import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildReconciliationPlan,
  parseReconciliationManifest,
} from "./figma-harness/reconciliation";

interface Options {
  manifest: string;
  figma: string;
  maxRepairs: number;
  roots: string[];
  dryRun: boolean;
}

interface RootRunResult {
  root: string;
  action: "patch" | "verify";
  mode: "write" | "verify";
  status: "PASS" | "FAILED" | "NOT_RUN";
  exitCode: number | null;
}

const root = process.cwd();
const reconciliationContract = ".agents/figma-reconciliation.md";

function die(message: string): never {
  console.error(`[figma-reconcile] ${message}`);
  process.exit(1);
}

function parseArgs(argv: string[]): Options {
  let manifest = "";
  let figma = "";
  let maxRepairs = 3;
  const roots: string[] = [];
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];

    if (arg === "--manifest") {
      if (!value) die("--manifest requires a value");
      manifest = value;
      i += 1;
      continue;
    }

    if (arg === "--figma") {
      if (!value) die("--figma requires a value");
      figma = value;
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

    if (arg === "--root") {
      if (!value) die("--root requires a value");
      roots.push(value);
      i += 1;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:\n  npm run figma:reconcile -- \\\n    --manifest docs/srs/figma-vertical-reconciliation.json \\\n    --figma "<Figma file/page reference>" \\\n    --max-repairs 3\n\nOptional:\n  --root <name>   Run only the named canonical root. Repeat to select multiple roots.\n  --dry-run       Validate manifest/docs and print the execution plan without mutating Figma.\n\nSemantics:\n- action=patch runs one normal figma:harness write lifecycle for that canonical root;\n- action=verify runs one read-only verification lifecycle;\n- every child receives .agents/figma-reconciliation.md before product/design docs;\n- product/design docs are then supplied in authority order: semantics → existing UI/UX base → delta → reference;\n- roots execute sequentially in manifest order;\n- the wave stops on the first non-PASS child lifecycle;\n- it never automatically restarts a failed root with a fresh repair budget;\n- use an explicit --root invocation when a human intentionally starts a new lifecycle later.\n`);
      process.exit(0);
    }

    die(`unknown argument: ${arg}`);
  }

  if (!manifest) die("--manifest is required");
  if (!figma) die("--figma is required");
  return { manifest, figma, maxRepairs, roots, dryRun };
}

function loadPlan(options: Options) {
  const contractPath = resolve(root, reconciliationContract);
  if (!existsSync(contractPath)) die(`reconciliation contract not found: ${reconciliationContract}`);

  const manifestPath = resolve(root, options.manifest);
  if (!existsSync(manifestPath)) die(`manifest not found: ${options.manifest}`);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    die(`invalid JSON manifest: ${error instanceof Error ? error.message : String(error)}`);
  }

  let manifest;
  try {
    manifest = parseReconciliationManifest(raw);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  let plan;
  try {
    plan = buildReconciliationPlan(manifest, options.maxRepairs, options.roots);
  } catch (error) {
    die(error instanceof Error ? error.message : String(error));
  }

  if (plan.length === 0) die("reconciliation plan is empty");

  for (const item of plan) {
    for (const doc of item.docs) {
      if (!existsSync(resolve(root, doc))) {
        die(`input document not found for ${item.root}: ${doc}`);
      }
    }
  }

  return { manifest, plan };
}

function printPlan(name: string, plan: ReturnType<typeof buildReconciliationPlan>): void {
  console.log(`[figma-reconcile] wave=${name}`);
  console.log(`[figma-reconcile] execution-contract=${reconciliationContract}`);
  for (const [index, item] of plan.entries()) {
    console.log(
      `[figma-reconcile] ${index + 1}. ${item.root} action=${item.action} mode=${item.mode} docs=${item.docs.length}` +
        (item.mode === "write" ? ` maxRepairs=${item.maxRepairs}` : ""),
    );
    item.docs.forEach((doc, docIndex) => {
      console.log(`[figma-reconcile]    ${docIndex + 1}. ${doc}`);
    });
  }
}

function writeWaveState(
  name: string,
  manifestPath: string,
  figma: string,
  results: RootRunResult[],
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = resolve(root, "artifacts", "figma-harness", `reconciliation-${timestamp}`);
  mkdirSync(runDir, { recursive: true });
  const statePath = resolve(runDir, "wave-state.json");
  writeFileSync(
    statePath,
    JSON.stringify({
      wave: name,
      manifest: manifestPath,
      figma,
      executionContract: reconciliationContract,
      results,
      completedAt: new Date().toISOString(),
    }, null, 2),
    "utf8",
  );
  return statePath;
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));
  const { manifest, plan } = loadPlan(options);
  printPlan(manifest.name, plan);

  if (options.dryRun) {
    console.log("[figma-reconcile] DRY_RUN PASS — manifest, contract, and documents are valid; no Figma lifecycle started.");
    return;
  }

  const results: RootRunResult[] = plan.map((item) => ({
    root: item.root,
    action: item.action,
    mode: item.mode,
    status: "NOT_RUN",
    exitCode: null,
  }));

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";

  for (let index = 0; index < plan.length; index += 1) {
    const item = plan[index];
    console.log(`[figma-reconcile] START ${item.root} (${item.action})`);

    const args = [
      "run",
      "figma:harness",
      "--",
      "--mode",
      item.mode,
      "--scope",
      item.scope,
      "--figma",
      options.figma,
      "--doc",
      reconciliationContract,
    ];

    for (const doc of item.docs) args.push("--doc", doc);
    if (item.mode === "write") args.push("--max-repairs", String(item.maxRepairs));

    const child = spawnSync(npm, args, {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    const exitCode = child.status;
    if (child.error) {
      console.error(`[figma-reconcile] ${item.root} failed to start: ${child.error.message}`);
    }

    results[index] = {
      root: item.root,
      action: item.action,
      mode: item.mode,
      status: exitCode === 0 && !child.error ? "PASS" : "FAILED",
      exitCode,
    };

    if (results[index].status !== "PASS") {
      const statePath = writeWaveState(manifest.name, options.manifest, options.figma, results);
      console.error(`[figma-reconcile] STOP ${item.root} failed. No later root will run.`);
      console.error(`[figma-reconcile] Wave state: ${statePath}`);
      process.exit(exitCode && exitCode > 0 ? exitCode : 1);
    }

    console.log(`[figma-reconcile] PASS ${item.root}`);
  }

  const statePath = writeWaveState(manifest.name, options.manifest, options.figma, results);
  console.log(`[figma-reconcile] PASS wave=${manifest.name}`);
  console.log(`[figma-reconcile] Wave state: ${statePath}`);
}

run();
