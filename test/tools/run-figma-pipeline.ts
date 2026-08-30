import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import {
  buildFigmaPipelinePlan,
  parseFigmaPipelineGraph,
} from "./figma-harness/dependency";

interface Options {
  graph: string;
  changed: string[];
  change: string;
  changeDocs: string[];
  maxRepairs: number;
  dryRun: boolean;
}

interface NodeRunResult {
  id: string;
  review: "PASS" | "NEEDS_UPDATE" | "FAILED" | "NOT_RUN";
  updated: boolean;
  status: "PASS" | "FAILED" | "NOT_RUN";
  reviewExitCode: number | null;
  updateExitCode: number | null;
}

type TargetResolution = "RESOLVED" | "NOT_FOUND" | "AMBIGUOUS" | "UNKNOWN";
type ChangeResolution = "VERIFIED" | "GAP" | "NOT_APPLICABLE" | "UNKNOWN";

interface ReviewProbe {
  summary?: string;
}

interface TerminalStateProbe {
  last_review?: string | null;
}

const root = process.cwd();
const pipelineContract = ".agents/figma-pipeline-update.md";
const designBaseContract = ".agents/design-base.md";
const harnessArtifactRoot = resolve(root, "artifacts", "figma-harness");

function die(message: string): never {
  console.error(`[figma-pipeline] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let graph = "";
  const changed: string[] = [];
  let change = "";
  const changeDocs: string[] = [];
  let maxRepairs = 3;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];

    if (arg === "--graph") {
      if (!value) die("--graph requires a value");
      graph = value;
      i += 1;
      continue;
    }

    if (arg === "--figma") {
      die("figma:pipeline resolves canonical module scopes through figma-mcp-go; do not pass --figma");
    }

    if (arg === "--changed") {
      if (!value) die("--changed requires a node id");
      changed.push(value);
      i += 1;
      continue;
    }

    if (arg === "--change") {
      if (!value) die("--change requires a label");
      change = value.trim();
      i += 1;
      continue;
    }

    if (arg === "--change-doc") {
      if (!value) die("--change-doc requires a path");
      changeDocs.push(value);
      i += 1;
      continue;
    }

    if (arg === "--max-repairs") {
      if (!value) die("--max-repairs requires a value");
      maxRepairs = Number.parseInt(value, 10);
      if (!Number.isInteger(maxRepairs) || maxRepairs < 0 || maxRepairs > 10) {
        die("--max-repairs must be an integer between 0 and 10");
      }
      i += 1;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:\n  npm run figma:pipeline -- \\\n    --graph docs/srs/figma-pipeline-dependencies.json \\\n    --changed Catalog \\\n    --change Promotions \\\n    --change-doc docs/srs/Promotions/05-promotions-impact-map-and-review.md \\\n    --max-repairs 3\n\nScope routing:\n  Dependency nodes are logical Module scopes, not mutation intent.\n  --changed selects the original changed Module seed(s), and the graph selects the dependent Module scopes to inspect.\n\nActive change contract:\n  --change names the accepted delta being materialized in this run.\n  Repeat --change-doc for authoritative delta/impact documents that explain what changed.\n  The runner propagates this context to every child reviewer/writer.\n  The graph remains a scope/dependency selector; it does not encode patch reasons.\n\nTarget routing:\n  Each affected Module is resolved through figma-mcp-go to its existing flattened\n  canonical surface-root set using Module identity + .agents/design-base.md.\n  Example: Catalog may resolve to Catalog Public + Catalog Admin.\n  No Figma URL or node id is supplied to the dependency pipeline.\n\nExisting-scope rule:\n  figma:pipeline is an update/verify path, not init/rewrite.\n  The required existing Module surface set MUST already be resolvable.\n  TARGET_NOT_FOUND or TARGET_AMBIGUOUS is terminal and never starts a writer.\n  Distinct Public/Admin surfaces of one Module are not ambiguity.\n\nMutation rule:\n  Reviewer summaries must classify the active change as CHANGE_VERIFIED, CHANGE_GAP, or CHANGE_NOT_APPLICABLE.\n  Only TARGET_RESOLVED + CHANGE_GAP + FAIL_VERIFICATION authorizes a writer.\n  Unrelated pre-existing design cleanup is not patch intent and must not authorize mutation.\n\nRepeat --changed when multiple module planning inputs changed for the same active change.\nUse --dry-run to print dependency lookup + active change context only; it does not access or mutate Figma.\n`);
      process.exit(0);
    }

    die(`unknown argument: ${arg}`);
  }

  if (!graph) die("--graph is required");
  if (changed.length === 0) die("at least one --changed node is required");
  if (!change) die("--change is required; dependency scope alone is not mutation intent");
  if (changeDocs.length === 0) {
    die("at least one --change-doc is required so child harnesses know what changed");
  }

  return { graph, changed, change, changeDocs, maxRepairs, dryRun };
}

function loadPlan(options: Options) {
  for (const contract of [pipelineContract, designBaseContract]) {
    if (!existsSync(resolve(root, contract))) {
      die(`required Figma contract not found: ${contract}`);
    }
  }

  for (const doc of options.changeDocs) {
    if (!existsSync(resolve(root, doc))) {
      die(`active change document not found: ${doc}`);
    }
  }

  const graphPath = resolve(root, options.graph);
  if (!existsSync(graphPath)) die(`dependency graph not found: ${options.graph}`);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(graphPath, "utf8"));
  } catch (error) {
    die(`invalid dependency graph JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  let graph;
  try {
    graph = parseFigmaPipelineGraph(raw);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  let plan;
  try {
    plan = buildFigmaPipelinePlan(graph, options.changed, options.maxRepairs);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  for (const item of plan) {
    for (const doc of item.docs) {
      if (!existsSync(resolve(root, doc))) {
        die(`input document not found for ${item.id}: ${doc}`);
      }
    }
  }

  return { graph, plan };
}

function printPlan(
  name: string,
  changed: string[],
  change: string,
  changeDocs: string[],
  plan: ReturnType<typeof buildFigmaPipelinePlan>,
): void {
  console.log(`[figma-pipeline] graph=${name}`);
  console.log(`[figma-pipeline] changed=${changed.join(", ")}`);
  console.log(`[figma-pipeline] active-change=${change}`);
  changeDocs.forEach((doc, index) => {
    console.log(`[figma-pipeline] change-doc ${index + 1}. ${doc}`);
  });
  console.log(`[figma-pipeline] affected=${plan.map((item) => item.id).join(" -> ")}`);
  for (const [index, item] of plan.entries()) {
    console.log(`[figma-pipeline] ${index + 1}. ${item.id} maxRepairs=${item.maxRepairs}`);
    console.log(`[figma-pipeline]    target=resolve EXISTING canonical ${item.id} Module surface set through figma-mcp-go`);
    item.docs.forEach((doc, docIndex) => {
      console.log(`[figma-pipeline]    ${docIndex + 1}. ${doc}`);
    });
  }
}

function writePipelineState(
  name: string,
  graphPath: string,
  changed: string[],
  change: string,
  changeDocs: string[],
  results: NodeRunResult[],
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, "artifacts", "figma-harness", `pipeline-${timestamp}`);
  mkdirSync(runDir, { recursive: true });
  const statePath = resolve(runDir, "pipeline-state.json");
  writeFileSync(
    statePath,
    `${JSON.stringify({
      pipeline: name,
      graph: graphPath,
      targetResolution: "figma-mcp-go + logical Module identity + flattened surface-set semantics + design-base structural constraints",
      changed,
      activeChange: {
        label: change,
        docs: changeDocs,
      },
      results,
      completedAt: new Date().toISOString(),
    }, null, 2)}\n`,
    "utf8",
  );
  return statePath;
}

function activeChangeBoundary(options: Options): string[] {
  return [
    "ACTIVE CHANGE CONTRACT — this is the mutation intent for the current dependency-pipeline run.",
    `Active change: ${options.change}`,
    "Authoritative change-context documents:",
    ...options.changeDocs.map((doc) => `- ${doc}`),
    "The dependency graph selected WHICH logical Module scopes must be checked. It does not define WHAT should be changed.",
    "The normal Module docs are the current canonical compatibility truth. The active change context above explains why this run exists and what delta must be materialized.",
    "For this Module, first determine whether the active change requires a direct observable/design delta, only compatibility verification, or no applicable change.",
    "Reviewer mutation-routing summary contract when TARGET_RESOLVED:",
    `- active change fully represented for this Module: include exactly CHANGE_VERIFIED: ${options.change}`,
    `- active change requires a missing/incorrect delta in this Module: include exactly CHANGE_GAP: ${options.change}`,
    `- active change has no direct required delta in this Module and current Figma remains compatible: include exactly CHANGE_NOT_APPLICABLE: ${options.change}`,
    "Only CHANGE_GAP is repair intent. A general quality observation unrelated to the active change must not be converted into CHANGE_GAP.",
    "Unrelated pre-existing spacing, polish, composition, copy, or craft defects are outside this patch run unless they directly block, contradict, or were introduced by the active change on an affected semantic surface.",
    "When the active change is already represented, PASS without mutation even if unrelated cleanup opportunities exist. Those may be reported as non-blocking evidence only.",
    "When no direct delta applies to this Module, perform compatibility verification only and do not mutate it for general cleanup.",
    "Writer boundary: mutate only the active change delta plus defects directly caused by or blocking that delta on affected surfaces. No opportunistic redesign, polishing, spacing cleanup, copy tuning, or unrelated repairs.",
  ];
}

function semanticFigmaTarget(
  item: ReturnType<typeof buildFigmaPipelinePlan>[number],
  options: Options,
): string {
  return [
    "Resolve the existing canonical Figma artifact through figma-mcp-go. Do not use or require a hard-coded Figma URL or node id.",
    "This dependency pipeline is UPDATE/VERIFY ONLY. It is NOT an init or rewrite request. The required existing Module surface set is mandatory.",
    `Logical dependency Module: ${item.id}`,
    `Pipeline scope: ${item.scope}`,
    `Structural locator contract: ${designBaseContract}`,
    "",
    ...activeChangeBoundary(options),
    "",
    "Important: the dependency Module is a logical scope, not one physical Figma root.",
    "The Figma canvas is flattened at the Module-surface level. Resolve ALL existing canonical top-level roots owned by this Module that are required by the supplied canonical inputs.",
    "Example: logical Catalog may resolve to sibling roots Catalog Public + Catalog Admin. Distinct Public/Admin responsibilities are valid and MUST NOT be classified ambiguous merely because there are multiple roots.",
    "Before review or mutation, inspect the connected Figma document with MCP and establish the existing canonical Module surface set that satisfies the shared contract:",
    "- a Module may own one or more sibling top-level canonical surface roots;",
    "- each resolved root must have a distinct semantic Surface responsibility;",
    "- canonical UI belongs only under the correct Module + Surface responsibility;",
    "- semantic identity is Module + Surface + Use Case + Screen responsibility + State responsibility;",
    "- node id, frame name, creation time, or visual similarity alone does not establish semantic identity.",
    "Target-resolution output contract for the reviewer summary:",
    "- required existing Module surface set established: summary MUST begin exactly TARGET_RESOLVED:",
    "- no canonical surface can be established for this Module, or a surface required by the supplied canonical inputs is missing: return status=fail and summary MUST begin exactly TARGET_NOT_FOUND:",
    "- multiple candidates compete for the SAME Module + Surface responsibility, or semantic ownership cannot be resolved: return status=fail and summary MUST begin exactly TARGET_AMBIGUOUS:",
    "TARGET_NOT_FOUND and TARGET_AMBIGUOUS are terminal routing failures, not ordinary design defects.",
    "Never create a missing surface root as fallback for either condition. Only an explicit separate init/rewrite instruction may authorize creating a missing canonical surface.",
    "If TARGET_RESOLVED and CHANGE_GAP is established, update only the affected semantic surface(s) required by the active change; do not restructure valid flattened Public/Admin roots into a wrapper Module root.",
  ].join("\n");
}

function harnessArgs(
  item: ReturnType<typeof buildFigmaPipelinePlan>[number],
  mode: "verify" | "write",
  options: Options,
): string[] {
  const args = [
    "run",
    mode === "verify" ? "figma:verify" : "figma:harness",
    "--",
  ];

  if (mode === "write") args.push("--mode", "write");

  args.push(
    "--scope",
    item.scope,
    "--figma",
    semanticFigmaTarget(item, options),
    "--doc",
    pipelineContract,
    "--doc",
    designBaseContract,
  );

  const docs = new Set(item.docs);
  for (const doc of options.changeDocs) docs.add(doc);
  for (const doc of docs) args.push("--doc", doc);

  if (mode === "write") args.push("--max-repairs", String(item.maxRepairs));
  return args;
}

function snapshotHarnessRuns(): Set<string> {
  if (!existsSync(harnessArtifactRoot)) return new Set();
  return new Set(
    readdirSync(harnessArtifactRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("pipeline-"))
      .map((entry) => entry.name),
  );
}

function newestNewHarnessRun(before: Set<string>): string | null {
  if (!existsSync(harnessArtifactRoot)) return null;

  const candidates = readdirSync(harnessArtifactRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith("pipeline-") &&
        !before.has(entry.name),
    )
    .map((entry) => {
      const path = resolve(harnessArtifactRoot, entry.name);
      return { path, mtimeMs: statSync(path).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return candidates[0]?.path ?? null;
}

function reviewSummaryFromHarnessRun(runDir: string | null): string | null {
  if (!runDir) return null;

  try {
    const terminalPath = resolve(runDir, "terminal-state.json");
    if (!existsSync(terminalPath)) return null;
    const terminal = JSON.parse(readFileSync(terminalPath, "utf8")) as TerminalStateProbe;
    if (!terminal.last_review) return null;

    const reviewPath = terminal.last_review.startsWith(runDir)
      ? terminal.last_review
      : resolve(runDir, terminal.last_review);
    if (!existsSync(reviewPath)) return null;

    const review = JSON.parse(readFileSync(reviewPath, "utf8")) as ReviewProbe;
    return (review.summary ?? "").trim();
  } catch {
    return null;
  }
}

function targetResolutionFromSummary(summary: string | null): TargetResolution {
  if (!summary) return "UNKNOWN";
  const normalized = summary.toUpperCase();
  if (normalized.startsWith("TARGET_RESOLVED:")) return "RESOLVED";
  if (normalized.startsWith("TARGET_NOT_FOUND:")) return "NOT_FOUND";
  if (normalized.startsWith("TARGET_AMBIGUOUS:")) return "AMBIGUOUS";
  return "UNKNOWN";
}

function changeResolutionFromSummary(summary: string | null, change: string): ChangeResolution {
  if (!summary) return "UNKNOWN";
  const normalized = summary.toUpperCase();
  const label = change.trim().toUpperCase();
  if (normalized.includes(`CHANGE_VERIFIED: ${label}`)) return "VERIFIED";
  if (normalized.includes(`CHANGE_GAP: ${label}`)) return "GAP";
  if (normalized.includes(`CHANGE_NOT_APPLICABLE: ${label}`)) return "NOT_APPLICABLE";
  return "UNKNOWN";
}

function stopForTargetResolutionFailure(
  options: Options,
  graphName: string,
  results: NodeRunResult[],
  index: number,
  itemId: string,
  reviewExitCode: number | null,
  resolution: TargetResolution,
): never {
  results[index] = {
    id: itemId,
    review: "FAILED",
    updated: false,
    status: "FAILED",
    reviewExitCode,
    updateExitCode: null,
  };
  const statePath = writePipelineState(
    graphName,
    options.graph,
    options.changed,
    options.change,
    options.changeDocs,
    results,
  );
  console.error(
    `[figma-pipeline] STOP ${itemId} target resolution=${resolution}. Existing-scope update cannot fall back to creating a missing Figma surface.`,
  );
  console.error("[figma-pipeline] A missing required surface may only be created by an explicit separate init/rewrite instruction.");
  console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
  process.exit(1);
}

function stopForChangeContractFailure(
  options: Options,
  graphName: string,
  results: NodeRunResult[],
  index: number,
  itemId: string,
  reviewExitCode: number | null,
  resolution: ChangeResolution,
  detail: string,
): never {
  results[index] = {
    id: itemId,
    review: "FAILED",
    updated: false,
    status: "FAILED",
    reviewExitCode,
    updateExitCode: null,
  };
  const statePath = writePipelineState(
    graphName,
    options.graph,
    options.changed,
    options.change,
    options.changeDocs,
    results,
  );
  console.error(
    `[figma-pipeline] STOP ${itemId} active change=${options.change} classification=${resolution}. ${detail}`,
  );
  console.error("[figma-pipeline] Dependency scope is not mutation permission; no general cleanup writer will be started.");
  console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
  process.exit(1);
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const { graph, plan } = loadPlan(options);
  printPlan(graph.name, options.changed, options.change, options.changeDocs, plan);

  if (options.dryRun) {
    console.log("[figma-pipeline] DRY_RUN PASS — dependency lookup + active change context are valid; no Figma MCP access, review, or mutation started.");
    return;
  }

  const results: NodeRunResult[] = plan.map((item) => ({
    id: item.id,
    review: "NOT_RUN",
    updated: false,
    status: "NOT_RUN",
    reviewExitCode: null,
    updateExitCode: null,
  }));

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  for (let index = 0; index < plan.length; index += 1) {
    const item = plan[index];
    console.log(
      `[figma-pipeline] REVIEW ${item.id} — active change=${options.change}; resolving EXISTING canonical Module surface set through figma-mcp-go`,
    );

    const beforeReviewRuns = snapshotHarnessRuns();
    const reviewChild = spawnSync(npm, harnessArgs(item, "verify", options), {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    const reviewExitCode = reviewChild.status;
    const reviewRunDir = newestNewHarnessRun(beforeReviewRuns);
    const reviewSummary = reviewSummaryFromHarnessRun(reviewRunDir);
    const targetResolution = targetResolutionFromSummary(reviewSummary);
    const changeResolution = changeResolutionFromSummary(reviewSummary, options.change);

    if (reviewChild.error) {
      console.error(`[figma-pipeline] ${item.id} review failed to start: ${reviewChild.error.message}`);
    }

    if (!reviewChild.error && (targetResolution === "NOT_FOUND" || targetResolution === "AMBIGUOUS")) {
      stopForTargetResolutionFailure(
        options,
        graph.name,
        results,
        index,
        item.id,
        reviewExitCode,
        targetResolution,
      );
    }

    if (!reviewChild.error && targetResolution === "UNKNOWN") {
      stopForTargetResolutionFailure(
        options,
        graph.name,
        results,
        index,
        item.id,
        reviewExitCode,
        "UNKNOWN",
      );
    }

    if (!reviewChild.error && targetResolution === "RESOLVED" && changeResolution === "UNKNOWN") {
      stopForChangeContractFailure(
        options,
        graph.name,
        results,
        index,
        item.id,
        reviewExitCode,
        changeResolution,
        "Reviewer did not classify the active change with CHANGE_VERIFIED, CHANGE_GAP, or CHANGE_NOT_APPLICABLE.",
      );
    }

    if (
      !reviewChild.error &&
      reviewExitCode === 0 &&
      targetResolution === "RESOLVED" &&
      (changeResolution === "VERIFIED" || changeResolution === "NOT_APPLICABLE")
    ) {
      results[index] = {
        id: item.id,
        review: "PASS",
        updated: false,
        status: "PASS",
        reviewExitCode,
        updateExitCode: null,
      };
      console.log(
        `[figma-pipeline] PASS ${item.id} — ${options.change} ${changeResolution}; no mutation required`,
      );
      continue;
    }

    if (
      !reviewChild.error &&
      reviewExitCode === 2 &&
      targetResolution === "RESOLVED" &&
      changeResolution !== "GAP"
    ) {
      stopForChangeContractFailure(
        options,
        graph.name,
        results,
        index,
        item.id,
        reviewExitCode,
        changeResolution,
        "Review failed but did not establish an active-change gap, so writer mutation is not authorized.",
      );
    }

    if (reviewChild.error || reviewExitCode !== 2 || targetResolution !== "RESOLVED") {
      results[index] = {
        id: item.id,
        review: "FAILED",
        updated: false,
        status: "FAILED",
        reviewExitCode,
        updateExitCode: null,
      };
      const statePath = writePipelineState(
        graph.name,
        options.graph,
        options.changed,
        options.change,
        options.changeDocs,
        results,
      );
      console.error(`[figma-pipeline] STOP ${item.id} review failed terminally. Dependents will not run.`);
      console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
      process.exit(reviewExitCode && reviewExitCode > 0 ? reviewExitCode : 1);
    }

    results[index].review = "NEEDS_UPDATE";
    results[index].reviewExitCode = reviewExitCode;
    console.log(
      `[figma-pipeline] UPDATE ${item.id} — TARGET_RESOLVED + CHANGE_GAP: ${options.change}; starting bounded child writer`,
    );

    const beforeUpdateRuns = snapshotHarnessRuns();
    const updateChild = spawnSync(npm, harnessArgs(item, "write", options), {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    const updateExitCode = updateChild.status;
    const updateRunDir = newestNewHarnessRun(beforeUpdateRuns);
    const updateSummary = reviewSummaryFromHarnessRun(updateRunDir);
    const updateTargetResolution = targetResolutionFromSummary(updateSummary);
    const updateChangeResolution = changeResolutionFromSummary(updateSummary, options.change);

    if (updateChild.error) {
      console.error(`[figma-pipeline] ${item.id} update failed to start: ${updateChild.error.message}`);
    }

    const updatePassed =
      !updateChild.error &&
      updateExitCode === 0 &&
      updateTargetResolution === "RESOLVED" &&
      (updateChangeResolution === "VERIFIED" || updateChangeResolution === "NOT_APPLICABLE");

    results[index] = {
      id: item.id,
      review: "NEEDS_UPDATE",
      updated: updatePassed,
      status: updatePassed ? "PASS" : "FAILED",
      reviewExitCode,
      updateExitCode,
    };

    if (results[index].status !== "PASS") {
      const statePath = writePipelineState(
        graph.name,
        options.graph,
        options.changed,
        options.change,
        options.changeDocs,
        results,
      );
      console.error(
        `[figma-pipeline] STOP ${item.id} update did not close with TARGET_RESOLVED + CHANGE_VERIFIED/CHANGE_NOT_APPLICABLE for ${options.change}. Dependents will not run.`,
      );
      console.error(`[figma-pipeline] Pipeline state: ${statePath}`);
      process.exit(updateExitCode && updateExitCode > 0 ? updateExitCode : 1);
    }

    console.log(
      `[figma-pipeline] PASS ${item.id} — ${options.change} closed by fresh independent review; only active-change mutation was authorized`,
    );
  }

  const statePath = writePipelineState(
    graph.name,
    options.graph,
    options.changed,
    options.change,
    options.changeDocs,
    results,
  );
  console.log(`[figma-pipeline] PASS pipeline=${graph.name} active-change=${options.change}`);
  console.log(`[figma-pipeline] Pipeline state: ${statePath}`);
}

run();
