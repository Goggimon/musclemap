import { normalizeUnit } from "./units.js";
import { normalizeSetRecord, normalizeWorkoutRecord } from "./workout-normalization.js";

export const STORAGE_KEY = "musclemap_v1_state";
export const CURRENT_SCHEMA_VERSION = 2;

const KNOWN_TOP_KEYS = new Set([
  "schemaVersion",
  "activeProfileId",
  "profiles",
  "bodyProfiles",
  "settings",
  "dashboardPrefs",
  "exercises",
  "routines",
  "workouts",
  "measurements",
  "activeWorkouts"
]);

export function mergeById(existing = [], incoming = []) {
  const map = new Map();
  existing.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  incoming.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values());
}

function isPlainObject(val) {
  return val != null && typeof val === "object" && !Array.isArray(val);
}

function isQuotaError(err) {
  if (!err) return false;
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22 ||
    err.code === 1014
  );
}

export function migrateState(parsed, createDefaultState, defaultExercises = []) {
  const base = createDefaultState();
  const prevVersion = Number(parsed?.schemaVersion) || 1;

  const settings = { ...base.settings };
  if (isPlainObject(parsed?.settings)) {
    Object.keys(parsed.settings).forEach((pid) => {
      settings[pid] = { ...(base.settings[pid] || base.settings.u1), ...(parsed.settings[pid] || {}) };
    });
  }

  const dashboardPrefs = { ...base.dashboardPrefs };
  if (isPlainObject(parsed?.dashboardPrefs)) {
    Object.keys(parsed.dashboardPrefs).forEach((pid) => {
      dashboardPrefs[pid] = {
        ...(base.dashboardPrefs[pid] || base.dashboardPrefs.u1),
        ...(parsed.dashboardPrefs[pid] || {})
      };
    });
  }

  const routines = Array.isArray(parsed?.routines)
    ? { ...base.routines, u1: parsed.routines }
    : { ...base.routines, ...(isPlainObject(parsed?.routines) ? parsed.routines : {}) };

  const workouts = Array.isArray(parsed?.workouts)
    ? parsed.workouts.map((w) => normalizeWorkoutRecord(w))
    : [];

  const activeWorkouts = { ...base.activeWorkouts };
  if (isPlainObject(parsed?.activeWorkouts)) {
    Object.keys(parsed.activeWorkouts).forEach((pid) => {
      const aw = parsed.activeWorkouts[pid];
      if (!aw) {
        activeWorkouts[pid] = null;
        return;
      }
      const sourceUnit =
        aw.weightUnit === "lb" || (prevVersion < 2 && !aw.weightUnit && settings[pid]?.unit === "lb")
          ? "lb"
          : "kg";
      activeWorkouts[pid] = {
        ...aw,
        weightUnit: "kg",
        exercises: (aw.exercises || []).map((exItem) => ({
          ...exItem,
          sets: (exItem.sets || []).map((s) =>
            normalizeSetRecord(s, { isLegacy: false, sourceUnit, forActive: true })
          )
        }))
      };
    });
  }

  const unknownTop = {};
  Object.keys(parsed || {}).forEach((k) => {
    if (!KNOWN_TOP_KEYS.has(k)) unknownTop[k] = parsed[k];
  });

  const migrated = {
    ...base,
    ...unknownTop,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    activeProfileId: parsed?.activeProfileId || base.activeProfileId,
    profiles: Array.isArray(parsed?.profiles) && parsed.profiles.length ? parsed.profiles : base.profiles,
    bodyProfiles: { ...base.bodyProfiles, ...(isPlainObject(parsed?.bodyProfiles) ? parsed.bodyProfiles : {}) },
    settings,
    dashboardPrefs,
    exercises: mergeById(defaultExercises, Array.isArray(parsed?.exercises) ? parsed.exercises : []),
    routines,
    workouts,
    measurements: Array.isArray(parsed?.measurements) ? parsed.measurements : [],
    activeWorkouts
  };

  return {
    state: migrated,
    migrationReport: {
      fromVersion: prevVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
      workoutsNormalized: workouts.length,
      migratedActiveProfiles: Object.keys(activeWorkouts).filter((k) => activeWorkouts[k] != null)
    }
  };
}

export function loadStateSafe(storage, createDefaultState, defaultExercises = []) {
  const defaultState = { ...createDefaultState(), schemaVersion: CURRENT_SCHEMA_VERSION };
  let raw = null;
  try {
    raw = storage?.getItem(STORAGE_KEY) ?? null;
  } catch (err) {
    return {
      status: "recovery_required",
      state: defaultState,
      backupKey: null,
      rawCorrupt: null,
      error: err,
      migrationReport: null
    };
  }

  if (!raw) {
    return {
      status: "empty",
      state: defaultState,
      backupKey: null,
      rawCorrupt: null,
      error: null,
      migrationReport: null
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) {
      throw new Error("Persisted state root is not an object.");
    }
    const { state, migrationReport } = migrateState(parsed, createDefaultState, defaultExercises);
    return {
      status: "ok",
      state,
      backupKey: null,
      rawCorrupt: null,
      error: null,
      migrationReport
    };
  } catch (err) {
    const backupKey = `${STORAGE_KEY}_backup_corrupt_${Date.now()}`;
    try {
      storage.setItem(backupKey, raw);
      const verified = storage.getItem(backupKey);
      if (verified !== raw) {
        throw new Error("Backup verification mismatch.");
      }
      return {
        status: "recovered",
        state: defaultState,
        backupKey,
        rawCorrupt: raw,
        error: err,
        migrationReport: null
      };
    } catch (backupErr) {
      return {
        status: "recovery_required",
        state: defaultState,
        backupKey: null,
        rawCorrupt: raw,
        error: backupErr || err,
        migrationReport: null
      };
    }
  }
}

export function saveStateSafe(storage, state, options = {}) {
  if (options.recoveryRequired) {
    return {
      ok: false,
      reason: "recovery_required",
      error: new Error("Persistence paused in recovery-required mode to protect original data.")
    };
  }
  try {
    const payload = JSON.stringify({
      ...state,
      schemaVersion: CURRENT_SCHEMA_VERSION
    });
    storage.setItem(STORAGE_KEY, payload);
    return { ok: true, reason: null, error: null };
  } catch (err) {
    return {
      ok: false,
      reason: isQuotaError(err) ? "quota_exceeded" : "storage_error",
      error: err
    };
  }
}

export function computeStateFingerprint(state) {
  const profilesSig = (state?.profiles || []).map((p) => `${p.id}:${p.name}`).join(",");
  const workoutsSig = (state?.workouts || []).map((w) => `${w.id}:${w.endedAt}`).join(",");
  const exSig = (state?.exercises || []).length;
  const activeSig = Object.entries(state?.activeWorkouts || {})
    .map(([k, v]) => `${k}:${v ? v.id : "null"}`)
    .join(",");
  const settingsSig = Object.entries(state?.settings || {})
    .map(([k, v]) => `${k}:${v?.unit || "kg"}:${v?.tone || "system"}`)
    .join(",");
  return `${state?.schemaVersion || 1}|${profilesSig}|${workoutsSig}|${exSig}|${activeSig}|${settingsSig}`;
}

export function buildImportPreview(currentState, importedRaw) {
  if (!isPlainObject(importedRaw) || !Array.isArray(importedRaw.workouts) || !Array.isArray(importedRaw.profiles)) {
    return { valid: false, error: "Invalid MUSCLEMAP backup file (missing profiles or workouts array)." };
  }

  const curProfiles = new Map((currentState.profiles || []).map((p) => [p.id, p]));
  const curExercises = new Map((currentState.exercises || []).map((e) => [e.id, e]));
  const curWorkouts = new Map((currentState.workouts || []).map((w) => [w.id, w]));
  const curWorkoutKeys = new Set(
    (currentState.workouts || []).map((w) => `${w.profileId}|${w.endedAt}`)
  );

  const profileConflicts = [];
  (importedRaw.profiles || []).forEach((p) => {
    if (!p || !p.id) return;
    const existing = curProfiles.get(p.id);
    if (existing && (existing.name !== p.name || existing.color !== p.color)) {
      profileConflicts.push({ id: p.id, existingName: existing.name, incomingName: p.name });
    }
  });

  const exerciseConflicts = [];
  (importedRaw.exercises || []).forEach((ex) => {
    if (!ex || !ex.id) return;
    const existing = curExercises.get(ex.id);
    if (existing && (existing.name !== ex.name || existing.equipment !== ex.equipment)) {
      exerciseConflicts.push({ id: ex.id, existingName: existing.name, incomingName: ex.name });
    }
  });

  let duplicateWorkouts = 0;
  let newWorkouts = 0;
  (importedRaw.workouts || []).forEach((w) => {
    if (!w || !w.id) return;
    const key = `${w.profileId}|${w.endedAt}`;
    if (curWorkouts.has(w.id) || curWorkoutKeys.has(key)) {
      duplicateWorkouts += 1;
    } else {
      newWorkouts += 1;
    }
  });

  const routineConflicts = [];
  if (isPlainObject(importedRaw.routines)) {
    Object.keys(importedRaw.routines).forEach((pid) => {
      const existingIds = new Set((currentState.routines?.[pid] || []).map((r) => r.id));
      (importedRaw.routines[pid] || []).forEach((r) => {
        if (r && r.id && existingIds.has(r.id)) {
          routineConflicts.push({ profileId: pid, id: r.id, name: r.name });
        }
      });
    });
  }

  const settingsConflicts = [];
  if (isPlainObject(importedRaw.settings)) {
    Object.keys(importedRaw.settings).forEach((pid) => {
      if (currentState.settings?.[pid]) settingsConflicts.push(pid);
    });
  }

  const activeWorkoutConflicts = [];
  if (isPlainObject(importedRaw.activeWorkouts)) {
    Object.keys(importedRaw.activeWorkouts).forEach((pid) => {
      if (currentState.activeWorkouts?.[pid] && importedRaw.activeWorkouts[pid]) {
        activeWorkoutConflicts.push(pid);
      }
    });
  }

  const unknownTopKeys = Object.keys(importedRaw).filter((k) => !KNOWN_TOP_KEYS.has(k));

  return {
    valid: true,
    baseFingerprint: computeStateFingerprint(currentState),
    counts: {
      profiles: (importedRaw.profiles || []).length,
      exercises: (importedRaw.exercises || []).length,
      workouts: (importedRaw.workouts || []).length,
      newWorkouts,
      duplicateWorkouts,
      measurements: (importedRaw.measurements || []).length
    },
    conflicts: {
      profileConflicts,
      exerciseConflicts,
      routineConflicts,
      settingsConflicts,
      activeWorkoutConflicts,
      unknownTopKeys
    }
  };
}

export function commitImport(currentState, importedRaw, options = {}) {
  const {
    mode = "merge", // "merge" | "restore"
    conflictPolicy = "keep_existing", // "keep_existing" | "overwrite"
    expectedFingerprint = null,
    storage = null,
    requireBackupForDestructive = false,
    createDefaultState,
    defaultExercises = []
  } = options;

  if (expectedFingerprint != null && computeStateFingerprint(currentState) !== expectedFingerprint) {
    return {
      ok: false,
      reason: "stale_preview",
      error: "State changed after import preview was generated. Please re-preview the import."
    };
  }

  const isDestructive = mode === "restore" || conflictPolicy === "overwrite";
  if (isDestructive && requireBackupForDestructive && storage) {
    const backupKey = `${STORAGE_KEY}_backup_pre_import_${Date.now()}`;
    try {
      const rawBackup = JSON.stringify(currentState);
      storage.setItem(backupKey, rawBackup);
      if (storage.getItem(backupKey) !== rawBackup) {
        throw new Error("Pre-import backup verification failed.");
      }
    } catch (err) {
      return {
        ok: false,
        reason: "backup_failed",
        error: err
      };
    }
  }

  const normalizedImported = migrateState(
    importedRaw,
    createDefaultState || (() => currentState),
    defaultExercises
  ).state;

  if (mode === "restore") {
    return {
      ok: true,
      nextState: {
        ...normalizedImported,
        schemaVersion: CURRENT_SCHEMA_VERSION
      },
      summary: { mode: "restore", workoutsTotal: normalizedImported.workouts.length }
    };
  }

  const overwrite = conflictPolicy === "overwrite";
  const mergeWithPolicy = (existingArr, incomingArr) => {
    const map = new Map();
    (existingArr || []).forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    (incomingArr || []).forEach((item) => {
      if (!item || !item.id) return;
      if (!map.has(item.id) || overwrite) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  };

  const nextProfiles = mergeWithPolicy(currentState.profiles, normalizedImported.profiles);
  const nextExercises = mergeWithPolicy(currentState.exercises, normalizedImported.exercises);

  // Deduplicate workouts by ID and by profileId + endedAt
  const workoutMap = new Map();
  const seenKeys = new Set();
  (currentState.workouts || []).forEach((w) => {
    if (!w || !w.id) return;
    workoutMap.set(w.id, w);
    seenKeys.add(`${w.profileId}|${w.endedAt}`);
  });
  let addedWorkouts = 0;
  (normalizedImported.workouts || []).forEach((w) => {
    if (!w || !w.id) return;
    const key = `${w.profileId}|${w.endedAt}`;
    if (workoutMap.has(w.id) || seenKeys.has(key)) {
      if (overwrite) workoutMap.set(w.id, w);
      return;
    }
    workoutMap.set(w.id, w);
    seenKeys.add(key);
    addedWorkouts += 1;
  });

  const nextMeasurements = mergeWithPolicy(currentState.measurements, normalizedImported.measurements);

  const nextRoutines = { ...(currentState.routines || {}) };
  Object.keys(normalizedImported.routines || {}).forEach((pid) => {
    nextRoutines[pid] = mergeWithPolicy(nextRoutines[pid] || [], normalizedImported.routines[pid] || []);
  });

  const nextSettings = { ...(currentState.settings || {}) };
  Object.keys(normalizedImported.settings || {}).forEach((pid) => {
    if (!nextSettings[pid] || overwrite) {
      nextSettings[pid] = {
        ...(nextSettings[pid] || {}),
        ...normalizedImported.settings[pid],
        unit: normalizeUnit(normalizedImported.settings[pid]?.unit)
      };
    }
  });

  const nextBodyProfiles = { ...(currentState.bodyProfiles || {}) };
  Object.keys(normalizedImported.bodyProfiles || {}).forEach((pid) => {
    if (!nextBodyProfiles[pid] || overwrite) {
      nextBodyProfiles[pid] = { ...(nextBodyProfiles[pid] || {}), ...normalizedImported.bodyProfiles[pid] };
    }
  });

  const nextDashPrefs = { ...(currentState.dashboardPrefs || {}) };
  Object.keys(normalizedImported.dashboardPrefs || {}).forEach((pid) => {
    if (!nextDashPrefs[pid] || overwrite) {
      nextDashPrefs[pid] = { ...(nextDashPrefs[pid] || {}), ...normalizedImported.dashboardPrefs[pid] };
    }
  });

  const nextActive = { ...(currentState.activeWorkouts || {}) };
  Object.keys(normalizedImported.activeWorkouts || {}).forEach((pid) => {
    if (!nextActive[pid] && normalizedImported.activeWorkouts[pid]) {
      nextActive[pid] = normalizedImported.activeWorkouts[pid];
    } else if (overwrite && normalizedImported.activeWorkouts[pid]) {
      nextActive[pid] = normalizedImported.activeWorkouts[pid];
    }
  });

  // Preserve unknown top-level fields from imported if not present in current
  const unknownMerged = {};
  Object.keys(normalizedImported).forEach((k) => {
    if (!KNOWN_TOP_KEYS.has(k) && !(k in currentState)) {
      unknownMerged[k] = normalizedImported[k];
    }
  });

  return {
    ok: true,
    nextState: {
      ...currentState,
      ...unknownMerged,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      profiles: nextProfiles,
      exercises: nextExercises,
      workouts: Array.from(workoutMap.values()),
      measurements: nextMeasurements,
      routines: nextRoutines,
      settings: nextSettings,
      bodyProfiles: nextBodyProfiles,
      dashboardPrefs: nextDashPrefs,
      activeWorkouts: nextActive
    },
    summary: {
      mode: "merge",
      conflictPolicy,
      addedWorkouts,
      totalWorkouts: workoutMap.size
    }
  };
}
