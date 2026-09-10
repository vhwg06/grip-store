import test from "node:test";
import assert from "node:assert/strict";
import {
  EvaluationValidity,
  EvaluationVerdict,
  ImplementationStatus,
  KnowledgeKind,
  createCoreHarness,
  createInMemorySessionStore
} from "../src/index.js";

function fixture({ evaluator, projector, supervisor } = {}) {
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
    contextProjector: projector ?? null,
    supervisor: supervisor ?? {
      async inspect() {
        return null;
      }
    },
    idFactory: () => `id-${++id}`,
    clock: () => `2026-09-10T00:00:${String(++time).padStart(2, "0")}Z`
  });

  return { harness, store };
}

const work = { id: "work-1", objective: "opaque work" };
const seed = { id: "candidate", version: "v0" };

test("persistent work state is first-class while default context stays selective", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.observe("s1", { kind: "compiler" });

  const context = await harness.context("s1");
  assert.equal(context.candidate.version, "v0");
  assert.equal(context.indexes.currentObservations.count, 1);
  assert.equal(context.indexes.implementations.count, 1);
  assert.equal("observations" in context, false);
  assert.equal("trajectory" in context, false);
  assert.equal("knowledge" in context, false);

  const state = await harness.workState("s1");
  assert.equal(state.persistentMemory.observations.length, 1);
  assert.equal(state.trajectory.length, 2);
  assert.equal(state.persistentMemory.implementations.length, 1);
});

test("every mutated implementation persists across the search, not only promoted lineage", async () => {
  const { harness } = fixture({
    evaluator: {
      async evaluate() {
        return { validity: EvaluationValidity.VALID, verdict: EvaluationVerdict.GAP };
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");
  await harness.act("s1", { mutate: true, nextVersion: "v2" });

  const implementations = await harness.implementationHistory("s1");
  assert.deepEqual(implementations.map((item) => item.candidate.version), ["v0", "v1", "v2"]);
  assert.deepEqual(implementations.map((item) => item.status), [
    ImplementationStatus.BASELINE,
    ImplementationStatus.WORKING,
    ImplementationStatus.WORKING
  ]);
  assert.equal((await harness.lineage("s1")).length, 1);
});

test("prior compiler/profiler style observations remain persistent but are not blindly injected as current evidence", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.observe("s1", { kind: "compiler", run: 1 });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.observe("s1", { kind: "profiler", run: 2 });

  assert.equal((await harness.observations("s1")).length, 2);
  assert.equal((await harness.observations("s1", { currentCandidateOnly: true })).length, 1);
  assert.equal((await harness.context("s1")).indexes.currentObservations.count, 1);
});

test("explicit accumulated engineering knowledge persists without becoming raw conversation history", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.recordKnowledge("s1", {
    kind: KnowledgeKind.HYPOTHESIS,
    statement: "database scan may dominate latency"
  });
  await harness.recordKnowledge("s1", {
    kind: KnowledgeKind.FINDING,
    statement: "database scan dominates latency",
    evidence: ["profile-1"]
  });

  const knowledge = await harness.knowledge("s1");
  assert.equal(knowledge.length, 2);
  assert.equal((await harness.context("s1")).indexes.knowledge.count, 2);
  assert.equal("knowledge" in await harness.context("s1"), false);
});

test("evidence-backed knowledge rejects unsupported durable findings", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });

  await assert.rejects(
    () => harness.recordKnowledge("s1", { kind: KnowledgeKind.FINDING, statement: "unsupported" }),
    /requires evidence/
  );
});

test("context projector selects from persistent engineering state instead of reconstructing history", async () => {
  const seen = [];
  const { harness } = fixture({
    projector: {
      async project({ problem, progress }) {
        seen.push(progress);
        return {
          problem,
          previousVersions: progress.persistentMemory.implementations.map((item) => item.candidate.version),
          priorEvaluationCount: progress.persistentMemory.evaluations.length
        };
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");

  const context = await harness.context("s1", { problem: "what should I try next?" });
  assert.deepEqual(context.projected.previousVersions, ["v0", "v1"]);
  assert.equal(context.projected.priorEvaluationCount, 1);
  assert.equal(seen.length, 1);
});

test("supervision is automatic at progress checkpoints and only redirects strategy", async () => {
  const triggers = [];
  const { harness } = fixture({
    supervisor: {
      async inspect({ trigger }) {
        triggers.push(trigger.type);
        if (trigger.type === "EVALUATED") {
          return { reason: "search plateau", guidance: { strategy: "try a different approach" } };
        }
        return null;
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.observe("s1", { kind: "inspect" });
  assert.deepEqual(triggers, []);

  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");

  assert.deepEqual(triggers, ["ACTED", "EVALUATED"]);
  const context = await harness.context("s1");
  assert.equal(context.latestIntervention.reason, "search plateau");
  assert.equal(context.candidate.version, "v1");
});

test("supervisor cannot become a correctness reviewer or candidate mutator", async () => {
  const { harness: verdictHarness } = fixture({
    supervisor: {
      async inspect() {
        return { reason: "looks wrong", verdict: "GAP", guidance: "rewrite" };
      }
    }
  });
  await verdictHarness.start({ sessionId: "v", work, seedCandidate: seed });
  await assert.rejects(() => verdictHarness.act("v", { mutate: false }), /cannot issue correctness verdicts/);

  const { harness: mutationHarness } = fixture({
    supervisor: {
      async inspect() {
        return { reason: "take over", candidate: { id: "candidate", version: "hijack" }, guidance: "rewrite" };
      }
    }
  });
  await mutationHarness.start({ sessionId: "m", work, seedCandidate: seed });
  await assert.rejects(() => mutationHarness.act("m", { mutate: false }), /cannot mutate candidate state/);
});

test("supervisor redirect does not decide correctness; only evaluator can authorize promotion", async () => {
  const { harness } = fixture({
    supervisor: {
      async inspect() {
        return { reason: "plateau", guidance: "broaden search" };
      }
    }
  });

  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");
  const promotion = await harness.promote("s1");

  assert.equal(promotion.candidate.version, "v1");
  assert.equal((await harness.lineage("s1")).length, 2);
});

test("a pass for an older implementation cannot promote a newer implementation", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.evaluate("s1");
  await harness.act("s1", { mutate: true, nextVersion: "v2" });

  await assert.rejects(() => harness.promote("s1"), /has not been evaluated/);
});

test("resume restores engineering progress across model contexts without dumping it into context", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "s1", work, seedCandidate: seed });
  await harness.act("s1", { mutate: true, nextVersion: "v1" });
  await harness.observe("s1", { kind: "compiler" });
  await harness.evaluate("s1");
  await harness.recordKnowledge("s1", {
    kind: KnowledgeKind.FAILED_DIRECTION,
    statement: "strategy X failed",
    evidence: ["eval-1"]
  });

  const resumed = await harness.resume("s1");
  assert.equal(resumed.candidate.version, "v1");
  assert.equal(resumed.progress.implementations, 2);
  assert.equal(resumed.progress.observations, 1);
  assert.equal(resumed.progress.evaluations, 1);
  assert.equal(resumed.progress.knowledge, 1);

  const state = await harness.workState("s1");
  assert.equal(state.trajectory.length > 0, true);
  const context = await harness.context("s1");
  assert.equal("trajectory" in context, false);
  assert.equal("observations" in context, false);
});

test("sessions keep persistent engineering state isolated", async () => {
  const { harness } = fixture();
  await harness.start({ sessionId: "a", work: { id: "A" }, seedCandidate: seed });
  await harness.start({ sessionId: "b", work: { id: "B" }, seedCandidate: { id: "candidate-b", version: "v0" } });
  await harness.act("a", { mutate: true, nextVersion: "v1" });
  await harness.recordKnowledge("a", { kind: KnowledgeKind.HYPOTHESIS, statement: "A only" });

  const a = await harness.workState("a");
  const b = await harness.workState("b");
  assert.equal(a.persistentMemory.implementations.length, 2);
  assert.equal(a.persistentMemory.knowledge.length, 1);
  assert.equal(b.persistentMemory.implementations.length, 1);
  assert.equal(b.persistentMemory.knowledge.length, 0);
});
