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

import type {
  FigmaExecutionPolicy,
  FigmaExecutionResult,
  FigmaExecutionUnit,
  ReviewDecision,
} from "./policy";

interface ReviewProbe {
  summary?: string;
}

interface TerminalStateProbe {
  last_review?: string | null;
}

const harnessArtifactRoot = "artifacts/figma-harness";

function snapshotHarnessRuns(root: string): Set<string> {
  const absolute = resolve(root, harnessArtifactRoot);
  if (!existsSync(absolute)) return new Set();
  return new Set(
    readdirSync(absolute, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("workload-"))
      .map((entry) => entry.name),
  );
}

function newestNewHarnessRun(root: string, before: Set<string>): string | null {
  const absolute = resolve(root, harnessArtifactRoot);
  if (!existsSync(absolute)) return null;
  const candidates = readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("workload-") && !before.has(entry.name))
    .map((entry) => {
      const path = resolve(absolute, entry.name);
      return { path, mtimeMs: statSync(path).mtimeMs };
    })
    .sort((left, right) => right.mtimeMs - left.mtimeMs);
  return candidates[0]?.path ?? null;
}

function reviewSummary(runDir: string | null): string {
  if (!runDir) return "";
  try {
    const terminalPath = resolve(runDir, "terminal-state.json");
    if (!existsSync(terminalPath)) return "";
    const terminal = JSON.parse(readFileSync(terminalPath, "utf8")) as TerminalStateProbe;
    if (!terminal.last_review) return "";
    const reviewPath = terminal.last_review.startsWith(runDir)
      ? terminal.last_review
      : resolve(runDir, terminal.last_review);
    if (!existsSync(reviewPath)) return "";
    const review = JSON.parse(readFileSync(reviewPath, "utf8")) as ReviewProbe;
    return (review.summary ?? "").trim();
  } catch {
    return "";
  }
}

function harnessArgs(
  unit: FigmaExecutionUnit,
  mode: "verify" | "write",
  repairBudget = unit.maxRepairs,
): string[] {
  const args = ["run", mode === "verify" ? "figma:verify" : "figma:harness", "--"];
  if (mode === "write") args.push("--mode", "write");
  args.push("--scope", unit.scope, "--figma", unit.target);
  for (const doc of unit.docs) args.push("--doc", doc);
  if (mode === "write") args.push("--max-repairs", String(repairBudget));
  return args;
}

function nonNegativeInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error(`${label} must be an integer between 0 and 10`);
  }
  return value;
}

function persistState<TTask>(
  root: string,
  taskPath: string,
  task: TTask,
  policy: FigmaExecutionPolicy<TTask>,
  results: FigmaExecutionResult[],
  status: "PASS" | "FAILED",
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, harnessArtifactRoot, `workload-${policy.artifactPrefix}-${timestamp}`);
  mkdirSync(runDir, { recursive: true });
  const statePath = resolve(runDir, "workload-state.json");
  writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        workload: "figma",
        policy: policy.id,
        resolvedTask: taskPath,
        status,
        results,
        ...policy.evidence(task, results),
        completedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  return statePath;
}

export function executeFigmaWorkload<TTask>(
  root: string,
  taskPath: string,
  task: TTask,
  policy: FigmaExecutionPolicy<TTask>,
): void {
  const units = policy.units(task);
  if (units.length === 0) throw new Error(`figma policy ${policy.id} resolved zero execution units`);

  const results: FigmaExecutionResult[] = units.map((unit) => ({
    id: unit.id,
    review: "NOT_RUN",
    updated: false,
    status: "NOT_RUN",
    reviewExitCode: null,
    updateExitCode: null,
    reviewRun: null,
    writeRun: null,
  }));
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  const fail = (index: number, message: string, review: FigmaExecutionResult["review"] = "FAILED"): never => {
    results[index].review = review;
    results[index].status = "FAILED";
    results[index].message = message;
    const statePath = persistState(root, taskPath, task, policy, results, "FAILED");
    throw new Error(`${message}; workload state: ${statePath}`);
  };

  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    console.log(`[figma-workload] REVIEW ${unit.id} policy=${policy.id}`);

    const beforeReview = snapshotHarnessRuns(root);
    const reviewChild = spawnSync(npm, harnessArgs(unit, "verify"), {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });
    results[index].reviewExitCode = reviewChild.status;
    if (reviewChild.error) fail(index, `review failed to start: ${reviewChild.error.message}`);

    const reviewRun = newestNewHarnessRun(root, beforeReview);
    results[index].reviewRun = reviewRun;
    const summary = reviewSummary(reviewRun);
    const decision = policy.decideReview(task, unit, summary, reviewChild.status);

    if (decision === "PASS") {
      results[index].review = "PASS";
      results[index].status = "PASS";
      console.log(`[figma-workload] PASS ${unit.id} — zero mutation`);
      continue;
    }
    if (decision === "DOC_GAP") {
      fail(index, `planning/design authority gap for ${unit.id}; writer forbidden`, "DOC_GAP");
    }
    if (decision !== "WRITE") {
      fail(index, `review result for ${unit.id} does not satisfy policy ${policy.id}`);
    }

    results[index].review = "NEEDS_UPDATE";
    const maxWriteAttempts = nonNegativeInteger(
      policy.maxWriteAttempts?.(task, unit) ?? 1,
      `figma policy ${policy.id} maxWriteAttempts`,
    );
    const childRepairBudget = nonNegativeInteger(
      policy.childRepairBudget?.(task, unit) ?? unit.maxRepairs,
      `figma policy ${policy.id} childRepairBudget`,
    );

    if (maxWriteAttempts === 0) {
      fail(index, `repair budget exhausted for ${unit.id} before writer mutation`);
    }

    let completed = false;
    for (let attempt = 1; attempt <= maxWriteAttempts; attempt += 1) {
      console.log(
        `[figma-workload] UPDATE ${unit.id} — policy-authorized gap; writer attempt ${attempt}/${maxWriteAttempts}`,
      );
      const beforeWrite = snapshotHarnessRuns(root);
      const writeChild = spawnSync(npm, harnessArgs(unit, "write", childRepairBudget), {
        cwd: root,
        env: process.env,
        stdio: "inherit",
        windowsHide: true,
      });
      results[index].updateExitCode = writeChild.status;
      if (writeChild.error) fail(index, `writer failed to start: ${writeChild.error.message}`);

      const writeRun = newestNewHarnessRun(root, beforeWrite);
      results[index].writeRun = writeRun;
      const writeSummary = reviewSummary(writeRun);
      const postWriteDecision: ReviewDecision = policy.decideAfterWrite
        ? policy.decideAfterWrite(task, unit, writeSummary, writeChild.status)
        : policy.verifyAfterWrite(task, unit, writeSummary, writeChild.status)
          ? "PASS"
          : "FAIL";

      if (postWriteDecision === "PASS") {
        results[index].updated = true;
        results[index].status = "PASS";
        completed = true;
        console.log(`[figma-workload] PASS ${unit.id} — updated and independently verified`);
        break;
      }

      if (postWriteDecision === "DOC_GAP") {
        fail(index, `planning/design authority gap discovered after writer attempt for ${unit.id}; further writer mutation forbidden`, "DOC_GAP");
      }

      if (postWriteDecision === "WRITE") {
        if (attempt >= maxWriteAttempts) {
          fail(index, `repair budget exhausted for ${unit.id} after ${maxWriteAttempts} policy-owned writer attempt(s)`);
        }
        console.log(
          `[figma-workload] RETRY ${unit.id} — fresh review still reports a repairable policy gap`,
        );
        continue;
      }

      fail(index, `fresh post-write review did not satisfy policy ${policy.id} for ${unit.id}`);
    }

    if (!completed) fail(index, `writer loop ended without terminal verification for ${unit.id}`);
  }

  const statePath = persistState(root, taskPath, task, policy, results, "PASS");
  console.log(`[figma-workload] PASS policy=${policy.id}`);
  console.log(`[figma-workload] Workload state: ${statePath}`);
}
