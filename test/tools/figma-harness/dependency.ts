export interface FigmaPipelineNode {
  id: string;
  scope: string;
  dependsOn: string[];
  docs: string[];
  maxRepairs?: number;
}

export interface FigmaPipelineGraph {
  version: 1;
  name: string;
  nodes: FigmaPipelineNode[];
}

export interface FigmaPipelinePlanItem {
  id: string;
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

function assertAcyclic(nodes: FigmaPipelineNode[]): void {
  const byId = new Map(nodes.map((node) => [node.id.toLowerCase(), node]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (key: string, path: string[]): void => {
    if (visited.has(key)) return;
    if (visiting.has(key)) {
      const cycleStart = path.indexOf(key);
      const cycle = [...path.slice(cycleStart), key]
        .map((id) => byId.get(id)?.id ?? id)
        .join(" -> ");
      throw new Error(`figma dependency graph contains a cycle: ${cycle}`);
    }

    visiting.add(key);
    const node = byId.get(key)!;
    for (const dependency of node.dependsOn) {
      visit(dependency.toLowerCase(), [...path, key]);
    }
    visiting.delete(key);
    visited.add(key);
  };

  for (const key of byId.keys()) visit(key, []);
}

export function parseFigmaPipelineGraph(input: unknown): FigmaPipelineGraph {
  if (!input || typeof input !== "object") throw new Error("graph must be an object");
  const raw = input as Record<string, unknown>;
  if (raw.version !== 1) throw new Error("graph.version must be 1");

  const name = nonEmptyString(raw.name, "graph.name");
  if (!Array.isArray(raw.nodes) || raw.nodes.length === 0) {
    throw new Error("graph.nodes must be a non-empty array");
  }

  const seen = new Set<string>();
  const nodes = raw.nodes.map((entry, index): FigmaPipelineNode => {
    if (!entry || typeof entry !== "object") throw new Error(`graph.nodes[${index}] must be an object`);
    const item = entry as Record<string, unknown>;
    const id = nonEmptyString(item.id, `graph.nodes[${index}].id`);
    const key = id.toLowerCase();
    if (seen.has(key)) throw new Error(`duplicate figma pipeline node: ${id}`);
    seen.add(key);

    const scope = nonEmptyString(item.scope, `graph.nodes[${index}].scope`);
    const dependsOn = stringArray(item.dependsOn ?? [], `graph.nodes[${index}].dependsOn`, true);
    const docs = stringArray(item.docs, `graph.nodes[${index}].docs`);
    const maxRepairs = optionalRepairBudget(item.maxRepairs, `graph.nodes[${index}].maxRepairs`);

    if (new Set(docs).size !== docs.length) {
      throw new Error(`graph node ${id} contains the same document more than once`);
    }

    return { id, scope, dependsOn, docs, maxRepairs };
  });

  const known = new Map(nodes.map((node) => [node.id.toLowerCase(), node.id]));
  for (const node of nodes) {
    const dependencyKeys = new Set<string>();
    for (const dependency of node.dependsOn) {
      const key = dependency.toLowerCase();
      if (key === node.id.toLowerCase()) throw new Error(`${node.id} cannot depend on itself`);
      if (!known.has(key)) throw new Error(`${node.id} depends on unknown node: ${dependency}`);
      if (dependencyKeys.has(key)) throw new Error(`${node.id} declares duplicate dependency: ${dependency}`);
      dependencyKeys.add(key);
    }
  }

  assertAcyclic(nodes);
  return { version: 1, name, nodes };
}

export function buildFigmaPipelinePlan(
  graph: FigmaPipelineGraph,
  changedNodes: string[],
  defaultMaxRepairs: number,
): FigmaPipelinePlanItem[] {
  if (!Number.isInteger(defaultMaxRepairs) || defaultMaxRepairs < 0 || defaultMaxRepairs > 10) {
    throw new Error("default repair budget must be an integer between 0 and 10");
  }
  if (changedNodes.length === 0) throw new Error("at least one changed Figma pipeline node is required");

  const byKey = new Map(graph.nodes.map((node) => [node.id.toLowerCase(), node]));
  const rebuild = new Set<string>();
  const queue: string[] = [];

  for (const changed of changedNodes) {
    const key = changed.toLowerCase();
    if (!byKey.has(key)) throw new Error(`unknown changed Figma pipeline node: ${changed}`);
    if (!rebuild.has(key)) {
      rebuild.add(key);
      queue.push(key);
    }
  }

  const dependents = new Map<string, string[]>();
  for (const node of graph.nodes) {
    for (const dependency of node.dependsOn) {
      const key = dependency.toLowerCase();
      const list = dependents.get(key) ?? [];
      list.push(node.id.toLowerCase());
      dependents.set(key, list);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const dependent of dependents.get(current) ?? []) {
      if (rebuild.has(dependent)) continue;
      rebuild.add(dependent);
      queue.push(dependent);
    }
  }

  const indegree = new Map<string, number>();
  for (const key of rebuild) {
    const node = byKey.get(key)!;
    indegree.set(
      key,
      node.dependsOn.filter((dependency) => rebuild.has(dependency.toLowerCase())).length,
    );
  }

  const graphOrder = new Map(graph.nodes.map((node, index) => [node.id.toLowerCase(), index]));
  const ready = [...rebuild]
    .filter((key) => indegree.get(key) === 0)
    .sort((a, b) => graphOrder.get(a)! - graphOrder.get(b)!);
  const ordered: string[] = [];

  while (ready.length > 0) {
    const key = ready.shift()!;
    ordered.push(key);
    for (const dependent of dependents.get(key) ?? []) {
      if (!rebuild.has(dependent)) continue;
      indegree.set(dependent, indegree.get(dependent)! - 1);
      if (indegree.get(dependent) === 0) {
        ready.push(dependent);
        ready.sort((a, b) => graphOrder.get(a)! - graphOrder.get(b)!);
      }
    }
  }

  if (ordered.length !== rebuild.size) {
    throw new Error("could not topologically order Figma rebuild nodes");
  }

  return ordered.map((key) => {
    const node = byKey.get(key)!;
    return {
      id: node.id,
      scope: node.scope,
      docs: node.docs,
      maxRepairs: node.maxRepairs ?? defaultMaxRepairs,
    };
  });
}
