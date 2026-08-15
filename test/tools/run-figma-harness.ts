import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

interface ReviewDefect {
  origin: "product_semantics" | "ux" | "composition" | "visual" | "responsive" | "geometry";
  severity: "blocking" | "non_blocking";
  target: string;
  problem: string;
  evidence: string;
}

interface ReviewResult {
  status: "pass" | "fail";
  scores: {
    ux: number;
    design_quality: number;
    composition: number;
    originality: number;
    craft: number;
  };
  defects: ReviewDefect[];
  summary: string;
}

interface Options {
  scope: string;
  figma: string;
  docs: string[];
  maxIterations: number;
}

const thresholds = {
  ux: 8,
  design_quality: 8,
  composition: 8,
  originality: 7,
  craft: 8,
} as const;

const root = process.cwd();
const reviewerPath = resolve(root, ".agents/figma-reviewer.md");
const designerPath = resolve(root, ".agents/designer.md");
const schemaPath = resolve(root, "tools/figma-harness/review.schema.json");
const codexBin = process.env.CODEX_BIN ?? "codex";

function die(message: string): never {
  console.error(`[figma-harness] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  const docs: string[] = [];
  let scope = "";
  let figma = "";
  let maxIterations = 3;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];

    if (arg === "--scope") {
      if (!value) die("--scope requires a value");
      scope = value;
      i += 1;
      continue;
    }

    if (arg === "--figma") {
      if (!value) die("--figma requires a value");
      figma = value;
      i += 1;
      continue;
    }

    if (arg === "--doc") {
      if (!value) die("--doc requires a value");
      docs.push(value);
      i += 1;
      continue;
    }

    if (arg === "--max-iterations") {
      if (!value) die("--max-iterations requires a value");
      maxIterations = Number.parseInt(value, 10);
      if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 10) {
        die("--max-iterations must be an integer between 1 and 10");
      }
      i += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  npm run figma:harness -- \\
    --scope "Checkout admin" \\
    --figma "<Figma file/page/node reference>" \\
    --doc docs/specs/checkout/checkout_srs.md \\
    --doc docs/specs/checkout/checkout_ui_ux_research.md \\
    --max-iterations 3

Inputs to this Figma phase are upstream documents only. Feature/Gherkin is not a Figma-phase input.

Optional environment:
  CODEX_BIN=<path>                    Codex CLI binary (default: codex)
  FIGMA_GEOMETRY_CHECK_CMD=<command>  Deterministic geometry command. Exit 0 = CLEAN.
`);
      process.exit(0);
    }

    die(`unknown argument: ${arg}`);
  }

  if (!scope) die("--scope is required");
  if (!figma) die("--figma is required");
  if (docs.length === 0) die("at least one --doc is required");

  return { scope, figma, docs, maxIterations };
}

function validateInputs(options: Options): string[] {
  for (const required of [designerPath, reviewerPath, schemaPath]) {
    if (!existsSync(required)) die(`required harness file not found: ${required}`);
  }

  return options.docs.map((doc) => {
    const absolute = resolve(root, doc);
    if (!existsSync(absolute)) die(`input document not found: ${doc}`);
    return absolute;
  });
}

function runCodex(args: string[], label: string): string {
  console.log(`[figma-harness] ${label}`);
  const result = spawnSync(codexBin, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  });

  if (result.error) die(`${label} failed to start: ${result.error.message}`);
  if (result.status !== 0) die(`${label} exited with status ${result.status}`);

  return result.stdout ?? "";
}

function extractThreadId(jsonl: string): string {
  for (const line of jsonl.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line) as { type?: string; thread_id?: string };
      if (event.type === "thread.started" && event.thread_id) return event.thread_id;
    } catch {
      // Ignore non-JSON noise; Codex JSON mode should normally emit JSONL only.
    }
  }

  die("writer run did not expose a Codex thread_id");
}

function writerPrompt(options: Options, docs: string[]): string {
  return `You are the Figma writer for scope: ${options.scope}.

Read and follow .agents/designer.md.

Figma target:
${options.figma}

Canonical upstream inputs for this Figma phase:
${docs.map((doc) => `- ${doc}`).join("\n")}

Important pipeline boundary:
- Use these upstream documents as the design inputs.
- Do NOT use Feature/Gherkin as an input to this Figma phase; that artifact belongs to a later phase.
- Do not create intermediate design-state/strategy/skeleton artifacts.

Task:
Complete the canonical Figma scope to production quality. Inspect the real target, reason about task hierarchy and composition before mutation, mutate Figma through the configured tools, and leave the requested scope ready for an independent review.

Do not self-approve the result. The harness will run a fresh reviewer after this writer turn.`;
}

function reviewerPrompt(options: Options, docs: string[]): string {
  return `You are a fresh independent reviewer for scope: ${options.scope}.

Read and follow .agents/figma-reviewer.md.

Figma target to inspect:
${options.figma}

Canonical upstream inputs for this Figma phase:
${docs.map((doc) => `- ${doc}`).join("\n")}

Important boundaries:
- Feature/Gherkin is NOT an input to this Figma phase.
- Inspect the actual rendered Figma artifact, not the writer's rationale.
- Do not mutate Figma.
- Return only the JSON object required by the supplied output schema.

Evaluate the current Figma now.`;
}

function reviewPasses(review: ReviewResult): boolean {
  const blocking = review.defects.some((defect) => defect.severity === "blocking");
  const scoresPass =
    review.scores.ux >= thresholds.ux &&
    review.scores.design_quality >= thresholds.design_quality &&
    review.scores.composition >= thresholds.composition &&
    review.scores.originality >= thresholds.originality &&
    review.scores.craft >= thresholds.craft;

  return review.status === "pass" && !blocking && scoresPass;
}

function scoreGaps(review: ReviewResult): string[] {
  return (Object.keys(thresholds) as Array<keyof typeof thresholds>)
    .filter((key) => review.scores[key] < thresholds[key])
    .map((key) => `${key}: ${review.scores[key]}/${thresholds[key]} minimum`);
}

function formatReviewFeedback(review: ReviewResult): string {
  const gaps = scoreGaps(review);
  const defects = review.defects
    .map(
      (defect, index) =>
        `${index + 1}. [${defect.severity}] ${defect.origin} — ${defect.target}\n` +
        `   Problem: ${defect.problem}\n` +
        `   Evidence: ${defect.evidence}`,
    )
    .join("\n");

  return `Independent Figma review failed.

Score gaps:
${gaps.length ? gaps.map((gap) => `- ${gap}`).join("\n") : "- none"}

Reviewer defects:
${defects || "- none"}

Reviewer summary:
${review.summary}

Repair the actual Figma artifact. Fix the originating design decision rather than masking a structural UX/composition defect with decoration. Do not create intermediate design documents. When finished, leave Figma ready for another fresh review.`;
}

function runGeometryGate(threadId: string): void {
  const command = process.env.FIGMA_GEOMETRY_CHECK_CMD;
  if (!command) return;

  console.log("[figma-harness] running deterministic geometry gate");
  const result = spawnSync("/bin/sh", ["-lc", command], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });

  if (result.error) die(`geometry gate failed to start: ${result.error.message}`);
  if (result.status === 0) return;

  const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  const feedback = `Deterministic geometry gate failed. Repair geometry only, then leave the same Figma scope ready for verification.\n\n${details || "Geometry command exited non-zero without output."}`;
  runCodex(["exec", "resume", threadId, feedback], "writer geometry repair");
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const docs = validateInputs(options);

  const runDir = resolve(root, "artifacts/figma-harness", new Date().toISOString().replace(/[:.]/g, "-"));
  mkdirSync(runDir, { recursive: true });

  const writerEvents = runCodex(
    ["exec", "--json", "--sandbox", "workspace-write", writerPrompt(options, docs)],
    "starting writer session",
  );
  const writerThreadId = extractThreadId(writerEvents);
  writeFileSync(resolve(runDir, "writer-thread.txt"), `${writerThreadId}\n`, "utf8");

  for (let iteration = 1; iteration <= options.maxIterations; iteration += 1) {
    runGeometryGate(writerThreadId);

    const reviewPath = resolve(runDir, `review-${iteration}.json`);
    runCodex(
      [
        "exec",
        "--ephemeral",
        "--sandbox",
        "read-only",
        "--output-schema",
        schemaPath,
        "-o",
        reviewPath,
        reviewerPrompt(options, docs),
      ],
      `fresh review ${iteration}/${options.maxIterations}`,
    );

    let review: ReviewResult;
    try {
      review = JSON.parse(readFileSync(reviewPath, "utf8")) as ReviewResult;
    } catch (error) {
      die(`could not parse reviewer output ${reviewPath}: ${String(error)}`);
    }

    if (reviewPasses(review)) {
      console.log(`[figma-harness] PASS after ${iteration} review iteration(s)`);
      console.log(`[figma-harness] review artifact: ${reviewPath}`);
      return;
    }

    console.log(`[figma-harness] review ${iteration} failed; routing defects back to writer`);
    const feedback = formatReviewFeedback(review);
    writeFileSync(resolve(runDir, `feedback-${iteration}.txt`), feedback, "utf8");
    runCodex(["exec", "resume", writerThreadId, feedback], `writer repair ${iteration}`);
  }

  die(`Figma did not pass after ${options.maxIterations} independent review iteration(s). Review artifacts: ${runDir}`);
}

main();
