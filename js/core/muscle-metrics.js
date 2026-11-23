import { isLegacySetRecord, isWorkingCompletedSet } from "./workout-normalization.js";

export function computeMuscleStats(workouts = [], musclesMap = {}, getExerciseById, windowDays = "7", nowMs = Date.now()) {
  const stats = {};
  Object.keys(musclesMap).forEach((m) => {
    stats[m] = { weightedSets: 0, volume: 0, lastTrained: null };
  });

  const cutoff =
    windowDays === "all" ? 0 : nowMs - Number(windowDays) * 24 * 60 * 60 * 1000;

  for (const w of workouts) {
    const wTime = new Date(w.endedAt).getTime();
    if (wTime < cutoff) continue;
    const legacy =
      w.schemaVersion == null &&
      (w.exercises || []).every((ex) => (ex.sets || []).every(isLegacySetRecord));

    for (const item of w.exercises || []) {
      const ex = getExerciseById ? getExerciseById(item.exerciseId) : null;
      if (!ex) continue;

      const workingSets = (item.sets || []).filter((s) => isWorkingCompletedSet(s, legacy));
      if (!workingSets.length) continue;

      const setCount = workingSets.length;
      const exVolume = workingSets.reduce(
        (sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0),
        0
      );

      for (const m of ex.primary || []) {
        if (!stats[m]) continue;
        stats[m].weightedSets += setCount * 1.0;
        stats[m].volume += exVolume * 1.0;
        if (!stats[m].lastTrained || wTime > new Date(stats[m].lastTrained).getTime()) {
          stats[m].lastTrained = w.endedAt;
        }
      }
      for (const m of ex.secondary || []) {
        if (!stats[m]) continue;
        stats[m].weightedSets += setCount * 0.5;
        stats[m].volume += exVolume * 0.5;
        if (!stats[m].lastTrained || wTime > new Date(stats[m].lastTrained).getTime()) {
          stats[m].lastTrained = w.endedAt;
        }
      }
    }
  }
  return stats;
}

export function getHeatLevel(weightedSets, windowDays) {
  if (weightedSets <= 0) return 0;
  const scale = windowDays === "7" ? 1 : windowDays === "30" ? 3 : 5;
  const norm = weightedSets / scale;
  if (norm < 3) return 1;
  if (norm < 7) return 2;
  if (norm < 12) return 3;
  return 4;
}

export function getRecoveryState(lastTrainedIso, nowMs = Date.now()) {
  if (!lastTrainedIso) {
    return { className: "heat-rec-rested", label: "Rested (Not trained recently)" };
  }
  const hours = (nowMs - new Date(lastTrainedIso).getTime()) / (1000 * 60 * 60);
  if (hours < 24) return { className: "heat-rec-fatigued", label: `Fatigued (${Math.round(hours)}h ago)` };
  if (hours < 48) return { className: "heat-rec-recovering", label: `Recovering (${Math.round(hours)}h ago)` };
  if (hours <= 96) return { className: "heat-rec-fresh", label: `Fresh (${Math.round(hours / 24)}d ago)` };
  return { className: "heat-rec-rested", label: `Rested (${Math.round(hours / 24)}d ago)` };
}
