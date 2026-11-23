import { isLegacySetRecord, isSetCompleted, isWorkingCompletedSet, normalizeSetType } from "./workout-normalization.js";

export function computeSet1RM(weightKg, reps) {
  const w = Number(weightKg) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  return w * (1 + r / 30);
}

function isWorkoutLegacy(workout) {
  return (
    workout?.schemaVersion == null &&
    (workout?.exercises || []).every((ex) => (ex.sets || []).every(isLegacySetRecord))
  );
}

export function getHistoricalBest1RM(exerciseId, workouts = []) {
  let best = 0;
  for (const w of workouts) {
    const legacy = isWorkoutLegacy(w);
    const match = (w.exercises || []).find((e) => e.exerciseId === exerciseId);
    if (!match) continue;
    for (const s of match.sets || []) {
      if (!isWorkingCompletedSet(s, legacy)) continue;
      const est = computeSet1RM(s.weight, s.reps);
      if (est > best) best = est;
    }
  }
  return best;
}

export function computeWorkoutTotals(workout) {
  const legacy = isWorkoutLegacy(workout);
  const durationMs =
    workout?.startedAt && workout?.endedAt
      ? Math.max(0, new Date(workout.endedAt).getTime() - new Date(workout.startedAt).getTime())
      : 0;

  let workingSets = 0;
  let warmupSets = 0;
  let skippedSets = 0;
  let workingVolumeKg = 0;

  (workout?.exercises || []).forEach((item) => {
    (item.sets || []).forEach((s) => {
      const completed = isSetCompleted(s, legacy);
      if (!completed) {
        skippedSets += 1;
        return;
      }
      if (normalizeSetType(s.type) === "W") {
        warmupSets += 1;
        return;
      }
      if (Number(s.reps) > 0 || Number(s.weight) > 0) {
        workingSets += 1;
        workingVolumeKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      }
    });
  });

  return { durationMs, workingSets, warmupSets, skippedSets, workingVolumeKg };
}

export function computeWindowKpis(workouts = []) {
  let totalSets = 0;
  let totalVolumeKg = 0;
  workouts.forEach((w) => {
    const t = computeWorkoutTotals(w);
    totalSets += t.workingSets;
    totalVolumeKg += t.workingVolumeKg;
  });
  return {
    sessions: workouts.length,
    workingSets: totalSets,
    volumeKg: totalVolumeKg
  };
}

export function computePersonalRecords(workoutExercises = [], historicalWorkouts = [], getExerciseById) {
  const newPRs = [];
  const legacy = workoutExercises.every((ex) => (ex.sets || []).every(isLegacySetRecord));

  workoutExercises.forEach((item) => {
    const ex = getExerciseById ? getExerciseById(item.exerciseId) : null;
    if (!ex) return;
    const histBest = getHistoricalBest1RM(item.exerciseId, historicalWorkouts);
    let bestSet = null;
    let best1RM = histBest;

    (item.sets || []).forEach((s) => {
      if (!isWorkingCompletedSet(s, legacy)) return;
      const est = computeSet1RM(s.weight, s.reps);
      if (est > best1RM) {
        best1RM = est;
        bestSet = s;
      }
    });

    if (bestSet && best1RM > histBest) {
      newPRs.push({
        exerciseId: ex.id,
        name: ex.name,
        weightKg: Number(bestSet.weight) || 0,
        reps: Number(bestSet.reps) || 0,
        est1RMKg: best1RM
      });
    }
  });

  return newPRs;
}

export function buildWeeklyVolumeSeries(workouts = [], unit = "kg", kgToDisplayFn, nowDate = new Date()) {
  const getMonday = (d) => {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
    copy.setDate(diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const thisMonday = getMonday(nowDate);
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(thisMonday.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    weeks.push({
      startMs: start.getTime(),
      endMs: start.getTime() + 7 * 24 * 60 * 60 * 1000,
      label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      volumeKg: 0
    });
  }

  workouts.forEach((w) => {
    const t = new Date(w.endedAt).getTime();
    const bucket = weeks.find((wk) => t >= wk.startMs && t < wk.endMs);
    if (!bucket) return;
    bucket.volumeKg += computeWorkoutTotals(w).workingVolumeKg;
  });

  return weeks.map((wk) => ({
    label: wk.label,
    volumeKg: wk.volumeKg,
    displayVolume: kgToDisplayFn ? Math.round(kgToDisplayFn(wk.volumeKg, unit)) : Math.round(wk.volumeKg)
  }));
}

export function buildStrengthSeries(workouts = [], exerciseId, unit = "kg", kgToDisplayFn) {
  const ordered = [...workouts].sort((a, b) => new Date(a.endedAt) - new Date(b.endedAt));
  const points = [];

  ordered.forEach((w) => {
    const legacy = isWorkoutLegacy(w);
    const match = (w.exercises || []).find((e) => e.exerciseId === exerciseId);
    if (!match) return;
    let best1RMKg = 0;
    (match.sets || []).forEach((s) => {
      if (!isWorkingCompletedSet(s, legacy)) return;
      const est = computeSet1RM(s.weight, s.reps);
      if (est > best1RMKg) best1RMKg = est;
    });
    if (best1RMKg > 0) {
      points.push({
        endedAt: w.endedAt,
        est1RMKg: Math.round(best1RMKg * 10) / 10,
        display1RM: kgToDisplayFn ? kgToDisplayFn(best1RMKg, unit) : Math.round(best1RMKg * 10) / 10
      });
    }
  });

  return points;
}
