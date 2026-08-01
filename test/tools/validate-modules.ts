import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const testRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(testRoot, "..");
const modulesRoot = path.join(testRoot, "modules");
const contractsRoot = path.join(testRoot, "contracts");
const mappingPath = path.join(testRoot, "migration/legacy-mapping.json");
const errors: string[] = [];
const scenarioOwners = new Map<string, string>();
const contractRefOwners = new Map<string, string>();

const scenarioIdPattern = /^SC-[A-Z0-9]+(?:-[A-Z0-9]+)+$/;
const useCasePattern = /^UC-[A-Z0-9]+(?:-[A-Z0-9]+)+$/;
const allowedLayers = new Set(["acceptance", "api", "browser"]);

type FeatureScenario = {
  id: string;
  title: string;
  status: "accepted" | "deferred" | undefined;
  layer: string | undefined;
  useCases: string[];
  rule?: string;
  line: number;
};

function filesUnder(directory: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function findModules(directory: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...findModules(entryPath));
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

function featureScenarios(feature: string): Map<string, FeatureScenario> {
  const result = new Map<string, FeatureScenario>();
  let pendingTags: string[] = [];
  let ruleTags: string[] = [];
  let ruleName: string | undefined;

  for (const [index, line] of feature.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;
    if (/^\s*@/.test(line)) {
      pendingTags = [...pendingTags, ...tagsOn(line)];
      continue;
    }
    if (/^\s*Feature\s*:/.test(line)) {
      if (pendingTags.some((tag) => useCasePattern.test(tag) || scenarioIdPattern.test(tag))) {
        errors.push(`${index + 1}: UC/SC tags must not be attached to Feature`);
      }
      pendingTags = [];
      continue;
    }
    const rule = line.match(/^\s*Rule\s*:\s*(.+)$/);
    if (rule) {
      if (pendingTags.some((tag) => scenarioIdPattern.test(tag))) {
        errors.push(`${index + 1}: Scenario ID tags must not be attached to Rule`);
      }
      ruleTags = pendingTags;
      ruleName = rule[1].trim();
      pendingTags = [];
      continue;
    }
    const scenario = line.match(/^\s*Scenario(?: Outline)?\s*:\s*(.+)$/);
    if (!scenario) {
      if (trimmed && !/^\s*(Examples|\|)/.test(line)) pendingTags = [];
      continue;
    }

    const directIds = unique(pendingTags.filter((tag) => scenarioIdPattern.test(tag)));
    if (directIds.length !== 1) {
      errors.push(`${index + 1}: Scenario must have exactly one direct @SC-* tag`);
    }
    const directUseCases = pendingTags.filter((tag) => useCasePattern.test(tag));
    const inheritedUseCases = ruleTags.filter((tag) => useCasePattern.test(tag));
    const effectiveUseCases = unique([...inheritedUseCases, ...directUseCases]);
    if (effectiveUseCases.length !== 1) {
      errors.push(`${index + 1}: Scenario must resolve to exactly one effective @UC-* tag`);
    }
    const statuses = unique(pendingTags.filter((tag) => tag === "accepted" || tag === "deferred"));
    if (statuses.length > 1) errors.push(`${index + 1}: Scenario cannot be both accepted and deferred`);
    const layers = unique(pendingTags.filter((tag) => allowedLayers.has(tag)));
    if (layers.length !== 1) errors.push(`${index + 1}: Scenario must have exactly one execution layer tag`);
    if (directIds.length === 1) {
      if (result.has(directIds[0])) errors.push(`${index + 1}: duplicate scenario ID ${directIds[0]}`);
      else {
        result.set(directIds[0], {
          id: directIds[0],
          title: scenario[1].trim(),
          status: statuses[0] as FeatureScenario["status"],
          layer: layers[0],
          useCases: effectiveUseCases,
          rule: ruleName,
          line: index + 1,
        });
      }
    }
    pendingTags = [];
  }
  return result;
}

function featureStepTexts(feature: string): Set<string> {
  const result = new Set<string>();
  for (const line of feature.split(/\r?\n/)) {
    const step = line.match(/^\s*(?:Given|When|Then|And|But)\s+(.+)$/);
    if (step) result.add(step[1].trim());
  }
  return result;
}

function stepDefinitions(source: string): Set<string> {
  const result = new Set<string>();
  const definition = /\b(?:Given|When|Then)\(\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/g;
  for (const match of source.matchAll(definition)) {
    result.add((match[1] ?? match[2]).replace(/\\(["'])/g, "$1"));
  }
  return result;
}

type ManifestScenario = { id: string; body: string };

function manifestScenarioLines(manifest: string): Map<string, ManifestScenario> {
  const result = new Map<string, ManifestScenario>();
  for (const match of manifest.matchAll(/^\s{2}(SC-[A-Z0-9]+(?:-[A-Z0-9]+)+):(?:\s*\{([^}]*)\})?/gm)) {
    result.set(match[1], { id: match[1], body: match[2] ?? "" });
  }
  return result;
}

type ContractDeclaration = { type?: string; path?: string; refs: string[] };

function parseManifestContract(manifest: string): ContractDeclaration | undefined {
  if (!/^contract:\s*$/m.test(manifest)) return undefined;
  return {
    type: manifest.match(/^\s{2}type:\s*(.+)$/m)?.[1]?.trim(),
    path: manifest.match(/^\s{2}path:\s*(.+)$/m)?.[1]?.trim(),
    refs: [...manifest.matchAll(/^\s{4}-\s+([A-Za-z0-9._-]+)\s*$/gm)].map((match) => match[1]),
  };
}

function isTestRootRelativePath(value: string): boolean {
  return !path.isAbsolute(value) && !path.relative(testRoot, path.resolve(testRoot, value)).startsWith("..");
}

for (const contractFile of filesUnder(contractsRoot)) {
  if (!contractFile.endsWith(".md")) continue;
  const relative = path.relative(testRoot, contractFile).split(path.sep).join("/");
  const source = fs.readFileSync(contractFile, "utf8");
  for (const match of source.matchAll(/<!--\s*contract-ref:\s*([A-Za-z0-9._-]+)\s*-->/g)) {
    const ref = match[1];
    const previous = contractRefOwners.get(ref);
    if (previous) errors.push(`contract ref ${ref} is duplicated in ${previous} and ${relative}`);
    else contractRefOwners.set(ref, relative);
  }
}

if (!fs.existsSync(mappingPath)) errors.push("migration/legacy-mapping.json is missing");

for (const modulePath of findModules(modulesRoot)) {
  const moduleRelative = path.relative(testRoot, modulePath).split(path.sep).join("/");
  const manifestPath = path.join(modulePath, "manifest.yaml");
  const manifest = fs.readFileSync(manifestPath, "utf8");
  const moduleName = manifest.match(/^module:\s*(.+)$/m)?.[1]?.trim();
  const expectedModuleName = moduleRelative.replace(/^modules\//, "").replaceAll("/", ".");
  if (moduleName !== expectedModuleName) errors.push(`${moduleRelative}: module name must be ${expectedModuleName}`);

  for (const required of ["README.md", "behavior.feature", "behavior.steps.ts", "manifest.yaml"]) {
    if (!fs.existsSync(path.join(modulePath, required))) errors.push(`${moduleRelative}: missing ${required}`);
  }

  const featurePath = path.join(modulePath, "behavior.feature");
  const stepsPath = path.join(modulePath, "behavior.steps.ts");
  const featureFiles = filesUnder(modulePath).filter((file) => file.endsWith(".feature"));
  if (featureFiles.length !== 1 || featureFiles[0] !== featurePath) {
    errors.push(`${moduleRelative}: module must own exactly one feature at behavior.feature`);
  }
  for (const file of filesUnder(modulePath)) {
    if (file.endsWith(".spec.ts") || file.endsWith(".spec.js")) {
      errors.push(`${moduleRelative}: native spec files are not allowed`);
    }
  }

  const featureSource = fs.existsSync(featurePath) ? fs.readFileSync(featurePath, "utf8") : "";
  const featureMeta = featureScenarios(featureSource);
  if (fs.existsSync(stepsPath)) {
    const stepsSource = fs.readFileSync(stepsPath, "utf8");
    if (!stepsSource.includes('from "@cucumber/cucumber"')) errors.push(`${moduleRelative}: steps are not Cucumber bindings`);
    if (!stepsSource.includes("Before(")) errors.push(`${moduleRelative}: behavior.steps.ts must register its module binding`);
    if (!stepsSource.includes(`this.activeModule = "${moduleName}"`)) errors.push(`${moduleRelative}: module binding is missing`);
    const localDefinitions = stepDefinitions(stepsSource);
    for (const step of featureStepTexts(featureSource)) {
      if (!localDefinitions.has(step)) errors.push(`${moduleRelative}: unbound local step: ${step}`);
    }
    if (/executors?\s*\[.*(?:scenarioId|scenarioBinding)|switch\s*\(.*(?:scenarioId|scenarioBinding)/s.test(stepsSource)) {
      errors.push(`${moduleRelative}: implementation dispatch by scenario identity is forbidden`);
    }
  }

  const manifestFeature = manifest.match(/^\s+feature:\s*(.+)$/m)?.[1]?.trim();
  const manifestSteps = manifest.match(/^\s+steps:\s*(.+)$/m)?.[1]?.trim();
  if (!manifestFeature || !fs.existsSync(path.join(testRoot, manifestFeature))) errors.push(`${moduleRelative}: manifest feature path is missing`);
  if (!manifestSteps || !fs.existsSync(path.join(testRoot, manifestSteps))) errors.push(`${moduleRelative}: manifest steps path is missing`);

  const manifestScenarios = manifestScenarioLines(manifest);
  for (const [id, meta] of featureMeta) {
    const previous = scenarioOwners.get(id);
    if (previous) errors.push(`${id}: claimed by both ${previous} and ${moduleRelative}`);
    scenarioOwners.set(id, moduleRelative);
    if (!manifestScenarios.has(id)) errors.push(`${moduleRelative}: ${id} is absent from manifest`);
    if (!meta.status) errors.push(`${moduleRelative}/${id}: missing @accepted or @deferred`);
  }
  for (const id of manifestScenarios.keys()) {
    if (!featureMeta.has(id)) errors.push(`${moduleRelative}: manifest declares ${id} absent from feature`);
  }
  for (const id of manifestScenarios.keys()) {
    if (!scenarioIdPattern.test(id)) errors.push(`${moduleRelative}: invalid scenario ID ${id}`);
  }

  const contractDeclaration = parseManifestContract(manifest);
  if (contractDeclaration) {
    if (!contractDeclaration.type || !["markdown", "openapi"].includes(contractDeclaration.type)) errors.push(`${moduleRelative}: invalid contract.type`);
    if (!contractDeclaration.path) errors.push(`${moduleRelative}: contract.path is required`);
    else if (!isTestRootRelativePath(contractDeclaration.path) || !fs.existsSync(path.resolve(testRoot, contractDeclaration.path))) errors.push(`${moduleRelative}: contract path is missing or not test-root-relative`);
    if (new Set(contractDeclaration.refs).size !== contractDeclaration.refs.length) errors.push(`${moduleRelative}: duplicate contract refs`);
    for (const ref of contractDeclaration.refs) {
      const owner = contractRefOwners.get(ref);
      if (!owner) errors.push(`${moduleRelative}: missing contract ref ${ref}`);
      else if (owner !== contractDeclaration.path) errors.push(`${moduleRelative}: contract ref ${ref} belongs to ${owner}`);
    }
  }
}

for (const oldRoot of ["specs", "tests", "support"]) {
  if (fs.existsSync(path.join(testRoot, oldRoot))) errors.push(`old root remains: test/${oldRoot}`);
}

try {
  const tracked = execFileSync("git", ["ls-files", "--", "test/generated/playwright-bdd"], { cwd: repoRoot, encoding: "utf8" }).trim();
  if (tracked) errors.push("generated/playwright-bdd must be git-untracked");
} catch {
  errors.push("could not inspect Git tracking state for generated/playwright-bdd");
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${findModules(modulesRoot).length} vertical-slice modules and ${scenarioOwners.size} scenario IDs.`);
}
