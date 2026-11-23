import { displayToKg, normalizeUnit } from "./units.js";

export const SET_STATUS = Object.freeze({
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SKIPPED: "skipped"
});

export function normalizeSetType(type) {
  if (type === "W" || type === "D" || type === "F") return type;
  return "";
}

export function isLegacySetRecord(setObj) {
  return (
    setObj != null &&
    typeof setObj === "object" &&
    typeof setObj.completed !== "boolean" &&
    typeof setObj.status !== "string"
  );
}

export function isSetCompleted(setObj, isLegacy = false) {
  if (!setObj || typeof setObj !== "object") return false;
  if (isLegacy || isLegacySetRecord(setObj)) {
    return Number(setObj.reps) > 0 || Number(setObj.weight) > 0;
  }
  if (typeof setObj.status === "string") {
    return setObj.status === SET_STATUS.COMPLETED;
  }
  return setObj.completed === true;
}

export function isWorkingCompletedSet(setObj, isLegacy = false) {
  if (!isSetCompleted(setObj, isLegacy)) return false;
  if (normalizeSetType(setObj.type) === "W") return false;
  return Number(setObj.reps) > 0 || Number(setObj.weight) > 0;
}

export function normalizeSetRecord(setObj, options = {}) {
  const { isLegacy = false, sourceUnit = "kg", forActive = false } = options;
  const rawWeight = setObj?.weight;
  const rawReps = setObj?.reps;
  const numWeight = Number(rawWeight) || 0;
  const numReps = Number(rawReps) || 0;
  const unit = normalizeUnit(sourceUnit);
  const weightKg = unit === "lb" ? displayToKg(numWeight, "lb") : Math.round(numWeight * 100) / 100;
  const type = normalizeSetType(setObj?.type);

  if (forActive) {
    const completed = setObj?.status === SET_STATUS.COMPLETED || setObj?.completed === true;
    const status = completed
      ? SET_STATUS.COMPLETED
      : typeof setObj?.status === "string"
        ? setObj.status
        : rawWeight !== "" || rawReps !== ""
          ? SET_STATUS.PLANNED
          : SET_STATUS.IN_PROGRESS;
    return {
      ...setObj,
      weight: rawWeight === "" || rawWeight == null ? "" : String(weightKg),
      reps: rawReps === "" || rawReps == null ? "" : String(numReps),
      type,
      status,
      completed
    };
  }

  let completed;
  let status;
  if (isLegacy || isLegacySetRecord(setObj)) {
    completed = numReps > 0 || weightKg > 0;
    status = completed ? SET_STATUS.COMPLETED : SET_STATUS.SKIPPED;
  } else {
    const explicitDone =
      typeof setObj?.status === "string"
        ? setObj.status === SET_STATUS.COMPLETED
        : setObj?.completed === true;
    completed = explicitDone && (numReps > 0 || weightKg > 0);
    status = completed
      ? SET_STATUS.COMPLETED
      : setObj?.status === SET_STATUS.PLANNED
        ? SET_STATUS.SKIPPED
        : SET_STATUS.SKIPPED;
  }

  return {
    ...setObj,
    weight: weightKg,
    reps: numReps,
    type,
    status,
    completed
  };
}

export function normalizeWorkoutRecord(workout, options = {}) {
  if (!workout || typeof workout !== "object") return workout;
  const explicitUnit = workout.weightUnit === "lb" ? "lb" : "kg";
  const isLegacy =
    options.isLegacy ??
    (workout.schemaVersion == null &&
      (workout.exercises || []).every((ex) => (ex.sets || []).every(isLegacySetRecord)));

  const exercises = (workout.exercises || []).map((item) => ({
    ...item,
    sets: (item.sets || []).map((s) =>
      normalizeSetRecord(s, { isLegacy, sourceUnit: explicitUnit, forActive: false })
    )
  }));

  return {
    ...workout,
    schemaVersion: workout.schemaVersion ?? 2,
    weightUnit: "kg",
    exercises
  };
}

export function finalizeActiveWorkout(activeWorkout, options = {}) {
  if (!activeWorkout || typeof activeWorkout !== "object") {
    return { ok: false, reason: "no_active_workout" };
  }
  const {
    title,
    profileId,
    endedAt = new Date().toISOString(),
    sourceUnit = "kg",
    weightsAreCanonicalKg = true
  } = options;

  const effectiveUnit = weightsAreCanonicalKg ? "kg" : normalizeUnit(sourceUnit);
  let completedCount = 0;
  let skippedCount = 0;

  const exercises = (activeWorkout.exercises || [])
    .map((item) => {
      const normalizedSets = [];
      for (const s of item.sets || []) {
        const hasValues = Number(s.reps) > 0 || Number(s.weight) > 0;
        const explicitCompleted =
          s.status === SET_STATUS.COMPLETED || s.completed === true;

        if (explicitCompleted && hasValues) {
          completedCount += 1;
          normalizedSets.push(
            normalizeSetRecord(
              { ...s, completed: true, status: SET_STATUS.COMPLETED },
              { isLegacy: false, sourceUnit: effectiveUnit, forActive: false }
            )
          );
        } else if (hasValues || s.status === SET_STATUS.PLANNED || s.status === SET_STATUS.SKIPPED) {
          skippedCount += 1;
          normalizedSets.push(
            normalizeSetRecord(
              { ...s, completed: false, status: SET_STATUS.SKIPPED },
              { isLegacy: false, sourceUnit: effectiveUnit, forActive: false }
            )
          );
        }
      }
      return {
        ...item,
        exerciseId: item.exerciseId,
        note: (item.note || "").trim(),
        rpe: item.rpe ? Number(item.rpe) : null,
        sets: normalizedSets
      };
    })
    .filter((item) => item.sets.length > 0);

  if (completedCount === 0) {
    return { ok: false, reason: "no_completed_sets" };
  }

  return {
    ok: true,
    completedCount,
    skippedCount,
    workout: {
      id: activeWorkout.id,
      profileId: profileId || activeWorkout.profileId,
      title: (title ?? activeWorkout.title ?? "Workout").trim() || "Workout",
      startedAt: activeWorkout.startedAt,
      endedAt,
      schemaVersion: 2,
      weightUnit: "kg",
      status: skippedCount > 0 ? "completed_partial" : "completed",
      exercises
    }
  };
}
