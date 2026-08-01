import fs from "node:fs";
import path from "node:path";

const testRoot = path.resolve(__dirname, "..");
const modulesRoot = path.join(testRoot, "modules");
const outputPath = path.join(testRoot, "generated/traceability-index.json");

type ScenarioRecord = {
  id: string;
  title: string;
  module: string;
  specStatus: string;
  useCase: string;
  layer: string;
  rule?: string;
  feature: string;
  steps: string;
  contract?: string;
};

function findModuleDirectories(directory: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...findModuleDirectories(entryPath));
    if (entry.isFile() && entry.name === "manifest.yaml") result.push(directory);
  }
  return result.sort();
}

function tagsOn(line: string): string[] {
  return [...line.matchAll(/@([A-Za-z0-9-]+)/g)].map((match) => match[1]);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function readFeatureScenarios(source: string): Map<string, Omit<ScenarioRecord, "id" | "module" | "feature" | "steps" | "contract">> {
  const result = new Map<string, Omit<ScenarioRecord, "id" | "module" | "feature" | "steps" | "contract">>();
  let pendingTags: string[] = [];
  let ruleTags: string[] = [];
  let ruleName: string | undefined;

  for (const line of source.split(/\r?\n/)) {
    if (/^\s*@/.test(line)) {
      pendingTags.push(...tagsOn(line));
      continue;
    }
    const rule = line.match(/^\s*Rule\s*:\s*(.+)$/);
    if (rule) {
      ruleTags = pendingTags;
      ruleName = rule[1].trim();
      pendingTags = [];
      continue;
    }
    const scenario = line.match(/^\s*Scenario(?: Outline)?\s*:\s*(.+)$/);
    if (!scenario) {
      if (line.trim() && !/^\s*(Examples|\|)/.test(line)) pendingTags = [];
      continue;
    }
    const id = pendingTags.find((tag) => /^SC-[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(tag));
    if (id) {
      const useCase = unique([
        ...ruleTags.filter((tag) => /^UC-[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(tag)),
        ...pendingTags.filter((tag) => /^UC-[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(tag)),
      ])[0] ?? "";
      result.set(id, {
        title: scenario[1].trim(),
        specStatus: pendingTags.find((tag) => tag === "accepted" || tag === "deferred") ?? "",
        useCase,
        layer: pendingTags.find((tag) => ["acceptance", "api", "browser"].includes(tag)) ?? "",
        ...(ruleName ? { rule: ruleName } : {}),
      });
    }
    pendingTags = [];
  }
  return result;
}

function manifestScenarioIds(manifest: string): Set<string> {
  return new Set([...manifest.matchAll(/^\s{2}(SC-[A-Z0-9]+(?:-[A-Z0-9]+)+):/gm)].map((match) => match[1]));
}

const records: ScenarioRecord[] = [];
for (const modulePath of findModuleDirectories(modulesRoot)) {
  const manifest = fs.readFileSync(path.join(modulePath, "manifest.yaml"), "utf8");
  const moduleName = manifest.match(/^module:\s*(.+)$/m)?.[1]?.trim();
  const feature = manifest.match(/^\s+feature:\s*(.+)$/m)?.[1]?.trim();
  const steps = manifest.match(/^\s+steps:\s*(.+)$/m)?.[1]?.trim();
  const contract = manifest.match(/^\s{2}path:\s*(.+)$/m)?.[1]?.trim();
  if (!moduleName || !feature || !steps) continue;
  const featureSource = fs.readFileSync(path.join(testRoot, feature), "utf8");
  const scenarios = readFeatureScenarios(featureSource);
  const manifestIds = manifestScenarioIds(manifest);
  for (const [id, metadata] of scenarios) {
    if (!manifestIds.has(id)) continue;
    records.push({ id, module: moduleName, feature, steps, ...(contract ? { contract } : {}), ...metadata });
  }
}

records.sort((left, right) => left.id.localeCompare(right.id) || left.module.localeCompare(right.module));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({
  schemaVersion: 2,
  generatedBy: "tools/build-traceability-index.ts",
  scenarios: records,
}, null, 2)}\n`);
