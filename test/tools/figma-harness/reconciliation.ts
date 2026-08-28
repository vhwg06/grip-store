export type ReconciliationAction = "patch" | "verify";
export type ReconciliationHarnessMode = "write" | "verify";

export interface ReconciliationDocSet {
  semantics: string[];
  baseUiUx: string[];
  deltaUiUx: string[];
  references?: string[];
}

export interface ReconciliationRoot {
  root: string;
  action: ReconciliationAction;
  scope: string;
  docs: ReconciliationDocSet;
  maxRepairs?: number;
}

export interface ReconciliationManifest {
  version: 1;
  name: string;
  roots: ReconciliationRoot[];
}

export interface ReconciliationPlanItem {
  root: string;
  action: ReconciliationAction;
  mode: ReconciliationHarnessMode;
  scope: string;
  docs: string[];
  maxRepairs: number;
}

function nonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function stringArray(value: unknown, field: string, allowEmpty = false): string[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  const result = value.map((entry, index) => nonEmptyString(entry, `${field}[${index}]`));
  if (!allowEmpty && result.length === 0) throw new Error(`${field} must not be empty`);
  return result;
}

function optionalRepairBudget(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 10) {
    throw new Error(`${field} must be an integer between 0 and 10`);
  }
  return value as number;
}

export function orderedDocs(docs: ReconciliationDocSet): string[] {
  return [
    ...docs.semantics,
    ...docs.baseUiUx,
    ...docs.deltaUiUx,
    ...(docs.references ?? []),
  ];
}

export function parseReconciliationManifest(input: unknown): ReconciliationManifest {
  if (!input || typeof input !== "object") throw new Error("manifest must be an object");
  const raw = input as Record<string, unknown>;
  if (raw.version !== 1) throw new Error("manifest.version must be 1");

  const name = nonEmptyString(raw.name, "manifest.name");
  if (!Array.isArray(raw.roots) || raw.roots.length === 0) {
    throw new Error("manifest.roots must be a non-empty array");
  }

  const seenRoots = new Set<string>();
  const roots = raw.roots.map((entry, index): ReconciliationRoot => {
    if (!entry || typeof entry !== "object") throw new Error(`manifest.roots[${index}] must be an object`);
    const item = entry as Record<string, unknown>;
    const root = nonEmptyString(item.root, `manifest.roots[${index}].root`);
    const rootKey = root.toLowerCase();
    if (seenRoots.has(rootKey)) throw new Error(`duplicate reconciliation root: ${root}`);
    seenRoots.add(rootKey);

    if (item.action !== "patch" && item.action !== "verify") {
      throw new Error(`manifest.roots[${index}].action must be patch or verify`);
    }
    const action = item.action as ReconciliationAction;
    const scope = nonEmptyString(item.scope, `manifest.roots[${index}].scope`);

    if (!item.docs || typeof item.docs !== "object") {
      throw new Error(`manifest.roots[${index}].docs must be an object`);
    }
    const rawDocs = item.docs as Record<string, unknown>;
    const docs: ReconciliationDocSet = {
      semantics: stringArray(rawDocs.semantics, `manifest.roots[${index}].docs.semantics`),
      baseUiUx: stringArray(rawDocs.baseUiUx, `manifest.roots[${index}].docs.baseUiUx`),
      deltaUiUx: stringArray(rawDocs.deltaUiUx ?? [], `manifest.roots[${index}].docs.deltaUiUx`, action === "verify"),
      references: stringArray(rawDocs.references ?? [], `manifest.roots[${index}].docs.references`, true),
    };

    const flattened = orderedDocs(docs);
    const unique = new Set(flattened);
    if (unique.size !== flattened.length) {
      throw new Error(`manifest root ${root} contains the same document more than once`);
    }

    const maxRepairs = optionalRepairBudget(item.maxRepairs, `manifest.roots[${index}].maxRepairs`);
    if (action === "verify" && maxRepairs !== undefined && maxRepairs !== 0) {
      throw new Error(`verify root ${root} cannot have a repair budget`);
    }

    return { root, action, scope, docs, maxRepairs };
  });

  return { version: 1, name, roots };
}

export function buildReconciliationPlan(
  manifest: ReconciliationManifest,
  defaultMaxRepairs: number,
  onlyRoots: string[] = [],
): ReconciliationPlanItem[] {
  if (!Number.isInteger(defaultMaxRepairs) || defaultMaxRepairs < 0 || defaultMaxRepairs > 10) {
    throw new Error("default repair budget must be an integer between 0 and 10");
  }

  const selected = new Set(onlyRoots.map((root) => root.toLowerCase()));
  if (selected.size > 0) {
    const known = new Set(manifest.roots.map((root) => root.root.toLowerCase()));
    for (const root of selected) {
      if (!known.has(root)) throw new Error(`unknown reconciliation root filter: ${root}`);
    }
  }

  return manifest.roots
    .filter((root) => selected.size === 0 || selected.has(root.root.toLowerCase()))
    .map((root) => ({
      root: root.root,
      action: root.action,
      mode: root.action === "patch" ? "write" : "verify",
      scope: root.scope,
      docs: orderedDocs(root.docs),
      maxRepairs: root.action === "verify" ? 0 : (root.maxRepairs ?? defaultMaxRepairs),
    }));
}
