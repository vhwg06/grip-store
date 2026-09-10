import { ImplementationStatus, candidateKey, normalizeCandidate, requireText } from "./contracts.js";

export function createPersistentWorkState({ id, work, seedCandidate, now }) {
  requireText(id, "session.id");
  const candidate = normalizeCandidate(seedCandidate);
  const createdAt = now();

  return {
    id,
    work: structuredClone(work),
    currentCandidate: candidate,
    implementations: [
      {
        candidate,
        parent: null,
        status: ImplementationStatus.BASELINE,
        createdAt,
        promotedAt: createdAt
      }
    ],
    observations: [],
    evaluations: [],
    knowledge: [],
    lineage: [
      {
        kind: "BASELINE",
        candidate,
        evaluation: null,
        promotedAt: createdAt
      }
    ],
    trajectory: [],
    supervision: {
      interventions: [],
      lastInspectedEventId: null
    },
    createdAt,
    updatedAt: createdAt
  };
}

export function findImplementation(state, candidate) {
  const key = candidateKey(candidate);
  return state.implementations.find((item) => candidateKey(item.candidate) === key) ?? null;
}

export function publicSnapshot(state) {
  return structuredClone({
    id: state.id,
    work: state.work,
    candidate: state.currentCandidate,
    progress: {
      implementations: state.implementations.length,
      evaluations: state.evaluations.length,
      observations: state.observations.length,
      knowledge: state.knowledge.length,
      lineage: {
        count: state.lineage.length,
        head: state.lineage.at(-1) ?? null
      },
      lastIntervention: state.supervision.interventions.at(-1) ?? null,
      trajectory: {
        eventCount: state.trajectory.length,
        lastEventId: state.trajectory.at(-1)?.id ?? null
      }
    },
    createdAt: state.createdAt,
    updatedAt: state.updatedAt
  });
}
