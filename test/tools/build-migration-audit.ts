import fs from "node:fs";
import path from "node:path";

const testRoot = path.resolve(__dirname, "..");
const modulesRoot = path.join(testRoot, "modules");
const mappingPath = path.join(testRoot, "migration/legacy-mapping.json");
const outputPath = path.join(testRoot, "generated/migration-audit.json");

type MappingEntry = {
  source_path: string;
  source_line: number;
  test_title: string;
  old_id: string | null;
  owner: string;
  target_scenarios: string[];
  disposition: string;
  preserved_assertions: Array<Record<string, unknown>>;
};

function filesUnder(directory: string): string[] {
  const result: string[] = [];
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesUnder(entryPath));
    else result.push(entryPath);
  }
  return result;
}

function featureIds(): Set<string> {
  const result = new Set<string>();
  for (const featurePath of filesUnder(modulesRoot).filter((file) => file.endsWith(".feature"))) {
    const source = fs.readFileSync(featurePath, "utf8");
    for (const match of source.matchAll(/@((?:SC|UC)-[A-Z0-9-]+)/g)) {
      if (match[1].startsWith("SC-")) result.add(match[1]);
    }
  }
  return result;
}

const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8")) as {
  schemaVersion: number;
  entries: MappingEntry[];
};
const ids = featureIds();
const mapped = new Map<string, number>();
const invalidTargets: Array<Record<string, unknown>> = [];
const pendingSources: Array<Record<string, unknown>> = [];
const dispositions = new Map<string, number>();

for (const entry of mapping.entries) {
  dispositions.set(entry.disposition, (dispositions.get(entry.disposition) ?? 0) + 1);
  if (entry.target_scenarios.length === 0) {
    pendingSources.push({ source_path: entry.source_path, source_line: entry.source_line, test_title: entry.test_title });
  }
  for (const target of entry.target_scenarios) {
    mapped.set(target, (mapped.get(target) ?? 0) + 1);
    if (!ids.has(target)) {
      invalidTargets.push({ source_path: entry.source_path, source_line: entry.source_line, target });
    }
  }
}

const orphanScenarios = [...ids].filter((id) => !mapped.has(id)).sort();
const report = {
  schemaVersion: 1,
  generatedBy: "tools/build-migration-audit.ts",
  sourceEntries: mapping.entries.length,
  featureScenarioIds: ids.size,
  mappedSourceEntries: mapping.entries.length - pendingSources.length,
  pendingSourceEntries: pendingSources.length,
  invalidTargets,
  orphanScenarios,
  dispositions: Object.fromEntries([...dispositions.entries()].sort(([a], [b]) => a.localeCompare(b))),
  pendingSources,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

if (invalidTargets.length > 0) {
  console.error(`Migration audit found ${invalidTargets.length} target scenario IDs absent from features.`);
  process.exitCode = 1;
} else {
  console.log(`Migration audit: ${mapping.entries.length} source entries, ${pendingSources.length} pending.`);
}
