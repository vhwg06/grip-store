import { normalizeCandidate, requireText } from "./contracts.js";

export function createSession({ id, work, seedCandidate, now }) {
  requireText(id, "session.id");
  const candidate = normalizeCandidate(seedCandidate);
  const createdAt = now();

  return {
    id,
    work: structuredClone(work),
    candidate,
    trajectory: [],
    observations: [],
    evaluations: [],
    interventions: [],
    memory: [],
    lineage: [
      {
        kind: "BASELINE",
        candidate,
        evaluation: null,
        promotedAt: createdAt
      }
    ],
    createdAt,
    updatedAt: createdAt,
    lastPromotionEventIndex: 0
  };
}

export function publicSnapshot(session) {
  return structuredClone({
    id: session.id,
    work: session.work,
    candidate: session.candidate,
    lineage: {
      count: session.lineage.length,
      head: session.lineage.at(-1) ?? null
    },
    memory: {
      count: session.memory.length
    },
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    trajectory: {
      eventCount: session.trajectory.length,
      lastEventId: session.trajectory.at(-1)?.id ?? null
    }
  });
}
