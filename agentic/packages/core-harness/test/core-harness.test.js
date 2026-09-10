import test from "node:test";
import assert from "node:assert/strict";
import {
  EvaluationValidity,
  EvaluationVerdict,
  MemoryKind,
  createCoreHarness,
  createInMemorySessionStore
} from "../src/index.js";

function fixture({ evaluator, resolver, consolidator, supervisor } = {}) {
  let id = 0;
  let time = 0;
  const store = createInMemorySessionStore();
  const environment = {
    async observe({ candidate, request }) {
      return { candidateSeen: candidate.version, request };
    },
    async act({ candidate, action }) {
      if (!action.mutate) return { mutated: false, result: action.result ?? null };
      return {
        mutated: true,
        candidate: { id: candidate.id, version: action.nextVersion },
        result: action.result ?? null
      };
    }
  };

  const harness = createCoreHarness({
    environment,
    evaluator: evaluator ?? {
      async evaluate() {
        return { validity: EvaluationValidity.VALID, verdict: EvaluationVerdict.PASS };
      }
    },
    sessionStore: store,
    contextResolver: resolver ?? null,
    memoryConsolidator: consolidator ?? null,
    supervisor: supervisor ?? null,
    idFactory: () => `id-${++id}`,
    clock: () => `2026-09-10T00:00:${String(++time).padStart(2, "0")}Z`
  });

  return { harness, store };
}

const work = { id: "work-1", objective: "opaque work" };
const seed = { id: "candidate", version: "v0" };

test("starts with a baseline lineage and keeps raw trajectory out of default context", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.observe("s1", { kind: "inspect" });

  const context = await harness.context("s1");
  assert.equal(context.indexes.lineage.count, 1);
  assert.equal(context.indexes.lineage.head.kind, "BASELINE");
  assert.equal(context.indexes.observations.count, 1);
  assert.deepEqual(context.indexes.trajectory, { eventCount: 2, lastEventId: "id-3" });
  assert.equal("lineage" in context, false);
  assert.equal("observations" in context, false);
  assert.equal("memory" in context, false);

  assert.equal((await harness.lineage("s1")).length, 1);
  assert.equal((await harness.observations("s1")).length, 1);
  const raw = await harness.trajectory("s1");
  assert.equal(raw.length, 2);
});

test("sessions are isolated and context resolver receives only the selected session", async () => {
  const seen = [];
  const { harness } = fixture({
    resolver: {
      async resolve(input) {
        seen.push(input);
        return { resolvedFor: input.work.id, problem: input.problem };
      }
    }
  });

  await harness.start({ sessionId: "a", work: { id: "A" }, seedCandidate: seed });
  await harness.start({ sessionId: "b", work: { id: "B" }, seedCandidate: { id: "candidate-b", version: "v0" } });

  const context = await harness.context("a", { problem: "only A" });
  assert.deepEqual(context.resolvedContext, { resolvedFor: "A", problem: "only A" });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].sessionId, "a");
  assert.equal(seen[0].work.id, "A");
});

test("mutation changes candidate and stale observations are not fed as current context", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.observe("s1", { step: "before" });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });

  const context = await harness.context("s1");
  assert.equal(context.candidate.version, "v1");
  assert.equal(context.indexes.observations.count, 0);
  assert.equal((await harness.observations("s1")).length, 0);

  const history = await harness.trajectory("s1");
  assert.equal(history.some((event) => event.type === "OBSERVED"), true);
});

test("failed and inconclusive evaluations never enter committed lineage", async () => {
  let call = 0;
  const { harness } = fixture({
    evaluator: {
      async evaluate() {
        call += 1;
        if (call === 1) return { validity: EvaluationValidity.VALID, verdict: EvaluationVerdict.GAP };
        return { validity: EvaluationValidity.INCONCLUSIVE };
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");
  await assert.rejects(() => harness.promote("s1"), /did not pass/);
  await harness.evaluate("s1");
  await assert.rejects(() => harness.promote("s1"), /not valid/);

  const context = await harness.context("s1");
  assert.equal(context.indexes.lineage.count, 1);
});

test("a pass for an older candidate cannot promote a newer mutation", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");
  await harness.act("s1", { mutate: true, nextVersion: "v2" });

  await assert.rejects(() => harness.promote("s1"), /has not been evaluated/);
  const context = await harness.context("s1");
  assert.equal(context.indexes.lineage.count, 1);
});

test("only a fresh valid pass promotes the current candidate", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  const evaluation = await harness.evaluate("s1");
  const promotion = await harness.promote("s1");

  assert.equal(promotion.kind, "PROMOTED");
  assert.equal(promotion.candidate.version, "v1");
  assert.equal(promotion.evaluation, evaluation.id);

  const lineage = await harness.lineage("s1");
  assert.deepEqual(lineage.map((entry) => entry.candidate.version), ["v0", "v1"]);
  await assert.rejects(() => harness.promote("s1"), /already committed/);
});

test("memory is compacted only through the explicit consolidator on promotion", async () => {
  let receivedTrajectory = null;
  const { harness } = fixture({
    consolidator: {
      async consolidate({ trajectory }) {
        receivedTrajectory = trajectory;
        return [{
          kind: MemoryKind.FAILED_DIRECTION,
          statement: "direction X was rejected by fresh evidence",
          evidence: ["eval-1"],
          scope: "work-1"
        }];
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");
  assert.equal((await harness.context("s1")).indexes.memory.count, 0);
  await harness.promote("s1");

  const context = await harness.context("s1");
  assert.equal(context.indexes.memory.count, 1);
  const memory = await harness.memory("s1");
  assert.equal(memory[0].kind, MemoryKind.FAILED_DIRECTION);
  assert.ok(receivedTrajectory.some((event) => event.type === "EVALUATED"));
});

test("persistent memory rejects unsupported claims without evidence", async () => {
  const { harness } = fixture({
    consolidator: {
      async consolidate() {
        return [{ kind: MemoryKind.FINDING, statement: "unsupported", evidence: [] }];
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");
  await assert.rejects(() => harness.promote("s1"), /requires evidence/);
});

test("supervisor can add guidance but cannot mutate the candidate", async () => {
  const { harness } = fixture({
    supervisor: {
      async inspect() {
        return { reason: "plateau", suggestions: ["try another direction"] };
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  const before = (await harness.context("s1")).candidate;
  const intervention = await harness.reviewProgress("s1");
  const after = (await harness.context("s1")).candidate;

  assert.equal(intervention.guidance.reason, "plateau");
  assert.deepEqual(after, before);
});

test("resume restores the full harness state from the injected session store without dumping it", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.observe("s1", { kind: "runtime" });

  const resumed = await harness.resume("s1");
  assert.equal(resumed.candidate.version, "v1");
  assert.equal(resumed.lineage.count, 1);
  assert.equal(resumed.memory.count, 0);
  assert.equal(resumed.trajectory.eventCount, 3);
  assert.equal(Array.isArray(resumed.lineage), false);
});
