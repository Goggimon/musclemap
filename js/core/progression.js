import { isLegacySetRecord, isWorkingCompletedSet } from "./workout-normalization.js";

export function getOverloadSuggestion(exerciseId, workouts = []) {
  for (const w of workouts) {
    const legacy =
      w.schemaVersion == null &&
      (w.exercises || []).every((ex) => (ex.sets || []).every(isLegacySetRecord));
    const match = (w.exercises || []).find((e) => e.exerciseId === exerciseId);
    if (!match || !match.sets || !match.sets.length) continue;

    const validSets = match.sets.filter((s) => isWorkingCompletedSet(s, legacy));
    if (!validSets.length) continue;

    const topSet = validSets.reduce((best, s) => {
      const bw = Number(best.weight) || 0;
      const sw = Number(s.weight) || 0;
      if (sw > bw) return s;
      if (sw === bw && (Number(s.reps) || 0) > (Number(best.reps) || 0)) return s;
      return best;
    }, validSets[0]);

    const lastWeightKg = Number(topSet.weight) || 0;
    const lastReps = Number(topSet.reps) || 0;

    if (lastWeightKg > 0 && lastReps >= 12) {
      return {
        weightKg: Number((lastWeightKg + 2.5).toFixed(2)),
        reps: 8,
        lastWeightKg,
        lastReps,
        readyToIncrease: true
      };
    }

    if (lastWeightKg > 0) {
      return {
        weightKg: lastWeightKg,
        reps: Math.min(12, lastReps + 1),
        lastWeightKg,
        lastReps,
        readyToIncrease: false
      };
    }

    return {
      weightKg: 0,
      reps: lastReps + 1,
      lastWeightKg: 0,
      lastReps,
      readyToIncrease: false
    };
  }
  return null;
}
