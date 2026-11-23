import {
  kgToDisplay,
  displayToKg,
  formatWeight
} from "../js/core/units.js";
import {
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
  loadStateSafe,
  saveStateSafe,
  migrateState,
  buildImportPreview,
  commitImport
} from "../js/core/storage.js";
import {
  isSetCompleted,
  isWorkingCompletedSet,
  finalizeActiveWorkout
} from "../js/core/workout-normalization.js";
import {
  computeSet1RM,
  getHistoricalBest1RM,
  computeWorkoutTotals,
  computeWindowKpis,
  computePersonalRecords,
  buildWeeklyVolumeSeries,
  buildStrengthSeries
} from "../js/core/workout-metrics.js";
import { computeMuscleStats } from "../js/core/muscle-metrics.js";
import { getOverloadSuggestion } from "../js/core/progression.js";

function createMockStorage(initial = {}, options = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(k) {
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) {
      if (options.throwQuotaOnAll) {
        const err = new Error("QuotaExceededError");
        err.name = "QuotaExceededError";
        throw err;
      }
      if (options.throwQuotaOnBackup && String(k).includes("backup")) {
        const err = new Error("QuotaExceededError");
        err.name = "QuotaExceededError";
        throw err;
      }
      map.set(k, String(v));
    },
    _dump() {
      return Object.fromEntries(map.entries());
    }
  };
}

function createDefaultState() {
  return {
    activeProfileId: "u1",
    profiles: [
      { id: "u1", name: "Person 1", color: "#C52F3A" },
      { id: "u2", name: "Person 2", color: "#A0A7AA" }
    ],
    bodyProfiles: { u1: {}, u2: {} },
    settings: {
      u1: { unit: "kg", tone: "system", autoRest: true, defaultRestSec: 90, weeklySetTarget: 40 },
      u2: { unit: "kg", tone: "system", autoRest: true, defaultRestSec: 90, weeklySetTarget: 40 }
    },
    dashboardPrefs: { u1: {}, u2: {} },
    exercises: [],
    routines: { u1: [], u2: [] },
    workouts: [],
    measurements: [],
    activeWorkouts: { u1: null, u2: null }
  };
}

const SAMPLE_EXERCISES = [
  { id: "ex_bench", name: "Barbell Bench Press", equipment: "Barbell", primary: ["chest"], secondary: ["front_delts", "triceps"] },
  { id: "ex_squat", name: "Barbell Back Squat", equipment: "Barbell", primary: ["quads", "glutes"], secondary: ["hamstrings"] }
];
const getEx = (id) => SAMPLE_EXERCISES.find((e) => e.id === id) || null;
const MUSCLES = { chest: "Chest", front_delts: "Front Delts", triceps: "Triceps", quads: "Quads", glutes: "Glutes", hamstrings: "Hamstrings" };

function assert(cond, msg) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
    print(`PASS: ${name}`);
  } catch (err) {
    results.push({ name, pass: false, error: err.message });
    print(`FAIL: ${name} -> ${err.message}`);
  }
}

// 1. Legacy workout without completed property
test("Legacy workout without completed preserves historical interpretation", () => {
  const legacySet = { weight: 60, reps: 8, type: "" };
  assertEqual(isSetCompleted(legacySet), true, "legacy set with weight/reps");
  assertEqual(isWorkingCompletedSet(legacySet), true, "legacy working set");
  const legacyWorkout = {
    id: "w_leg",
    profileId: "u1",
    endedAt: new Date().toISOString(),
    exercises: [{ exerciseId: "ex_bench", sets: [legacySet, { weight: 40, reps: 8, type: "W" }] }]
  };
  const totals = computeWorkoutTotals(legacyWorkout);
  assertEqual(totals.workingSets, 1, "legacy workingSets");
  assertEqual(totals.warmupSets, 1, "legacy warmupSets");
  assertEqual(totals.workingVolumeKg, 480, "legacy volume");
});

// 2. New incomplete set never counted as completed
test("New incomplete set is never counted as completed", () => {
  const incomplete = { weight: 60, reps: 10, type: "", status: "planned", completed: false };
  assertEqual(isSetCompleted(incomplete), false, "planned set");
  assertEqual(isWorkingCompletedSet(incomplete), false, "planned working set");
});

// 3. Interrupted workout preserves completed vs skipped sets
test("Interrupted workout keeps completed and skipped sets distinguishable", () => {
  const active = {
    id: "wk_int",
    title: "Full Body A",
    weightUnit: "kg",
    startedAt: "2026-11-22T10:00:00.000Z",
    exercises: [
      {
        exerciseId: "ex_bench",
        sets: [
          { weight: "60", reps: "8", type: "", status: "completed", completed: true },
          { weight: "60", reps: "8", type: "", status: "planned", completed: false },
          { weight: "60", reps: "8", type: "", status: "planned", completed: false }
        ]
      }
    ]
  };
  const res = finalizeActiveWorkout(active, { profileId: "u1", weightsAreCanonicalKg: true });
  assert(res.ok, "finalize ok");
  assertEqual(res.completedCount, 1, "completedCount");
  assertEqual(res.skippedCount, 2, "skippedCount");
  assertEqual(res.workout.status, "completed_partial", "partial status");
  const totals = computeWorkoutTotals(res.workout);
  assertEqual(totals.workingSets, 1, "only 1 working set counted");
  assertEqual(totals.skippedSets, 2, "2 skipped sets tracked");
  assertEqual(totals.workingVolumeKg, 480, "only completed set volume counted");
});

// 4. Storage backup quota failure preserves original state untouched
test("Storage backup quota failure preserves original corrupt key and blocks save", () => {
  const corruptRaw = "{not valid json!!!";
  const storage = createMockStorage({ [STORAGE_KEY]: corruptRaw }, { throwQuotaOnBackup: true });
  const loaded = loadStateSafe(storage, createDefaultState, SAMPLE_EXERCISES);
  assertEqual(loaded.status, "recovery_required", "status recovery_required");
  assertEqual(storage.getItem(STORAGE_KEY), corruptRaw, "original key untouched");

  const saveAttempt = saveStateSafe(storage, loaded.state, { recoveryRequired: true });
  assertEqual(saveAttempt.ok, false, "save blocked in recovery_required");
  assertEqual(saveAttempt.reason, "recovery_required", "reason recovery_required");
  assertEqual(storage.getItem(STORAGE_KEY), corruptRaw, "original key still untouched");
});

// 5. Storage write failure reports persistence failure
test("Storage write failure returns quota_exceeded error", () => {
  const storage = createMockStorage({}, { throwQuotaOnAll: true });
  const res = saveStateSafe(storage, createDefaultState());
  assertEqual(res.ok, false, "save failed");
  assertEqual(res.reason, "quota_exceeded", "reason quota_exceeded");
});

// 6. Mixed-unit historical data migration
test("Mixed-unit historical data migrates explicit lb records and preserves ambiguous kg", () => {
  const rawState = {
    activeProfileId: "u1",
    profiles: [{ id: "u1", name: "User", color: "#C52F3A" }],
    workouts: [
      {
        id: "w_lb",
        profileId: "u1",
        weightUnit: "lb",
        endedAt: "2026-11-20T10:00:00.000Z",
        exercises: [{ exerciseId: "ex_bench", sets: [{ weight: 135, reps: 5 }] }]
      },
      {
        id: "w_amb",
        profileId: "u1",
        endedAt: "2026-11-21T10:00:00.000Z",
        exercises: [{ exerciseId: "ex_bench", sets: [{ weight: 60, reps: 5 }] }]
      }
    ]
  };
  const { state } = migrateState(rawState, createDefaultState, SAMPLE_EXERCISES);
  assertEqual(state.schemaVersion, CURRENT_SCHEMA_VERSION, "schemaVersion bumped");
  assertEqual(state.workouts[0].weightUnit, "kg", "explicit lb converted to kg");
  assertEqual(state.workouts[0].exercises[0].sets[0].weight, 61.23, "135 lb -> 61.23 kg");
  assertEqual(state.workouts[1].exercises[0].sets[0].weight, 60, "ambiguous record kept at 60 kg");
});

// 7. KG/LB PR comparison (135 lb vs 60 kg history)
test("135 lb (61.23 kg) vs 60 kg x 5 historical set detects genuine PR", () => {
  const hist = [
    {
      id: "w1",
      profileId: "u1",
      schemaVersion: 2,
      endedAt: "2026-11-20T10:00:00.000Z",
      exercises: [{ exerciseId: "ex_bench", sets: [{ weight: 60, reps: 5, type: "", status: "completed", completed: true }] }]
    }
  ];
  const weightKg = displayToKg(135, "lb");
  assertEqual(weightKg, 61.23, "135 lb -> 61.23 kg");
  const prs = computePersonalRecords(
    [{ exerciseId: "ex_bench", sets: [{ weight: weightKg, reps: 5, type: "", status: "completed", completed: true }] }],
    hist,
    getEx
  );
  assertEqual(prs.length, 1, "1 PR detected");
  assertEqual(prs[0].weightKg, 61.23, "PR weight in canonical kg");

  // Compare against 65 kg history -> no false PR
  const heavierHist = [
    {
      id: "w2",
      profileId: "u1",
      schemaVersion: 2,
      endedAt: "2026-11-21T10:00:00.000Z",
      exercises: [{ exerciseId: "ex_bench", sets: [{ weight: 65, reps: 5, type: "", status: "completed", completed: true }] }]
    }
  ];
  const noPrs = computePersonalRecords(
    [{ exerciseId: "ex_bench", sets: [{ weight: weightKg, reps: 5, type: "", status: "completed", completed: true }] }],
    heavierHist,
    getEx
  );
  assertEqual(noPrs.length, 0, "no false PR against 65 kg");
});

// 8. Switch KG -> LB -> KG with zero accumulated conversion error
test("Switching KG -> LB -> KG preserves canonical kg with zero drift", () => {
  const storedKg = 60;
  const shownInLb = kgToDisplay(storedKg, "lb");
  assertEqual(shownInLb, 132.5, "60 kg displays as 132.5 lb");
  const backToKg = kgToDisplay(storedKg, "kg");
  assertEqual(backToKg, 60, "stored canonical kg remains exactly 60");
  assertEqual(formatWeight(61.23, "lb"), "135 lb", "61.23 kg displays as 135 lb");
});

// 9. Warmup exclusion consistency across workout totals, dashboard KPIs, and muscle stats
test("Warmup sets (W) excluded consistently across KPIs, muscle stats, and PRs", () => {
  const w = {
    id: "w_wu",
    profileId: "u1",
    schemaVersion: 2,
    endedAt: new Date().toISOString(),
    exercises: [
      {
        exerciseId: "ex_bench",
        sets: [
          { weight: 40, reps: 10, type: "W", status: "completed", completed: true },
          { weight: 50, reps: 5, type: "W", status: "completed", completed: true },
          { weight: 80, reps: 5, type: "", status: "completed", completed: true },
          { weight: 80, reps: 5, type: "", status: "completed", completed: true },
          { weight: 80, reps: 5, type: "", status: "completed", completed: true }
        ]
      }
    ]
  };
  const totals = computeWorkoutTotals(w);
  assertEqual(totals.workingSets, 3, "totals workingSets = 3");
  assertEqual(totals.warmupSets, 2, "totals warmupSets = 2");
  assertEqual(totals.workingVolumeKg, 1200, "totals workingVolume = 1200");

  const kpis = computeWindowKpis([w]);
  assertEqual(kpis.workingSets, 3, "KPIs workingSets = 3");
  assertEqual(kpis.volumeKg, 1200, "KPIs volume = 1200");

  const mStats = computeMuscleStats([w], MUSCLES, getEx, "7");
  assertEqual(mStats.chest.weightedSets, 3, "primary chest = 3.0 sets");
  assertEqual(mStats.triceps.weightedSets, 1.5, "secondary triceps = 1.5 sets (0.5x preserved)");
});

// 10. Import preview and conflict resolution
test("Import preview detects conflicts and commitImport preserves settings/unknown fields", () => {
  const current = {
    ...createDefaultState(),
    customTopKey: "keep_me",
    profiles: [{ id: "u1", name: "Kartik", color: "#C52F3A" }],
    workouts: [
      { id: "w1", profileId: "u1", endedAt: "2026-11-20T10:00:00.000Z", exercises: [] }
    ]
  };
  const incoming = {
    profiles: [{ id: "u1", name: "Other Name", color: "#000000" }],
    settings: { u1: { unit: "lb", tone: "calm" } },
    workouts: [
      { id: "w1", profileId: "u1", endedAt: "2026-11-20T10:00:00.000Z", exercises: [] },
      { id: "w2", profileId: "u1", endedAt: "2026-11-21T10:00:00.000Z", exercises: [] }
    ],
    extraVendorField: { v: 1 }
  };

  const preview = buildImportPreview(current, incoming);
  assert(preview.valid, "preview valid");
  assertEqual(preview.conflicts.profileConflicts.length, 1, "1 profile conflict");
  assertEqual(preview.conflicts.settingsConflicts.length, 1, "1 settings conflict");
  assertEqual(preview.counts.newWorkouts, 1, "1 new workout");
  assertEqual(preview.counts.duplicateWorkouts, 1, "1 duplicate workout");

  const merged = commitImport(current, incoming, {
    mode: "merge",
    conflictPolicy: "keep_existing",
    createDefaultState,
    defaultExercises: SAMPLE_EXERCISES
  });
  assertEqual(merged.nextState.profiles[0].name, "Kartik", "kept existing profile name");
  assertEqual(merged.nextState.settings.u1.unit, "kg", "kept existing profile unit");
  assertEqual(merged.nextState.workouts.length, 2, "merged to 2 workouts");
  assertEqual(merged.nextState.customTopKey, "keep_me", "preserved existing unknown field");
  assertEqual(merged.nextState.extraVendorField.v, 1, "preserved incoming unknown field");
});

// 11. Mid-workout application refresh & full lifecycle integration
test("Full workout lifecycle + mid-workout refresh survival", () => {
  const storage = createMockStorage();
  const s1 = createDefaultState();
  s1.settings.u1.unit = "lb";
  s1.activeWorkouts.u1 = {
    id: "wk_live",
    title: "Upper A",
    weightUnit: "kg",
    startedAt: "2026-11-22T09:00:00.000Z",
    exercises: [
      {
        exerciseId: "ex_bench",
        sets: [
          { weight: String(displayToKg(135, "lb")), reps: "5", type: "", status: "completed", completed: true },
          { weight: String(displayToKg(135, "lb")), reps: "5", type: "", status: "planned", completed: false }
        ]
      }
    ]
  };
  const saved = saveStateSafe(storage, s1);
  assert(saved.ok, "saved active workout");

  // Simulate page reload / mid-workout refresh
  const reloaded = loadStateSafe(storage, createDefaultState, SAMPLE_EXERCISES);
  assertEqual(reloaded.status, "ok", "reloaded cleanly");
  const aw = reloaded.state.activeWorkouts.u1;
  assert(aw != null, "active workout survived refresh");
  assertEqual(aw.exercises[0].sets[0].completed, true, "completed set survived");
  assertEqual(aw.exercises[0].sets[1].completed, false, "planned set stayed incomplete");

  // Finish workout
  const fin = finalizeActiveWorkout(aw, { profileId: "u1", weightsAreCanonicalKg: true });
  assert(fin.ok, "finalized workout");
  assertEqual(fin.workout.exercises[0].sets[0].weight, 61.23, "persisted canonical kg");
  assertEqual(fin.workout.exercises[0].sets[1].status, "skipped", "unchecked set marked skipped");

  reloaded.state.workouts.push(fin.workout);
  reloaded.state.activeWorkouts.u1 = null;
  saveStateSafe(storage, reloaded.state);

  const sug = getOverloadSuggestion("ex_bench", reloaded.state.workouts);
  assertEqual(sug.lastWeightKg, 61.23, "progression consumes canonical kg");
  assertEqual(sug.reps, 6, "suggests +1 rep");
  assertEqual(getHistoricalBest1RM("ex_bench", reloaded.state.workouts), computeSet1RM(61.23, 5), "1RM in canonical kg");
});

// 12. Chart-facing conversion helpers (KG and LB)
test("buildWeeklyVolumeSeries and buildStrengthSeries convert canonical kg to display unit and exclude warmups", () => {
  const now = new Date("2026-11-22T12:00:00.000Z");
  const workouts = [
    {
      id: "w_chart_1",
      profileId: "u1",
      schemaVersion: 2,
      endedAt: "2026-11-20T12:00:00.000Z",
      exercises: [
        {
          exerciseId: "ex_bench",
          sets: [
            { weight: 40, reps: 10, type: "W", status: "completed", completed: true },
            { weight: 61.23, reps: 5, type: "", status: "completed", completed: true },
            { weight: 100, reps: 5, type: "", status: "planned", completed: false }
          ]
        }
      ]
    }
  ];
  const volKg = buildWeeklyVolumeSeries(workouts, "kg", kgToDisplay, now);
  const volLb = buildWeeklyVolumeSeries(workouts, "lb", kgToDisplay, now);
  assertEqual(volKg.length, 8, "8-week series");
  assertEqual(volKg[7].volumeKg, 306.15, "canonical kg excludes W and planned sets");
  assertEqual(volKg[7].displayVolume, 306, "kg display volume");
  assertEqual(volLb[7].displayVolume, 675, "lb display volume (306.15 kg -> 675 lb)");

  const strKg = buildStrengthSeries(workouts, "ex_bench", "kg", kgToDisplay);
  const strLb = buildStrengthSeries(workouts, "ex_bench", "lb", kgToDisplay);
  assertEqual(strKg.length, 1, "1 strength point");
  assertEqual(strKg[0].est1RMKg, 71.4, "canonical 1RM kg");
  assertEqual(strKg[0].display1RM, 71.4, "display 1RM kg");
  assertEqual(strLb[0].display1RM, 157.5, "display 1RM lb");
});

// 13. Migration idempotency, repeated load/save, nested unknown fields, and ambiguous protection
test("Migration is idempotent across repeated load/save cycles and preserves nested unknown fields", () => {
  const raw = {
    schemaVersion: 1,
    activeProfileId: "u1",
    profiles: [{ id: "u1", name: "Kartik", color: "#C52F3A", avatarSeed: "k1" }],
    settings: { u1: { unit: "lb", customFlag: true } },
    routines: { u1: [{ id: "r1", name: "Push", exerciseIds: ["ex_bench"], customNote: "keep" }] },
    workouts: [
      {
        id: "w_ambig",
        profileId: "u1",
        endedAt: "2026-11-18T10:00:00.000Z",
        customWorkoutTag: "legacy_tag",
        exercises: [
          {
            exerciseId: "ex_bench",
            customExMeta: { tempo: "3-1-1" },
            sets: [{ weight: 80, reps: 5, type: "", customSetHint: "paused" }]
          }
        ]
      }
    ],
    activeWorkouts: {
      u1: {
        id: "aw_1",
        title: "Live",
        startedAt: "2026-11-22T10:00:00.000Z",
        exercises: [
          {
            exerciseId: "ex_bench",
            sets: [
              { weight: "135", reps: "5", completed: true },
              { weight: "135", reps: "5", completed: false }
            ]
          }
        ]
      }
    }
  };

  const first = migrateState(raw, createDefaultState, SAMPLE_EXERCISES).state;
  const second = migrateState(first, createDefaultState, SAMPLE_EXERCISES).state;
  assertEqual(JSON.stringify(first), JSON.stringify(second), "migrateState idempotent");

  assertEqual(first.workouts[0].exercises[0].sets[0].weight, 80, "ambiguous historical weight untouched");
  assertEqual(first.activeWorkouts.u1.weightUnit, "kg", "active workout canonicalized");
  assertEqual(first.activeWorkouts.u1.exercises[0].sets[0].weight, "61.23", "active lb converted to 61.23 kg");
  assertEqual(first.activeWorkouts.u1.exercises[0].sets[0].completed, true, "active completed preserved");
  assertEqual(first.activeWorkouts.u1.exercises[0].sets[1].completed, false, "active planned preserved");

  assertEqual(first.profiles[0].avatarSeed, "k1", "profile nested unknown field");
  assertEqual(first.settings.u1.customFlag, true, "settings nested unknown field");
  assertEqual(first.routines.u1[0].customNote, "keep", "routine nested unknown field");
  assertEqual(first.workouts[0].customWorkoutTag, "legacy_tag", "workout nested unknown field");
  assertEqual(first.workouts[0].exercises[0].customExMeta.tempo, "3-1-1", "exercise nested unknown field");
  assertEqual(first.workouts[0].exercises[0].sets[0].customSetHint, "paused", "set nested unknown field");

  const storage = createMockStorage({ [STORAGE_KEY]: JSON.stringify(raw) });
  const l1 = loadStateSafe(storage, createDefaultState, SAMPLE_EXERCISES);
  assertEqual(saveStateSafe(storage, l1.state).ok, true, "save 1 ok");
  const l2 = loadStateSafe(storage, createDefaultState, SAMPLE_EXERCISES);
  assertEqual(saveStateSafe(storage, l2.state).ok, true, "save 2 ok");
  const l3 = loadStateSafe(storage, createDefaultState, SAMPLE_EXERCISES);
  assertEqual(JSON.stringify(l2.state), JSON.stringify(l3.state), "repeated load/save stable");
});

// 14. Failed migration cannot overwrite original state
test("Failed migration preserves original LocalStorage state untouched", () => {
  const originalRaw = JSON.stringify({ schemaVersion: 1, profiles: [{ id: "u1", name: "Safe", color: "#C52F3A" }], workouts: [] });
  const storage = createMockStorage({ [STORAGE_KEY]: originalRaw });
  const throwingCreateDefault = () => {
    throw new Error("Simulated migration failure");
  };
  let threw = false;
  try {
    loadStateSafe(storage, throwingCreateDefault, SAMPLE_EXERCISES);
  } catch {
    threw = true;
  }
  assert(threw, "exception surfaced without overwriting");
  assertEqual(storage.getItem(STORAGE_KEY), originalRaw, "original storage key untouched");
});

// 15. Full import semantics audit: overwrite vs keep_existing, restore vs merge, backup failure, stale preview
test("Import semantics enforce conflict policies, restore vs merge, backup failure, and stale-preview rejection", () => {
  const current = {
    ...createDefaultState(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    profiles: [{ id: "u1", name: "LocalUser", color: "#C52F3A" }],
    exercises: [{ id: "ex_custom", name: "Local Custom", equipment: "Cable", primary: ["chest"], secondary: [] }],
    routines: { u1: [{ id: "r1", name: "Local Routine", exerciseIds: ["ex_bench"] }] },
    settings: { u1: { unit: "kg", tone: "system", autoRest: true, defaultRestSec: 90, weeklySetTarget: 40 } },
    workouts: [{ id: "w1", profileId: "u1", endedAt: "2026-11-20T10:00:00.000Z", title: "Local W1", exercises: [] }],
    activeWorkouts: { u1: { id: "aw_local", title: "Local Active", exercises: [] }, u2: null }
  };
  const incoming = {
    profiles: [{ id: "u1", name: "RemoteUser", color: "#FFFFFF" }],
    exercises: [{ id: "ex_custom", name: "Remote Custom", equipment: "Dumbbell", primary: ["lats"], secondary: [] }],
    routines: { u1: [{ id: "r1", name: "Remote Routine", exerciseIds: ["ex_squat"] }] },
    settings: { u1: { unit: "lb", tone: "calm" } },
    workouts: [
      { id: "w1", profileId: "u1", endedAt: "2026-11-20T10:00:00.000Z", title: "Remote W1", exercises: [] },
      { id: "w2", profileId: "u1", endedAt: "2026-11-21T10:00:00.000Z", title: "Remote W2", exercises: [] }
    ],
    activeWorkouts: { u1: { id: "aw_remote", title: "Remote Active", exercises: [] } }
  };

  const preview = buildImportPreview(current, incoming);
  assert(preview.valid, "preview valid");
  assertEqual(preview.conflicts.profileConflicts.length, 1, "profile conflict detected");
  assertEqual(preview.conflicts.exerciseConflicts.length, 1, "exercise conflict detected");
  assertEqual(preview.conflicts.routineConflicts.length, 1, "routine conflict detected");
  assertEqual(preview.conflicts.settingsConflicts.length, 1, "settings conflict detected");
  assertEqual(preview.conflicts.activeWorkoutConflicts.length, 1, "active workout conflict detected");

  const mutated = { ...current, profiles: [{ id: "u1", name: "ChangedAfterPreview", color: "#C52F3A" }] };
  const staleRes = commitImport(mutated, incoming, {
    mode: "merge",
    conflictPolicy: "keep_existing",
    expectedFingerprint: preview.baseFingerprint,
    createDefaultState,
    defaultExercises: SAMPLE_EXERCISES
  });
  assertEqual(staleRes.ok, false, "stale preview rejected");
  assertEqual(staleRes.reason, "stale_preview", "reason stale_preview");

  const failingStorage = createMockStorage({}, { throwQuotaOnBackup: true });
  const backupFailRestore = commitImport(current, incoming, {
    mode: "restore",
    conflictPolicy: "overwrite",
    expectedFingerprint: preview.baseFingerprint,
    storage: failingStorage,
    requireBackupForDestructive: true,
    createDefaultState,
    defaultExercises: SAMPLE_EXERCISES
  });
  assertEqual(backupFailRestore.ok, false, "restore blocked on backup failure");
  assertEqual(backupFailRestore.reason, "backup_failed", "reason backup_failed");

  const okStorage = createMockStorage();
  const overwriteMerge = commitImport(current, incoming, {
    mode: "merge",
    conflictPolicy: "overwrite",
    expectedFingerprint: preview.baseFingerprint,
    storage: okStorage,
    requireBackupForDestructive: true,
    createDefaultState,
    defaultExercises: SAMPLE_EXERCISES
  });
  assertEqual(overwriteMerge.ok, true, "overwrite merge succeeded");
  assertEqual(overwriteMerge.nextState.profiles[0].name, "RemoteUser", "profile overwritten");
  assertEqual(overwriteMerge.nextState.routines.u1[0].name, "Remote Routine", "routine overwritten");
  assertEqual(overwriteMerge.nextState.settings.u1.unit, "lb", "settings overwritten");
  assertEqual(overwriteMerge.nextState.activeWorkouts.u1.id, "aw_remote", "active workout overwritten");
  assertEqual(overwriteMerge.nextState.workouts.length, 2, "2 workouts after merge");

  const currentWithExtra = { ...current, workouts: [...current.workouts, { id: "w_local_only", profileId: "u1", endedAt: "2026-11-19T10:00:00.000Z", exercises: [] }] };
  const restorePreview = buildImportPreview(currentWithExtra, incoming);
  const restored = commitImport(currentWithExtra, incoming, {
    mode: "restore",
    conflictPolicy: "overwrite",
    expectedFingerprint: restorePreview.baseFingerprint,
    storage: okStorage,
    requireBackupForDestructive: true,
    createDefaultState,
    defaultExercises: SAMPLE_EXERCISES
  });
  assertEqual(restored.ok, true, "full restore succeeded");
  assertEqual(restored.nextState.workouts.length, 2, "full restore replaced local-only workout");
});

const failed = results.filter((r) => !r.pass);
print(`\nSUMMARY: ${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) {
  throw new Error(`${failed.length} test(s) failed`);
}
