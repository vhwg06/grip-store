import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  decideAfterVerification,
  type HarnessMode,
  initialWriterRequired,
  maximumReviewCount,
} from "./figma-harness/lifecycle";

interface ReviewDefect {
  origin:
    | "product_semantics"
    | "ux"
    | "composition"
    | "visual"
    | "responsive"
    | "geometry"
    | "canonical_structure";
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
  mode: HarnessMode;
  scope: string;
  figma: string;
  docs: string[];
  maxRepairs: number;
}

type TerminalStatus = "PASS" | "FAIL_BUDGET" | "FAIL_VERIFICATION" | "TIMEOUT" | "ERROR";

interface GeometryCheckResult {
  passed: boolean;
  details: string;
}

class HarnessFailure extends Error {
  constructor(
    readonly status: Extract<TerminalStatus, "TIMEOUT" | "ERROR">,
    message: string,
  ) {
    super(message);
  }
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

function envPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new HarnessFailure("ERROR", `${name} must be a positive integer`);
  }
  return value;
}

const phaseTimeoutMs = envPositiveInt("FIGMA_PHASE_TIMEOUT_MS", 45 * 60 * 1000);
const runTimeoutMs = envPositiveInt("FIGMA_HARNESS_TIMEOUT_MS", 4 * 60 * 60 * 1000);
const heartbeatMs = envPositiveInt("FIGMA_HARNESS_HEARTBEAT_MS", 60 * 1000);
const maxCodexOutputBytes = 32 * 1024 * 1024;

function die(message: string): never {
  console.error(`[figma-harness] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  const docs: string[] = [];
  let mode: HarnessMode = "write";
  let scope = "";
  let figma = "";
  let maxRepairs = 3;
  let repairBudgetWasExplicit = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];

    if (arg === "--mode") {
      if (!value) die("--mode requires a value");
      if (value !== "write" && value !== "verify") {
        die("--mode must be either write or verify");
      }
      mode = value;
      i += 1;
      continue;
    }

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

    if (arg === "--max-repairs" || arg === "--max-iterations") {
      if (!value) die(`${arg} requires a value`);
      maxRepairs = Number.parseInt(value, 10);
      if (!Number.isInteger(maxRepairs) || maxRepairs < 0 || maxRepairs > 10) {
        die(`${arg} must be an integer between 0 and 10`);
      }
      repairBudgetWasExplicit = true;
      if (arg === "--max-iterations") {
        console.warn(
          "[figma-harness] --max-iterations is deprecated; interpreting it as the repair budget. Use --max-repairs instead.",
        );
      }
      i += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:\n  # canonical write / repair lifecycle\n  npm run figma:harness -- \\\n    --scope "Checkout admin" \\\n    --figma "<Figma file/page/node reference>" \\\n    --doc docs/specs/checkout/checkout_srs.md \\\n    --doc docs/specs/checkout/checkout_ui_ux_research.md \\\n    --max-repairs 3\n\n  # read-only verification of the artifact as it already exists\n  npm run figma:verify -- \\\n    --scope "Checkout admin" \\\n    --figma "<Figma file/page/node reference>" \\\n    --doc docs/specs/checkout/checkout_srs.md \\\n    --doc docs/specs/checkout/checkout_ui_ux_research.md\n\nWrite mode starts one writer session, then permits at most N repairs and N+1 independent reviews.\nVerify mode starts no writer, performs no repair, and terminates after verification.\nThe harness always terminates from a reviewer/verifier state, never immediately after mutation.\n\nInputs to this Figma phase are upstream documents only. Feature/Gherkin is not a Figma-phase input.\n\nOptional environment:\n  CODEX_BIN=<path>                     Codex CLI binary (default: codex)\n  FIGMA_GEOMETRY_CHECK_CMD=<command>   Deterministic geometry command. Exit 0 = CLEAN.\n  FIGMA_PHASE_TIMEOUT_MS=<ms>          Per Codex phase timeout (default: 2700000 / 45m).\n  FIGMA_HARNESS_TIMEOUT_MS=<ms>        Whole-run timeout (default: 14400000 / 4h).\n  FIGMA_HARNESS_HEARTBEAT_MS=<ms>      Heartbeat interval (default: 60000 / 1m).\n`);
      process.exit(0);
    }

    die(`unknown argument: ${arg}`);
  }

  if (!scope) die("--scope is required");
  if (!figma) die("--figma is required");
  if (docs.length === 0) die("at least one --doc is required");

  if (mode === "verify") {
    if (repairBudgetWasExplicit && maxRepairs !== 0) {
      die("--max-repairs is not valid in verify mode; verification is read-only and has no repair budget");
    }
    maxRepairs = 0;
  }

  return { mode, scope, figma, docs, maxRepairs };
}

function validateInputs(options: Options): string[] {
  const required = initialWriterRequired(options.mode)
    ? [designerPath, reviewerPath, schemaPath]
    : [reviewerPath, schemaPath];

  for (const path of required) {
    if (!existsSync(path)) die(`required harness file not found: ${path}`);
  }

  return options.docs.map((doc) => {
    const absolute = resolve(root, doc);
    if (!existsSync(absolute)) die(`input document not found: ${doc}`);
    return absolute;
  });
}

function remainingRunMs(runDeadline: number): number {
  return runDeadline - Date.now();
}

async function runCodex(args: string[], label: string, runDeadline: number): Promise<string> {
  const remaining = remainingRunMs(runDeadline);
  if (remaining <= 0) {
    throw new HarnessFailure("TIMEOUT", `whole-run timeout reached before ${label}`);
  }

  const timeoutMs = Math.min(phaseTimeoutMs, remaining);
  const startedAt = Date.now();
  console.log(`[figma-harness] ${label}`);

  return await new Promise<string>((resolvePromise, reject) => {
    const child = spawn(codexBin, args, {
      cwd: root,
      stdio: ["ignore", "pipe", "inherit"],
    });

    let stdout = "";
    let outputBytes = 0;
    let timedOut = false;
    let outputExceeded = false;

    const heartbeat = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      console.log(`[figma-harness] ${label} still running (${elapsedSeconds}s)`);
    }, heartbeatMs);
    heartbeat.unref();

    const timeout = setTimeout(() => {
      timedOut = true;
      console.error(`[figma-harness] ${label} exceeded ${timeoutMs}ms; terminating child process`);
      child.kill("SIGTERM");
      const forceKill = setTimeout(() => child.kill("SIGKILL"), 5_000);
      forceKill.unref();
    }, timeoutMs);
    timeout.unref();

    child.stdout?.on("data", (chunk: Buffer | string) => {
      const text = chunk.toString();
      outputBytes += Buffer.byteLength(text);
      if (outputBytes > maxCodexOutputBytes) {
        outputExceeded = true;
        child.kill("SIGTERM");
        return;
      }
      stdout += text;
    });

    child.on("error", (error) => {
      clearInterval(heartbeat);
      clearTimeout(timeout);
      reject(new HarnessFailure("ERROR", `${label} failed to start: ${error.message}`));
    });

    child.on("close", (code, signal) => {
      clearInterval(heartbeat);
      clearTimeout(timeout);

      if (timedOut) {
        reject(new HarnessFailure("TIMEOUT", `${label} timed out after ${timeoutMs}ms`));
        return;
      }
      if (outputExceeded) {
        reject(new HarnessFailure("ERROR", `${label} exceeded ${maxCodexOutputBytes} bytes of captured output`));
        return;
      }
      if (code !== 0) {
        reject(
          new HarnessFailure(
            "ERROR",
            `${label} exited with status ${String(code)}${signal ? ` (signal ${signal})` : ""}`,
          ),
        );
        return;
      }

      resolvePromise(stdout);
    });
  });
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

  throw new HarnessFailure("ERROR", "writer run did not expose a Codex thread_id");
}

function figmaToolBoundary(): string {
  return `Figma tool routing is strict:\n- Use only the figma-mcp-go server (mcp__figma_mcp_go__*) for Figma operations.\n- Never use the legacy mcp__figma__* server.\n- If figma-mcp-go cannot perform a required operation, do not fall back to another Figma MCP server.`;
}

function canonicalReconciliationBoundary(): string {
  return `Canonical reconciliation is mandatory:\n- Resolve semantic identity by owning Module + Use Case + Screen + State responsibility, not by node id or display name alone.\n- Before creating or duplicating a screen/state, inspect the existing canonical scope for an equivalent representation.\n- If the semantic representation already exists, update/reconcile it in place instead of appending another copy.\n- Repeated execution over the same scope with unchanged semantics must converge on the same canonical artifact.\n- Different state names alone do not justify different frames. When semantics require distinct user-visible states, their rendered behavior/content must contain a meaningful observable difference.\n- Do not blindly delete suspicious duplicates. Reconcile only when semantic identity is established, preserving one canonical representation.`;
}

function writerPrompt(options: Options, docs: string[]): string {
  return `You are the Figma writer for scope: ${options.scope}.\n\nRead and follow .agents/designer.md.\n\n${figmaToolBoundary()}\n\n${canonicalReconciliationBoundary()}\n\nFigma target:\n${options.figma}\n\nCanonical upstream inputs for this Figma phase:\n${docs.map((doc) => `- ${doc}`).join("\n")}\n\nImportant pipeline boundary:\n- Use these upstream documents as the design inputs.\n- Do NOT use Feature/Gherkin as an input to this Figma phase; that artifact belongs to a later phase.\n- Do not create intermediate design-state/strategy/skeleton artifacts.\n\nTask:\nComplete the canonical Figma scope to production quality. Inspect and reconcile the real target before mutation, reason about task hierarchy and composition, mutate Figma through figma-mcp-go, and leave the requested scope ready for an independent review.\n\nDo not self-approve the result. The harness will run a fresh reviewer after this writer turn.`;
}

function reviewerPrompt(options: Options, docs: string[]): string {
  return `You are a fresh independent reviewer for scope: ${options.scope}.\n\nRead and follow .agents/figma-reviewer.md.\n\n${figmaToolBoundary()}\n\nFigma target to inspect:\n${options.figma}\n\nCanonical upstream inputs for this Figma phase:\n${docs.map((doc) => `- ${doc}`).join("\n")}\n\nImportant boundaries:\n- Feature/Gherkin is NOT an input to this Figma phase.\n- Inspect the actual rendered Figma artifact, not the writer's rationale.\n- Use figma-mcp-go only.\n- Do not mutate Figma.\n- Inspect canonical screen/state inventory for competing semantic representations or renamed clones.\n- Pixel-identical rendering is evidence of possible duplication, not proof by itself; judge semantic responsibility and observable state difference.\n- Report competing canonical representations or unjustified duplicate states with origin canonical_structure.\n- Return only the JSON object required by the supplied output schema.\n\nEvaluate the current Figma now.`;
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

  return `Independent Figma review failed.\n\nScore gaps:\n${gaps.length ? gaps.map((gap) => `- ${gap}`).join("\n") : "- none"}\n\nReviewer defects:\n${defects || "- none"}\n\nReviewer summary:\n${review.summary}\n\nRepair the actual Figma artifact. Fix the originating design decision rather than masking a structural UX/composition defect with decoration. Reconcile existing canonical screen/state representations before creating new nodes; do not solve a defect by appending a semantically equivalent clone. Do not create intermediate design documents. When finished, leave Figma ready for another fresh review.`;
}

function runGeometryCheck(runDeadline: number): GeometryCheckResult | null {
  const command = process.env.FIGMA_GEOMETRY_CHECK_CMD;
  if (!command) return null;

  const remaining = remainingRunMs(runDeadline);
  if (remaining <= 0) {
    throw new HarnessFailure("TIMEOUT", "whole-run timeout reached before geometry verification");
  }

  console.log("[figma-harness] running deterministic geometry verification");
  const result = spawnSync("/bin/sh", ["-lc", command], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    timeout: Math.min(5 * 60 * 1000, remaining),
  });

  if (result.error) {
    const status = result.error.message.includes("ETIMEDOUT") ? "TIMEOUT" : "ERROR";
    throw new HarnessFailure(status, `geometry verification failed to execute: ${result.error.message}`);
  }

  const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  if (result.status === 0) return { passed: true, details };

  return {
    passed: false,
    details: details || "Geometry command exited non-zero without output.",
  };
}

function formatGeometryFeedback(details: string): string {
  return `Deterministic geometry verification failed. Repair the originating geometry only, then leave the same canonical Figma scope ready for verification. Do not append duplicate screen/state representations while repairing.\n\n${details}`;
}

function writeTerminalState(
  runDir: string,
  options: Options,
  status: TerminalStatus,
  reviews: number,
  repairsUsed: number,
  startedAt: string,
  summary: string,
  lastReviewPath?: string,
): void {
  writeFileSync(
    resolve(runDir, "terminal-state.json"),
    `${JSON.stringify(
      {
        status,
        mode: options.mode,
        scope: options.scope,
        reviews,
        repairs_used: repairsUsed,
        max_repairs: options.maxRepairs,
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        last_review: lastReviewPath ?? null,
        summary,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function finishFailedVerification(
  runDir: string,
  options: Options,
  reviews: number,
  repairsUsed: number,
  startedAt: string,
  summary: string,
  lastReviewPath?: string,
): void {
  writeTerminalState(
    runDir,
    options,
    "FAIL_VERIFICATION",
    reviews,
    repairsUsed,
    startedAt,
    summary,
    lastReviewPath,
  );
  console.error(`[figma-harness] FAIL_VERIFICATION: ${summary}`);
  console.error(`[figma-harness] run artifacts: ${runDir}`);
  process.exitCode = 2;
}

function finishBudgetFailure(
  runDir: string,
  options: Options,
  reviews: number,
  repairsUsed: number,
  startedAt: string,
  summary: string,
  lastReviewPath?: string,
): void {
  writeTerminalState(
    runDir,
    options,
    "FAIL_BUDGET",
    reviews,
    repairsUsed,
    startedAt,
    summary,
    lastReviewPath,
  );
  console.error(`[figma-harness] FAIL_BUDGET: ${summary}`);
  console.error(`[figma-harness] run artifacts: ${runDir}`);
  process.exitCode = 2;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const docs = validateInputs(options);
  const startedAtDate = new Date();
  const startedAt = startedAtDate.toISOString();
  const runDeadline = startedAtDate.getTime() + runTimeoutMs;

  const runDir = resolve(root, "artifacts/figma-harness", startedAt.replace(/[:.]/g, "-"));
  mkdirSync(runDir, { recursive: true });

  let reviews = 0;
  let repairsUsed = 0;
  let lastReviewPath: string | undefined;
  let writerThreadId: string | undefined;

  try {
    if (initialWriterRequired(options.mode)) {
      const writerEvents = await runCodex(
        ["exec", "--json", "--sandbox", "workspace-write", writerPrompt(options, docs)],
        "starting writer session",
        runDeadline,
      );
      writerThreadId = extractThreadId(writerEvents);
      writeFileSync(resolve(runDir, "writer-thread.txt"), `${writerThreadId}\n`, "utf8");
    } else {
      console.log("[figma-harness] verification-only mode: skipping writer creation and all mutation/repair steps");
    }

    const maxReviews = maximumReviewCount(options.mode, options.maxRepairs);

    while (true) {
      const geometry = runGeometryCheck(runDeadline);
      if (geometry && !geometry.passed) {
        const evidencePath = resolve(runDir, `geometry-failure-${repairsUsed + 1}.txt`);
        writeFileSync(evidencePath, `${geometry.details}\n`, "utf8");

        const decision = decideAfterVerification(false, options.mode, repairsUsed, options.maxRepairs);

        if (decision === "fail_verification") {
          finishFailedVerification(
            runDir,
            options,
            reviews,
            repairsUsed,
            startedAt,
            `Read-only deterministic geometry verification failed. No writer was started and no mutation was performed. Evidence: ${evidencePath}`,
            lastReviewPath,
          );
          return;
        }

        if (decision === "fail_budget") {
          finishBudgetFailure(
            runDir,
            options,
            reviews,
            repairsUsed,
            startedAt,
            `Deterministic geometry verification still failed after the full repair budget (${options.maxRepairs}) was used. No further writer mutation was performed. This invocation is terminal; do not automatically restart the harness. Evidence: ${evidencePath}`,
            lastReviewPath,
          );
          return;
        }

        if (decision !== "repair" || !writerThreadId) {
          throw new HarnessFailure("ERROR", "geometry verification requested a repair without an active writer thread");
        }

        const feedback = formatGeometryFeedback(geometry.details);
        writeFileSync(resolve(runDir, `geometry-feedback-${repairsUsed + 1}.txt`), feedback, "utf8");
        await runCodex(
          ["exec", "resume", writerThreadId, feedback],
          `writer geometry repair ${repairsUsed + 1}/${options.maxRepairs}`,
          runDeadline,
        );
        repairsUsed += 1;
        continue;
      }

      reviews += 1;
      const reviewPath = resolve(runDir, `review-${reviews}.json`);
      lastReviewPath = reviewPath;

      await runCodex(
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
        `fresh review ${reviews}/${maxReviews}`,
        runDeadline,
      );

      let review: ReviewResult;
      try {
        review = JSON.parse(readFileSync(reviewPath, "utf8")) as ReviewResult;
      } catch (error) {
        throw new HarnessFailure("ERROR", `could not parse reviewer output ${reviewPath}: ${String(error)}`);
      }

      const decision = decideAfterVerification(
        reviewPasses(review),
        options.mode,
        repairsUsed,
        options.maxRepairs,
      );

      if (decision === "pass") {
        const summary =
          options.mode === "verify"
            ? "PASS: read-only verification passed with zero writer mutations"
            : `PASS after ${reviews} independent review(s) and ${repairsUsed} repair(s)`;
        writeTerminalState(runDir, options, "PASS", reviews, repairsUsed, startedAt, summary, reviewPath);
        console.log(`[figma-harness] ${summary}`);
        console.log(`[figma-harness] review artifact: ${reviewPath}`);
        return;
      }

      if (decision === "fail_verification") {
        finishFailedVerification(
          runDir,
          options,
          reviews,
          repairsUsed,
          startedAt,
          "Read-only verification failed. No writer was started, no repair was scheduled, and the canonical artifact was left unchanged.",
          reviewPath,
        );
        return;
      }

      if (decision === "fail_budget") {
        finishBudgetFailure(
          runDir,
          options,
          reviews,
          repairsUsed,
          startedAt,
          `Final independent review failed after the full repair budget (${options.maxRepairs}) was used. No further writer mutation was performed. This invocation is terminal; do not automatically restart the harness.`,
          reviewPath,
        );
        return;
      }

      if (!writerThreadId) {
        throw new HarnessFailure("ERROR", "review requested a repair without an active writer thread");
      }

      console.log(
        `[figma-harness] review ${reviews} failed; routing defects to writer repair ${repairsUsed + 1}/${options.maxRepairs}`,
      );
      const feedback = formatReviewFeedback(review);
      writeFileSync(resolve(runDir, `feedback-${reviews}.txt`), feedback, "utf8");
      await runCodex(
        ["exec", "resume", writerThreadId, feedback],
        `writer repair ${repairsUsed + 1}/${options.maxRepairs}`,
        runDeadline,
      );
      repairsUsed += 1;
    }
  } catch (error) {
    const failure = error instanceof HarnessFailure ? error : new HarnessFailure("ERROR", String(error));
    const summary = `${failure.status}: ${failure.message}. This invocation is terminal; do not automatically restart the harness.`;
    writeTerminalState(runDir, options, failure.status, reviews, repairsUsed, startedAt, summary, lastReviewPath);
    console.error(`[figma-harness] ${summary}`);
    console.error(`[figma-harness] run artifacts: ${runDir}`);
    process.exitCode = 1;
  }
}

void main();
