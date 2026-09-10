import { randomUUID } from "node:crypto";
import {
  EvaluationValidity,
  EvaluationVerdict,
  candidateKey,
  invariant,
  normalizeCandidate,
  requireText,
  sameCandidate,
  validateEvaluation,
  validateMemoryRecord
} from "./contracts.js";
import { validateCorePorts } from "./ports.js";
import { createSession, publicSnapshot } from "./state.js";

const defaultClock = () => new Date().toISOString();
const defaultId = () => randomUUID();

export function createCoreHarness({
  environment,
  evaluator,
  sessionStore,
  contextResolver = null,
  memoryConsolidator = null,
  supervisor = null,
  clock = defaultClock,
  idFactory = defaultId
}) {
  validateCorePorts({ environment, evaluator, sessionStore, contextResolver, memoryConsolidator, supervisor });

  async function load(sessionId) {
    requireText(sessionId, "sessionId");
    const session = await sessionStore.load(sessionId);
    invariant(session, `session not found: ${sessionId}`);
    return session;
  }

  async function save(session) {
    session.updatedAt = clock();
    await sessionStore.save(session);
  }

  function event(session, type, payload = {}) {
    const item = {
      id: idFactory(),
      type,
      at: clock(),
      candidate: structuredClone(session.candidate),
      ...structuredClone(payload)
    };
    session.trajectory.push(item);
    return item;
  }

  function currentObservations(session) {
    const key = candidateKey(session.candidate);
    return session.observations.filter((item) => candidateKey(item.candidate) === key);
  }

  function currentEvaluation(session) {
    const key = candidateKey(session.candidate);
    return [...session.evaluations]
      .reverse()
      .find((item) => candidateKey(item.candidate) === key) ?? null;
  }

  return Object.freeze({
    async start({ sessionId = idFactory(), work, seedCandidate }) {
      requireText(sessionId, "sessionId");
      invariant(work != null, "work is required");
      const existing = await sessionStore.load(sessionId);
      invariant(existing == null, `session already exists: ${sessionId}`);

      const session = createSession({ id: sessionId, work, seedCandidate, now: clock });
      event(session, "SESSION_STARTED");
      await save(session);
      return publicSnapshot(session);
    },

    async resume(sessionId) {
      return publicSnapshot(await load(sessionId));
    },

    async context(sessionId, { problem } = {}) {
      const session = await load(sessionId);
      let resolved = null;

      if (contextResolver) {
        requireText(problem, "context problem");
        resolved = await contextResolver.resolve({
          sessionId: session.id,
          work: structuredClone(session.work),
          candidate: structuredClone(session.candidate),
          problem
        });
      }

      const observations = currentObservations(session);
      const lineageHead = session.lineage.at(-1) ?? null;

      return Object.freeze({
        sessionId: session.id,
        work: structuredClone(session.work),
        candidate: structuredClone(session.candidate),
        evaluation: structuredClone(currentEvaluation(session)),
        intervention: structuredClone(session.interventions.at(-1) ?? null),
        resolvedContext: structuredClone(resolved),
        indexes: Object.freeze({
          observations: Object.freeze({ count: observations.length, currentCandidateOnly: true }),
          lineage: Object.freeze({ count: session.lineage.length, head: structuredClone(lineageHead) }),
          memory: Object.freeze({ count: session.memory.length }),
          trajectory: Object.freeze({
            eventCount: session.trajectory.length,
            lastEventId: session.trajectory.at(-1)?.id ?? null
          })
        })
      });
    },

    async observations(sessionId) {
      const session = await load(sessionId);
      return structuredClone(currentObservations(session));
    },

    async lineage(sessionId) {
      const session = await load(sessionId);
      return structuredClone(session.lineage);
    },

    async memory(sessionId) {
      const session = await load(sessionId);
      return structuredClone(session.memory);
    },

    async trajectory(sessionId, { afterEventId = null } = {}) {
      const session = await load(sessionId);
      if (!afterEventId) return structuredClone(session.trajectory);

      const index = session.trajectory.findIndex((item) => item.id === afterEventId);
      invariant(index >= 0, `trajectory event not found: ${afterEventId}`);
      return structuredClone(session.trajectory.slice(index + 1));
    },

    async observe(sessionId, request) {
      const session = await load(sessionId);
      const result = await environment.observe({
        sessionId: session.id,
        work: structuredClone(session.work),
        candidate: structuredClone(session.candidate),
        request: structuredClone(request)
      });

      const observation = {
        id: idFactory(),
        candidate: structuredClone(session.candidate),
        at: clock(),
        value: structuredClone(result)
      };
      session.observations.push(observation);
      event(session, "OBSERVED", { observationId: observation.id });
      await save(session);
      return structuredClone(observation);
    },

    async act(sessionId, action) {
      const session = await load(sessionId);
      const before = structuredClone(session.candidate);
      const result = await environment.act({
        sessionId: session.id,
        work: structuredClone(session.work),
        candidate: before,
        action: structuredClone(action)
      });

      invariant(result && typeof result === "object", "environment action result is required");
      const mutated = result.mutated === true;
      let after = before;

      if (mutated) {
        after = normalizeCandidate(result.candidate);
        invariant(!sameCandidate(before, after), "mutating action must return a new candidate version");
        session.candidate = after;
      } else {
        invariant(result.candidate == null || sameCandidate(before, result.candidate), "non-mutating action cannot change candidate");
      }

      const actionEvent = event(session, "ACTED", {
        mutated,
        before,
        after,
        result: structuredClone(result.result ?? null)
      });
      await save(session);

      return Object.freeze({
        eventId: actionEvent.id,
        mutated,
        candidate: structuredClone(after),
        result: structuredClone(result.result ?? null)
      });
    },

    async evaluate(sessionId, request = null) {
      const session = await load(sessionId);
      const candidate = structuredClone(session.candidate);
      const observations = structuredClone(currentObservations(session));

      const raw = await evaluator.evaluate({
        sessionId: session.id,
        work: structuredClone(session.work),
        candidate,
        observations,
        request: structuredClone(request)
      });
      const result = validateEvaluation(raw);

      const evaluation = {
        id: idFactory(),
        candidate,
        at: clock(),
        ...result
      };
      session.evaluations.push(evaluation);
      event(session, "EVALUATED", { evaluationId: evaluation.id, validity: evaluation.validity, verdict: evaluation.verdict });
      await save(session);
      return structuredClone(evaluation);
    },

    async promote(sessionId) {
      const session = await load(sessionId);
      const evaluation = currentEvaluation(session);
      invariant(evaluation, "current candidate has not been evaluated");
      invariant(evaluation.validity === EvaluationValidity.VALID, "current evaluation is not valid");
      invariant(evaluation.verdict === EvaluationVerdict.PASS, "current candidate did not pass evaluation");

      const head = session.lineage.at(-1);
      invariant(!sameCandidate(head.candidate, session.candidate), "current candidate is already committed to lineage");

      const promotion = {
        kind: "PROMOTED",
        candidate: structuredClone(session.candidate),
        evaluation: evaluation.id,
        promotedAt: clock()
      };
      session.lineage.push(promotion);
      const promotionEvent = event(session, "PROMOTED", { evaluationId: evaluation.id });

      if (memoryConsolidator) {
        const rawRecords = await memoryConsolidator.consolidate({
          sessionId: session.id,
          work: structuredClone(session.work),
          candidate: structuredClone(session.candidate),
          lineage: structuredClone(session.lineage),
          trajectory: structuredClone(session.trajectory.slice(session.lastPromotionEventIndex))
        });
        invariant(Array.isArray(rawRecords), "memory consolidator must return an array");
        session.memory.push(...rawRecords.map(validateMemoryRecord));
      }

      session.lastPromotionEventIndex = session.trajectory.findIndex((item) => item.id === promotionEvent.id) + 1;
      await save(session);
      return structuredClone(promotion);
    },

    async reviewProgress(sessionId) {
      invariant(supervisor, "supervisor is not configured");
      const session = await load(sessionId);
      const intervention = await supervisor.inspect({
        sessionId: session.id,
        work: structuredClone(session.work),
        candidate: structuredClone(session.candidate),
        lineage: structuredClone(session.lineage),
        memory: structuredClone(session.memory),
        trajectory: structuredClone(session.trajectory)
      });

      if (intervention == null) return null;
      invariant(typeof intervention === "object", "supervisor intervention must be an object or null");

      const record = {
        id: idFactory(),
        at: clock(),
        candidate: structuredClone(session.candidate),
        guidance: structuredClone(intervention)
      };
      session.interventions.push(record);
      event(session, "SUPERVISOR_INTERVENED", { interventionId: record.id });
      await save(session);
      return structuredClone(record);
    }
  });
}
