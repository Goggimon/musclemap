import {
  kgToDisplay as coreKgToDisplay,
  displayToKg as coreDisplayToKg,
  formatWeight as coreFormatWeight,
  roundGymWeight
} from "./js/core/units.js";
import {
  STORAGE_KEY,
  loadStateSafe,
  saveStateSafe,
  buildImportPreview,
  commitImport
} from "./js/core/storage.js";
import { finalizeActiveWorkout, isWorkingCompletedSet } from "./js/core/workout-normalization.js";
import {
  computeSet1RM,
  getHistoricalBest1RM as coreGetHistoricalBest1RM,
  computeWorkoutTotals,
  computeWindowKpis,
  computePersonalRecords,
  buildWeeklyVolumeSeries,
  buildStrengthSeries
} from "./js/core/workout-metrics.js";
import {
  computeMuscleStats as coreComputeMuscleStats,
  getHeatLevel,
  getRecoveryState
} from "./js/core/muscle-metrics.js";
import { getOverloadSuggestion as coreGetOverloadSuggestion } from "./js/core/progression.js";

(() => {
  "use strict";

  const APP_VERSION = "v7.1";

  const CHANGELOG = [
    {
      version: "v7.1",
      date: "2026-11-22",
      items: [
        "Expanded Exercise Library to 95+ exercises: added 45° Back Extensions, Weighted Back Extensions, Reverse Hyperextensions, Neutral/Single-Arm/Wide/Close/Underhand Lat Pulldowns, MAG/Wide/Single-Arm Seated Cable Rows, and all Cable Fly angles (High-to-Low, Low-to-High, Mid, Seated, Incline, Single-Arm)",
        "Added dedicated 2D stickman animations, joint-angle guides, and Mistake comparisons for every new movement pattern",
        "Added Edit Past Workout inside History & Calendar so you can fix weight/reps, change set types, or add/remove sets and exercises anytime"
      ]
    },
    {
      version: "v7.0",
      date: "2026-11-20",
      items: [
        "Personal Coach Onboarding: builds a tailored 2–4 day plan (Full Body, Upper/Lower, or Dumbbell-at-Home) with System / Calm / Sport visual tones",
        "Today-First Home: leads with Today's Workout, plain-language context, My Plan adherence strip, and a clean empty-state preview before your first session",
        "Focused Active Workout Mode: inline form cues, plain-language progression targets, warm-up vs working set separation, remembered bench/pin settings, kg/lb toggle, and floating rest timer",
        "Coach Insights & Gentle Balance Guidance: post-workout difficulty reflection, weekly insight cards in Stats, and plain-language muscle map cues"
      ]
    },
    {
      version: "v6.5",
      date: "2026-11-16",
      items: [
        "Slimmed down the Home Biometric Scan figure and added a live Front / Rear toggle on the Home card",
        "Made Weekly Set Target (04 // WEEKLY LOAD) customizable per profile via Edit or Customize",
        "Added Push / Pull / Legs balance gauge on Home and visual ratio bars in Anatomy Balance Diagnostics"
      ]
    },
    {
      version: "v6.4",
      date: "2026-11-15",
      items: [
        "Added Post-Workout Summary Card modal shown automatically on session finish and accessible from any past workout in History/Calendar",
        "Displays session duration, working sets, total volume, new 1RM PRs hit, stimulated muscles, and exercise breakdown with 1-tap PNG Card download"
      ]
    },
    {
      version: "v6.3",
      date: "2026-11-15",
      items: [
        "Added specular crimson top-edge highlights, biometric scan sweep & PEC/CORE/QUAD callouts on the hero figure",
        "Upgraded Stimulus Periodic bars with glowing cap dots & dashed average line, multi-arc concentric Session Ring, and mini Intensity waveform"
      ]
    },
    {
      version: "v6.2",
      date: "2026-11-15",
      items: [
        "Added subtle animated cybernetic micro-grid and drifting telemetry nodes background with smoked-glass hardware panels",
        "Enriched Bento Overview with SVG session progress ring, chart Peak/Avg summary column, Set Target hero readout, and 7-day volume sparkline"
      ]
    },
    {
      version: "v6.1",
      date: "2026-11-15",
      items: [
        "Replaced the left Iron Rail with a centered top horizontal navigation bar on desktop for full-width workspace layout",
        "Rebuilt Home Overview into a 2-row Bento Swiss Grid: Hero Anatomy Scan + 7D Stimulus Bar Chart on top, and Next Session + Segmented Set Target + Weekly Activity Strip below"
      ]
    },
    {
      version: "v6.0",
      date: "2026-11-15",
      items: [
        "SYSTEM 01 Redesign (Cybernetic × Techwear × Swiss Grid): #0B0D0F graphite surfaces, restrained #C52F3A/#E3444D blood-red illumination, Space Grotesk + IBM Plex Mono typography",
        "Desktop Iron Rail navigation with M/S01 monogram, unified geometric icons, and contextual SYSTEM / 01 top bar",
        "Expanded Anatomy Centrepiece: 2-column biometric scan workspace with OVERVIEW / STIMULUS / VOLUME / FREQUENCY contextual tabs",
        "Re-themed Chart.js performance charts, calendar, workout logger, and mobile-first bottom navigation"
      ]
    },
    {
      version: "v5.1",
      date: "2026-11-15",
      items: [
        "Switched Form Viewer back to the crisp 2D athletic stickman with zero loading delay and full muscle-group highlighting (Primary red, Secondary amber)",
        "Added live joint-angle arcs and degree readouts (°), curved movement trajectories, and spine posture lines under Guides: ON/OFF",
        "Added Mistake: OFF/ON comparison mode on every exercise plus a full Form Guide section (Setup, Tempo & Breathing, Target Angles, and What to Look Out For)"
      ]
    },
    {
      version: "v5.0",
      date: "2026-11-15",
      items: [
        "Upgraded 3D Form Viewer to a full .glb skinned human model (Xbot.glb via GLTFLoader) with Mixamo bone-driven exercise animations and instant procedural fallback",
        "Added peak-flex contraction pulsing on primary and secondary muscles, PCFSoftShadowMap studio lighting, Olympic barbell collars, weight-stack selector pins, and split V-ropes",
        "Added live 3D joint-angle arcs at key joints and a Mistake: OFF/ON toggle showing common form errors with coaching explanations"
      ]
    },
    {
      version: "v4.1",
      date: "2026-11-15",
      items: [
        "Sculpted 3D athlete anatomy: detailed head (jaw, brow, nose, eyes, ears), articulated hands gripping bars/handles, and 17 distinct muscle groups",
        "Intensity-based muscle highlighting: Primary muscles (1.0x) glow red while Secondary muscles (0.5x) glow amber-orange",
        "Animated machine-specific rigs: swinging Pec Deck arms, Chest/Shoulder Press levers, Lat Pulldown bar + thigh pads + moving weight stack, Leg Ext/Curl rotating ankle rollers, and 45° Leg Press sled",
        "Full 3D curved movement trajectories with directional cones and green spine posture lines on every exercise"
      ]
    },
    {
      version: "v4.0",
      date: "2026-11-15",
      items: [
        "Upgraded Form Viewer to an interactive 360° 3D anatomical model (Three.js + OrbitControls) for all 60 exercises",
        "Added drag-to-orbit, pinch/scroll zoom, 45° / Front / Side / Back camera presets, and toggleable 3D alignment guides",
        "Automatic fallback to the 2D stickman viewer if WebGL is unavailable"
      ]
    },
    {
      version: "v3.2",
      date: "2026-11-15",
      items: [
        "Added dedicated Guide tab alongside Home/Map/Workout/Library/Stats showing where every feature lives",
        "Added 3-step Beginner Quick Start, live feature search, and 1-tap jump buttons to every screen"
      ]
    },
    {
      version: "v3.1",
      date: "2026-11-15",
      items: [
        "PWA offline support (sw.js app shell + Chart.js caching) & unlocked landscape orientation in manifest.json",
        "Set-type tags (Working / W Warmup / D Drop / F Failure) — warmup sets excluded from 1RM PRs and heatmap sets",
        "Live PR! badge updates as you type, including first-time exercise PRs",
        "Optional per-exercise notes and RPE logging, included in CSV export",
        "Custom routine editing and up/down exercise reordering",
        "Tier table highlights your Experience level and adds 1-tap Use buttons to pre-fill sets",
        "Screen Wake Lock during active workouts & background rest-timer Notifications",
        "8-Week Weekly Volume Trend chart in Stats",
        "Cable handle and leg-press sled animations in Exercise Form viewer"
      ]
    },
    {
      version: "v3.0",
      date: "2026-11-15",
      items: [
        "Swiss Grid / Minimal Fitness dark-charcoal + blood-red redesign with Iron Rail desktop navigation",
        "Body-gated 4-tier exercise load recommendations (Beginner to Maximum)",
        "Upgraded athletic stickman geometry with tapered limbs and torso",
        "V2 bundle: session recovery, 1-tap set completion, smart rest timer, progressive overload, swaps, plate calculator, custom dashboard, calendar, recovery heatmap, and CSV export"
      ]
    }
  ];

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  function openChangelogModal() {
    const verEl = document.getElementById("changelog-current-version");
    const listEl = document.getElementById("changelog-list");
    if (verEl) verEl.textContent = `Current build: ${APP_VERSION}`;
    if (listEl) {
      listEl.innerHTML = CHANGELOG.map(
        (rel) => `
        <div class="changelog-item">
          <div class="card-head">
            <strong>${escapeHtml(rel.version)}</strong>
            <span class="muted-note">${escapeHtml(rel.date)}</span>
          </div>
          <ul class="changelog-ul">
            ${rel.items.map((it) => `<li>${escapeHtml(it)}</li>`).join("")}
          </ul>
        </div>`
      ).join("");
    }
    openModal("modal-changelog");
  }

  const MUSCLES = {
    chest: "Chest",
    front_delts: "Front Delts",
    side_delts: "Side Delts",
    rear_delts: "Rear Delts",
    traps: "Traps",
    lats: "Lats",
    mid_back: "Mid Back",
    lower_back: "Lower Back",
    biceps: "Biceps",
    triceps: "Triceps",
    forearms: "Forearms",
    abs: "Abs",
    obliques: "Obliques",
    quads: "Quads",
    hamstrings: "Hamstrings",
    glutes: "Glutes",
    calves: "Calves"
  };

  /* ---------------- 55+ EXERCISES (MACHINES, DUMBBELLS, BARBELL, CABLE, BODYWEIGHT) ---------------- */
  const DEFAULT_EXERCISES = [
    // Chest
    { id: "ex_bench", name: "Barbell Bench Press", equipment: "Barbell", primary: ["chest"], secondary: ["front_delts", "triceps"], rig: "bench_press" },
    { id: "ex_db_bench", name: "Dumbbell Flat Bench Press", equipment: "Dumbbell", primary: ["chest"], secondary: ["front_delts", "triceps"], rig: "bench_press" },
    { id: "ex_incline_db", name: "Incline Dumbbell Press", equipment: "Dumbbell", primary: ["chest", "front_delts"], secondary: ["triceps"], rig: "incline_press" },
    { id: "ex_incline_bb", name: "Incline Barbell Press", equipment: "Barbell", primary: ["chest", "front_delts"], secondary: ["triceps"], rig: "incline_press" },
    { id: "ex_db_fly", name: "Dumbbell Chest Fly", equipment: "Dumbbell", primary: ["chest"], secondary: ["front_delts"], rig: "chest_fly" },
    { id: "ex_db_pullover", name: "Dumbbell Pullover", equipment: "Dumbbell", primary: ["chest", "lats"], secondary: ["triceps"], rig: "db_pullover" },
    { id: "ex_cable_fly", name: "Cable Chest Fly", equipment: "Cable", primary: ["chest"], secondary: ["front_delts"], rig: "cable_fly" },
    { id: "ex_pec_deck", name: "Pec Deck Fly Machine", equipment: "Machine", primary: ["chest"], secondary: ["front_delts"], rig: "pec_deck" },
    { id: "ex_chest_press_mach", name: "Seated Chest Press Machine", equipment: "Machine", primary: ["chest"], secondary: ["front_delts", "triceps"], rig: "machine_press" },
    { id: "ex_dips", name: "Weighted / Parallel Dips", equipment: "Bodyweight", primary: ["chest", "triceps"], secondary: ["front_delts"], rig: "dips" },
    { id: "ex_pushup", name: "Push-Ups", equipment: "Bodyweight", primary: ["chest"], secondary: ["front_delts", "triceps", "abs"], rig: "pushup" },

    // Shoulders
    { id: "ex_ohp", name: "Overhead Barbell Press", equipment: "Barbell", primary: ["front_delts"], secondary: ["side_delts", "triceps", "traps"], rig: "ohp" },
    { id: "ex_db_shoulder", name: "Seated DB Shoulder Press", equipment: "Dumbbell", primary: ["front_delts", "side_delts"], secondary: ["triceps"], rig: "seated_ohp" },
    { id: "ex_arnold_press", name: "Dumbbell Arnold Press", equipment: "Dumbbell", primary: ["front_delts", "side_delts"], secondary: ["triceps"], rig: "seated_ohp" },
    { id: "ex_shoulder_mach", name: "Shoulder Press Machine", equipment: "Machine", primary: ["front_delts", "side_delts"], secondary: ["triceps"], rig: "seated_ohp" },
    { id: "ex_lat_raise", name: "Dumbbell Lateral Raise", equipment: "Dumbbell", primary: ["side_delts"], secondary: ["traps"], rig: "lat_raise" },
    { id: "ex_cable_lat_raise", name: "Cable Lateral Raise", equipment: "Cable", primary: ["side_delts"], secondary: ["traps"], rig: "lat_raise" },
    { id: "ex_db_front_raise", name: "Dumbbell Front Raise", equipment: "Dumbbell", primary: ["front_delts"], secondary: ["side_delts"], rig: "front_raise" },
    { id: "ex_db_rear_fly", name: "DB Bent-Over Rear Delt Fly", equipment: "Dumbbell", primary: ["rear_delts"], secondary: ["mid_back", "traps"], rig: "rear_delt_fly" },
    { id: "ex_rear_delt_mach", name: "Reverse Pec Deck (Rear Delt)", equipment: "Machine", primary: ["rear_delts", "mid_back"], secondary: ["traps"], rig: "pec_deck" },
    { id: "ex_face_pull", name: "Cable Face Pull", equipment: "Cable", primary: ["rear_delts", "mid_back"], secondary: ["traps"], rig: "face_pull" },

    // Back & Traps
    { id: "ex_pullup", name: "Pull-Ups", equipment: "Bodyweight", primary: ["lats"], secondary: ["biceps", "mid_back", "rear_delts"], rig: "pullup" },
    { id: "ex_lat_pulldown", name: "Lat Pulldown Machine", equipment: "Machine", primary: ["lats"], secondary: ["biceps", "mid_back"], rig: "lat_pulldown" },
    { id: "ex_bb_row", name: "Barbell Bent-Over Row", equipment: "Barbell", primary: ["mid_back", "lats"], secondary: ["rear_delts", "biceps", "lower_back"], rig: "bent_row" },
    { id: "ex_db_single_row", name: "Single-Arm Dumbbell Row", equipment: "Dumbbell", primary: ["lats", "mid_back"], secondary: ["biceps", "rear_delts"], rig: "single_arm_row" },
    { id: "ex_db_chest_row", name: "Chest-Supported DB Row", equipment: "Dumbbell", primary: ["mid_back", "lats"], secondary: ["rear_delts", "biceps"], rig: "incline_row" },
    { id: "ex_cable_row", name: "Seated Cable Row", equipment: "Cable", primary: ["mid_back", "lats"], secondary: ["biceps", "rear_delts"], rig: "seated_row" },
    { id: "ex_mach_row", name: "Seated Row Machine", equipment: "Machine", primary: ["mid_back", "lats"], secondary: ["biceps", "rear_delts"], rig: "seated_row" },
    { id: "ex_shrug", name: "Dumbbell Shrugs", equipment: "Dumbbell", primary: ["traps"], secondary: ["forearms"], rig: "shrug" },
    { id: "ex_bb_shrug", name: "Barbell Shrugs", equipment: "Barbell", primary: ["traps"], secondary: ["forearms"], rig: "shrug" },

    // Arms
    { id: "ex_bb_curl", name: "Barbell Bicep Curl", equipment: "Barbell", primary: ["biceps"], secondary: ["forearms"], rig: "curl" },
    { id: "ex_db_curl", name: "Dumbbell Standing Curl", equipment: "Dumbbell", primary: ["biceps"], secondary: ["forearms"], rig: "curl" },
    { id: "ex_incline_curl", name: "Incline Dumbbell Curl", equipment: "Dumbbell", primary: ["biceps"], secondary: ["forearms"], rig: "incline_curl" },
    { id: "ex_hammer_curl", name: "Dumbbell Hammer Curl", equipment: "Dumbbell", primary: ["biceps", "forearms"], secondary: [], rig: "curl" },
    { id: "ex_conc_curl", name: "DB Concentration Curl", equipment: "Dumbbell", primary: ["biceps"], secondary: ["forearms"], rig: "preacher_curl" },
    { id: "ex_preacher_mach", name: "Preacher Curl Machine", equipment: "Machine", primary: ["biceps"], secondary: ["forearms"], rig: "preacher_curl" },
    { id: "ex_pushdown", name: "Tricep Rope Pushdown", equipment: "Cable", primary: ["triceps"], secondary: [], rig: "tricep_pushdown" },
    { id: "ex_db_oh_ext", name: "DB Overhead Tricep Extension", equipment: "Dumbbell", primary: ["triceps"], secondary: [], rig: "tricep_overhead" },
    { id: "ex_db_skull", name: "Dumbbell Skullcrushers", equipment: "Dumbbell", primary: ["triceps"], secondary: [], rig: "skullcrusher" },
    { id: "ex_skullcrusher", name: "EZ-Bar Skullcrushers", equipment: "Barbell", primary: ["triceps"], secondary: [], rig: "skullcrusher" },
    { id: "ex_tricep_kickback", name: "Dumbbell Tricep Kickback", equipment: "Dumbbell", primary: ["triceps"], secondary: [], rig: "kickback" },

    // Legs & Glutes
    { id: "ex_squat", name: "Barbell Back Squat", equipment: "Barbell", primary: ["quads", "glutes"], secondary: ["hamstrings", "lower_back", "abs"], rig: "squat" },
    { id: "ex_goblet_squat", name: "Dumbbell Goblet Squat", equipment: "Dumbbell", primary: ["quads", "glutes"], secondary: ["abs"], rig: "squat" },
    { id: "ex_db_split_squat", name: "DB Bulgarian Split Squat", equipment: "Dumbbell", primary: ["quads", "glutes"], secondary: ["hamstrings"], rig: "lunge" },
    { id: "ex_db_lunge", name: "Dumbbell Walking Lunges", equipment: "Dumbbell", primary: ["quads", "glutes"], secondary: ["hamstrings", "calves"], rig: "lunge" },
    { id: "ex_smith_squat", name: "Smith / Hack Squat Machine", equipment: "Machine", primary: ["quads", "glutes"], secondary: ["hamstrings"], rig: "squat" },
    { id: "ex_leg_press", name: "Leg Press Machine", equipment: "Machine", primary: ["quads"], secondary: ["glutes", "hamstrings"], rig: "leg_press" },
    { id: "ex_leg_ext", name: "Leg Extension Machine", equipment: "Machine", primary: ["quads"], secondary: [], rig: "leg_ext" },
    { id: "ex_rdl", name: "Barbell Romanian Deadlift", equipment: "Barbell", primary: ["hamstrings", "glutes"], secondary: ["lower_back", "forearms"], rig: "rdl" },
    { id: "ex_db_rdl", name: "Dumbbell Romanian Deadlift", equipment: "Dumbbell", primary: ["hamstrings", "glutes"], secondary: ["lower_back", "forearms"], rig: "rdl" },
    { id: "ex_deadlift", name: "Conventional Deadlift", equipment: "Barbell", primary: ["lower_back", "glutes", "hamstrings"], secondary: ["traps", "forearms", "quads"], rig: "rdl" },
    { id: "ex_leg_curl", name: "Seated Leg Curl Machine", equipment: "Machine", primary: ["hamstrings"], secondary: ["calves"], rig: "leg_curl" },
    { id: "ex_lying_leg_curl", name: "Lying Leg Curl Machine", equipment: "Machine", primary: ["hamstrings"], secondary: ["calves"], rig: "lying_curl" },
    { id: "ex_hip_thrust", name: "Barbell Hip Thrust", equipment: "Barbell", primary: ["glutes"], secondary: ["hamstrings"], rig: "hip_thrust" },
    { id: "ex_calf_raise", name: "Standing Calf Raise Machine", equipment: "Machine", primary: ["calves"], secondary: [], rig: "calf_raise" },
    { id: "ex_db_calf", name: "Dumbbell Single-Leg Calf Raise", equipment: "Dumbbell", primary: ["calves"], secondary: [], rig: "calf_raise" },

    // Chest Variations & Cable Flies
    { id: "ex_decline_bench", name: "Decline Barbell Bench Press", equipment: "Barbell", primary: ["chest"], secondary: ["triceps", "front_delts"], rig: "bench_press" },
    { id: "ex_decline_db", name: "Decline Dumbbell Press", equipment: "Dumbbell", primary: ["chest"], secondary: ["triceps", "front_delts"], rig: "bench_press" },
    { id: "ex_high_to_low_fly", name: "High-to-Low Cable Fly (Lower Chest)", equipment: "Cable", primary: ["chest"], secondary: ["front_delts"], rig: "cable_fly_high_low" },
    { id: "ex_low_to_high_fly", name: "Low-to-High Cable Fly (Upper Chest)", equipment: "Cable", primary: ["chest", "front_delts"], secondary: [], rig: "cable_fly_low_high" },
    { id: "ex_standing_mid_fly", name: "Standing Mid-Pulley Cable Fly", equipment: "Cable", primary: ["chest"], secondary: ["front_delts"], rig: "cable_fly" },
    { id: "ex_seated_cable_fly", name: "Seated Cable Chest Fly", equipment: "Cable", primary: ["chest"], secondary: ["front_delts"], rig: "cable_fly" },
    { id: "ex_incline_cable_fly", name: "Incline Bench Cable Fly", equipment: "Cable", primary: ["chest", "front_delts"], secondary: [], rig: "cable_fly_low_high" },
    { id: "ex_single_cable_fly", name: "Single-Arm Cable Crossover Fly", equipment: "Cable", primary: ["chest"], secondary: ["front_delts", "obliques"], rig: "cable_fly" },

    // Back Extensions & Lower Back
    { id: "ex_back_ext", name: "45° Back Extension (Hyperextension)", equipment: "Bodyweight", primary: ["lower_back", "glutes"], secondary: ["hamstrings"], rig: "back_extension" },
    { id: "ex_weighted_back_ext", name: "Weighted 45° Back Extension", equipment: "Dumbbell", primary: ["lower_back", "glutes"], secondary: ["hamstrings"], rig: "back_extension" },
    { id: "ex_reverse_hyper", name: "Reverse Hyperextension", equipment: "Machine", primary: ["glutes", "lower_back"], secondary: ["hamstrings"], rig: "lying_curl" },

    // Lat Pulldown & Seated Cable Row Variations
    { id: "ex_neutral_pulldown", name: "Neutral-Grip Lat Pulldown", equipment: "Cable", primary: ["lats"], secondary: ["biceps", "mid_back"], rig: "lat_pulldown_neutral" },
    { id: "ex_single_arm_pulldown", name: "Single-Arm Lat Pulldown", equipment: "Cable", primary: ["lats"], secondary: ["biceps", "mid_back", "obliques"], rig: "lat_pulldown_single" },
    { id: "ex_wide_pulldown", name: "Wide-Grip Lat Pulldown", equipment: "Cable", primary: ["lats", "mid_back"], secondary: ["rear_delts", "biceps"], rig: "lat_pulldown" },
    { id: "ex_close_pulldown", name: "Close-Grip V-Bar Lat Pulldown", equipment: "Cable", primary: ["lats"], secondary: ["biceps", "mid_back"], rig: "lat_pulldown_neutral" },
    { id: "ex_underhand_pulldown", name: "Underhand (Supinated) Lat Pulldown", equipment: "Cable", primary: ["lats", "biceps"], secondary: ["mid_back"], rig: "lat_pulldown_neutral" },
    { id: "ex_mag_cable_row", name: "Seated Cable Row (MAG / Neutral Grip)", equipment: "Cable", primary: ["mid_back", "lats"], secondary: ["biceps", "rear_delts"], rig: "seated_row" },
    { id: "ex_wide_cable_row", name: "Seated Cable Row (Wide Grip)", equipment: "Cable", primary: ["mid_back", "rear_delts"], secondary: ["lats", "traps", "biceps"], rig: "seated_row_wide" },
    { id: "ex_single_cable_row", name: "Single-Arm Seated Cable Row", equipment: "Cable", primary: ["lats", "mid_back"], secondary: ["biceps", "obliques"], rig: "seated_row" },
    { id: "ex_tbar_row", name: "T-Bar Row", equipment: "Barbell", primary: ["mid_back", "lats"], secondary: ["rear_delts", "biceps", "lower_back"], rig: "bent_row" },
    { id: "ex_pendlay_row", name: "Pendlay Barbell Row", equipment: "Barbell", primary: ["mid_back", "lats"], secondary: ["rear_delts", "lower_back"], rig: "bent_row" },
    { id: "ex_meadows_row", name: "Meadows Landmine Row", equipment: "Barbell", primary: ["lats", "mid_back"], secondary: ["rear_delts", "biceps"], rig: "single_arm_row" },
    { id: "ex_straight_arm_pulldown", name: "Straight-Arm Cable Pulldown", equipment: "Cable", primary: ["lats"], secondary: ["triceps", "abs"], rig: "straight_arm_pulldown" },

    // Shoulder & Arm Variations
    { id: "ex_leaning_lat_raise", name: "Leaning Single-Arm Cable Lateral Raise", equipment: "Cable", primary: ["side_delts"], secondary: ["traps"], rig: "lat_raise" },
    { id: "ex_upright_row", name: "Cable / EZ-Bar Upright Row", equipment: "Cable", primary: ["side_delts", "traps"], secondary: ["front_delts", "biceps"], rig: "shrug" },
    { id: "ex_reverse_cable_fly", name: "Cross-Body Cable Rear Delt Fly", equipment: "Cable", primary: ["rear_delts"], secondary: ["mid_back"], rig: "rear_delt_fly" },
    { id: "ex_bayesian_curl", name: "Bayesian Behind-the-Back Cable Curl", equipment: "Cable", primary: ["biceps"], secondary: ["forearms"], rig: "bayesian_curl" },
    { id: "ex_rope_hammer_curl", name: "Cable Rope Hammer Curl", equipment: "Cable", primary: ["biceps", "forearms"], secondary: [], rig: "curl" },
    { id: "ex_spider_curl", name: "Spider Dumbbell Curl", equipment: "Dumbbell", primary: ["biceps"], secondary: ["forearms"], rig: "preacher_curl" },
    { id: "ex_cable_oh_tricep", name: "Overhead Cable Rope Tricep Extension", equipment: "Cable", primary: ["triceps"], secondary: [], rig: "tricep_overhead" },
    { id: "ex_single_pushdown", name: "Single-Arm Cable Tricep Pushdown", equipment: "Cable", primary: ["triceps"], secondary: [], rig: "tricep_pushdown" },
    { id: "ex_close_grip_bench", name: "Close-Grip Barbell Bench Press", equipment: "Barbell", primary: ["triceps", "chest"], secondary: ["front_delts"], rig: "bench_press" },

    // Leg Variations
    { id: "ex_front_squat", name: "Barbell Front Squat", equipment: "Barbell", primary: ["quads", "glutes"], secondary: ["abs", "mid_back"], rig: "squat" },
    { id: "ex_hack_squat", name: "Hack Squat Machine", equipment: "Machine", primary: ["quads", "glutes"], secondary: [], rig: "squat" },
    { id: "ex_sumo_deadlift", name: "Sumo Deadlift", equipment: "Barbell", primary: ["glutes", "hamstrings", "quads"], secondary: ["lower_back", "traps", "forearms"], rig: "rdl" },
    { id: "ex_seated_calf", name: "Seated Calf Raise Machine", equipment: "Machine", primary: ["calves"], secondary: [], rig: "calf_raise" },
    { id: "ex_adductor_mach", name: "Hip Adductor / Abductor Machine", equipment: "Machine", primary: ["glutes", "quads"], secondary: [], rig: "leg_ext" },

    // Core
    { id: "ex_hanging_raise", name: "Hanging Leg Raise", equipment: "Bodyweight", primary: ["abs"], secondary: ["obliques", "forearms"], rig: "hanging_raise" },
    { id: "ex_cable_crunch", name: "Cable Crunch", equipment: "Cable", primary: ["abs"], secondary: ["obliques"], rig: "cable_crunch" },
    { id: "ex_ab_mach", name: "Ab Crunch Machine", equipment: "Machine", primary: ["abs"], secondary: ["obliques"], rig: "cable_crunch" },
    { id: "ex_ab_wheel", name: "Ab Wheel Rollout", equipment: "Bodyweight", primary: ["abs"], secondary: ["lats", "obliques"], rig: "ab_wheel" },
    { id: "ex_pallof_press", name: "Cable Pallof Press", equipment: "Cable", primary: ["obliques", "abs"], secondary: [], rig: "woodchop" },
    { id: "ex_woodchop", name: "Cable / DB Woodchopper", equipment: "Cable", primary: ["obliques"], secondary: ["abs"], rig: "woodchop" }
  ];

  /* ---------------- STICKMAN RIGS (2D KEYFRAMES + EQUIPMENT + CUES) ---------------- */
  const FORM_RIGS = {
    bench_press: {
      equip: "bench_flat",
      prop: "bar",
      cues: [
        "Pin shoulder blades back and down into the bench with a slight upper-back arch.",
        "Plant feet flat on the floor; tuck elbows ~45° from your torso.",
        "Lower the weight to mid-chest under control, then press up over your shoulders."
      ],
      start: { head: [58, 98], neck: [72, 102], sh: [82, 105], el: [86, 128], wr: [86, 104], hip: [132, 106], kn: [164, 114], an: [168, 148] },
      end:   { head: [58, 98], neck: [72, 102], sh: [82, 105], el: [86, 84],  wr: [86, 56],  hip: [132, 106], kn: [164, 114], an: [168, 148] }
    },
    incline_press: {
      equip: "bench_incline",
      prop: "dumbbell",
      cues: [
        "Set the bench to 30–45° and keep your upper back pinned to the pad.",
        "Keep elbows slightly tucked (~45°) rather than flared straight out.",
        "Press dumbbells up and slightly inward above your upper chest."
      ],
      start: { head: [72, 64], neck: [82, 76], sh: [90, 84], el: [96, 108], wr: [100, 82], hip: [122, 118], kn: [158, 122], an: [162, 150] },
      end:   { head: [72, 64], neck: [82, 76], sh: [90, 84], el: [96, 62],  wr: [100, 38], hip: [122, 118], kn: [158, 122], an: [162, 150] }
    },
    chest_fly: {
      equip: "bench_flat",
      prop: "dumbbell",
      cues: [
        "Maintain a soft, fixed bend in your elbows throughout the entire arc.",
        "Open your arms wide until you feel a deep stretch across the pecs.",
        "Squeeze your chest to bring the dumbbells back together above your sternum."
      ],
      start: { head: [58, 98], neck: [72, 102], sh: [82, 105], el: [78, 128], wr: [74, 140], hip: [132, 106], kn: [164, 114], an: [168, 148] },
      end:   { head: [58, 98], neck: [72, 102], sh: [82, 105], el: [86, 80],  wr: [88, 56],  hip: [132, 106], kn: [164, 114], an: [168, 148] }
    },
    db_pullover: {
      equip: "bench_flat",
      prop: "dumbbell",
      cues: [
        "Keep hips slightly dropped and core braced so your lower back doesn't over-arch.",
        "Lower the dumbbell behind your head with a slight elbow bend.",
        "Pull back over your chest using your lats and upper pecs."
      ],
      start: { head: [66, 98], neck: [80, 102], sh: [90, 105], el: [64, 92], wr: [42, 86], hip: [138, 108], kn: [168, 116], an: [170, 148] },
      end:   { head: [66, 98], neck: [80, 102], sh: [90, 105], el: [94, 78], wr: [98, 56], hip: [138, 108], kn: [168, 116], an: [170, 148] }
    },
    cable_fly: {
      equip: "cable_mid",
      prop: "none",
      cues: [
        "Take one step forward into a staggered stance for stability.",
        "Keep chest proud and shoulders down—don't round forward.",
        "Sweep your hands together in a wide hug motion and pause at peak contraction."
      ],
      start: { head: [110, 34], neck: [110, 48], sh: [108, 58], el: [84, 68],  wr: [68, 66],  hip: [104, 96], kn: [114, 124], an: [118, 150] },
      end:   { head: [110, 34], neck: [110, 48], sh: [108, 58], el: [128, 72], wr: [148, 74], hip: [104, 96], kn: [114, 124], an: [118, 150] }
    },
    pec_deck: {
      equip: "machine_seat",
      prop: "none",
      cues: [
        "Adjust seat height so handles align with your mid-chest.",
        "Keep your back flat against the pad and shoulders depressed.",
        "Bring arms together smoothly without letting elbows drop."
      ],
      start: { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [78, 64],  wr: [78, 46],  hip: [102, 104], kn: [136, 106], an: [138, 148] },
      end:   { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [122, 64], wr: [136, 56], hip: [102, 104], kn: [136, 106], an: [138, 148] }
    },
    machine_press: {
      equip: "machine_seat",
      prop: "none",
      cues: [
        "Set the seat so the handles sit at mid-chest level.",
        "Keep shoulder blades pinned to the backrest as you press forward.",
        "Stop just short of locking out your elbows to keep tension on the chest."
      ],
      start: { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [84, 68],  wr: [104, 64], hip: [102, 104], kn: [136, 106], an: [138, 148] },
      end:   { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [124, 62], wr: [152, 62], hip: [102, 104], kn: [136, 106], an: [138, 148] }
    },
    dips: {
      equip: "dip_bars",
      prop: "none",
      cues: [
        "Lean torso slightly forward (~20°) to emphasize chest, or stay upright for triceps.",
        "Lower until your upper arms are parallel to the floor.",
        "Press straight back up without swinging your legs."
      ],
      start: { head: [112, 30], neck: [110, 44], sh: [108, 52], el: [104, 72], wr: [106, 92], hip: [102, 92], kn: [108, 122], an: [100, 142] },
      end:   { head: [116, 50], neck: [112, 64], sh: [108, 72], el: [90, 78],  wr: [106, 92], hip: [98, 112], kn: [104, 138], an: [96, 148] }
    },
    pushup: {
      equip: "floor",
      prop: "none",
      cues: [
        "Keep a rigid straight line from head to heels—brace abs and glutes.",
        "Hands just outside shoulder width, elbows angled ~45° back.",
        "Lower chest near the floor, then push through your palms."
      ],
      start: { head: [54, 90],  neck: [66, 96],  sh: [74, 102], el: [74, 126], wr: [74, 148], hip: [122, 122], kn: [152, 136], an: [178, 148] },
      end:   { head: [54, 116], neck: [66, 122], sh: [74, 128], el: [58, 134], wr: [74, 148], hip: [122, 136], kn: [152, 142], an: [178, 148] }
    },
    ohp: {
      equip: "floor",
      prop: "bar",
      cues: [
        "Squeeze glutes and brace your core so your lower back stays neutral.",
        "Start bar at upper chest with forearms vertical.",
        "Press straight overhead, pushing your head slightly through at lockout."
      ],
      start: { head: [108, 34], neck: [108, 48], sh: [108, 58], el: [118, 74], wr: [116, 54], hip: [108, 96], kn: [110, 124], an: [108, 150] },
      end:   { head: [112, 34], neck: [110, 48], sh: [108, 58], el: [110, 38], wr: [110, 16], hip: [108, 96], kn: [110, 124], an: [108, 150] }
    },
    seated_ohp: {
      equip: "machine_seat",
      prop: "dumbbell",
      cues: [
        "Keep your upper back firmly against the upright pad.",
        "Keep elbows slightly in front of your torso (scapular plane).",
        "Press smoothly overhead without shrugging your traps up to your ears."
      ],
      start: { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [108, 76], wr: [108, 56], hip: [102, 104], kn: [136, 106], an: [138, 148] },
      end:   { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [102, 40], wr: [102, 18], hip: [102, 104], kn: [136, 106], an: [138, 148] }
    },
    lat_raise: {
      equip: "floor",
      prop: "dumbbell",
      cues: [
        "Hinge forward a tiny bit (~10°) and keep elbows slightly bent.",
        "Raise out to the sides until upper arms reach shoulder height—don't swing.",
        "Lead with your elbows/pinkies slightly, then lower slowly."
      ],
      start: { head: [110, 32], neck: [110, 46], sh: [110, 56], el: [110, 78], wr: [114, 98], hip: [108, 96], kn: [110, 124], an: [108, 150] },
      end:   { head: [110, 32], neck: [110, 46], sh: [110, 56], el: [136, 54], wr: [160, 56], hip: [108, 96], kn: [110, 124], an: [108, 150] }
    },
    front_raise: {
      equip: "floor",
      prop: "dumbbell",
      cues: [
        "Stand tall with core braced so your torso doesn't rock backward.",
        "Raise the dumbbells straight in front to eye/shoulder level.",
        "Control the descent—don't let gravity drop your arms."
      ],
      start: { head: [108, 32], neck: [108, 46], sh: [108, 56], el: [108, 78], wr: [112, 98], hip: [108, 96], kn: [108, 124], an: [108, 150] },
      end:   { head: [108, 32], neck: [108, 46], sh: [108, 56], el: [134, 56], wr: [158, 54], hip: [108, 96], kn: [108, 124], an: [108, 150] }
    },
    rear_delt_fly: {
      equip: "floor",
      prop: "dumbbell",
      cues: [
        "Hinge at the hips until your torso is nearly parallel to the floor, flat back.",
        "Sweep dumbbells out wide with a slight elbow bend.",
        "Squeeze rear delts at the top without shrugging."
      ],
      start: { head: [138, 66], neck: [126, 70], sh: [118, 74], el: [118, 96], wr: [118, 118], hip: [84, 94], kn: [92, 122], an: [88, 150] },
      end:   { head: [138, 66], neck: [126, 70], sh: [118, 74], el: [118, 54], wr: [118, 38],  hip: [84, 94], kn: [92, 122], an: [88, 150] }
    },
    face_pull: {
      equip: "cable_high",
      prop: "none",
      cues: [
        "Set pulley around upper-chest/eye height and step back for tension.",
        "Pull rope toward your forehead while driving elbows high and wide.",
        "Externally rotate your hands at the end to hit rear delts and rotator cuffs."
      ],
      start: { head: [128, 34], neck: [128, 48], sh: [126, 58], el: [102, 54], wr: [78, 46],  hip: [124, 96], kn: [128, 124], an: [128, 150] },
      end:   { head: [128, 34], neck: [128, 48], sh: [126, 58], el: [142, 48], wr: [126, 36], hip: [124, 96], kn: [128, 124], an: [128, 150] }
    },
    pullup: {
      equip: "pullup_bar",
      prop: "none",
      cues: [
        "Start from a dead hang with shoulders engaged (depressed down).",
        "Drive elbows down toward your hips to pull your chest toward the bar.",
        "Avoid kipping or swinging your legs; lower all the way down."
      ],
      start: { head: [110, 62], neck: [110, 74], sh: [110, 82], el: [106, 56], wr: [108, 28], hip: [110, 116], kn: [112, 134], an: [106, 150] },
      end:   { head: [110, 22], neck: [110, 34], sh: [110, 42], el: [96, 56],  wr: [108, 28], hip: [110, 80],  kn: [114, 108], an: [106, 130] }
    },
    lat_pulldown: {
      equip: "lat_machine",
      prop: "none",
      cues: [
        "Lock thighs under the knee pad and lean back slightly (~15°).",
        "Pull elbows straight down toward your ribs—don't yank with your lower back.",
        "Touch upper chest, then let lats stretch fully at the top."
      ],
      start: { head: [108, 48], neck: [106, 62], sh: [104, 70], el: [110, 46], wr: [114, 22], hip: [102, 108], kn: [136, 108], an: [138, 148] },
      end:   { head: [108, 50], neck: [104, 64], sh: [100, 72], el: [94, 94],  wr: [112, 70], hip: [102, 108], kn: [136, 108], an: [138, 148] }
    },
    bent_row: {
      equip: "floor",
      prop: "bar",
      cues: [
        "Hinge at the hips to ~45° with a flat, braced spine.",
        "Pull the bar toward your lower ribs/belly button, driving elbows back.",
        "Pause briefly at the top and lower without rounding your lower back."
      ],
      start: { head: [142, 54], neck: [130, 62], sh: [122, 68], el: [124, 92], wr: [126, 116], hip: [86, 94], kn: [96, 122], an: [92, 150] },
      end:   { head: [142, 54], neck: [130, 62], sh: [122, 68], el: [102, 62], wr: [112, 84],  hip: [86, 94], kn: [96, 122], an: [92, 150] }
    },
    single_arm_row: {
      equip: "bench_flat",
      prop: "dumbbell",
      cues: [
        "Brace one knee/hand on the bench with a flat, level torso.",
        "Let the shoulder stretch down at the bottom, then pull the dumbbell toward your hip.",
        "Keep your torso still—don't twist to heave the weight."
      ],
      start: { head: [144, 68], neck: [130, 74], sh: [120, 78], el: [122, 102], wr: [122, 126], hip: [82, 86], kn: [88, 106], an: [88, 148] },
      end:   { head: [144, 68], neck: [130, 74], sh: [120, 78], el: [98, 68],   wr: [106, 92],  hip: [82, 86], kn: [88, 106], an: [88, 148] }
    },
    incline_row: {
      equip: "bench_incline",
      prop: "dumbbell",
      cues: [
        "Lie chest-down on a 30–45° incline bench so your lower back is supported.",
        "Pull both dumbbells up toward your hips while squeezing shoulder blades.",
        "Lower smoothly to a full lat stretch."
      ],
      start: { head: [126, 52], neck: [116, 64], sh: [108, 74], el: [114, 100], wr: [116, 124], hip: [82, 114], kn: [64, 134], an: [48, 150] },
      end:   { head: [126, 52], neck: [116, 64], sh: [108, 74], el: [88, 80],   wr: [100, 96],  hip: [82, 114], kn: [64, 134], an: [48, 150] }
    },
    seated_row: {
      equip: "cable_mid",
      prop: "none",
      cues: [
        "Sit upright with knees slightly bent and chest lifted.",
        "Pull handle to your lower stomach while squeezing your shoulder blades together.",
        "Control the return—don't collapse your spine forward."
      ],
      start: { head: [132, 54], neck: [130, 68], sh: [128, 76], el: [102, 78], wr: [76, 78],  hip: [128, 116], kn: [96, 116], an: [66, 122] },
      end:   { head: [132, 54], neck: [130, 68], sh: [128, 76], el: [148, 88], wr: [122, 92], hip: [128, 116], kn: [96, 116], an: [66, 122] }
    },
    shrug: {
      equip: "floor",
      prop: "dumbbell",
      cues: [
        "Stand tall with arms straight—don't bend your elbows to lift the weight.",
        "Elevate your shoulders straight up toward your ears (no rolling).",
        "Hold the top squeeze for 1 second before lowering."
      ],
      start: { head: [110, 32], neck: [110, 46], sh: [110, 58], el: [112, 82], wr: [114, 106], hip: [110, 96], kn: [110, 124], an: [110, 150] },
      end:   { head: [110, 32], neck: [110, 46], sh: [110, 48], el: [112, 72], wr: [114, 96],  hip: [110, 96], kn: [110, 124], an: [110, 150] }
    },
    curl: {
      equip: "floor",
      prop: "dumbbell",
      cues: [
        "Pin elbows gently at your sides—don't let them swing forward.",
        "Curl the weight up by flexing only at the elbow.",
        "Lower under a 2-second control without leaning back."
      ],
      start: { head: [108, 32], neck: [108, 46], sh: [108, 56], el: [110, 80], wr: [114, 104], hip: [108, 96], kn: [108, 124], an: [108, 150] },
      end:   { head: [108, 32], neck: [108, 46], sh: [108, 56], el: [112, 80], wr: [120, 56],  hip: [108, 96], kn: [108, 124], an: [108, 150] }
    },
    incline_curl: {
      equip: "bench_incline",
      prop: "dumbbell",
      cues: [
        "Set bench to 45° and let arms hang straight down behind your torso.",
        "Keep upper arms pointing straight at the floor as you curl.",
        "This maximizes the long-head bicep stretch at the bottom."
      ],
      start: { head: [72, 64], neck: [82, 76], sh: [90, 84], el: [88, 108], wr: [88, 132], hip: [122, 118], kn: [158, 122], an: [162, 150] },
      end:   { head: [72, 64], neck: [82, 76], sh: [90, 84], el: [90, 108], wr: [104, 86], hip: [122, 118], kn: [158, 122], an: [162, 150] }
    },
    preacher_curl: {
      equip: "machine_seat",
      prop: "dumbbell",
      cues: [
        "Rest upper arms flat on the preacher pad with armpits snug at the top edge.",
        "Curl smoothly without lifting your elbows off the pad.",
        "Lower almost to full extension—stop just shy of hyperextending."
      ],
      start: { head: [94, 40], neck: [98, 54], sh: [102, 62], el: [124, 78], wr: [142, 92], hip: [96, 106], kn: [130, 108], an: [132, 148] },
      end:   { head: [94, 40], neck: [98, 54], sh: [102, 62], el: [124, 78], wr: [114, 56], hip: [96, 106], kn: [130, 108], an: [132, 148] }
    },
    tricep_pushdown: {
      equip: "cable_high",
      prop: "none",
      cues: [
        "Stand tall with a slight forward lean and lock elbows against your ribs.",
        "Extend forearms straight down until arms are fully straight.",
        "Keep upper arms frozen—only your forearms should move."
      ],
      start: { head: [128, 34], neck: [128, 48], sh: [126, 58], el: [124, 80], wr: [104, 72],  hip: [126, 96], kn: [128, 124], an: [128, 150] },
      end:   { head: [128, 34], neck: [128, 48], sh: [126, 58], el: [124, 80], wr: [116, 106], hip: [126, 96], kn: [128, 124], an: [128, 150] }
    },
    tricep_overhead: {
      equip: "machine_seat",
      prop: "dumbbell",
      cues: [
        "Point elbows upward alongside your ears and keep them narrow.",
        "Lower the dumbbell deep behind your head for a full long-head stretch.",
        "Extend straight up to the ceiling without flaring elbows wide."
      ],
      start: { head: [98, 38], neck: [98, 52], sh: [98, 62], el: [96, 36], wr: [78, 48],  hip: [102, 104], kn: [136, 106], an: [138, 148] },
      end:   { head: [98, 38], neck: [98, 52], sh: [98, 62], el: [98, 36], wr: [100, 14], hip: [102, 104], kn: [136, 106], an: [138, 148] }
    },
    skullcrusher: {
      equip: "bench_flat",
      prop: "bar",
      cues: [
        "Angle upper arms slightly back (~15° past vertical) for constant tension.",
        "Bend only at the elbows, lowering the weight just behind your forehead.",
        "Extend back up without letting your elbows flare outward."
      ],
      start: { head: [60, 98], neck: [74, 102], sh: [84, 105], el: [78, 78], wr: [56, 86], hip: [132, 106], kn: [164, 114], an: [168, 148] },
      end:   { head: [60, 98], neck: [74, 102], sh: [84, 105], el: [78, 78], wr: [76, 52], hip: [132, 106], kn: [164, 114], an: [168, 148] }
    },
    kickback: {
      equip: "bench_flat",
      prop: "dumbbell",
      cues: [
        "Hinge torso nearly flat and pin your working upper arm parallel to your torso.",
        "Extend your forearm straight back until your arm is fully locked out.",
        "Pause for 1 second at full extension—don't swing the dumbbell."
      ],
      start: { head: [144, 68], neck: [130, 74], sh: [120, 78], el: [102, 82], wr: [106, 108], hip: [82, 86], kn: [88, 106], an: [88, 148] },
      end:   { head: [144, 68], neck: [130, 74], sh: [120, 78], el: [102, 82], wr: [76, 80],   hip: [82, 86], kn: [88, 106], an: [88, 148] }
    },
    squat: {
      equip: "floor",
      prop: "bar",
      cues: [
        "Brace your core before descending; keep chest up and knees tracking over toes.",
        "Sit hips down and back until thighs are at least parallel to the floor.",
        "Drive evenly through mid-foot/heels back to standing."
      ],
      start: { head: [110, 28], neck: [110, 42], sh: [108, 52], el: [102, 68], wr: [104, 50], hip: [106, 92],  kn: [110, 122], an: [108, 150] },
      end:   { head: [122, 60], neck: [116, 72], sh: [112, 80], el: [104, 96], wr: [108, 78], hip: [88, 114],  kn: [124, 116], an: [108, 150] }
    },
    lunge: {
      equip: "floor",
      prop: "dumbbell",
      cues: [
        "Keep torso tall with a slight forward lean over the working front leg.",
        "Lower until both knees reach roughly 90° angles.",
        "Push through your front heel/mid-foot to stand back up."
      ],
      start: { head: [110, 28], neck: [110, 42], sh: [110, 52], el: [110, 76], wr: [110, 98], hip: [110, 92],  kn: [114, 122], an: [112, 150] },
      end:   { head: [114, 54], neck: [112, 68], sh: [110, 76], el: [110, 100], wr: [110, 120], hip: [104, 112], kn: [134, 116], an: [134, 150] }
    },
    leg_press: {
      equip: "leg_press",
      prop: "none",
      cues: [
        "Keep your lower back and glutes glued to the seat—never let your tailbone curl up.",
        "Place feet shoulder-width on the sled and lower knees toward your chest.",
        "Press through full feet without locking your knees hard at the top."
      ],
      start: { head: [56, 76], neck: [66, 86], sh: [72, 94], el: [78, 110], wr: [86, 118], hip: [96, 120], kn: [132, 94], an: [164, 72] },
      end:   { head: [56, 76], neck: [66, 86], sh: [72, 94], el: [78, 110], wr: [86, 118], hip: [96, 120], kn: [106, 98], an: [140, 84] }
    },
    leg_ext: {
      equip: "machine_seat",
      prop: "none",
      cues: [
        "Align the machine's pivot point with your knee joint; pad sits just above ankles.",
        "Grip the side handles to lock your hips into the seat.",
        "Extend knees fully, squeeze quads for 1 second, and lower slowly."
      ],
      start: { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [96, 82], wr: [104, 102], hip: [102, 104], kn: [136, 106], an: [136, 144] },
      end:   { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [96, 82], wr: [104, 102], hip: [102, 104], kn: [136, 106], an: [176, 106] }
    },
    leg_curl: {
      equip: "machine_seat",
      prop: "none",
      cues: [
        "Set the thigh pad snugly so your hips stay anchored during the curl.",
        "Drive your heels back and down underneath the seat as far as possible.",
        "Control the return smoothly—don't let the weight stack slam."
      ],
      start: { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [96, 82], wr: [106, 100], hip: [102, 104], kn: [138, 106], an: [174, 112] },
      end:   { head: [96, 36], neck: [96, 50], sh: [96, 60], el: [96, 82], wr: [106, 100], hip: [102, 104], kn: [138, 106], an: [122, 144] }
    },
    lying_curl: {
      equip: "bench_flat",
      prop: "none",
      cues: [
        "Keep your hips pressed flat into the bench—don't lift your butt as you curl.",
        "Curl heels smoothly toward your glutes.",
        "Lower under a 2-second control to full extension."
      ],
      start: { head: [54, 96], neck: [68, 100], sh: [78, 104], el: [64, 114], wr: [52, 110], hip: [122, 106], kn: [158, 106], an: [194, 106] },
      end:   { head: [54, 96], neck: [68, 100], sh: [78, 104], el: [64, 114], wr: [52, 110], hip: [122, 106], kn: [158, 106], an: [134, 72] }
    },
    rdl: {
      equip: "floor",
      prop: "bar",
      cues: [
        "Keep a slight, fixed knee bend and push your hips straight back (hinge).",
        "Keep the bar/dumbbells gliding close against your thighs and shins.",
        "Stop when your hips stop moving back (mid-shin), then drive hips forward."
      ],
      start: { head: [108, 30], neck: [108, 44], sh: [108, 54], el: [110, 76], wr: [112, 98],  hip: [106, 94], kn: [108, 122], an: [106, 150] },
      end:   { head: [148, 66], neck: [134, 72], sh: [126, 76], el: [126, 98], wr: [126, 120], hip: [86, 94],  kn: [98, 122],  an: [98, 150] }
    },
    hip_thrust: {
      equip: "bench_flat",
      prop: "bar",
      cues: [
        "Rest lower shoulder blades against the bench edge; shins vertical at the top.",
        "Tuck your chin slightly and keep ribs down—don't hyperextend your lower back.",
        "Drive through your heels and squeeze glutes hard for 1 second at lockout."
      ],
      start: { head: [76, 84], neck: [84, 96], sh: [90, 104], el: [104, 116], wr: [116, 126], hip: [116, 134], kn: [150, 116], an: [156, 148] },
      end:   { head: [76, 82], neck: [84, 94], sh: [90, 102], el: [106, 104], wr: [122, 104], hip: [124, 104], kn: [156, 108], an: [156, 148] }
    },
    calf_raise: {
      equip: "floor",
      prop: "dumbbell",
      cues: [
        "Stand on the edge of a step/plate with knees straight.",
        "Drop heels slowly for a 2-second stretch at the bottom.",
        "Press all the way up onto your big toes and pause at the top."
      ],
      start: { head: [110, 34], neck: [110, 48], sh: [110, 58], el: [110, 80], wr: [112, 102], hip: [110, 96], kn: [110, 124], an: [110, 150] },
      end:   { head: [110, 24], neck: [110, 38], sh: [110, 48], el: [110, 70], wr: [112, 92],  hip: [110, 86], kn: [110, 114], an: [110, 140] }
    },
    hanging_raise: {
      equip: "pullup_bar",
      prop: "none",
      cues: [
        "Hang still with shoulders engaged—avoid swinging.",
        "Curl your pelvis upward toward your ribs as you raise your legs.",
        "Lower legs slowly back down without losing control."
      ],
      start: { head: [110, 54], neck: [110, 66], sh: [110, 74], el: [108, 50], wr: [108, 28], hip: [110, 108], kn: [110, 130], an: [110, 150] },
      end:   { head: [110, 54], neck: [110, 66], sh: [110, 74], el: [108, 50], wr: [108, 28], hip: [112, 106], kn: [142, 86],  an: [164, 72] }
    },
    cable_crunch: {
      equip: "cable_high",
      prop: "none",
      cues: [
        "Hold rope beside your temples and keep your hips stationary.",
        "Curl your ribcage down toward your pelvis—don't just hinge at the hips.",
        "Exhale fully at the bottom contraction."
      ],
      start: { head: [126, 62], neck: [122, 74], sh: [118, 82], el: [106, 72], wr: [116, 60], hip: [114, 120], kn: [116, 148], an: [144, 148] },
      end:   { head: [100, 96], neck: [104, 106], sh: [106, 110], el: [96, 102], wr: [102, 90], hip: [114, 120], kn: [116, 148], an: [144, 148] }
    },
    back_extension: {
      equip: "roman_chair",
      prop: "none",
      cues: [
        "Set the hip pad just below your hip crease so your pelvis can hinge freely.",
        "Keep a neutral spine (or slight upper-back round to bias glutes) and hinge down to ~60°.",
        "Squeeze glutes and spinal erectors to rise to a straight body line—don't hyperextend past 180°."
      ],
      start: { head: [148, 114], neck: [136, 102], sh: [128, 96], el: [134, 114], wr: [138, 102], hip: [96, 86], kn: [72, 118], an: [50, 148] },
      end:   { head: [152, 54],  neck: [138, 64],  sh: [130, 70], el: [132, 88],  wr: [138, 78],  hip: [96, 86], kn: [72, 118], an: [50, 148] }
    },
    lat_pulldown_neutral: {
      equip: "lat_machine",
      prop: "none",
      cues: [
        "Use a shoulder-width neutral/MAG attachment with palms facing each other.",
        "Keep chest lifted (~10–15° lean) and drive elbows straight down in front of your torso.",
        "Pause when handles reach upper chest, then control the stretch all the way back up."
      ],
      start: { head: [108, 48], neck: [106, 62], sh: [104, 70], el: [112, 46], wr: [116, 22], hip: [102, 108], kn: [136, 108], an: [138, 148] },
      end:   { head: [108, 50], neck: [104, 64], sh: [100, 72], el: [104, 96], wr: [114, 72], hip: [102, 108], kn: [136, 108], an: [138, 148] }
    },
    lat_pulldown_single: {
      equip: "lat_machine",
      prop: "none",
      cues: [
        "Grip a single D-handle with your palm neutral or slightly rotating from pronated to supinated.",
        "Anchor your non-working hand on the pad/seat and pull your elbow down toward your hip pocket.",
        "Let the shoulder blade glide fully upward at the top for a deep unilateral lat stretch."
      ],
      start: { head: [108, 48], neck: [106, 62], sh: [104, 70], el: [114, 46], wr: [118, 22], hip: [102, 108], kn: [136, 108], an: [138, 148] },
      end:   { head: [108, 50], neck: [105, 64], sh: [102, 72], el: [100, 96], wr: [112, 74], hip: [102, 108], kn: [136, 108], an: [138, 148] }
    },
    seated_row_wide: {
      equip: "cable_mid",
      prop: "none",
      cues: [
        "Use a wide pronated or wide MAG bar outside shoulder width.",
        "Keep elbows flared ~45–60° and pull the bar toward your lower chest / sternum.",
        "Squeeze your mid-back and rear delts hard before extending arms forward."
      ],
      start: { head: [132, 54], neck: [130, 68], sh: [128, 76], el: [102, 74], wr: [76, 74],  hip: [128, 116], kn: [96, 116], an: [66, 122] },
      end:   { head: [132, 54], neck: [130, 68], sh: [128, 76], el: [152, 78], wr: [124, 78], hip: [128, 116], kn: [96, 116], an: [66, 122] }
    },
    cable_fly_high_low: {
      equip: "cable_high",
      prop: "none",
      cues: [
        "Set pulleys above head height, step forward into a staggered stance, and lean slightly forward.",
        "Keep a soft fixed elbow bend and sweep handles downward and inward in front of your hips.",
        "Squeeze your lower chest for 1 second at the bottom before controlling back up."
      ],
      start: { head: [110, 34], neck: [110, 48], sh: [108, 58], el: [86, 52],  wr: [68, 42],  hip: [104, 96], kn: [114, 124], an: [118, 150] },
      end:   { head: [110, 34], neck: [110, 48], sh: [108, 58], el: [122, 82], wr: [136, 104], hip: [104, 96], kn: [114, 124], an: [118, 150] }
    },
    cable_fly_low_high: {
      equip: "cable_mid",
      prop: "none",
      cues: [
        "Set pulleys at the bottom setting, step forward, and keep chest proud.",
        "Keep elbows softly bent and scoop handles upward and inward to upper-chest/chin height.",
        "Focus on driving your upper arms across your upper chest rather than lifting with biceps."
      ],
      start: { head: [110, 34], neck: [110, 48], sh: [108, 58], el: [96, 82],  wr: [84, 108], hip: [104, 96], kn: [114, 124], an: [118, 150] },
      end:   { head: [110, 34], neck: [110, 48], sh: [108, 58], el: [128, 60], wr: [148, 46], hip: [104, 96], kn: [114, 124], an: [118, 150] }
    },
    straight_arm_pulldown: {
      equip: "cable_high",
      prop: "none",
      cues: [
        "Stand back from a high pulley with a slight hip hinge (~20°) and arms nearly straight.",
        "Keep elbows softly locked and sweep the bar down in an arc to your thighs using your lats.",
        "Control the return back overhead until you feel a deep lat stretch."
      ],
      start: { head: [128, 36], neck: [126, 50], sh: [124, 60], el: [98, 46],  wr: [74, 34],  hip: [128, 98], kn: [128, 126], an: [128, 150] },
      end:   { head: [128, 36], neck: [126, 50], sh: [124, 60], el: [122, 84], wr: [126, 108], hip: [128, 98], kn: [128, 126], an: [128, 150] }
    },
    bayesian_curl: {
      equip: "cable_mid",
      prop: "none",
      cues: [
        "Set pulley at wrist/hip height, face away from the stack, and step forward so your arm is pulled behind your torso.",
        "Keep your elbow pinned slightly behind your ribcage to maximize the long-head stretch.",
        "Curl forward smoothly without letting your shoulder roll forward."
      ],
      start: { head: [128, 32], neck: [128, 46], sh: [126, 56], el: [108, 76], wr: [92, 98],  hip: [124, 96], kn: [128, 124], an: [124, 150] },
      end:   { head: [128, 32], neck: [128, 46], sh: [126, 56], el: [114, 78], wr: [132, 60], hip: [124, 96], kn: [128, 124], an: [124, 150] }
    },
    ab_wheel: {
      equip: "floor",
      prop: "none",
      cues: [
        "Start kneeling with glutes squeezed and ribs tucked down (posterior pelvic tilt).",
        "Roll forward under control keeping arms straight and lower back flat—never let hips sag.",
        "Pull back toward your knees by contracting your abs and lats together."
      ],
      start: { head: [112, 80], neck: [118, 90], sh: [122, 96], el: [116, 122], wr: [112, 146], hip: [148, 108], kn: [164, 148], an: [188, 148] },
      end:   { head: [62, 114], neck: [74, 120], sh: [82, 124], el: [64, 136],  wr: [48, 146],  hip: [126, 134], kn: [164, 148], an: [188, 148] }
    },
    woodchop: {
      equip: "cable_high",
      prop: "none",
      cues: [
        "Stand perpendicular to the cable with feet wider than shoulder-width.",
        "Rotate through your torso and obliques with arms nearly straight.",
        "Pivot your back foot smoothly as you chop across your body."
      ],
      start: { head: [114, 34], neck: [114, 48], sh: [114, 58], el: [92, 46],  wr: [72, 36],  hip: [112, 96], kn: [112, 124], an: [112, 150] },
      end:   { head: [116, 38], neck: [116, 52], sh: [116, 62], el: [134, 84], wr: [150, 106], hip: [114, 96], kn: [118, 124], an: [116, 150] }
    }
  };

  const DAY_RECOMMENDATIONS = [
    {
      id: "rec_chest",
      title: "Chest Day",
      focusMuscles: ["chest", "front_delts", "triceps"],
      summary: "Upper, mid & lower pec hypertrophy with tricep finisher.",
      exercises: [
        { id: "ex_bench", scheme: "4 × 6–8 reps" },
        { id: "ex_incline_db", scheme: "3 × 8–10 reps" },
        { id: "ex_pec_deck", scheme: "3 × 12–15 reps" },
        { id: "ex_dips", scheme: "3 × 8–12 reps" },
        { id: "ex_pushdown", scheme: "3 × 12–15 reps" }
      ]
    },
    {
      id: "rec_back",
      title: "Back Day",
      focusMuscles: ["lats", "mid_back", "rear_delts", "biceps"],
      summary: "Vertical pull for width, horizontal rows for thickness.",
      exercises: [
        { id: "ex_pullup", scheme: "4 × 6–10 reps" },
        { id: "ex_bb_row", scheme: "4 × 8–10 reps" },
        { id: "ex_lat_pulldown", scheme: "3 × 10–12 reps" },
        { id: "ex_cable_row", scheme: "3 × 10–12 reps" },
        { id: "ex_face_pull", scheme: "3 × 15 reps" },
        { id: "ex_bb_curl", scheme: "3 × 10–12 reps" }
      ]
    },
    {
      id: "rec_legs",
      title: "Leg Day",
      focusMuscles: ["quads", "hamstrings", "glutes", "calves"],
      summary: "Balanced quad, hamstring, glute & calf stimulus.",
      exercises: [
        { id: "ex_squat", scheme: "4 × 6–8 reps" },
        { id: "ex_rdl", scheme: "3 × 8–10 reps" },
        { id: "ex_leg_press", scheme: "3 × 10–12 reps" },
        { id: "ex_leg_curl", scheme: "3 × 12–15 reps" },
        { id: "ex_calf_raise", scheme: "4 × 15–20 reps" }
      ]
    },
    {
      id: "rec_shoulders",
      title: "Shoulder Day",
      focusMuscles: ["front_delts", "side_delts", "rear_delts", "traps"],
      summary: "3D delts: overhead press, lateral raises & rear delt work.",
      exercises: [
        { id: "ex_ohp", scheme: "4 × 6–8 reps" },
        { id: "ex_db_shoulder", scheme: "3 × 8–10 reps" },
        { id: "ex_lat_raise", scheme: "4 × 12–15 reps" },
        { id: "ex_face_pull", scheme: "4 × 15 reps" },
        { id: "ex_shrug", scheme: "3 × 12–15 reps" }
      ]
    },
    {
      id: "rec_arms",
      title: "Arms & Core",
      focusMuscles: ["biceps", "triceps", "forearms", "abs"],
      summary: "Direct bicep/tricep volume plus weighted abs.",
      exercises: [
        { id: "ex_bb_curl", scheme: "3 × 8–10 reps" },
        { id: "ex_skullcrusher", scheme: "3 × 8–10 reps" },
        { id: "ex_incline_curl", scheme: "3 × 10–12 reps" },
        { id: "ex_pushdown", scheme: "3 × 12–15 reps" },
        { id: "ex_hammer_curl", scheme: "3 × 10–12 reps" },
        { id: "ex_hanging_raise", scheme: "3 × 12–15 reps" }
      ]
    },
    {
      id: "rec_db_only",
      title: "Dumbbell Only Full Body",
      focusMuscles: ["chest", "lats", "quads", "hamstrings", "side_delts"],
      summary: "Complete full-body workout using only dumbbells.",
      exercises: [
        { id: "ex_goblet_squat", scheme: "4 × 10–12 reps" },
        { id: "ex_db_bench", scheme: "4 × 8–10 reps" },
        { id: "ex_db_single_row", scheme: "3 × 10–12 reps" },
        { id: "ex_db_rdl", scheme: "3 × 10–12 reps" },
        { id: "ex_lat_raise", scheme: "3 × 15 reps" },
        { id: "ex_db_curl", scheme: "3 × 10–12 reps" }
      ]
    }
  ];

  function createDefaultState() {
    return {
      activeProfileId: "u1",
      profiles: [
        { id: "u1", name: "Person 1", color: "#C52F3A" },
        { id: "u2", name: "Person 2", color: "#A0A7AA" }
      ],
      bodyProfiles: {
        u1: { age: "", heightCm: "", weightKg: "", targetWeightKg: "", goal: "Hypertrophy", level: "Intermediate" },
        u2: { age: "", heightCm: "", weightKg: "", targetWeightKg: "", goal: "Hypertrophy", level: "Intermediate" }
      },
      settings: {
        u1: {
          autoRest: true, defaultRestSec: 90, weeklySetTarget: 40,
          unit: "kg", tone: "system", equipment: "full_gym",
          daysPerWeek: 3, sessionMinutes: 45, experience: "Beginner",
          goal: "Build Muscle", limitations: "", onboardingDone: false,
          plan: null, exerciseSettings: {}, hardStreak: 0
        },
        u2: {
          autoRest: true, defaultRestSec: 90, weeklySetTarget: 40,
          unit: "kg", tone: "system", equipment: "full_gym",
          daysPerWeek: 3, sessionMinutes: 45, experience: "Beginner",
          goal: "Build Muscle", limitations: "", onboardingDone: false,
          plan: null, exerciseSettings: {}, hardStreak: 0
        }
      },
      dashboardPrefs: {
        u1: { session: true, kpis: true, recommended: true, streak: true, quick_links: true, recent: true },
        u2: { session: true, kpis: true, recommended: true, streak: true, quick_links: true, recent: true }
      },
      exercises: DEFAULT_EXERCISES,
      routines: { u1: [], u2: [] },
      workouts: [],
      measurements: [],
      activeWorkouts: { u1: null, u2: null }
    };
  }

  let storageStatus = {
    status: "ok",
    backupKey: null,
    rawCorrupt: null,
    error: null,
    recoveryRequired: false,
    lastSaveError: null
  };
  let saveToastTimer = null;
  let state = null;
  let currentView = "dashboard";
  let currentDashPreset = "overview";
  let currentSide = "front";
  let dashHeroSide = "front";
  let currentMetric = "sets";
  let currentAnatomyTab = "overview";
  let currentWindow = "7";
  let selectedMuscle = null;
  let libraryMuscleFilter = "all";
  let timerInterval = null;
  let restInterval = null;
  let restEndsAt = 0;
  let swapTargetExIdx = null;
  let calYear = new Date().getFullYear();
  let calMonth = new Date().getMonth();
  let calSelectedDateKey = null;
  let charts = { volume: null, strength: null, weight: null, weeklyTrend: null };
  let wakeLockSentinel = null;
  let editingRoutineId = null;

  // Form animation state
  let formAnimRaf = null;
  let formAnimPlaying = true;
  let formAnimSpeed = 1.0;
  let formAnimPhase = 0;
  let formLastTs = 0;
  let activeFormRig = null;
  let activeFormRigKey = "curl";
  let activeFormExercise = null;
  let formGuidesOn = true;
  let formMistakeOn = false;

  function loadState() {
    const res = loadStateSafe(localStorage, createDefaultState, DEFAULT_EXERCISES);
    storageStatus = {
      status: res.status,
      backupKey: res.backupKey,
      rawCorrupt: res.rawCorrupt,
      error: res.error,
      recoveryRequired: res.status === "recovery_required",
      lastSaveError: null
    };
    return res.state;
  }

  function renderStorageAlert() {
    const el = document.getElementById("app-storage-alert");
    if (!el) return;

    if (storageStatus.recoveryRequired) {
      el.classList.remove("hidden");
      el.innerHTML = `
        <div>
          <span class="eyebrow" style="color:var(--primary);">Recovery Required · Original Data Preserved</span>
          <strong>Saved data could not be parsed and LocalStorage had no space for a backup copy.</strong>
          <div class="muted-note">Auto-save is paused so your original data is not overwritten. Export the raw data or reset manually.</div>
        </div>
        <div class="btn-row">
          <button id="btn-storage-download-raw" class="btn btn-primary btn-sm" type="button">Download Raw Backup</button>
          <button id="btn-storage-dismiss-recovery" class="btn btn-danger-ghost btn-sm" type="button">Reset Storage</button>
        </div>
      `;
      document.getElementById("btn-storage-download-raw")?.addEventListener("click", () => {
        const raw = storageStatus.rawCorrupt ?? localStorage.getItem(STORAGE_KEY) ?? "";
        const blob = new Blob([raw], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `musclemap_corrupt_raw_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      });
      document.getElementById("btn-storage-dismiss-recovery")?.addEventListener("click", () => {
        if (confirm("Clear corrupted storage and resume saving with a fresh state?")) {
          storageStatus.recoveryRequired = false;
          storageStatus.status = "ok";
          saveState();
          renderStorageAlert();
        }
      });
      return;
    }

    if (storageStatus.status === "recovered" && storageStatus.backupKey) {
      el.classList.remove("hidden");
      el.innerHTML = `
        <div>
          <span class="eyebrow">Corrupt Data Quarantined</span>
          <strong>Previous browser data was invalid and backed up safely.</strong>
          <div class="muted-note">Backup key: <code>${escapeHtml(storageStatus.backupKey)}</code></div>
        </div>
        <button id="btn-storage-ack-recovered" class="btn btn-secondary btn-sm" type="button">Dismiss</button>
      `;
      document.getElementById("btn-storage-ack-recovered")?.addEventListener("click", () => {
        storageStatus.status = "ok";
        renderStorageAlert();
      });
      return;
    }

    if (storageStatus.lastSaveError) {
      el.classList.remove("hidden");
      const msg =
        storageStatus.lastSaveError.reason === "quota_exceeded"
          ? "Browser LocalStorage is full — export a JSON backup and clear old backups to keep saving."
          : "Could not write to browser LocalStorage.";
      el.innerHTML = `
        <div>
          <span class="eyebrow" style="color:var(--primary);">Persistence Failure</span>
          <strong>${escapeHtml(msg)}</strong>
        </div>
        <button id="btn-storage-export-emergency" class="btn btn-primary btn-sm" type="button">Export JSON</button>
      `;
      document.getElementById("btn-storage-export-emergency")?.addEventListener("click", exportJson);
      return;
    }

    el.classList.add("hidden");
    el.innerHTML = "";
  }

  function saveState() {
    const active = state.activeWorkouts?.[state.activeProfileId];
    if (active) {
      active.lastSavedAt = new Date().toISOString();
    }
    const res = saveStateSafe(localStorage, state, {
      recoveryRequired: storageStatus.recoveryRequired
    });
    if (!res.ok) {
      storageStatus.lastSaveError = res;
      renderStorageAlert();
      return false;
    }
    storageStatus.lastSaveError = null;
    renderStorageAlert();
    updateAutosaveIndicator();
    showSavedToast();
    return true;
  }

  function showSavedToast() {
    const el = document.getElementById("app-save-indicator");
    if (!el) return;
    el.classList.remove("hidden");
    if (saveToastTimer) clearTimeout(saveToastTimer);
    saveToastTimer = setTimeout(() => el.classList.add("hidden"), 1600);
  }

  function updateAutosaveIndicator() {
    const pill = document.getElementById("workout-autosave-status");
    const active = state.activeWorkouts?.[state.activeProfileId];
    if (!pill || !active) return;
    const t = active.lastSavedAt
      ? new Date(active.lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "now";
    pill.textContent = `Autosaved · ${t}`;
  }

  function applyVisualTone() {
    const tone = getProfileSettings().tone || "system";
    document.documentElement.dataset.tone = tone;
  }

  function getUnit() {
    return getProfileSettings().unit === "lb" ? "lb" : "kg";
  }

  function kgToDisplay(kg) {
    return coreKgToDisplay(kg, getUnit());
  }

  function displayToKg(val) {
    return coreDisplayToKg(val, getUnit());
  }

  function fmtWt(kg) {
    return coreFormatWeight(kg, getUnit());
  }

  function updateOfflineStatus() {
    const pill = document.getElementById("app-offline-pill");
    if (!pill) return;
    pill.classList.toggle("hidden", navigator.onLine !== false);
  }

  function getProfileSettings(profileId = state.activeProfileId) {
    if (!state.settings[profileId]) {
      state.settings[profileId] = {
        autoRest: true, defaultRestSec: 90, weeklySetTarget: 40,
        unit: "kg", tone: "system", equipment: "full_gym",
        daysPerWeek: 3, sessionMinutes: 45, experience: "Beginner",
        goal: "Build Muscle", limitations: "", onboardingDone: false,
        plan: null, exerciseSettings: {}, hardStreak: 0
      };
    }
    return state.settings[profileId];
  }

  function getDashboardPrefs(profileId = state.activeProfileId) {
    const defaults = { session: true, kpis: true, recommended: true, streak: true, quick_links: true, recent: true };
    return { ...defaults, ...(state.dashboardPrefs?.[profileId] || {}) };
  }

  function uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getActiveProfile() {
    return state.profiles.find((p) => p.id === state.activeProfileId) || state.profiles[0];
  }

  function getBodyProfile(profileId = state.activeProfileId) {
    return state.bodyProfiles[profileId] || { age: "", heightCm: "", weightKg: "", targetWeightKg: "", goal: "Hypertrophy", level: "Intermediate" };
  }

  function getProfileRoutines(profileId = state.activeProfileId) {
    return state.routines[profileId] || [];
  }

  function getExerciseById(id) {
    return state.exercises.find((e) => e.id === id);
  }

  function getProfileWorkouts(profileId = state.activeProfileId) {
    return state.workouts
      .filter((w) => w.profileId === profileId)
      .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));
  }

  function getLastExerciseSummary(exerciseId) {
    const workouts = getProfileWorkouts(state.activeProfileId);
    for (const w of workouts) {
      const found = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (found && found.sets.length) {
        const preview = found.sets
          .filter((s) => isWorkingCompletedSet(s, w.schemaVersion == null))
          .slice(0, 3)
          .map((s) => `${fmtWt(s.weight)}×${s.reps}`)
          .join(", ");
        if (preview) return `Last (${formatDate(w.endedAt)}): ${preview}`;
      }
    }
    return "";
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function formatDuration(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }


  /* ---------------- V7.0 COACH PROGRAM ENGINE & BEGINNER REASONS ---------------- */
  const EXERCISE_WHY = {
    ex_bench: "Builds pressing strength across your chest, shoulders, and triceps.",
    ex_db_bench: "Strengthens chest and stabilizers with a shoulder-friendly arc.",
    ex_incline_db: "Targets upper chest and front shoulders for balanced pressing.",
    ex_pushup: "Foundational bodyweight press for chest, triceps, and core control.",
    ex_lat_pulldown: "Builds pulling strength for your lats and upper back.",
    ex_pullup: "Classic vertical pull for upper-back width and arm strength.",
    ex_cable_row: "Strengthens mid-back posture muscles and lats.",
    ex_db_single_row: "Builds a stronger back one side at a time to fix imbalances.",
    ex_squat: "Primary lower-body builder for quads, glutes, and core stability.",
    ex_goblet_squat: "Beginner-friendly squat pattern for legs, glutes, and upright posture.",
    ex_leg_press: "Builds quad and glute strength with lower-back support.",
    ex_rdl: "Strengthens hamstrings, glutes, and posterior-chain hinge mechanics.",
    ex_db_rdl: "Teaches hip-hinge strength for hamstrings and glutes.",
    ex_leg_curl: "Isolates hamstrings to balance knee strength and protect joints.",
    ex_ohp: "Builds overhead shoulder strength and torso stability.",
    ex_db_shoulder: "Presses overhead with natural joint alignment.",
    ex_lat_raise: "Targets side delts for shoulder width and stability.",
    ex_face_pull: "Supports healthy shoulders, rear delts, and upper-back posture.",
    ex_db_curl: "Direct bicep strength for pulling and arm balance.",
    ex_bb_curl: "Classic bicep builder with straightforward progression.",
    ex_pushdown: "Isolates triceps to support pressing strength.",
    ex_hanging_raise: "Strengthens lower abs and grip.",
    ex_cable_crunch: "Controlled core flexion you can progress gradually."
  };

  function getExerciseWhy(exId) {
    if (EXERCISE_WHY[exId]) return EXERCISE_WHY[exId];
    const ex = getExerciseById(exId);
    if (!ex) return "Supports balanced strength and muscle development.";
    const p = (ex.primary || []).map((m) => MUSCLES[m] || m).join(" & ");
    return `Targets ${p} with controlled ${ex.equipment.toLowerCase()} resistance.`;
  }

  function generatePlanFromPrefs(prefs) {
    const days = Number(prefs.daysPerWeek) || 3;
    const equip = prefs.equipment || "full_gym";
    const mins = Number(prefs.sessionMinutes) || 45;
    const limitCount = mins <= 30 ? 4 : mins >= 60 ? 6 : 5;

    let planName = "Full Body 3×";
    let dayTemplates = [];

    if (equip === "dumbbells") {
      planName = `Dumbbell at Home (${days}×)`;
      dayTemplates = [
        { title: "Full Body A (Dumbbell)", focus: "Squat, Push & Row", exIds: ["ex_goblet_squat", "ex_db_bench", "ex_db_single_row", "ex_db_shoulder", "ex_db_curl", "ex_db_calf"] },
        { title: "Full Body B (Dumbbell)", focus: "Hinge, Incline & Arms", exIds: ["ex_db_rdl", "ex_incline_db", "ex_db_chest_row", "ex_lat_raise", "ex_db_oh_ext", "ex_db_lunge"] },
        { title: "Full Body C (Dumbbell)", focus: "Split Legs, Press & Core", exIds: ["ex_db_split_squat", "ex_db_bench", "ex_db_single_row", "ex_db_rear_fly", "ex_hammer_curl", "ex_db_rdl"] }
      ];
    } else if (equip === "bodyweight") {
      planName = `Bodyweight & Minimal (${days}×)`;
      dayTemplates = [
        { title: "Full Body A (Minimal)", focus: "Push, Pull & Core", exIds: ["ex_pushup", "ex_pullup", "ex_dips", "ex_hanging_raise", "ex_goblet_squat"] },
        { title: "Full Body B (Minimal)", focus: "Control & Volume", exIds: ["ex_dips", "ex_pullup", "ex_pushup", "ex_hanging_raise", "ex_db_lunge"] }
      ];
    } else if (days === 4) {
      planName = "Upper / Lower 4×";
      dayTemplates = [
        { title: "Upper Body A", focus: "Chest, Back & Shoulders", exIds: ["ex_bench", "ex_lat_pulldown", "ex_db_shoulder", "ex_cable_row", "ex_pushdown", "ex_face_pull"] },
        { title: "Lower Body A", focus: "Quads, Hamstrings & Calves", exIds: ["ex_squat", "ex_rdl", "ex_leg_press", "ex_leg_curl", "ex_calf_raise", "ex_cable_crunch"] },
        { title: "Upper Body B", focus: "Incline, Rows & Arms", exIds: ["ex_incline_db", "ex_cable_row", "ex_lat_raise", "ex_lat_pulldown", "ex_db_curl", "ex_pushdown"] },
        { title: "Lower Body B", focus: "Hinge, Glutes & Quads", exIds: ["ex_hip_thrust", "ex_leg_press", "ex_leg_curl", "ex_leg_ext", "ex_calf_raise", "ex_hanging_raise"] }
      ];
    } else if (days === 2) {
      planName = "Full Body 2×";
      dayTemplates = [
        { title: "Full Body A", focus: "Squat, Press & Pull", exIds: ["ex_leg_press", "ex_db_bench", "ex_lat_pulldown", "ex_db_shoulder", "ex_leg_curl", "ex_cable_crunch"] },
        { title: "Full Body B", focus: "Hinge, Incline & Row", exIds: ["ex_db_rdl", "ex_incline_db", "ex_cable_row", "ex_lat_raise", "ex_db_curl", "ex_pushdown"] }
      ];
    } else {
      planName = "Full Body 3×";
      dayTemplates = [
        { title: "Full Body A", focus: "Legs, Push & Pull", exIds: ["ex_squat", "ex_db_bench", "ex_lat_pulldown", "ex_lat_raise", "ex_db_curl", "ex_cable_crunch"] },
        { title: "Full Body B", focus: "Hinge, Press & Row", exIds: ["ex_rdl", "ex_incline_db", "ex_cable_row", "ex_face_pull", "ex_pushdown", "ex_calf_raise"] },
        { title: "Full Body C", focus: "Leg Press, Chest & Back", exIds: ["ex_leg_press", "ex_chest_press_mach", "ex_lat_pulldown", "ex_db_shoulder", "ex_leg_curl", "ex_hanging_raise"] }
      ];
    }

    const daysList = dayTemplates.slice(0, days).map((d, idx) => ({
      id: `plan_d${idx}`,
      label: `Day ${String.fromCharCode(65 + idx)}`,
      title: d.title,
      focus: d.focus,
      exercises: d.exIds.slice(0, limitCount).filter((id) => getExerciseById(id))
    }));

    return {
      name: planName,
      daysPerWeek: days,
      estimatedMinutes: mins,
      currentDayIdx: 0,
      days: daysList
    };
  }

  function ensurePlanExists() {
    const s = getProfileSettings();
    if (!s.plan || !s.plan.days || !s.plan.days.length) {
      s.plan = generatePlanFromPrefs(s);
    }
    return s.plan;
  }

  function startPlanDay(dayIdx) {
    const plan = ensurePlanExists();
    const day = plan.days[dayIdx] || plan.days[0];
    if (!day) return;
    plan.currentDayIdx = dayIdx;
    state.activeWorkouts[state.activeProfileId] = {
      id: uid("wk"),
      title: day.title,
      planDayIdx: dayIdx,
      weightUnit: "kg",
      startedAt: new Date().toISOString(),
      exercises: day.exercises.map((id, idx) => {
        const overload = getOverloadSuggestion(id);
        const wKg = overload && overload.weightKg > 0 ? String(overload.weightKg) : "";
        const warmupKg = overload && overload.weightKg > 0 ? String(Math.max(5, Math.round(overload.weightKg * 0.6))) : "";
        const r = overload ? String(overload.reps) : "10";
        const sets = idx === 0
          ? [
              { weight: warmupKg, reps: "8", type: "W", status: "planned", completed: false },
              { weight: wKg, reps: r, type: "", status: "planned", completed: false },
              { weight: wKg, reps: r, type: "", status: "planned", completed: false },
              { weight: wKg, reps: r, type: "", status: "planned", completed: false }
            ]
          : [
              { weight: wKg, reps: r, type: "", status: "planned", completed: false },
              { weight: wKg, reps: r, type: "", status: "planned", completed: false },
              { weight: wKg, reps: r, type: "", status: "planned", completed: false }
            ];
        return { exerciseId: id, sets };
      })
    };
    saveState();
    switchView("workout");
  }

  /* ---------------- BODY-GATED EXERCISE WEIGHT TIERS ---------------- */
  const EXERCISE_BW_RATIOS = {
    ex_bench: { r: 0.90 },
    ex_db_bench: { r: 0.34, perHand: true },
    ex_incline_db: { r: 0.30, perHand: true },
    ex_incline_bb: { r: 0.78 },
    ex_db_fly: { r: 0.16, perHand: true },
    ex_db_pullover: { r: 0.30 },
    ex_cable_fly: { r: 0.22, perHand: true },
    ex_pec_deck: { r: 0.55 },
    ex_chest_press_mach: { r: 0.80 },
    ex_dips: { bw: true, weighted: true },
    ex_pushup: { bw: true, weighted: false },

    ex_ohp: { r: 0.58 },
    ex_db_shoulder: { r: 0.24, perHand: true },
    ex_arnold_press: { r: 0.22, perHand: true },
    ex_shoulder_mach: { r: 0.55 },
    ex_lat_raise: { r: 0.11, perHand: true },
    ex_cable_lat_raise: { r: 0.10 },
    ex_db_front_raise: { r: 0.11, perHand: true },
    ex_db_rear_fly: { r: 0.10, perHand: true },
    ex_rear_delt_mach: { r: 0.45 },
    ex_face_pull: { r: 0.30 },

    ex_pullup: { bw: true, weighted: true },
    ex_lat_pulldown: { r: 0.72 },
    ex_bb_row: { r: 0.80 },
    ex_db_single_row: { r: 0.36 },
    ex_db_chest_row: { r: 0.28, perHand: true },
    ex_cable_row: { r: 0.75 },
    ex_mach_row: { r: 0.75 },
    ex_shrug: { r: 0.36, perHand: true },
    ex_bb_shrug: { r: 1.00 },

    ex_bb_curl: { r: 0.38 },
    ex_db_curl: { r: 0.16, perHand: true },
    ex_incline_curl: { r: 0.14, perHand: true },
    ex_hammer_curl: { r: 0.17, perHand: true },
    ex_conc_curl: { r: 0.15 },
    ex_preacher_mach: { r: 0.38 },
    ex_pushdown: { r: 0.35 },
    ex_db_oh_ext: { r: 0.26 },
    ex_db_skull: { r: 0.14, perHand: true },
    ex_skullcrusher: { r: 0.35 },
    ex_tricep_kickback: { r: 0.10, perHand: true },

    ex_squat: { r: 1.25 },
    ex_goblet_squat: { r: 0.36 },
    ex_db_split_squat: { r: 0.22, perHand: true },
    ex_db_lunge: { r: 0.22, perHand: true },
    ex_smith_squat: { r: 1.15 },
    ex_leg_press: { r: 1.85 },
    ex_leg_ext: { r: 0.65 },
    ex_rdl: { r: 1.10 },
    ex_db_rdl: { r: 0.32, perHand: true },
    ex_deadlift: { r: 1.50 },
    ex_leg_curl: { r: 0.55 },
    ex_lying_leg_curl: { r: 0.55 },
    ex_hip_thrust: { r: 1.35 },
    ex_calf_raise: { r: 1.05 },
    ex_db_calf: { r: 0.24 },

    ex_hanging_raise: { bw: true, weighted: false },
    ex_cable_crunch: { r: 0.45 },
    ex_ab_mach: { r: 0.45 },
    ex_decline_bench: { r: 0.92 },
    ex_decline_db: { r: 0.34, perHand: true },
    ex_high_to_low_fly: { r: 0.22, perHand: true },
    ex_low_to_high_fly: { r: 0.18, perHand: true },
    ex_standing_mid_fly: { r: 0.20, perHand: true },
    ex_seated_cable_fly: { r: 0.22, perHand: true },
    ex_incline_cable_fly: { r: 0.18, perHand: true },
    ex_single_cable_fly: { r: 0.20 },
    ex_back_ext: { bw: true, weighted: false },
    ex_weighted_back_ext: { r: 0.22 },
    ex_reverse_hyper: { r: 0.45 },
    ex_neutral_pulldown: { r: 0.75 },
    ex_single_arm_pulldown: { r: 0.36 },
    ex_wide_pulldown: { r: 0.70 },
    ex_close_pulldown: { r: 0.76 },
    ex_underhand_pulldown: { r: 0.74 },
    ex_mag_cable_row: { r: 0.78 },
    ex_wide_cable_row: { r: 0.68 },
    ex_single_cable_row: { r: 0.36 },
    ex_tbar_row: { r: 0.85 },
    ex_pendlay_row: { r: 0.80 },
    ex_meadows_row: { r: 0.42 },
    ex_straight_arm_pulldown: { r: 0.35 },
    ex_leaning_lat_raise: { r: 0.11 },
    ex_upright_row: { r: 0.40 },
    ex_reverse_cable_fly: { r: 0.12 },
    ex_bayesian_curl: { r: 0.16 },
    ex_rope_hammer_curl: { r: 0.32 },
    ex_spider_curl: { r: 0.14, perHand: true },
    ex_cable_oh_tricep: { r: 0.34 },
    ex_single_pushdown: { r: 0.18 },
    ex_close_grip_bench: { r: 0.82 },
    ex_front_squat: { r: 1.05 },
    ex_hack_squat: { r: 1.35 },
    ex_sumo_deadlift: { r: 1.50 },
    ex_seated_calf: { r: 0.75 },
    ex_adductor_mach: { r: 0.65 },
    ex_ab_wheel: { bw: true, weighted: false },
    ex_pallof_press: { r: 0.20 },
    ex_woodchop: { r: 0.22 }
  };

  function getUserEffectiveWeight(profileId = state.activeProfileId) {
    const bp = getBodyProfile(profileId);
    const entries = state.measurements
      .filter((m) => m.profileId === profileId && Number(m.weight) > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestMeas = entries[0] ? Number(entries[0].weight) : 0;
    const profileW = Number(bp.weightKg) || 0;
    const w = latestMeas > 0 ? latestMeas : profileW;
    return w > 0 ? w : null;
  }


  function getExerciseWeightTiers(ex, profileId = state.activeProfileId) {
    const bw = getUserEffectiveWeight(profileId);
    if (!bw || !ex) return null;

    const bp = getBodyProfile(profileId);
    const age = Number(bp.age) || 0;
    const ageFactor = age >= 50 ? 0.92 : age > 0 && age < 18 ? 0.90 : 1.0;
    const goalFactor = bp.goal === "Strength" ? 1.05 : bp.goal === "Fat Loss" ? 0.95 : 1.0;
    const mod = ageFactor * goalFactor;

    let spec = EXERCISE_BW_RATIOS[ex.id];
    if (!spec) {
      if (ex.equipment === "Bodyweight") {
        spec = { bw: true, weighted: true };
      } else {
        const lowerPrimary = (ex.primary || []).some((m) => ["quads", "hamstrings", "glutes", "lower_back"].includes(m));
        const baseFallback =
          ex.equipment === "Barbell" ? (lowerPrimary ? 1.1 : 0.7)
          : ex.equipment === "Dumbbell" ? (lowerPrimary ? 0.28 : 0.20)
          : ex.equipment === "Machine" ? (lowerPrimary ? 0.9 : 0.6)
          : 0.35;
        spec = { r: baseFallback, perHand: ex.equipment === "Dumbbell" };
      }
    }

    const tiersMeta = [
      { label: "Tier 1 - Beginner", mult: 0.55, reps: "12–15", targetReps: 12, sets: "2–3", targetSets: 3, failure: "No (RIR 3)", failCls: "tier-fail-no" },
      { label: "Tier 2 - Moderate", mult: 0.75, reps: "8–12",  targetReps: 10, sets: "3",   targetSets: 3, failure: "No (RIR 1–2)", failCls: "tier-fail-no" },
      { label: "Tier 3 - Heavy",    mult: 0.95, reps: "6–8",   targetReps: 6,  sets: "3–4", targetSets: 4, failure: "Last set", failCls: "tier-fail-last" },
      { label: "Tier 4 - Maximum",  mult: 1.12, reps: "3–5",   targetReps: 4,  sets: "2–3", targetSets: 3, failure: "Yes", failCls: "tier-fail-yes" }
    ];

    const levelIndex = bp.level === "Beginner" ? 0 : bp.level === "Advanced" ? 2 : 1;

    const rows = tiersMeta.map((t, idx) => {
      let weightStr = "";
      let numericWeight = 0;
      if (spec.bw) {
        if (idx === 0) weightStr = spec.weighted ? "BW (Assisted)" : "BW";
        else if (idx === 1) weightStr = "BW";
        else if (idx === 2) {
          numericWeight = spec.weighted ? roundGymWeight(bw * 0.08 * mod, "Barbell") : 0;
          weightStr = spec.weighted ? `BW + ${numericWeight} kg` : "BW";
        } else {
          numericWeight = spec.weighted ? roundGymWeight(bw * 0.18 * mod, "Barbell") : 5;
          weightStr = spec.weighted ? `BW + ${numericWeight} kg` : "BW + 5 kg";
        }
      } else {
        const raw = bw * spec.r * t.mult * mod;
        numericWeight = roundGymWeight(raw, ex.equipment);
        weightStr = spec.perHand ? `${numericWeight} kg × 2` : `${numericWeight} kg`;
      }
      return { ...t, weight: weightStr, numericWeight, isUserLevel: idx === levelIndex };
    });

    return { bw, goal: bp.goal || "Hypertrophy", level: bp.level || "Intermediate", rows };
  }

  function applyTierToWorkout(exId, tierIdx) {
    const ex = getExerciseById(exId);
    const data = getExerciseWeightTiers(ex);
    if (!ex || !data || !data.rows[tierIdx]) return;
    const tier = data.rows[tierIdx];

    let active = getActiveWorkout();
    if (!active) {
      active = {
        id: uid("wk"),
        title: `${ex.name} Session`,
        startedAt: new Date().toISOString(),
        exercises: []
      };
      setActiveWorkout(active);
    }

    const sets = Array.from({ length: tier.targetSets }, (_, i) => ({
      weight: tier.numericWeight > 0 ? String(tier.numericWeight) : "",
      reps: String(tier.targetReps),
      type: tierIdx === 3 || (tierIdx === 2 && i === tier.targetSets - 1) ? "F" : "",
      completed: false
    }));

    const existing = active.exercises.find((item) => item.exerciseId === ex.id);
    if (existing) {
      existing.sets = sets;
    } else {
      active.exercises.push({ exerciseId: ex.id, sets });
    }
    saveState();
    closeModal("modal-exercise-form");
    switchView("workout");
  }

  function renderExerciseTierTableHtml(ex) {
    const data = getExerciseWeightTiers(ex);
    if (!data) return "";
    return `
      <div class="tier-head">
        <span class="eyebrow" style="margin-bottom:0;">Recommended Load Tiers</span>
        <span class="muted-note">Based on ${data.bw} kg · ${escapeHtml(data.goal)} · ${escapeHtml(data.level)}</span>
      </div>
      <div class="tier-table-scroll">
        <table class="tier-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Weight</th>
              <th>Reps</th>
              <th>Sets</th>
              <th>Failure?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${data.rows
              .map(
                (r, idx) => `
              <tr class="${r.isUserLevel ? "tier-active-row" : ""}">
                <td>${r.label}</td>
                <td><strong>${escapeHtml(r.weight)}</strong></td>
                <td>${r.reps}</td>
                <td>${r.sets}</td>
                <td class="${r.failCls}">${r.failure}</td>
                <td><button class="btn btn-ghost btn-sm" type="button" data-apply-tier="${ex.id}:${idx}">Use</button></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------------- STICKMAN FORM ANIMATION ENGINE ---------------- */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpPose(p1, p2, t) {
    const out = {};
    Object.keys(p1).forEach((k) => {
      out[k] = [lerp(p1[k][0], p2[k][0], t), lerp(p1[k][1], p2[k][1], t)];
    });
    return out;
  }

  function drawEquipmentSvg(equip, wr, an) {
    let html = `<line x1="12" y1="152" x2="208" y2="152" stroke="#202629" stroke-width="2" stroke-linecap="round"/>`;
    if (equip === "bench_flat") {
      html += `
        <rect x="44" y="106" width="98" height="9" rx="2.5" fill="#1b1f27" stroke="#3f4654" stroke-width="1.2"/>
        <rect x="44" y="106" width="98" height="3" rx="1" fill="#2a303c"/>
        <line x1="56" y1="115" x2="56" y2="152" stroke="#3a404d" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="130" y1="115" x2="130" y2="152" stroke="#3a404d" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="50" y1="152" x2="62" y2="152" stroke="#4b5563" stroke-width="3" stroke-linecap="round"/>
        <line x1="124" y1="152" x2="136" y2="152" stroke="#4b5563" stroke-width="3" stroke-linecap="round"/>`;
    } else if (equip === "bench_incline") {
      html += `
        <line x1="62" y1="62" x2="112" y2="118" stroke="#3f4654" stroke-width="9" stroke-linecap="round"/>
        <line x1="112" y1="122" x2="144" y2="122" stroke="#3f4654" stroke-width="8" stroke-linecap="round"/>
        <line x1="86" y1="92" x2="86" y2="152" stroke="#3a404d" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="134" y1="125" x2="134" y2="152" stroke="#3a404d" stroke-width="3.5" stroke-linecap="round"/>`;
    } else if (equip === "pullup_bar") {
      html += `
        <line x1="68" y1="26" x2="152" y2="26" stroke="#A0A7AA" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="72" y1="26" x2="72" y2="152" stroke="#2a303c" stroke-width="2.5"/>
        <line x1="148" y1="26" x2="148" y2="152" stroke="#2a303c" stroke-width="2.5"/>`;
    } else if (equip === "dip_bars") {
      html += `
        <line x1="84" y1="92" x2="132" y2="92" stroke="#A0A7AA" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="90" y1="92" x2="90" y2="152" stroke="#3a404d" stroke-width="3.5"/>
        <line x1="126" y1="92" x2="126" y2="152" stroke="#3a404d" stroke-width="3.5"/>`;
    } else if (equip === "machine_seat") {
      html += `
        <rect x="86" y="42" width="9" height="66" rx="2.5" fill="#1b1f27" stroke="#3f4654" stroke-width="1.2"/>
        <rect x="86" y="106" width="46" height="9" rx="2.5" fill="#1b1f27" stroke="#3f4654" stroke-width="1.2"/>
        <line x1="102" y1="115" x2="102" y2="152" stroke="#3a404d" stroke-width="3.5"/>`;
    } else if (equip === "lat_machine") {
      html += `
        <line x1="114" y1="14" x2="114" y2="${wr[1]}" stroke="#A0A7AA" stroke-width="1.6" stroke-dasharray="3 2"/>
        <line x1="70" y1="14" x2="156" y2="14" stroke="#3f4654" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="${wr[0] - 12}" y1="${wr[1]}" x2="${wr[0] + 12}" y2="${wr[1]}" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <rect x="86" y="108" width="46" height="9" rx="2.5" fill="#1b1f27" stroke="#3f4654" stroke-width="1.2"/>
        <line x1="104" y1="117" x2="104" y2="152" stroke="#3a404d" stroke-width="3.5"/>`;
    } else if (equip === "cable_high" || equip === "cable_mid") {
      const py = equip === "cable_high" ? 36 : 78;
      html += `
        <line x1="36" y1="20" x2="36" y2="152" stroke="#3f4654" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="36" cy="${py}" r="5" fill="#191c22" stroke="#C52F3A" stroke-width="2"/>
        <line x1="36" y1="${py}" x2="${wr[0]}" y2="${wr[1]}" stroke="#A0A7AA" stroke-width="1.6" stroke-dasharray="3 2"/>
        <rect x="${wr[0] - 3}" y="${wr[1] - 4}" width="6" height="8" rx="1.5" fill="#f59e0b"/>`;
    } else if (equip === "leg_press") {
      const sx = an ? an[0] : 152;
      const sy = an ? an[1] : 78;
      html += `
        <line x1="50" y1="74" x2="88" y2="122" stroke="#3f4654" stroke-width="9" stroke-linecap="round"/>
        <line x1="88" y1="124" x2="116" y2="124" stroke="#3f4654" stroke-width="8" stroke-linecap="round"/>
        <line x1="124" y1="112" x2="178" y2="62" stroke="#2a303c" stroke-width="3"/>
        <line x1="${sx - 4}" y1="${sy + 12}" x2="${sx + 10}" y2="${sy - 14}" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>`;
    } else if (equip === "roman_chair") {
      html += `
        <line x1="50" y1="148" x2="106" y2="88" stroke="#3f4654" stroke-width="5" stroke-linecap="round"/>
        <line x1="94" y1="98" x2="94" y2="152" stroke="#3a404d" stroke-width="3.5"/>
        <rect x="90" y="84" width="16" height="8" rx="2" fill="#1b1f27" stroke="#C52F3A" stroke-width="1.2"/>
        <circle cx="52" cy="144" r="4" fill="#f59e0b"/>`;
    }
    return html;
  }

  function taperedLimb(a, b, r1, r2, fill, stroke = "none") {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const p1 = `${(a[0] + nx * r1).toFixed(1)},${(a[1] + ny * r1).toFixed(1)}`;
    const p2 = `${(b[0] + nx * r2).toFixed(1)},${(b[1] + ny * r2).toFixed(1)}`;
    const p3 = `${(b[0] - nx * r2).toFixed(1)},${(b[1] - ny * r2).toFixed(1)}`;
    const p4 = `${(a[0] - nx * r1).toFixed(1)},${(a[1] - ny * r1).toFixed(1)}`;
    return `
      <polygon points="${p1} ${p2} ${p3} ${p4}" fill="${fill}" stroke="${stroke}" stroke-width="0.6" stroke-linejoin="round"/>
      <circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="${r1}" fill="${fill}"/>
      <circle cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="${r2}" fill="${fill}"/>
    `;
  }

  const FORM_COACH_META = {
    bench_press: {
      angleMode: "elbow", track: "wr",
      setup: "Eyes under the bar, shoulder blades squeezed down and back, feet planted flat on the floor.",
      tempo: "2s controlled lower to mid-chest, brief pause, explosive 1s press; inhale down, exhale up.",
      targetAngles: "Elbows ~45° tucked to torso · 75°–170° elbow extension",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Flaring elbows to 90° and flattening your shoulders puts excess stress on the shoulder joint.",
      lookOutFor: "Do not bounce the bar off your sternum or flare elbows straight out to 90°."
    },
    incline_press: {
      angleMode: "elbow", track: "wr",
      setup: "Set bench to 30–45°, pin upper back to pad, and keep wrists stacked directly over elbows.",
      tempo: "2–3s lower toward upper chest, 1s press up and slightly inward; exhale at top.",
      targetAngles: "Bench 30–45° · Elbows ~45° tucked · 80°–170° elbow range",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Flaring elbows wide or lifting your upper back off the incline pad shifts load to front delts.",
      lookOutFor: "Avoid excessive lower-back arch or pressing too far forward over your belly."
    },
    chest_fly: {
      angleMode: "shoulder", track: "wr",
      setup: "Lie flat with shoulder blades retracted and maintain a soft 15–20° bend at the elbows.",
      tempo: "3s wide stretch until pecs feel taut, 1s hug back together without clanging weights.",
      targetAngles: "Fixed ~155° elbow bend · Wide shoulder adduction arc",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Bending elbows too far turns the fly into a press; dropping shoulders forward loses pec tension.",
      lookOutFor: "Keep the elbow angle locked—do not bend and straighten like a dumbbell press."
    },
    db_pullover: {
      angleMode: "shoulder", track: "wr",
      setup: "Support upper back on bench, brace core, and cup one dumbbell overhead with soft elbows.",
      tempo: "3s slow reach behind head to a lat/chest stretch, 1.5s pull back over sternum.",
      targetAngles: "Fixed ~155°–165° elbow · Shoulder arc 85°–165°",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Over-arching your ribcage/lower back fakes range of motion without stretching the lats.",
      lookOutFor: "Keep ribs tucked down; stop lowering if your lower back starts lifting off the bench."
    },
    cable_fly: {
      angleMode: "shoulder", track: "wr",
      setup: "Set pulleys at chest height, step into a staggered stance, and keep chest proud.",
      tempo: "2s controlled open to chest line, 1s sweep together with a 1s peak squeeze.",
      targetAngles: "Soft ~150° elbow bend · Horizontal sweep in front of sternum",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Leaning and jerking forward with momentum instead of isolating the pecs.",
      lookOutFor: "Do not let your shoulders roll forward at the finish of each rep."
    },
    pec_deck: {
      angleMode: "shoulder", track: "wr",
      setup: "Adjust seat so handles align with mid-chest; keep shoulder blades pinned to backrest.",
      tempo: "2s controlled open, 1s smooth squeeze to center, 1s pause at peak contraction.",
      targetAngles: "Upper arms ~80°–90° to torso · Fixed soft elbow ~140°",
      mistakeType: "shrug_traps",
      mistakeNote: "Mistake: Shrugging shoulders up toward your ears shifts tension into upper traps.",
      lookOutFor: "Keep shoulders depressed down away from your ears throughout the set."
    },
    machine_press: {
      angleMode: "elbow", track: "wr",
      setup: "Set seat so handles sit at mid-chest level; plant feet and press upper back into pad.",
      tempo: "2s controlled return, 1s press forward stopping just short of hard elbow lockout.",
      targetAngles: "Elbows ~45° below shoulders · 80°–168° elbow extension",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Letting shoulders roll off the backrest at lockout reduces pec tension.",
      lookOutFor: "Keep shoulder blades pinned back as your hands press forward."
    },
    dips: {
      angleMode: "elbow", track: "wr",
      setup: "Grip parallel bars with straight wrists, depress shoulders, and lean torso ~15–20° forward.",
      tempo: "2–3s lower until upper arms reach parallel, 1s press back to full support.",
      targetAngles: "Torso ~15–20° lean · Elbow bends to ~85°–90° at bottom",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Dropping too fast with flared elbows and shrugged shoulders strains the anterior capsule.",
      lookOutFor: "Avoid swinging your legs or letting shoulders hike up toward your ears."
    },
    pushup: {
      angleMode: "elbow", track: "head",
      setup: "Hands just outside shoulder width, fingers forward, glutes and abs squeezed in a straight plank.",
      tempo: "2s lower until chest hovers an inch above floor, 1s strong push through palms.",
      targetAngles: "Straight 180° body line · Elbows ~45° from ribs · 85°–175° elbow",
      mistakeType: "hip_sag",
      mistakeNote: "Mistake: Letting hips sag toward the floor breaks core tension and strains the lower back.",
      lookOutFor: "Keep your hips level with your shoulders—never let your lower back dip."
    },
    ohp: {
      angleMode: "elbow", track: "wr",
      setup: "Grip just outside shoulders, forearms vertical under bar, glutes and abs braced tight.",
      tempo: "1s press straight overhead pushing head slightly through, 2s controlled lower to collarbone.",
      targetAngles: "Vertical spine 90° · Elbow 65° at rack to 175° lockout",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Leaning back and turning an overhead press into a standing incline press.",
      lookOutFor: "Squeeze glutes hard so your lower back does not hyperextend."
    },
    seated_ohp: {
      angleMode: "elbow", track: "wr",
      setup: "Sit tall against upright pad, elbows angled ~30° forward in the scapular plane.",
      tempo: "2s lower to ear/chin level, 1s smooth press overhead without clanking weights.",
      targetAngles: "Elbow 70° bottom to 172° top · Scapular plane path",
      mistakeType: "shrug_traps",
      mistakeNote: "Mistake: Shrugging traps up at the top or flaring elbows straight out to the sides.",
      lookOutFor: "Keep elbows slightly in front of your ears rather than flared behind you."
    },
    lat_raise: {
      angleMode: "shoulder", track: "wr",
      setup: "Stand tall with ~10° forward torso lean, soft elbow bend, weights beside thighs.",
      tempo: "1.5s raise leading with elbows to shoulder height, 2.5s slow controlled lower.",
      targetAngles: "Shoulder abduction 15°–88° · Fixed ~155° elbow bend",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Swinging your torso and shrugging traps to heave weights above shoulder height.",
      lookOutFor: "Stop at shoulder level (90°); if you have to swing, drop the weight."
    },
    front_raise: {
      angleMode: "shoulder", track: "wr",
      setup: "Stand upright with core braced, palms facing thighs, soft bend in elbows.",
      tempo: "1.5s raise to eye/shoulder level, 2s controlled descent without dropping arms.",
      targetAngles: "Shoulder flexion 15°–90° · Fixed ~160° elbow",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Rocking backward with your lower back to swing the dumbbells up.",
      lookOutFor: "Keep your ribcage stacked over your pelvis the entire set."
    },
    rear_delt_fly: {
      angleMode: "shoulder", track: "wr",
      setup: "Hinge hips to ~75°–85° with a flat back, letting arms hang beneath shoulders.",
      tempo: "1.5s sweep out wide toward ceiling, 1s pause, 2s controlled lower.",
      targetAngles: "Torso ~15°–25° above horizontal · Wide horizontal abduction",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Rounding the lower back or bobbing the torso upward on every rep.",
      lookOutFor: "Sweep out wide rather than pulling straight back with your lats."
    },
    face_pull: {
      angleMode: "elbow", track: "wr",
      setup: "Set pulley at upper-chest/eye height, stagger stance, grip rope with thumbs back.",
      tempo: "1.5s pull toward forehead driving elbows high/wide, 1s external rotation pause, 2s return.",
      targetAngles: "Elbows ~85°–95° at peak · Upper arms parallel to floor",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Leaning far back and pulling with body weight instead of rear delts and mid-back.",
      lookOutFor: "Finish with knuckles pointing behind you, not pulled down to your chest."
    },
    pullup: {
      angleMode: "elbow", track: "head",
      setup: "Hang with arms straight, grip just outside shoulders, depress shoulder blades before pulling.",
      tempo: "1.5s pull chest toward bar, 1s top hold, 2.5s controlled lower to full dead hang.",
      targetAngles: "Elbow 175° dead hang to ~55° top · Minimal hip swing",
      mistakeType: "half_rep",
      mistakeNote: "Mistake: Cutting the bottom stretch short (half-reps) or kipping with your legs.",
      lookOutFor: "Lower all the way down until elbows straighten before starting the next rep."
    },
    lat_pulldown: {
      angleMode: "elbow", track: "wr",
      setup: "Lock thighs snugly under knee pad, grip wider than shoulders, lean back ~15°.",
      tempo: "1.5s drive elbows down to ribs, 1s squeeze at upper chest, 2.5s stretch back up.",
      targetAngles: "Torso ~105°–110° · Elbow 172° top to ~65° bottom",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Rocking backward past 45° to yank the bar down with momentum.",
      lookOutFor: "Pull with your elbows down toward your hips, not by rounding your shoulders forward."
    },
    bent_row: {
      angleMode: "elbow", track: "wr",
      setup: "Hinge at hips to ~45° torso angle with a flat spine and knees slightly bent.",
      tempo: "1s pull bar to lower ribs/navel, 1s squeeze shoulder blades, 2s controlled lower.",
      targetAngles: "Torso ~45° hinge · Elbow 170° bottom to ~75° top",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Rounding the lumbar spine or standing nearly upright as the set gets heavy.",
      lookOutFor: "Keep your torso angle locked at ~45° and spine neutral throughout."
    },
    single_arm_row: {
      angleMode: "elbow", track: "wr",
      setup: "Brace one knee and hand on bench with a flat, level torso parallel to the floor.",
      tempo: "1.5s pull dumbbell in a slight arc toward your hip, 2s lower into a full lat stretch.",
      targetAngles: "Flat horizontal spine · Elbow 172° stretch to ~80° peak",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Twisting the torso or rounding your lower back to heave the dumbbell up.",
      lookOutFor: "Pull toward your hip pocket, not straight up into your armpit."
    },
    incline_row: {
      angleMode: "elbow", track: "wr",
      setup: "Lie chest-down on a 35–45° incline bench with feet planted firmly for stability.",
      tempo: "1.5s row dumbbells toward hips squeezing shoulder blades, 2s controlled lower.",
      targetAngles: "Bench 35–45° · Elbow 170° hang to ~80° top",
      mistakeType: "shrug_traps",
      mistakeNote: "Mistake: Lifting chest off the pad or shrugging shoulders up toward your ears.",
      lookOutFor: "Keep your sternum glued to the bench pad on every rep."
    },
    seated_row: {
      angleMode: "elbow", track: "wr",
      setup: "Sit tall with knees slightly bent, chest lifted, and arms extended forward to feel lat stretch.",
      tempo: "1.5s pull handle to lower stomach, 1s squeeze mid-back, 2s controlled return.",
      targetAngles: "Upright ~90°–100° torso · Elbow 170° reach to ~75° pull",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Leaning way back to pull and collapsing your spine forward on the return.",
      lookOutFor: "Move from your shoulder blades and elbows—not by rocking your lower back."
    },
    shrug: {
      angleMode: "shoulder", track: "wr",
      setup: "Stand tall holding weights at sides with arms completely straight and core braced.",
      tempo: "1s elevate shoulders straight toward ears, 1.5s squeeze at top, 2s slow lower.",
      targetAngles: "Arms straight ~175° · Vertical scapular elevation",
      mistakeType: "shrug_traps",
      mistakeNote: "Mistake: Bending your elbows or rolling your shoulders in circles.",
      lookOutFor: "Go straight up and straight down—never roll your shoulders."
    },
    curl: {
      angleMode: "elbow", track: "wr",
      setup: "Stand tall, pin elbows gently at your sides, palms up, chest lifted.",
      tempo: "1.5s curl up flexing only at the elbow, 1s squeeze, 2.5s slow negative.",
      targetAngles: "Upper arm vertical · Elbow 172° bottom to ~42° top",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Swinging your torso backward and letting elbows drift forward to cheat the weight up.",
      lookOutFor: "Keep your upper arms pinned to your ribs from start to finish."
    },
    incline_curl: {
      angleMode: "elbow", track: "wr",
      setup: "Set bench to 45°, pin shoulder blades back, and let arms hang straight down behind torso.",
      tempo: "1.5s curl forearms up keeping upper arms vertical, 2.5s slow lower to full stretch.",
      targetAngles: "Bench 45° · Upper arm perpendicular to floor · Elbow 175° to ~48°",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Driving elbows forward as you curl removes the long-head bicep stretch.",
      lookOutFor: "Keep elbows pointing straight at the floor throughout the rep."
    },
    preacher_curl: {
      angleMode: "elbow", track: "wr",
      setup: "Snug armpits over top of preacher pad, back of upper arms flat against pad.",
      tempo: "1.5s smooth curl, 1s squeeze, 2.5s lower stopping just shy of hyperextension.",
      targetAngles: "Upper arm locked on 45° pad · Elbow ~165° bottom to ~45° top",
      mistakeType: "half_rep",
      mistakeNote: "Mistake: Lifting elbows off the pad or bouncing out of the bottom stretch.",
      lookOutFor: "Control the bottom 15° slowly to protect the distal bicep tendon."
    },
    tricep_pushdown: {
      angleMode: "elbow", track: "wr",
      setup: "Stand tall with slight forward lean, pin elbows tightly to ribs, grip rope/bar.",
      tempo: "1s extend forearms straight down to full lockout, 1s squeeze, 2s controlled return.",
      targetAngles: "Upper arm fixed · Elbow ~65° top to 175° full lockout",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Letting elbows flare forward/up or leaning your whole body weight onto the bar.",
      lookOutFor: "Only your forearms should move—elbows stay glued to your sides."
    },
    tricep_overhead: {
      angleMode: "elbow", track: "wr",
      setup: "Sit upright, press weight overhead, and point elbows upward close to your ears.",
      tempo: "2.5s lower behind head for a deep tricep stretch, 1.5s extend back overhead.",
      targetAngles: "Upper arm near vertical · Elbow ~50° deep stretch to 172° top",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Flaring elbows wide out to the sides or arching lower back.",
      lookOutFor: "Keep elbows narrow and pointing toward the ceiling."
    },
    skullcrusher: {
      angleMode: "elbow", track: "wr",
      setup: "Lie flat, angle upper arms slightly back (~15° past vertical) for constant tension.",
      tempo: "2.5s bend elbows lowering weight just behind forehead, 1.5s extend back up.",
      targetAngles: "Upper arm ~105° to torso · Elbow 170° top to ~55° bottom",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Flaring elbows outward or dropping upper arms forward during the press.",
      lookOutFor: "Keep upper arms frozen in place; hinge strictly at the elbows."
    },
    kickback: {
      angleMode: "elbow", track: "wr",
      setup: "Hinge torso nearly horizontal, pin working upper arm parallel to your torso.",
      tempo: "1s extend forearm straight back to full lockout, 1s squeeze, 2s controlled return.",
      targetAngles: "Upper arm horizontal · Elbow ~85° start to 175° lockout",
      mistakeType: "half_rep",
      mistakeNote: "Mistake: Dropping your elbow down and swinging the dumbbell with momentum.",
      lookOutFor: "Keep your upper arm high and parallel to the floor on every rep."
    },
    squat: {
      angleMode: "knee", track: "hip",
      setup: "Feet shoulder-width, toes slightly out, brace core 360° before unlocking hips and knees.",
      tempo: "2.5s controlled descent to parallel or below, 1s drive evenly through mid-foot.",
      targetAngles: "Knee 175° top to ~85°–95° bottom · Neutral torso angle",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Rounding your lower back at the bottom (butt wink) or letting knees cave inward.",
      lookOutFor: "Keep chest proud and knees tracking directly over your middle toes."
    },
    lunge: {
      angleMode: "knee", track: "hip",
      setup: "Split stance hip-width apart for balance, torso tall with slight ~10° forward lean.",
      tempo: "2s lower straight down until both knees reach ~90°, 1s drive through front mid-foot.",
      targetAngles: "Front & back knees ~90° at bottom · Upright torso",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Letting the front knee collapse inward or slamming the back knee into the floor.",
      lookOutFor: "Push through your front heel/mid-foot rather than pushing off your back toes."
    },
    leg_press: {
      angleMode: "knee", track: "an",
      setup: "Feet shoulder-width on sled, lower back and glutes pressed firmly into seat pad.",
      tempo: "2.5s lower knees toward chest without tailbone curling, 1.5s press stopping shy of knee lock.",
      targetAngles: "Knee ~168° top to ~85°–90° bottom · Tailbone stays glued",
      mistakeType: "half_rep",
      mistakeNote: "Mistake: Cutting depth short or curling your lower back off the seat at the bottom.",
      lookOutFor: "Stop lowering just before your glutes lift off the pad; never snap knees into lockout."
    },
    leg_ext: {
      angleMode: "knee", track: "an",
      setup: "Align knee joint with machine pivot; ankle pad rests just above shoelaces; grip side handles.",
      tempo: "1.5s extend to full straight leg, 1s hard quad squeeze, 2.5s slow lower.",
      targetAngles: "Knee ~90° bottom to 175° full extension",
      mistakeType: "half_rep",
      mistakeNote: "Mistake: Swinging legs up with momentum or lifting hips out of the seat.",
      lookOutFor: "Hold the top squeeze for a full second to maximize quad recruitment."
    },
    leg_curl: {
      angleMode: "knee", track: "an",
      setup: "Lock thigh pad snugly over legs, align knee with machine pivot, toes pulled slightly toward shins.",
      tempo: "1.5s curl heels smoothly beneath seat, 1s hamstring squeeze, 2.5s controlled return.",
      targetAngles: "Knee ~165° extended to ~65°–75° curled",
      mistakeType: "half_rep",
      mistakeNote: "Mistake: Letting the weight stack slam or cutting the bottom stretch short.",
      lookOutFor: "Keep your hips pressed back into the seat pad throughout the curl."
    },
    lying_curl: {
      angleMode: "knee", track: "an",
      setup: "Lie face-down with knees just past bench edge and hips pressed firmly into pad.",
      tempo: "1.5s curl heels toward glutes, 1s squeeze, 2.5s slow lower.",
      targetAngles: "Hips flat 180° · Knee ~172° to ~65° curled",
      mistakeType: "hip_sag",
      mistakeNote: "Mistake: Lifting your butt off the bench as you curl steals tension from the hamstrings.",
      lookOutFor: "Squeeze glutes into the bench so your hips never pop up."
    },
    rdl: {
      angleMode: "hip", track: "wr",
      setup: "Soft ~15° knee bend locked in place, lats tight, bar/dumbbells touching thighs.",
      tempo: "3s push hips straight back keeping bar against legs, 1.5s drive hips forward to stand.",
      targetAngles: "Fixed ~160° knee · Hip hinge from 175° down to ~85°–95°",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Rounding the lower back or letting the bar drift away from your shins.",
      lookOutFor: "Stop lowering as soon as your hips stop moving backward—depth comes from hip hinge, not spine flexion."
    },
    hip_thrust: {
      angleMode: "hip", track: "hip",
      setup: "Lower shoulder blades anchored on bench edge, shins vertical at top, chin tucked.",
      tempo: "1.5s drive through heels to flat torso, 1.5s hard glute squeeze, 2s controlled lower.",
      targetAngles: "Top lockout: 180° torso-thigh line · 90° vertical shins",
      mistakeType: "hip_sag",
      mistakeNote: "Mistake: Hyperextending your lower back at the top instead of tilting pelvis via glutes.",
      lookOutFor: "Keep ribs down and eyes forward so your lower back stays neutral at lockout."
    },
    calf_raise: {
      angleMode: "knee", track: "hip",
      setup: "Balls of feet on step edge, knees straight (~175°), core braced.",
      tempo: "2s slow drop into deep ankle stretch, 1s pause at bottom, 1.5s drive onto big toes + 1s top hold.",
      targetAngles: "Full ankle dorsiflexion to maximal plantarflexion",
      mistakeType: "half_rep",
      mistakeNote: "Mistake: Bouncing rapidly off the bottom Achilles tendon without pausing.",
      lookOutFor: "Pause for 1 full second at the bottom stretch so momentum is zero."
    },
    hanging_raise: {
      angleMode: "hip", track: "an",
      setup: "Dead hang with shoulders engaged (depressed), legs straight or slightly bent.",
      tempo: "1.5s curl pelvis upward toward ribs, 2.5s slow lower stopping swing.",
      targetAngles: "Hip flexion from 180° hang up to ~75°–90°",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Swinging legs with momentum without curling your pelvis upward.",
      lookOutFor: "Focus on rolling your tailbone up toward your belly button, not just lifting feet."
    },
    cable_crunch: {
      angleMode: "hip", track: "head",
      setup: "Kneel upright holding rope beside temples, lock hips stationary.",
      tempo: "1.5s curl ribcage down toward pelvis exhaling hard, 2s controlled return.",
      targetAngles: "Hips fixed · Thoracic/lumbar flexion ~165° down to ~95°",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Sitting hips back toward heels turns the crunch into a hip hinge.",
      lookOutFor: "Keep your hips frozen over your knees—only your upper spine curls down."
    },
    back_extension: {
      angleMode: "hip", track: "head",
      setup: "Set top pad just below your hip crease; cross arms over chest or hold plate/dumbbell close to sternum.",
      tempo: "2.5s hinge down keeping spine neutral, 1s squeeze glutes & erectors to rise to straight line.",
      targetAngles: "Hip hinge ~105°–120° bottom to 180° straight line (never hyperextend)",
      mistakeType: "round_back",
      mistakeNote: "Mistake: Hyperextending your lower back past 180° at the top or rounding your lumbar spine under load.",
      lookOutFor: "Stop at a straight line from heels to head—never arch backward past neutral."
    },
    lat_pulldown_neutral: {
      angleMode: "elbow", track: "wr",
      setup: "Lock thighs under pad, grip shoulder-width neutral/MAG handles with palms facing each other.",
      tempo: "1.5s drive elbows down in front of ribs, 1s upper-chest pause, 2.5s full overhead stretch.",
      targetAngles: "Torso ~105° · Elbows tucked ~30° forward · Elbow 172° top to ~62° bottom",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Leaning way back to turn the pulldown into a row or shrugging shoulders at the bottom.",
      lookOutFor: "Keep chest proud and pull elbows straight down toward your hips."
    },
    lat_pulldown_single: {
      angleMode: "elbow", track: "wr",
      setup: "Brace non-working hand on seat/pad, hold D-handle overhead with a slight ~10° torso lean.",
      tempo: "1.5s pull elbow smoothly down to your hip pocket, 1s squeeze, 2.5s full upward lat stretch.",
      targetAngles: "Elbow 175° top stretch to ~65° bottom · Minimal torso twist",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Twisting or side-bending your torso aggressively to yank the handle down.",
      lookOutFor: "Keep your ribcage square and let the shoulder blade glide all the way up at the top."
    },
    seated_row_wide: {
      angleMode: "elbow", track: "wr",
      setup: "Sit tall with knees slightly bent, grip wide MAG or straight bar outside shoulder width.",
      tempo: "1.5s pull bar to lower sternum with elbows flared ~45–60°, 1s mid-back squeeze, 2s return.",
      targetAngles: "Upright ~90°–100° torso · Elbows ~50° from sides · Elbow 170° to ~78°",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Rocking your torso back and forth or shrugging upper traps toward your ears.",
      lookOutFor: "Keep shoulders depressed down and pull with your shoulder blades."
    },
    cable_fly_high_low: {
      angleMode: "shoulder", track: "wr",
      setup: "Set pulleys high above head, take one step forward, lean ~15° forward with chest lifted.",
      tempo: "2s controlled open above shoulders, 1s sweep down and inward in front of hips, 1s lower-pec squeeze.",
      targetAngles: "Soft fixed ~150° elbow · Downward-inward arc toward navel/hips",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Bending elbows into a press or hunching shoulders forward at the bottom.",
      lookOutFor: "Keep shoulders back and down as hands meet in front of your lower torso."
    },
    cable_fly_low_high: {
      angleMode: "shoulder", track: "wr",
      setup: "Set pulleys at bottom, stagger stance, chest proud, palms facing up/forward.",
      tempo: "2s controlled stretch back, 1.5s scoop upward and inward to chin/upper-chest height.",
      targetAngles: "Soft fixed ~150° elbow · Upward-inward arc to clavicle level",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Swinging your torso backward or bending elbows to curl the weight up.",
      lookOutFor: "Lead with your inner elbows and upper chest—don't turn it into a bicep curl."
    },
    straight_arm_pulldown: {
      angleMode: "shoulder", track: "wr",
      setup: "Stand back from high pulley, ~20° hip hinge, core braced, arms straight with soft ~165° elbow.",
      tempo: "1.5s sweep bar down to thighs using lats, 1s squeeze, 2.5s slow return overhead.",
      targetAngles: "Fixed ~165° elbow · Shoulder extension arc from ~150° down to ~25°",
      mistakeType: "elbow_flare",
      mistakeNote: "Mistake: Bending and straightening your elbows turns it into a tricep pushdown.",
      lookOutFor: "Keep your elbow angle locked—motion happens strictly at the shoulder joint."
    },
    bayesian_curl: {
      angleMode: "elbow", track: "wr",
      setup: "Set pulley at wrist height, face away, step forward so your upper arm trails ~20° behind torso.",
      tempo: "1.5s curl forearm forward, 1s squeeze, 2.5s slow lower back into the behind-body stretch.",
      targetAngles: "Upper arm ~20° behind torso · Elbow ~175° stretch to ~48° top",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Letting your elbow swing forward in front of your ribs loses the long-head stretch.",
      lookOutFor: "Keep your elbow anchored behind your torso line on every rep."
    },
    ab_wheel: {
      angleMode: "hip", track: "wr",
      setup: "Kneel with glutes squeezed, ribs tucked down (hollow body), arms straight gripping wheel.",
      tempo: "3s slow rollout extending only as far as lower back stays flat, 1.5s pull back via abs.",
      targetAngles: "Neutral/slightly flexed spine · Stop before lower back arches",
      mistakeType: "hip_sag",
      mistakeNote: "Mistake: Letting your hips sag and lower back hyperextend at full reach.",
      lookOutFor: "Stop rolling out the instant you feel your lower back start to arch."
    },
    woodchop: {
      angleMode: "shoulder", track: "wr",
      setup: "Stand perpendicular to cable, wide athletic stance, arms nearly straight.",
      tempo: "1.5s rotate torso across body pivoting back foot, 2s controlled return.",
      targetAngles: "Arms ~160° · Diagonal torso rotation across midline",
      mistakeType: "torso_swing",
      mistakeNote: "Mistake: Pulling only with your arms while keeping your ribcage and hips frozen.",
      lookOutFor: "Let your torso and obliques drive the rotation while arms act as cables."
    }
  };

  function getFormCoachMeta(rigKey, ex) {
    const base = FORM_COACH_META[rigKey] || FORM_COACH_META.curl;
    return base;
  }

  function apply2DMistakePose(p, rigKey, ease) {
    if (!formMistakeOn) return p;
    const meta = getFormCoachMeta(rigKey);
    const out = {
      head: [...p.head], neck: [...p.neck], sh: [...p.sh],
      el: [...p.el], wr: [...p.wr], hip: [...p.hip], kn: [...p.kn], an: [...p.an]
    };
    const m = meta.mistakeType;
    if (m === "elbow_flare") {
      out.el[0] -= 14;
      out.el[1] -= 10;
      out.sh[1] -= 4;
    } else if (m === "round_back") {
      out.neck[1] += 10 * (0.4 + 0.6 * ease);
      out.head[1] += 12 * (0.4 + 0.6 * ease);
      out.sh[1] += 8 * (0.4 + 0.6 * ease);
      out.kn[0] += 8 * ease;
    } else if (m === "torso_swing") {
      const lean = 16 * ease;
      out.head[0] -= lean;
      out.neck[0] -= lean * 0.85;
      out.sh[0] -= lean * 0.7;
      out.el[0] += 10 * ease;
    } else if (m === "hip_sag") {
      out.hip[1] += 14 * (0.5 + 0.5 * ease);
    } else if (m === "shrug_traps") {
      out.sh[1] -= 9;
      out.el[1] -= 6;
    } else if (m === "half_rep") {
      // Half-rep is handled via t scaling; subtle stiffness cue
      out.el[1] += 4 * ease;
    }
    return out;
  }

  function drawAngleArc2D(a, pivot, b, color = "#38bdf8") {
    const v1x = a[0] - pivot[0];
    const v1y = a[1] - pivot[1];
    const v2x = b[0] - pivot[0];
    const v2y = b[1] - pivot[1];
    const l1 = Math.hypot(v1x, v1y);
    const l2 = Math.hypot(v2x, v2y);
    if (l1 < 4 || l2 < 4) return "";

    const a1 = Math.atan2(v1y, v1x);
    const a2 = Math.atan2(v2y, v2x);
    let diff = a2 - a1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    const deg = Math.round(Math.abs(diff) * (180 / Math.PI));
    if (deg < 5 || deg > 179) return "";

    const r = 13;
    const x1 = pivot[0] + Math.cos(a1) * r;
    const y1 = pivot[1] + Math.sin(a1) * r;
    const x2 = pivot[0] + Math.cos(a1 + diff) * r;
    const y2 = pivot[1] + Math.sin(a1 + diff) * r;
    const sweep = diff >= 0 ? 1 : 0;

    const midA = a1 + diff * 0.5;
    const tx = pivot[0] + Math.cos(midA) * (r + 9);
    const ty = pivot[1] + Math.sin(midA) * (r + 9) + 3;

    return `
      <path d="M ${pivot[0].toFixed(1)} ${pivot[1].toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${x2.toFixed(1)} ${y2.toFixed(1)} Z"
            fill="rgba(56,189,248,0.22)" stroke="${color}" stroke-width="1"/>
      <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="#7dd3fc" font-size="8.5" font-weight="700" text-anchor="middle">${deg}°</text>
    `;
  }

  function drawTrajectory2D(rig, rigKey) {
    const meta = getFormCoachMeta(rigKey);
    const key = meta.track || "wr";
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const rawT = i / 14;
      const tEff = formMistakeOn && meta.mistakeType === "half_rep" ? rawT * 0.48 : rawT;
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * tEff);
      let ptPose = lerpPose(rig.start, rig.end, ease);
      if (formMistakeOn) ptPose = apply2DMistakePose(ptPose, rigKey, ease);
      pts.push(ptPose[key]);
    }
    const dist = Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]);
    if (dist < 4) return "";

    const d = pts.map((pt, idx) => `${idx === 0 ? "M" : "L"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ");
    const strokeCol = formMistakeOn ? "#ef4444" : "#f59e0b";
    const mid = pts[7];
    const next = pts[8];
    const ang = Math.atan2(next[1] - mid[1], next[0] - mid[0]) * (180 / Math.PI);

    return `
      <path d="${d}" fill="none" stroke="${strokeCol}" stroke-width="1.8" stroke-dasharray="3 2" opacity="0.88"/>
      <circle cx="${pts[0][0].toFixed(1)}" cy="${pts[0][1].toFixed(1)}" r="2.6" fill="#22c55e"/>
      <circle cx="${pts[pts.length - 1][0].toFixed(1)}" cy="${pts[pts.length - 1][1].toFixed(1)}" r="2.6" fill="#ef4444"/>
      <polygon points="-3,-2.5 3,0 -3,2.5" fill="${strokeCol}" transform="translate(${mid[0].toFixed(1)},${mid[1].toFixed(1)}) rotate(${ang.toFixed(1)})"/>
    `;
  }

  function getSegmentHighlightColor(ex, groupMuscles, fallback) {
    if (!ex) return fallback;
    if (ex.primary.some((m) => groupMuscles.includes(m))) return "#C52F3A";
    if (ex.secondary.some((m) => groupMuscles.includes(m))) return "#f59e0b";
    return fallback;
  }

  function renderStickmanFrame(rig, t) {
    const svg = document.getElementById("form-stickman-svg");
    if (!svg || !rig) return;

    const meta = getFormCoachMeta(activeFormRigKey, activeFormExercise);
    const tEff = formMistakeOn && meta.mistakeType === "half_rep" ? t * 0.48 : t;
    const ease = 0.5 - 0.5 * Math.cos(Math.PI * tEff);
    let p = lerpPose(rig.start, rig.end, ease);
    if (formMistakeOn) p = apply2DMistakePose(p, activeFormRigKey, ease);

    const equipSvg = drawEquipmentSvg(rig.equip, p.wr, p.an);

    // Subtle far-side limb silhouette offset for depth
    const off = [4, 2];
    const farHip = [p.hip[0] + off[0], p.hip[1] + off[1]];
    const farKn = [p.kn[0] + off[0], p.kn[1] + off[1]];
    const farAn = [p.an[0] + off[0], p.an[1] + off[1]];
    const farSh = [p.sh[0] + off[0], p.sh[1] - 1];
    const farEl = [p.el[0] + off[0], p.el[1] + 1];
    const farWr = [p.wr[0] + off[0], p.wr[1] + 1];

    const dir = p.head[0] <= p.hip[0] ? -1 : 1;
    const footDir = p.kn[0] >= p.hip[0] ? 1 : -1;

    // Highlight working muscles on the 2D stickman
    const torsoColor = getSegmentHighlightColor(activeFormExercise, ["chest", "lats", "mid_back", "lower_back", "abs", "obliques", "traps"], "#d1d5db");
    const upperArmColor = getSegmentHighlightColor(activeFormExercise, ["biceps", "triceps", "front_delts", "side_delts", "rear_delts"], "#A0A7AA");
    const foreArmColor = getSegmentHighlightColor(activeFormExercise, ["forearms", "biceps", "triceps"], "#cbd5e1");
    const thighColor = getSegmentHighlightColor(activeFormExercise, ["quads", "hamstrings", "glutes"], "#6b7280");
    const calfColor = getSegmentHighlightColor(activeFormExercise, ["calves", "hamstrings"], "#A0A7AA");

    let propSvg = "";
    if (rig.prop === "bar") {
      propSvg = `
        <line x1="${p.wr[0] - 14}" y1="${p.wr[1]}" x2="${p.wr[0] + 14}" y2="${p.wr[1]}" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
        <rect x="${p.wr[0] - 16}" y="${p.wr[1] - 6}" width="4" height="12" rx="1" fill="#f59e0b"/>
        <rect x="${p.wr[0] + 12}" y="${p.wr[1] - 6}" width="4" height="12" rx="1" fill="#f59e0b"/>`;
    } else if (rig.prop === "dumbbell") {
      propSvg = `
        <rect x="${p.wr[0] - 7}" y="${p.wr[1] - 3.5}" width="14" height="7" rx="1.5" fill="#191c22" stroke="#f59e0b" stroke-width="1.2"/>
        <rect x="${p.wr[0] - 7}" y="${p.wr[1] - 4.5}" width="4" height="9" rx="1" fill="#f59e0b"/>
        <rect x="${p.wr[0] + 3}" y="${p.wr[1] - 4.5}" width="4" height="9" rx="1" fill="#f59e0b"/>`;
    }

    const shoe = (an, fill) => {
      const sx = an[0];
      const sy = an[1];
      return `<path d="M${sx - 2 * footDir} ${sy - 2} L${sx + 8 * footDir} ${sy + 1.5} L${sx + 8 * footDir} ${sy + 3.5} L${sx - 3 * footDir} ${sy + 3.5} Z" fill="${fill}" rx="1"/>`;
    };

    // Guides: trajectory curve, spine posture line, and live joint angle arcs
    let guidesSvg = "";
    if (formGuidesOn) {
      const spineCol = formMistakeOn && (meta.mistakeType === "round_back" || meta.mistakeType === "hip_sag") ? "#ef4444" : "#22c55e";
      guidesSvg += drawTrajectory2D(rig, activeFormRigKey);
      guidesSvg += `<line x1="${p.hip[0].toFixed(1)}" y1="${p.hip[1].toFixed(1)}" x2="${p.neck[0].toFixed(1)}" y2="${p.neck[1].toFixed(1)}" stroke="${spineCol}" stroke-width="1.6" stroke-dasharray="2.5 2" opacity="0.8"/>`;

      if (meta.angleMode === "elbow") {
        guidesSvg += drawAngleArc2D(p.sh, p.el, p.wr);
      } else if (meta.angleMode === "knee") {
        guidesSvg += drawAngleArc2D(p.hip, p.kn, p.an);
        guidesSvg += drawAngleArc2D(p.neck, p.hip, p.kn);
      } else if (meta.angleMode === "hip") {
        guidesSvg += drawAngleArc2D(p.neck, p.hip, p.kn);
      } else if (meta.angleMode === "shoulder") {
        guidesSvg += drawAngleArc2D(p.hip, p.sh, p.el);
      }
    }

    svg.innerHTML = `
      <g transform="translate(10, 8)">
        ${equipSvg}

        <!-- Far-side limbs (depth) -->
        ${taperedLimb(farHip, farKn, 5.2, 3.8, "#2a303c")}
        ${taperedLimb(farKn, farAn, 3.6, 2.3, "#2a303c")}
        ${taperedLimb(farSh, farEl, 3.8, 2.8, "#4b2528")}
        ${taperedLimb(farEl, farWr, 2.8, 2.0, "#4b2528")}

        <!-- Near-side Lower Body -->
        ${taperedLimb(p.hip, p.kn, 6.2, 4.4, thighColor, "#111318")}
        ${taperedLimb(p.kn, p.an, 4.3, 2.7, calfColor, "#111318")}
        ${shoe(p.an, "#e5e7eb")}

        <!-- Neck & Structured Athletic Torso -->
        ${taperedLimb(p.neck, p.head, 3.2, 2.8, "#d1d5db")}
        ${taperedLimb(p.hip, p.neck, 5.4, 7.8, torsoColor, "#111318")}

        <!-- Head with brow orientation -->
        <circle cx="${p.head[0]}" cy="${p.head[1]}" r="8.5" fill="#191c22" stroke="#f3f4f6" stroke-width="2.2"/>
        <line x1="${p.head[0] + 2 * dir}" y1="${p.head[1] - 1.5}" x2="${p.head[0] + 7 * dir}" y2="${p.head[1] - 1.5}" stroke="#C52F3A" stroke-width="2" stroke-linecap="round"/>

        <!-- Near-side Working Arm -->
        ${taperedLimb(p.sh, p.el, 4.6, 3.3, upperArmColor, "#0b0c0e")}
        ${taperedLimb(p.el, p.wr, 3.3, 2.3, foreArmColor, "#0b0c0e")}
        <circle cx="${p.wr[0]}" cy="${p.wr[1]}" r="3" fill="#f3f4f6"/>

        <!-- Joint Markers -->
        <circle cx="${p.sh[0]}" cy="${p.sh[1]}" r="2.2" fill="#fca5a5"/>
        <circle cx="${p.el[0]}" cy="${p.el[1]}" r="1.8" fill="#fca5a5"/>
        <circle cx="${p.hip[0]}" cy="${p.hip[1]}" r="2.2" fill="#d1d5db"/>
        <circle cx="${p.kn[0]}" cy="${p.kn[1]}" r="1.8" fill="#e5e7eb"/>

        ${propSvg}
        ${guidesSvg}
      </g>
    `;
  }

  function renderFormGuideSection(ex, rigKey) {
    const el = document.getElementById("form-guide-section");
    if (!el) return;
    const meta = getFormCoachMeta(rigKey, ex);
    el.innerHTML = `
      <span class="eyebrow" style="margin-bottom:0;">Full Form Guide</span>
      <div class="form-guide-grid">
        <div class="form-guide-box">
          <strong>Setup &amp; Positioning</strong>
          ${escapeHtml(meta.setup)}
        </div>
        <div class="form-guide-box">
          <strong>Tempo &amp; Breathing</strong>
          ${escapeHtml(meta.tempo)}
        </div>
        <div class="form-guide-box">
          <strong>Target Joint Angles</strong>
          ${escapeHtml(meta.targetAngles)}
        </div>
        <div class="form-guide-box" style="border-color:rgba(239,68,68,0.4);">
          <strong style="color:#f87171;">What to Look Out For</strong>
          ${escapeHtml(meta.lookOutFor)}
        </div>
      </div>
    `;
  }

  function stepFormAnimation(ts) {
    if (!activeFormRig) return;
    if (!formLastTs) formLastTs = ts;
    const dt = Math.min(0.05, (ts - formLastTs) / 1000);
    formLastTs = ts;

    if (formAnimPlaying) {
      formAnimPhase = (formAnimPhase + dt * 0.45 * formAnimSpeed) % 1;
      const raw = formAnimPhase < 0.5 ? formAnimPhase * 2 : (1 - formAnimPhase) * 2;
      const t = Math.max(0, Math.min(1, (raw - 0.08) / 0.84));
      renderStickmanFrame(activeFormRig, t);
    }
    formAnimRaf = requestAnimationFrame(stepFormAnimation);
  }

  function openExerciseFormModal(exerciseId) {
    const ex = getExerciseById(exerciseId);
    if (!ex) return;
    const rigKey = ex.rig && FORM_RIGS[ex.rig] ? ex.rig : "curl";
    activeFormRig = FORM_RIGS[rigKey];
    activeFormRigKey = rigKey;
    activeFormExercise = ex;
    formAnimPlaying = true;
    formAnimPhase = 0;
    formLastTs = 0;
    formMistakeOn = false;

    document.getElementById("form-modal-title").textContent = ex.name;
    document.getElementById("form-modal-equip").textContent = `${ex.equipment} · Proper Form & Positioning`;
    document.getElementById("btn-form-play").textContent = "Pause";
    document.getElementById("btn-form-speed").textContent = `${formAnimSpeed.toFixed(1)}x`;

    const guidesBtn = document.getElementById("btn-form-guides");
    if (guidesBtn) {
      guidesBtn.classList.toggle("active", formGuidesOn);
      guidesBtn.textContent = formGuidesOn ? "Guides: ON" : "Guides: OFF";
    }
    const mistakeBtn = document.getElementById("btn-form-mistake");
    const mistakeNote = document.getElementById("form-mistake-note");
    if (mistakeBtn) {
      mistakeBtn.classList.remove("active");
      mistakeBtn.textContent = "Mistake: OFF";
    }
    if (mistakeNote) {
      mistakeNote.textContent = "";
      mistakeNote.classList.add("hidden");
    }

    document.getElementById("form-modal-muscles").innerHTML = `
      ${ex.primary.map((m) => `<span class="badge badge-primary">${MUSCLES[m]} (Primary)</span>`).join("")}
      ${ex.secondary.map((m) => `<span class="badge badge-secondary">${MUSCLES[m]} (Secondary)</span>`).join("")}
    `;

    const tiersEl = document.getElementById("form-modal-tiers");
    const tierHtml = renderExerciseTierTableHtml(ex);
    if (tierHtml) {
      tiersEl.innerHTML = tierHtml;
      tiersEl.querySelectorAll("[data-apply-tier]").forEach((tBtn) => {
        tBtn.addEventListener("click", () => {
          const [id, idx] = tBtn.dataset.applyTier.split(":");
          applyTierToWorkout(id, Number(idx));
        });
      });
      tiersEl.classList.remove("hidden");
    } else {
      tiersEl.innerHTML = "";
      tiersEl.classList.add("hidden");
    }

    document.getElementById("form-modal-cues").innerHTML = activeFormRig.cues
      .map((c) => `<li>${escapeHtml(c)}</li>`)
      .join("");
    renderFormGuideSection(ex, rigKey);

    if (formAnimRaf) cancelAnimationFrame(formAnimRaf);
    openModal("modal-exercise-form");
    renderStickmanFrame(activeFormRig, 0);
    formAnimRaf = requestAnimationFrame(stepFormAnimation);
  }

  function stopFormAnimation() {
    if (formAnimRaf) {
      cancelAnimationFrame(formAnimRaf);
      formAnimRaf = null;
    }
    activeFormRig = null;
    activeFormExercise = null;
  }

  /* ---------------- SMART REST TIMER (TIMESTAMP-BASED + AUDIO/VIBRATE) ---------------- */
  function playRestChime() {
    try {
      if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [880, 1174.66].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.14;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch {
      // Ignore audio restrictions
    }
  }

  function updateAutoRestButton() {
    const btn = document.getElementById("btn-auto-rest-toggle");
    if (!btn) return;
    const settings = getProfileSettings();
    btn.classList.toggle("active", Boolean(settings.autoRest));
    btn.textContent = settings.autoRest ? "Auto: ON" : "Auto: OFF";
  }

  function updateRestDisplay() {
    const disp = document.getElementById("rest-timer-display");
    const stopBtn = document.getElementById("btn-rest-stop");
    const minusBtn = document.getElementById("btn-rest-minus");
    const plusBtn = document.getElementById("btn-rest-plus");
    if (!disp || !stopBtn) return;

    const remainingSec = restEndsAt > Date.now() ? Math.ceil((restEndsAt - Date.now()) / 1000) : 0;
    const floatBar = document.getElementById("floating-rest-bar");
    const floatLbl = document.getElementById("floating-rest-label");
    if (remainingSec > 0) {
      const txt = formatDuration(remainingSec * 1000);
      disp.textContent = `Rest: ${txt}`;
      disp.style.color = "var(--primary)";
      stopBtn.classList.remove("hidden");
      minusBtn?.classList.remove("hidden");
      plusBtn?.classList.remove("hidden");
      if (floatBar && floatLbl) {
        floatLbl.textContent = `Rest ${txt}`;
        floatBar.classList.remove("hidden");
      }
    } else {
      disp.textContent = "Rest: Ready";
      disp.style.color = "";
      stopBtn.classList.add("hidden");
      minusBtn?.classList.add("hidden");
      plusBtn?.classList.add("hidden");
      floatBar?.classList.add("hidden");
    }
  }

  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator && !wakeLockSentinel) {
        wakeLockSentinel = await navigator.wakeLock.request("screen");
        wakeLockSentinel.addEventListener("release", () => {
          wakeLockSentinel = null;
        });
      }
    } catch {
      // Ignore unsupported or battery-saver wakeLock rejections
    }
  }

  function releaseWakeLock() {
    try {
      if (wakeLockSentinel) {
        wakeLockSentinel.release();
        wakeLockSentinel = null;
      }
    } catch {
      wakeLockSentinel = null;
    }
  }

  function startRestTimer(seconds) {
    stopRestTimer(false);
    const settings = getProfileSettings();
    settings.defaultRestSec = seconds;
    restEndsAt = Date.now() + seconds * 1000;
    const active = getActiveWorkout();
    if (active) active.restEndsAt = restEndsAt;
    saveState();

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    updateRestDisplay();
    restInterval = setInterval(() => {
      if (Date.now() >= restEndsAt) {
        stopRestTimer(true);
        const disp = document.getElementById("rest-timer-display");
        if (disp) {
          disp.textContent = "Rest Done!";
          disp.style.color = "var(--success)";
        }
        playRestChime();
        if (document.hidden && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("MUSCLEMAP — Rest Complete", { body: "Time for your next set." });
          } catch {
            // Ignore notification errors
          }
        }
      } else {
        updateRestDisplay();
      }
    }, 500);
  }

  function adjustRestTimer(deltaSec) {
    if (!restEndsAt || restEndsAt <= Date.now()) return;
    restEndsAt = Math.max(Date.now() + 1000, restEndsAt + deltaSec * 1000);
    const active = getActiveWorkout();
    if (active) active.restEndsAt = restEndsAt;
    saveState();
    updateRestDisplay();
  }

  function stopRestTimer(clearSaved = true) {
    if (restInterval) {
      clearInterval(restInterval);
      restInterval = null;
    }
    restEndsAt = 0;
    if (clearSaved) {
      const active = getActiveWorkout();
      if (active && active.restEndsAt) {
        active.restEndsAt = 0;
        saveState();
      }
    }
    updateRestDisplay();
  }

  function restoreRestTimerIfNeeded() {
    const active = getActiveWorkout();
    if (active && active.restEndsAt && active.restEndsAt > Date.now()) {
      const remSec = Math.ceil((active.restEndsAt - Date.now()) / 1000);
      startRestTimer(remSec);
    }
  }

  /* ---------------- PROGRESSIVE OVERLOAD ASSISTANT ---------------- */
  function getHistoricalBest1RM(exerciseId) {
    return coreGetHistoricalBest1RM(exerciseId, getProfileWorkouts(state.activeProfileId));
  }

  function getOverloadSuggestion(exerciseId) {
    const sug = coreGetOverloadSuggestion(exerciseId, getProfileWorkouts(state.activeProfileId));
    if (!sug) return null;
    let label = "";
    if (sug.lastWeightKg > 0 && sug.readyToIncrease) {
      label = `Last: ${fmtWt(sug.lastWeightKg)} × ${sug.lastReps} · Ready for ${fmtWt(sug.weightKg)} × ${sug.reps}`;
    } else if (sug.lastWeightKg > 0) {
      const stepLabel = getUnit() === "lb" ? "5 lb" : "2.5 kg";
      label = `Last: ${fmtWt(sug.lastWeightKg)} × ${sug.lastReps} · Try ${fmtWt(sug.weightKg)} × ${sug.reps} (at 12, add ${stepLabel})`;
    } else {
      label = `Target: ${sug.reps} reps (+1 rep)`;
    }
    return {
      ...sug,
      weight: sug.weightKg,
      label
    };
  }

  /* ---------------- MUSCLE STIMULUS ENGINE ---------------- */
  function computeMuscleStats(profileId, windowDays) {
    return coreComputeMuscleStats(getProfileWorkouts(profileId), MUSCLES, getExerciseById, windowDays);
  }

  function getSuggestedDay(profileId) {
    const stats7 = computeMuscleStats(profileId, "7");
    let bestRec = DAY_RECOMMENDATIONS[0];
    let lowestAvg = Infinity;

    DAY_RECOMMENDATIONS.forEach((rec) => {
      const avg = rec.focusMuscles.reduce((sum, m) => sum + (stats7[m]?.weightedSets || 0), 0) / rec.focusMuscles.length;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        bestRec = rec;
      }
    });
    return { rec: bestRec, avgSets: lowestAvg };
  }

  /* ---------------- NAVIGATION & MODALS ---------------- */
  function switchView(viewName) {
    currentView = viewName;
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById(`view-${viewName}`)?.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.nav === viewName);
    });

    const sectionTitles = {
      dashboard: "SYSTEM / 01 · OVERVIEW",
      anatomy: "SYSTEM / 01 · MUSCLE OVERVIEW",
      workout: "SYSTEM / 01 · TRAINING SYSTEM",
      library: "SYSTEM / 01 · EXERCISE LIBRARY",
      analytics: "SYSTEM / 01 · PERFORMANCE",
      guide: "SYSTEM / 01 · APP GUIDE"
    };
    const topLabel = document.getElementById("top-section-label");
    if (topLabel) topLabel.textContent = sectionTitles[viewName] || "SYSTEM / 01";

    if (viewName === "dashboard") renderDashboard();
    if (viewName === "anatomy") renderAnatomy();
    if (viewName === "workout") renderWorkoutView();
    if (viewName === "library") renderLibrary();
    if (viewName === "analytics") renderAnalytics();
    if (viewName === "guide") renderGuide();
  }

  /* ---------------- APP GUIDE & FEATURE DIRECTORY ---------------- */
  const GUIDE_SECTIONS = [
    {
      title: "Home (Training Home)",
      eyebrow: "Dashboard",
      jump: "dashboard",
      jumpLabel: "Open Home",
      items: [
        ["Overview / Training / Analytics presets", "Switch between daily summary, quick-start splits, and top PR/muscle highlights."],
        ["Session Recovery banner", "Automatically appears if you left a workout mid-session so you can Resume or Discard."],
        ["7D KPIs & Weekly Streak", "Tracks 7-day sessions, total kg lifted, working sets, and consecutive active weeks."],
        ["Customize button", "Toggle which widgets appear on your Home Overview."]
      ]
    },
    {
      title: "Map (Anatomical Heatmap)",
      eyebrow: "Muscle Stimulus",
      jump: "anatomy",
      jumpLabel: "Open Map",
      items: [
        ["Front / Back diagram", "Tap any muscle to see weighted sets, volume, last trained date, and matching exercises."],
        ["Sets / Volume / Recovery modes", "Switch between set count, kg volume, or live recovery status (Fatigued, Recovering, Fresh, Rested)."],
        ["7D / 30D / All-Time windows", "Compare short-term stimulus against long-term training focus."],
        ["Balance Diagnostics", "Checks your Push/Pull and Upper/Lower set ratios and highlights your least-trained muscle."]
      ]
    },
    {
      title: "Workout (Active Logger & Routines)",
      eyebrow: "Training",
      jump: "workout",
      jumpLabel: "Open Workout",
      items: [
        ["Blank Workout & Recommended Splits", "Start from scratch or pick Chest, Back, Legs, Shoulders, Arms, or Dumbbell-only days."],
        ["Custom Routines (Create / Edit / Reorder)", "Build your own routines and reorder exercises with up/down arrows."],
        ["Set Types (1 / W / D / F)", "Tap the set number pill to cycle Working, Warmup (W), Drop (D), or Failure (F). Warmups don't skew PRs."],
        ["Live PR! Badges & Overload Targets", "Shows your last session's weight/reps, suggests +2.5 kg or +1 rep, and flags PRs as you type."],
        ["Smart Rest Timer & Wake Lock", "Auto-starts when you check a set, adjusts -15s/+15s, keeps screen awake, and notifies when done."],
        ["Swap, Plate Calc, Notes & RPE", "Substitute exercises mid-workout, calculate barbell plates, and log per-exercise notes or RPE."]
      ]
    },
    {
      title: "Library (Exercises, Form & Tiers)",
      eyebrow: "60+ Exercises",
      jump: "library",
      jumpLabel: "Open Library",
      items: [
        ["Search & Muscle Filters", "Filter all exercises by muscle group or search by name and equipment."],
        ["2D Form & Angle Guide", "Tap Form on any exercise to see the highlighted stickman, live joint-angle measurements (°), curved movement path, Mistake: ON/OFF comparison, and the full Setup/Tempo/Look-Out-For guide."],
        ["Tier 1–4 Weight Recommendations", "When your body weight is entered in Body Info, tap Tiers or Form to see Beginner–Maximum weights and 1-tap Use."],
        ["+ Custom Exercise", "Add your own exercises with primary (1.0x) and secondary (0.5x) muscle tags."]
      ]
    },
    {
      title: "Stats (Charts, Calendar & Body Info)",
      eyebrow: "Analytics",
      jump: "analytics:charts",
      jumpLabel: "Open Stats",
      items: [
        ["Charts tab", "View 7D/30D Muscle Stimulus bar chart, Est. 1RM Strength Progression, and 8-Week Volume Trend."],
        ["Calendar tab", "Browse monthly workout dots and tap any date to inspect that day's sessions."],
        ["History & CSV Export", "Review past workouts, save any past workout as a Routine, or export everything to CSV."],
        ["Body Info tab", "Enter your weight, height, age, goal, and experience level (unlocks Tier weight recommendations) plus circumference logs."]
      ]
    },
    {
      title: "Top Bar (Profiles, Backups & Version)",
      eyebrow: "System",
      jump: "modal:profile",
      jumpLabel: "Open Profile",
      items: [
        ["User Switcher", "Keep completely separate workouts, routines, and body stats for Person 1 and Person 2."],
        ["JSON Backup & Merge Import", "Export a full JSON backup or merge-import data from another device without overwriting records."],
        ["Version Pill (v7.1)", "Tap the version badge in the top-right header anytime to check the current build and release notes."]
      ]
    }
  ];

  function handleGuideJump(target) {
    if (!target) return;
    if (target === "modal:profile") {
      renderProfileModal();
      openModal("modal-profile-data");
      return;
    }
    const [viewName, subTab] = target.split(":");
    switchView(viewName);
    if (viewName === "analytics" && subTab) {
      document.querySelector(`.analytics-tab[data-tab="${subTab}"]`)?.click();
    }
  }

  function renderGuide() {
    const container = document.getElementById("guide-directory");
    if (!container) return;
    const q = (document.getElementById("guide-search-input")?.value || "").trim().toLowerCase();

    const filtered = GUIDE_SECTIONS.map((sec) => {
      if (!q) return sec;
      const titleMatch = sec.title.toLowerCase().includes(q) || sec.eyebrow.toLowerCase().includes(q);
      const matchingItems = sec.items.filter(
        ([name, desc]) => name.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
      );
      if (titleMatch) return sec;
      if (matchingItems.length) return { ...sec, items: matchingItems };
      return null;
    }).filter(Boolean);

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No features match "${escapeHtml(q)}".</div>`;
      return;
    }

    container.innerHTML = filtered
      .map(
        (sec) => `
        <div class="card guide-card">
          <div class="card-head">
            <div>
              <span class="eyebrow">${escapeHtml(sec.eyebrow)}</span>
              <h2>${escapeHtml(sec.title)}</h2>
            </div>
            <button class="btn btn-secondary btn-sm" type="button" data-guide-jump="${escapeHtml(sec.jump)}">${escapeHtml(sec.jumpLabel)} &rarr;</button>
          </div>
          <ul class="guide-feature-list">
            ${sec.items
              .map(([name, desc]) => `<li><strong>${escapeHtml(name)}:</strong> ${escapeHtml(desc)}</li>`)
              .join("")}
          </ul>
        </div>`
      )
      .join("");
  }

  function openModal(id) {
    document.getElementById(id)?.classList.remove("hidden");
  }

  function closeModal(id) {
    if (id === "modal-exercise-form") stopFormAnimation();
    document.getElementById(id)?.classList.add("hidden");
  }

  /* ---------------- HEADER & USER SELECTION ---------------- */
  function renderHeader() {
    const profile = getActiveProfile();
    document.getElementById("active-profile-name").textContent = profile.name;
    document.getElementById("active-profile-dot").style.background = profile.color;
  }

  function renderProfileModal() {
    const list = document.getElementById("profile-select-list");
    list.innerHTML = state.profiles
      .map((p) => {
        const active = p.id === state.activeProfileId;
        const count = getProfileWorkouts(p.id).length;
        return `
          <button class="card inline-row" type="button" data-switch-profile="${p.id}" style="justify-content:space-between;align-items:center;text-align:left;cursor:pointer;border-color:${active ? p.color : "var(--border)"}">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="profile-dot" style="background:${p.color};width:12px;height:12px;"></span>
              <div>
                <strong>${escapeHtml(p.name)}</strong>
                <div class="muted-note">${count} workout${count === 1 ? "" : "s"} logged</div>
              </div>
            </div>
            ${active ? '<span class="badge badge-primary">Active</span>' : '<span class="muted-note">Select</span>'}
          </button>`;
      })
      .join("");

    document.getElementById("rename-profile-input").value = getActiveProfile().name;
    const sObj = getProfileSettings();
    const uSel = document.getElementById("pref-unit-select");
    const tSel = document.getElementById("pref-tone-select");
    if (uSel) uSel.value = sObj.unit || "kg";
    if (tSel) tSel.value = sObj.tone || "system";

    list.querySelectorAll("[data-switch-profile]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeProfileId = btn.dataset.switchProfile;
        saveState();
        renderHeader();
        renderProfileModal();
        switchView(currentView);
      });
    });
  }

  /* ---------------- DASHBOARD ---------------- */
  function switchDashPreset(preset) {
    currentDashPreset = preset;
    document.querySelectorAll(".dash-preset-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.preset === preset);
    });
    document.querySelectorAll(".dash-preset").forEach((p) => {
      p.classList.toggle("active", p.id === `dash-preset-${preset}`);
    });
  }

  function computeTrainingStreak(profileId) {
    const workouts = getProfileWorkouts(profileId);
    if (!workouts.length) return { weekCount: 0, totalDays: 0, streakWeeks: 0 };

    const uniqueDays = new Set(
      workouts.map((w) => {
        const d = new Date(w.endedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );

    const getMondayKey = (dateObj) => {
      const d = new Date(dateObj);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const weekSet = new Set(workouts.map((w) => getMondayKey(new Date(w.endedAt))));
    const thisWeekMs = getMondayKey(new Date());
    const lastWeekMs = thisWeekMs - 7 * 24 * 60 * 60 * 1000;
    let streakWeeks = 0;
    let cursor = weekSet.has(thisWeekMs) ? thisWeekMs : weekSet.has(lastWeekMs) ? lastWeekMs : null;
    while (cursor !== null && weekSet.has(cursor)) {
      streakWeeks += 1;
      cursor -= 7 * 24 * 60 * 60 * 1000;
    }

    const cutoff7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekCount = workouts.filter((w) => new Date(w.endedAt).getTime() >= cutoff7).length;
    return { weekCount, totalDays: uniqueDays.size, streakWeeks };
  }

  function applyDashboardWidgetPrefs() {
    const prefs = getDashboardPrefs();
    document.querySelectorAll("[data-dash-widget]").forEach((el) => {
      const key = el.dataset.dashWidget;
      el.classList.toggle("hidden", prefs[key] === false);
    });
  }

  function openCustomizeDashboardModal() {
    const prefs = getDashboardPrefs();
    const targetInp = document.getElementById("dash-weekly-set-target");
    if (targetInp) targetInp.value = String(getProfileSettings().weeklySetTarget || 40);
    const labels = [
      ["session", "Session Action Card"],
      ["kpis", "7-Day KPIs (Sessions, Volume, Sets)"],
      ["streak", "Training Consistency & Weekly Streak"],
      ["recommended", "Recommended Next Workout"],
      ["quick_links", "Quick Links (Map & Stats)"],
      ["recent", "Recent Sessions Overview"]
    ];
    const list = document.getElementById("customize-dash-list");
    list.innerHTML = labels
      .map(
        ([key, label]) => `
        <label class="widget-toggle-row">
          <span>${label}</span>
          <input type="checkbox" data-widget-pref="${key}" ${prefs[key] !== false ? "checked" : ""} />
        </label>`
      )
      .join("");
    openModal("modal-customize-dash");
  }

  function renderDashboardBento(allWorkouts, recent7, stats7, trainedMuscles, totalSets) {
    // 1. Mini anatomy muscle highlights + Front/Rear toggle inside hero panel
    const frontGrp = document.getElementById("dash-hero-front-group");
    const backGrp = document.getElementById("dash-hero-back-group");
    if (frontGrp && backGrp) {
      frontGrp.classList.toggle("hidden", dashHeroSide !== "front");
      backGrp.classList.toggle("hidden", dashHeroSide !== "back");
    }
    document.getElementById("btn-hero-scan-front")?.classList.toggle("active", dashHeroSide === "front");
    document.getElementById("btn-hero-scan-back")?.classList.toggle("active", dashHeroSide === "back");

    document.querySelectorAll("#dash-hero-scan-svg .dash-mini-muscle").forEach((g) => {
      const m = g.dataset.miniMuscle;
      const lvl = getHeatLevel(stats7[m]?.weightedSets || 0, "7");
      const fills = ["#23282D", "#4E1B20", "#7D2028", "#B32833", "#E3444D"];
      g.setAttribute("fill", fills[lvl] || "#23282D");
    });

    // 2. Top 6 trained muscles vertical bar chart (with hatched peak bar)
    const barsEl = document.getElementById("dash-bento-bars");
    if (barsEl) {
      const top6 = trainedMuscles.slice(0, 6);
      if (!top6.length) {
        const placeholders = ["Chest", "Lats", "Quads", "Delts", "Arms", "Core"];
        barsEl.innerHTML = placeholders
          .map((lbl) => `<div class="bento-bar-col"><span class="bento-bar-val">0</span><div class="bento-bar" style="height:10%"></div><span class="bento-bar-label">${lbl}</span></div>`)
          .join("");
      } else {
        const maxSets = Math.max(1, ...top6.map(([, v]) => v.weightedSets));
        barsEl.innerHTML = top6
          .map(([m, v], idx) => {
            const pct = Math.max(12, Math.round((v.weightedSets / maxSets) * 100));
            const valStr = v.weightedSets.toFixed(1).replace(/\.0$/, "");
            const shortName = (MUSCLES[m] || m).replace("Front ", "F.").replace("Mid ", "M.").slice(0, 6);
            return `
              <div class="bento-bar-col">
                <span class="bento-bar-val">${valStr}</span>
                <span class="bento-bar-dot" style="${idx === 0 ? "background:#E3444D;box-shadow:0 0 6px #E3444D;" : ""}"></span>
                <div class="bento-bar ${idx === 0 ? "peak" : ""}" style="height:${pct}%"></div>
                <span class="bento-bar-label">${escapeHtml(shortName)}</span>
              </div>`;
          })
          .join("");
      }
    }

    // 3. 10-segment weekly set target meter (customizable) + Push/Pull/Legs balance gauge
    const targetSets = Math.max(10, Number(getProfileSettings().weeklySetTarget) || 40);
    const fracEl = document.getElementById("dash-target-fraction");
    const meterEl = document.getElementById("dash-target-bars");
    if (fracEl) fracEl.textContent = `${totalSets} / ${targetSets} sets`;
    if (meterEl) {
      const litCount = Math.min(10, Math.round((totalSets / targetSets) * 10));
      meterEl.innerHTML = Array.from({ length: 10 }, (_, i) =>
        `<div class="bento-seg-pill ${i < litCount ? "lit" : ""}"></div>`
      ).join("");
    }

    const pplEl = document.getElementById("dash-ppl-balance");
    if (pplEl) {
      const sumW = (keys) => keys.reduce((s, k) => s + (stats7[k]?.weightedSets || 0), 0);
      const pushW = sumW(["chest", "front_delts", "side_delts", "triceps"]);
      const pullW = sumW(["lats", "mid_back", "rear_delts", "traps", "biceps"]);
      const legsW = sumW(["quads", "hamstrings", "glutes", "calves"]);
      const pplTotal = pushW + pullW + legsW;
      const pPct = pplTotal > 0 ? Math.round((pushW / pplTotal) * 100) : 34;
      const lPct = pplTotal > 0 ? Math.round((pullW / pplTotal) * 100) : 33;
      const gPct = pplTotal > 0 ? Math.max(0, 100 - pPct - lPct) : 33;
      const fmtS = (v) => v.toFixed(1).replace(/\.0$/, "");
      pplEl.innerHTML = `
        <div class="ppl-head-row">
          <span>Push / Pull / Legs (7D)</span>
          <span>${pplTotal > 0 ? `${pPct}% · ${lPct}% · ${gPct}%` : "No sets"}</span>
        </div>
        <div class="ppl-bar-track" title="Push ${fmtS(pushW)}s · Pull ${fmtS(pullW)}s · Legs ${fmtS(legsW)}s">
          <div class="ppl-seg-push" style="width:${pPct}%;"></div>
          <div class="ppl-seg-pull" style="width:${lPct}%;"></div>
          <div class="ppl-seg-legs" style="width:${gPct}%;"></div>
        </div>
        <div class="ppl-legend-row">
          <span><strong style="color:#E3444D;">PUSH</strong> ${fmtS(pushW)}s</span>
          <span><strong style="color:#A0A7AA;">PULL</strong> ${fmtS(pullW)}s</span>
          <span><strong style="color:#C98A3A;">LEGS</strong> ${fmtS(legsW)}s</span>
        </div>
      `;
    }

    // 4. 7-day Mon–Sun activity strip
    const weekEl = document.getElementById("dash-week-strip");
    if (weekEl) {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0..Sun=6
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);

      const trainedKeys = new Set(recent7.map((w) => toLocalDateKey(w.endedAt)));
      const todayKey = toLocalDateKey(now);
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      weekEl.innerHTML = dayNames
        .map((dn, idx) => {
          const d = new Date(monday);
          d.setDate(monday.getDate() + idx);
          const k = toLocalDateKey(d);
          const isTrained = trainedKeys.has(k);
          const isToday = k === todayKey;
          return `
            <div class="bento-day-pill ${isToday ? "today-day" : ""} ${isTrained ? "active-day" : ""}">
              <span>${dn}</span>
              <strong>${d.getDate()}</strong>
            </div>`;
        })
        .join("");
    }

    // 5. Chart meta (Peak muscle + 7D Avg)
    const chartMetaEl = document.getElementById("dash-chart-meta");
    if (chartMetaEl) {
      const peak = trainedMuscles[0];
      const avg = trainedMuscles.length
        ? (trainedMuscles.reduce((s, [, v]) => s + v.weightedSets, 0) / trainedMuscles.length).toFixed(1)
        : "0";
      chartMetaEl.innerHTML = `
        <div class="bento-stat">
          <span class="kpi-label">Peak Focus</span>
          <strong style="font-size:13px;">${peak ? escapeHtml(MUSCLES[peak[0]]) : "—"}</strong>
        </div>
        <div class="bento-stat">
          <span class="kpi-label">Avg / Group</span>
          <strong style="font-family:var(--font-mono);font-size:14px;">${avg} sets</strong>
        </div>
      `;
    }

    // 6. Session radial progress ring
    const ringEl = document.getElementById("dash-session-ring");
    if (ringEl) {
      const targetSessions = 5;
      const done = recent7.length;
      const pct = Math.min(1, done / targetSessions);
      const r = 34;
      const circ = 2 * Math.PI * r;
      const dash = (circ * pct).toFixed(1);
      const r2 = 25;
      const circ2 = 2 * Math.PI * r2;
      const setPct = Math.min(1, totalSets / targetSets);
      const dash2 = (circ2 * setPct).toFixed(1);
      ringEl.innerHTML = `
        <svg viewBox="0 0 88 88" width="88" height="88">
          <circle cx="44" cy="44" r="${r}" fill="none" stroke="#202629" stroke-width="6" />
          <circle cx="44" cy="44" r="${r}" fill="none" stroke="#E3444D" stroke-width="6"
                  stroke-dasharray="${dash} ${circ.toFixed(1)}" stroke-linecap="round"
                  transform="rotate(-90 44 44)" />
          <circle cx="44" cy="44" r="${r2}" fill="none" stroke="#1D2226" stroke-width="4" />
          <circle cx="44" cy="44" r="${r2}" fill="none" stroke="#C98A3A" stroke-width="4"
                  stroke-dasharray="${dash2} ${circ2.toFixed(1)}" stroke-linecap="round"
                  transform="rotate(-90 44 44)" />
          <text x="44" y="42" text-anchor="middle" fill="#F0F1F1" font-family="IBM Plex Mono, monospace" font-size="12.5" font-weight="600">${done}/${targetSessions}</text>
          <text x="44" y="54" text-anchor="middle" fill="#697277" font-family="IBM Plex Mono, monospace" font-size="7.5">7D SESS</text>
        </svg>
      `;

      const waveEl = document.getElementById("dash-hero-wave");
      if (waveEl) {
        const vals = trainedMuscles.slice(0, 6).map(([, v]) => v.weightedSets);
        const wPts = (vals.length >= 2 ? vals : [2, 5, 3, 7, 4, 6]).map((v, i, arr) => {
          const mx = Math.max(1, ...arr);
          return `${(4 + i * (112 / Math.max(1, arr.length - 1))).toFixed(1)},${(24 - (v / mx) * 18).toFixed(1)}`;
        }).join(" ");
        waveEl.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span class="kpi-label" style="margin:0;">INTENSITY</span>
            <span style="font-family:var(--font-mono);font-size:10px;color:#E3444D;">${Math.round(setPct * 100)}%</span>
          </div>
          <svg viewBox="0 0 120 28" width="100%" height="26" preserveAspectRatio="none">
            <polyline points="${wPts}" fill="none" stroke="#E3444D" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
        `;
      }
    }

    // 7. Set Target big hero number
    const bigTargetEl = document.getElementById("dash-target-big");
    if (bigTargetEl) {
      const pct = Math.min(100, Math.round((totalSets / targetSets) * 100));
      bigTargetEl.innerHTML = `${totalSets} <span class="muted-note">SETS (${pct}%)</span>`;
    }

    // 8. 7-day volume sparkline
    const sparkEl = document.getElementById("dash-week-sparkline");
    if (sparkEl) {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);
      monday.setHours(0, 0, 0, 0);

      const dayVols = Array.from({ length: 7 }, (_, idx) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + idx);
        const k = toLocalDateKey(d);
        return recent7
          .filter((w) => toLocalDateKey(w.endedAt) === k)
          .reduce((sum, w) => sum + w.exercises.reduce((es, ex) => es + ex.sets.reduce((ss, s) => ss + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0), 0), 0);
      });
      const maxV = Math.max(1, ...dayVols);
      const pts = dayVols.map((v, i) => [10 + i * 36.6, 36 - (v / maxV) * 26]);
      const poly = pts.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ");
      const area = `10,40 ${poly} 229.6,40`;
      const dots = pts.map((pt, i) => dayVols[i] > 0 ? `<circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="2.6" fill="#E3444D" />` : "").join("");
      sparkEl.innerHTML = `
        <svg viewBox="0 0 240 42" preserveAspectRatio="none">
          <polygon points="${area}" fill="rgba(197, 47, 58, 0.14)" />
          <polyline points="${poly}" fill="none" stroke="#C52F3A" stroke-width="1.8" stroke-linejoin="round" />
          ${dots}
        </svg>
      `;
    }
  }

  function renderTodayCoach(profile, allWorkouts, recent7) {
    const heroEl = document.getElementById("dash-today-hero");
    const planEl = document.getElementById("dash-my-plan");
    if (!heroEl) return;

    const s = getProfileSettings(profile.id);
    const plan = ensurePlanExists();
    const active = getActiveWorkout();
    const dayIdx = (plan.currentDayIdx || 0) % plan.days.length;
    const todayDay = plan.days[dayIdx] || plan.days[0];
    const daysGoal = plan.daysPerWeek || 3;

    let contextLine = `Your only goal this week is to show up ${daysGoal} times.`;
    if (allWorkouts.length > 0) {
      const lastW = allWorkouts[0];
      const daysAgo = Math.max(0, Math.floor((Date.now() - new Date(lastW.endedAt).getTime()) / (24 * 60 * 60 * 1000)));
      const agoStr = daysAgo === 0 ? "earlier today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`;
      contextLine = `You trained ${lastW.title} ${agoStr} — today is ${todayDay.title}.`;
    }

    const exPreviewHtml = todayDay.exercises.slice(0, 5).map((id) => {
      const ex = getExerciseById(id);
      if (!ex) return "";
      return `
        <div class="today-ex-row">
          <div>
            <strong>${escapeHtml(ex.name)}</strong>
            <div class="today-ex-reason">${escapeHtml(getExerciseWhy(id))}</div>
          </div>
          <span class="badge badge-secondary">${escapeHtml(ex.equipment)}</span>
        </div>`;
    }).join("");

    const emptyNotice = allWorkouts.length === 0
      ? `<div class="muted-note" style="margin-top:8px;color:var(--recovery);">Complete your first workout to unlock your live muscle map &amp; progress insights.</div>`
      : "";

    heroEl.innerHTML = `
      <div class="today-hero-grid">
        <div>
          <span class="eyebrow">TODAY'S WORKOUT · ${escapeHtml(plan.name)}</span>
          <h2 style="font-size:22px;margin-bottom:4px;">${active ? escapeHtml(active.title || "Active Session") : escapeHtml(todayDay.title)}</h2>
          <p class="muted-note">${escapeHtml(contextLine)}</p>
          ${emptyNotice}
          <div class="today-ex-list">${exPreviewHtml}</div>
        </div>
        <div class="today-cta-box">
          <div class="card-head">
            <span class="kpi-label">Estimated Time</span>
            <strong style="font-family:var(--font-mono);">~${s.sessionMinutes || 45} min</strong>
          </div>
          <div class="card-head">
            <span class="kpi-label">This Week</span>
            <strong style="font-family:var(--font-mono);">${recent7.length} / ${daysGoal} sessions</strong>
          </div>
          <div class="card-head">
            <span class="kpi-label">Focus</span>
            <span class="muted-note">${escapeHtml(todayDay.focus)}</span>
          </div>
          <button id="btn-today-start" class="btn btn-primary btn-full" type="button">
            ${active ? "Resume Active Workout →" : `Start ${escapeHtml(todayDay.label)} →`}
          </button>
          <button id="btn-today-swap-day" class="btn btn-ghost btn-sm" type="button">
            Switch to another plan day
          </button>
        </div>
      </div>
    `;

    document.getElementById("btn-today-start")?.addEventListener("click", () => {
      if (getActiveWorkout()) switchView("workout");
      else startPlanDay(dayIdx);
    });
    document.getElementById("btn-today-swap-day")?.addEventListener("click", () => {
      plan.currentDayIdx = (dayIdx + 1) % plan.days.length;
      saveState();
      renderDashboard();
    });

    if (planEl) {
      planEl.classList.remove("hidden");
      planEl.innerHTML = `
        <div class="card-head">
          <div>
            <span class="eyebrow">MY PLAN · ${escapeHtml(plan.name)}</span>
            <strong>${recent7.length} of ${daysGoal} workouts completed this week</strong>
          </div>
          <button id="btn-plan-edit" class="link-btn" type="button">Customize Plan</button>
        </div>
        <div class="plan-days-row">
          ${plan.days.map((d, idx) => `
            <button class="plan-day-pill ${idx === dayIdx ? "next-day" : ""}" type="button" data-start-plan-day="${idx}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${escapeHtml(d.label)}</strong>
                ${idx === dayIdx ? '<span class="badge badge-primary">Up Next</span>' : '<span class="muted-note">Start</span>'}
              </div>
              <div class="muted-note" style="margin-top:3px;">${escapeHtml(d.title)}</div>
            </button>
          `).join("")}
        </div>
      `;
      document.getElementById("btn-plan-edit")?.addEventListener("click", openOnboardingModal);
      planEl.querySelectorAll("[data-start-plan-day]").forEach((btn) => {
        btn.addEventListener("click", () => startPlanDay(Number(btn.dataset.startPlanDay)));
      });
    }
  }

  function renderDashboard() {
    const profile = getActiveProfile();
    document.getElementById("dash-greeting").textContent = `Hey, ${profile.name}`;

    const active = getActiveWorkout();
    const recoveryEl = document.getElementById("dash-recovery-banner");
    if (active) {
      const doneSets = active.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
        0
      );
      const elapsed = formatDuration(Date.now() - new Date(active.startedAt).getTime());
      recoveryEl.classList.remove("hidden");
      recoveryEl.innerHTML = `
        <div>
          <span class="eyebrow">Session Recovery</span>
          <strong>${escapeHtml(active.title || "Active Workout")}</strong>
          <div class="muted-note">${active.exercises.length} exercises · ${doneSets} completed sets · ${elapsed} elapsed</div>
        </div>
        <div class="btn-row">
          <button id="btn-recover-resume" class="btn btn-primary btn-sm" type="button">Resume</button>
          <button id="btn-recover-discard" class="btn btn-danger-ghost btn-sm" type="button">Discard</button>
        </div>
      `;
      document.getElementById("btn-recover-resume").addEventListener("click", () => switchView("workout"));
      document.getElementById("btn-recover-discard").addEventListener("click", () => {
        if (confirm("Discard this saved active session?")) {
          stopRestTimer();
          setActiveWorkout(null);
          renderDashboard();
        }
      });
    } else {
      recoveryEl.classList.add("hidden");
      recoveryEl.innerHTML = "";
    }

    document.getElementById("dash-session-heading").textContent = active ? "Active Session in Progress" : "Ready to train";
    document.getElementById("btn-dash-start").textContent = active ? "Resume Workout" : "+ Start Workout";

    const allWorkouts = getProfileWorkouts(profile.id);
    const cutoff7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent7 = allWorkouts.filter((w) => new Date(w.endedAt).getTime() >= cutoff7);

    const kpis7 = computeWindowKpis(recent7);
    const totalSets = kpis7.workingSets;
    const totalVol = kpis7.volumeKg;

    renderTodayCoach(profile, allWorkouts, recent7);
    document.getElementById("kpi-workouts-7d").textContent = String(recent7.length);
    document.getElementById("kpi-volume-7d").textContent = fmtWt(totalVol);
    document.getElementById("kpi-sets-7d").textContent = String(totalSets);

    const streak = computeTrainingStreak(profile.id);
    const streakEl = document.getElementById("dash-streak-card");
    if (streakEl) {
      streakEl.innerHTML = `
        <div class="card-head">
          <div>
            <span class="eyebrow">Consistency</span>
            <strong>${streak.streakWeeks} Week${streak.streakWeeks === 1 ? "" : "s"} Active Streak</strong>
          </div>
          <span class="badge badge-secondary">${streak.totalDays} total days</span>
        </div>
      `;
    }

    const { rec } = getSuggestedDay(profile.id);
    const focusEl = document.getElementById("dash-focus-banner");
    focusEl.innerHTML = `
      <div>
        <span class="eyebrow">Recommended Next</span>
        <strong>${escapeHtml(rec.title)}</strong>
        <div class="muted-note">Targets ${rec.focusMuscles.map((m) => MUSCLES[m]).join(", ")}</div>
      </div>
      <button class="btn btn-primary btn-sm" type="button" data-preview-rec="${rec.id}">View</button>
    `;
    focusEl.querySelector("[data-preview-rec]").addEventListener("click", () => openRecommendationModal(rec.id));

    const stats7 = computeMuscleStats(profile.id, "7");
    const trainedMuscles = Object.entries(stats7)
      .filter(([, v]) => v.weightedSets > 0)
      .sort((a, b) => b[1].weightedSets - a[1].weightedSets);

    document.getElementById("dash-stimulus-summary").textContent = trainedMuscles.length
      ? `${trainedMuscles.length} muscle group${trainedMuscles.length === 1 ? "" : "s"} stimulated in 7D`
      : "View 7-day anatomical heatmap";

    const prMap = new Map();
    allWorkouts.forEach((w) => {
      const legacy = w.schemaVersion == null;
      w.exercises.forEach((item) => {
        const ex = getExerciseById(item.exerciseId);
        if (!ex) return;
        item.sets.forEach((s) => {
          if (!isWorkingCompletedSet(s, legacy)) return;
          const weight = Number(s.weight) || 0;
          const reps = Number(s.reps) || 0;
          if (weight <= 0 || reps <= 0) return;
          const est1RM = computeSet1RM(weight, reps);
          const prev = prMap.get(ex.id);
          if (!prev || est1RM > prev.est1RM) {
            prMap.set(ex.id, { name: ex.name, est1RM, weight, reps, date: w.endedAt });
          }
        });
      });
    });
    const topPRs = Array.from(prMap.values()).sort((a, b) => b.est1RM - a.est1RM);

    document.getElementById("dash-pr-summary").textContent = topPRs.length
      ? `${topPRs.length} exercise PR${topPRs.length === 1 ? "" : "s"} tracked · View 1RM charts`
      : "View 1RM progression & charts";

    const recentOverviewEl = document.getElementById("dash-recent-overview");
    if (recentOverviewEl) {
      const top3 = allWorkouts.slice(0, 3);
      recentOverviewEl.innerHTML = `
        <div class="card-head" style="margin-bottom:8px;">
          <div>
            <span class="eyebrow">Recent</span>
            <strong>Last Sessions</strong>
          </div>
          <button class="link-btn" type="button" data-nav-history="1">All</button>
        </div>
        ${
          top3.length
            ? `<div class="card-stack">${top3
                .map(
                  (w) => `
                  <div class="muscle-ex-item" data-open-workout="${w.id}" style="cursor:pointer;">
                    <span><strong>${escapeHtml(w.title)}</strong></span>
                    <span class="muted-note">${formatDate(w.endedAt)}</span>
                  </div>`
                )
                .join("")}</div>`
            : `<div class="muted-note">No completed sessions yet.</div>`
        }
      `;
      recentOverviewEl.querySelector("[data-nav-history]")?.addEventListener("click", () => {
        switchView("analytics");
        document.querySelector('.analytics-tab[data-tab="history"]')?.click();
      });
      recentOverviewEl.querySelectorAll("[data-open-workout]").forEach((el) => {
        el.addEventListener("click", () => openWorkoutDetail(el.dataset.openWorkout));
      });
    }

    renderDashboardBento(allWorkouts, recent7, stats7, trainedMuscles, totalSets);
    applyDashboardWidgetPrefs();

    const recScroll = document.getElementById("dash-recommendations");
    recScroll.innerHTML = DAY_RECOMMENDATIONS.map(
      (r) => `
      <div class="rec-card">
        <div>
          <strong>${escapeHtml(r.title)}</strong>
          <div class="muted-note" style="margin-top:3px;">${r.exercises.length} exercises</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-secondary btn-sm" type="button" data-preview-rec="${r.id}">Preview</button>
          <button class="btn btn-primary btn-sm" type="button" data-start-rec="${r.id}">Start</button>
        </div>
      </div>`
    ).join("");

    recScroll.querySelectorAll("[data-preview-rec]").forEach((b) => {
      b.addEventListener("click", () => openRecommendationModal(b.dataset.previewRec));
    });
    recScroll.querySelectorAll("[data-start-rec]").forEach((b) => {
      b.addEventListener("click", () => startWorkoutFromRecommendation(b.dataset.startRec));
    });

    const feed = document.getElementById("dash-recent-workouts");
    const userWorkouts = allWorkouts.slice(0, 6);
    if (!userWorkouts.length) {
      feed.innerHTML = `<div class="empty-state">No workouts logged for <strong>${escapeHtml(profile.name)}</strong> yet. Tap <strong>+ Blank Workout</strong> or pick a recommended day above.</div>`;
    } else {
      feed.innerHTML = userWorkouts
        .map((w) => {
          const vol = computeWorkoutTotals(w).workingVolumeKg;
          return `
            <div class="card" data-open-workout="${w.id}" style="cursor:pointer;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${escapeHtml(w.title)}</strong>
                <span class="muted-note">${formatDate(w.endedAt)}</span>
              </div>
              <div class="muted-note" style="margin-top:4px;">
                ${w.exercises.length} exercises • ${fmtWt(vol)}
              </div>
            </div>`;
        })
        .join("");

      feed.querySelectorAll("[data-open-workout]").forEach((card) => {
        card.addEventListener("click", () => openWorkoutDetail(card.dataset.openWorkout));
      });
    }

    const topMusclesEl = document.getElementById("dash-top-muscles");
    if (!trainedMuscles.length) {
      topMusclesEl.innerHTML = `<div class="empty-state">Log a workout to see your 7-day muscle stimulus breakdown.</div>`;
    } else {
      topMusclesEl.innerHTML = trainedMuscles
        .slice(0, 5)
        .map(([key, val]) => `
          <div class="muscle-ex-item">
            <strong>${MUSCLES[key]}</strong>
            <span class="muted-note">${val.weightedSets.toFixed(1).replace(/\.0$/, "")} sets · ${fmtWt(val.volume)}</span>
          </div>`
        )
        .join("");
    }

    const topPrsEl = document.getElementById("dash-top-prs");
    if (!topPRs.length) {
      topPrsEl.innerHTML = `<div class="empty-state">Log weighted sets to track your estimated 1RM records.</div>`;
    } else {
      topPrsEl.innerHTML = topPRs
        .slice(0, 5)
        .map((pr) => `
          <div class="muscle-ex-item">
            <div>
              <strong>${escapeHtml(pr.name)}</strong>
              <div class="muted-note">${fmtWt(pr.weight)} × ${pr.reps} · ${formatDate(pr.date)}</div>
            </div>
            <span class="badge badge-primary">${fmtWt(pr.est1RM)} 1RM</span>
          </div>`
        )
        .join("");
    }
  }

  /* ---------------- RECOMMENDATIONS ---------------- */
  function openRecommendationModal(recId) {
    const rec = DAY_RECOMMENDATIONS.find((r) => r.id === recId);
    if (!rec) return;
    document.getElementById("rec-modal-title").textContent = rec.title;
    document.getElementById("rec-modal-body").innerHTML = `
      <p class="muted-note">${escapeHtml(rec.summary)}</p>
      <div class="badge-row">
        ${rec.focusMuscles.map((m) => `<span class="badge badge-primary">${MUSCLES[m]}</span>`).join("")}
      </div>
      <div class="card-stack">
        ${rec.exercises
          .map((item) => {
            const ex = getExerciseById(item.id);
            if (!ex) return "";
            return `
              <div class="muscle-ex-item">
                <span><strong>${escapeHtml(ex.name)}</strong></span>
                <div class="btn-row" style="align-items:center;">
                  <span class="badge badge-secondary">${escapeHtml(item.scheme)}</span>
                  <button class="btn btn-ghost btn-sm" type="button" data-open-form="${ex.id}">Form</button>
                </div>
              </div>`;
          })
          .join("")}
      </div>
      <button id="btn-modal-start-rec" class="btn btn-primary btn-full" type="button">Start ${escapeHtml(rec.title)}</button>
    `;
    document.getElementById("rec-modal-body").querySelectorAll("[data-open-form]").forEach((b) => {
      b.addEventListener("click", () => openExerciseFormModal(b.dataset.openForm));
    });
    document.getElementById("btn-modal-start-rec").addEventListener("click", () => {
      closeModal("modal-recommendation-detail");
      startWorkoutFromRecommendation(rec.id);
    });
    openModal("modal-recommendation-detail");
  }

  function startWorkoutFromRecommendation(recId) {
    const rec = DAY_RECOMMENDATIONS.find((r) => r.id === recId);
    if (!rec) return;
    state.activeWorkouts[state.activeProfileId] = {
      id: uid("wk"),
      title: rec.title,
      startedAt: new Date().toISOString(),
      exercises: rec.exercises
        .filter((item) => getExerciseById(item.id))
        .map((item) => ({
          exerciseId: item.id,
          sets: [{ weight: "", reps: "", completed: false }]
        }))
    };
    saveState();
    switchView("workout");
  }

  /* ---------------- ANATOMICAL HEATMAP ---------------- */

  function renderBalancePanel(stats) {
    const el = document.getElementById("anatomy-balance-panel");
    if (!el) return;

    const sumSets = (keys) => keys.reduce((sum, k) => sum + (stats[k]?.weightedSets || 0), 0);
    const pushSets = sumSets(["chest", "front_delts", "triceps"]);
    const pullSets = sumSets(["lats", "mid_back", "rear_delts", "biceps"]);
    const upperSets = sumSets(["chest", "front_delts", "side_delts", "rear_delts", "traps", "lats", "mid_back", "biceps", "triceps", "forearms"]);
    const lowerSets = sumSets(["quads", "hamstrings", "glutes", "calves"]);

    const quadSets = stats.quads?.weightedSets || 0;
    const hamSets = stats.hamstrings?.weightedSets || 0;

    const pushPullRatio = pullSets > 0 ? (pushSets / pullSets).toFixed(2) : pushSets > 0 ? "∞" : "—";
    const upperLowerRatio = lowerSets > 0 ? (upperSets / lowerSets).toFixed(2) : upperSets > 0 ? "∞" : "—";
    const quadHamRatio = hamSets > 0 ? (quadSets / hamSets).toFixed(2) : quadSets > 0 ? "∞" : "—";

    const ppPct = pushSets + pullSets > 0 ? Math.round((pushSets / (pushSets + pullSets)) * 100) : 50;
    const ulPct = upperSets + lowerSets > 0 ? Math.round((upperSets / (upperSets + lowerSets)) * 100) : 50;

    const lowestMuscle = Object.entries(stats)
      .sort((a, b) => a[1].weightedSets - b[1].weightedSets)[0];

    el.innerHTML = `
      <span class="eyebrow">Balance Diagnostics</span>
      <div class="balance-grid">
        <div class="kpi-box">
          <span class="kpi-label">Push / Pull Ratio</span>
          <strong class="kpi-value">${pushPullRatio}</strong>
          <span class="muted-note">${pushSets.toFixed(1).replace(/\.0$/, "")} vs ${pullSets.toFixed(1).replace(/\.0$/, "")} sets</span>
          <div class="balance-bar-track"><div class="balance-bar-left" style="width:${ppPct}%"></div><div class="balance-bar-right" style="width:${100 - ppPct}%"></div></div>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Upper / Lower</span>
          <strong class="kpi-value">${upperLowerRatio}</strong>
          <span class="muted-note">${upperSets.toFixed(1).replace(/\.0$/, "")} vs ${lowerSets.toFixed(1).replace(/\.0$/, "")} sets</span>
          <div class="balance-bar-track"><div class="balance-bar-left" style="width:${ulPct}%"></div><div class="balance-bar-right" style="width:${100 - ulPct}%"></div></div>
        </div>
      </div>
      <div class="muted-note">Quad / Hamstring ratio: <strong>${quadHamRatio}</strong> (${quadSets.toFixed(1).replace(/\.0$/, "")} vs ${hamSets.toFixed(1).replace(/\.0$/, "")} sets)</div>
      ${
        pushSets > pullSets * 1.4 && pushSets >= 3
          ? `<div class="muted-note" style="color:var(--recovery);">Coach tip: You've done more push than pull this week — add a row or pulldown next session.</div>`
          : pullSets > pushSets * 1.4 && pullSets >= 3
          ? `<div class="muted-note" style="color:var(--recovery);">Coach tip: Strong pulling week — balance it with a chest or shoulder press next session.</div>`
          : lowestMuscle
          ? `<div class="muted-note">Least stimulated this window: <strong>${MUSCLES[lowestMuscle[0]]}</strong> (${lowestMuscle[1].weightedSets.toFixed(1).replace(/\.0$/, "")} sets)</div>`
          : ""
      }
    `;
  }

  function renderAnatomy() {
    document.getElementById("svg-front").classList.toggle("active", currentSide === "front");
    document.getElementById("svg-back").classList.toggle("active", currentSide === "back");
    document.getElementById("btn-view-front").classList.toggle("active", currentSide === "front");
    document.getElementById("btn-view-back").classList.toggle("active", currentSide === "back");

    document.querySelectorAll(".anatomy-tab-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.anatomyTab === currentAnatomyTab);
    });

    const cutoff =
      currentWindow === "all" ? 0 : Date.now() - Number(currentWindow) * 24 * 60 * 60 * 1000;
    const windowWorkouts = getProfileWorkouts(state.activeProfileId).filter(
      (w) => new Date(w.endedAt).getTime() >= cutoff
    );
    const windowLabel =
      currentWindow === "7" ? "7-Day" : currentWindow === "30" ? "30-Day" : "All-Time";
    const metricLabel =
      currentMetric === "sets" ? "Stimulus" : currentMetric === "volume" ? "Volume" : "Recovery";
    document.getElementById("heatmap-window-summary").textContent =
      `${windowLabel} ${metricLabel} · ${windowWorkouts.length} workout${windowWorkouts.length === 1 ? "" : "s"} · Tap any muscle`;

    const stats = computeMuscleStats(state.activeProfileId, currentWindow);
    const allTimeStats = currentMetric === "recovery" ? computeMuscleStats(state.activeProfileId, "all") : stats;
    const maxVol = Math.max(1, ...Object.values(stats).map((s) => s.volume || 0));

    document.querySelectorAll(".muscle-part").forEach((el) => {
      const m = el.dataset.muscle;
      el.classList.remove(
        "heat-0", "heat-1", "heat-2", "heat-3", "heat-4",
        "heat-rec-fresh", "heat-rec-recovering", "heat-rec-fatigued", "heat-rec-rested",
        "selected"
      );

      if (currentMetric === "recovery") {
        const rec = getRecoveryState(allTimeStats[m]?.lastTrained);
        el.classList.add(rec.className);
      } else if (currentMetric === "volume") {
        const vol = stats[m]?.volume || 0;
        const ratio = vol / maxVol;
        const level = vol <= 0 ? 0 : ratio < 0.25 ? 1 : ratio < 0.5 ? 2 : ratio < 0.8 ? 3 : 4;
        el.classList.add(`heat-${level}`);
      } else {
        const level = getHeatLevel(stats[m]?.weightedSets || 0, currentWindow);
        el.classList.add(`heat-${level}`);
      }

      if (m === selectedMuscle) el.classList.add("selected");
    });

    renderMusclePanel(stats, allTimeStats);
    renderAnatomyTabSummary(stats, allTimeStats);
    renderBalancePanel(stats);
  }

  function renderAnatomyTabSummary(stats, allTimeStats) {
    const el = document.getElementById("anatomy-tab-summary");
    if (!el) return;
    if (currentAnatomyTab === "overview") {
      el.innerHTML = "";
      return;
    }
    if (currentAnatomyTab === "stimulus") {
      const top = Object.entries(stats)
        .filter(([, v]) => v.weightedSets > 0)
        .sort((a, b) => b[1].weightedSets - a[1].weightedSets)
        .slice(0, 4);
      el.innerHTML = `
        <span class="eyebrow">Stimulus Leaders (${currentWindow === "all" ? "ALL" : currentWindow + "D"})</span>
        ${top.length
          ? top.map(([m, v]) => `<div class="muscle-ex-item"><strong>${MUSCLES[m]}</strong><span class="muted-note">${v.weightedSets.toFixed(1).replace(/\.0$/, "")} weighted sets</span></div>`).join("")
          : `<div class="muted-note">No stimulus logged in this window.</div>`}
      `;
    } else if (currentAnatomyTab === "volume") {
      const top = Object.entries(stats)
        .filter(([, v]) => v.volume > 0)
        .sort((a, b) => b[1].volume - a[1].volume)
        .slice(0, 4);
      el.innerHTML = `
        <span class="eyebrow">Volume Leaders (${currentWindow === "all" ? "ALL" : currentWindow + "D"})</span>
        ${top.length
          ? top.map(([m, v]) => `<div class="muscle-ex-item"><strong>${MUSCLES[m]}</strong><span class="muted-note">${fmtWt(v.volume)}</span></div>`).join("")
          : `<div class="muted-note">No volume logged in this window.</div>`}
      `;
    } else if (currentAnatomyTab === "frequency") {
      const entries = Object.entries(allTimeStats).map(([m, v]) => ({
        m,
        last: v.lastTrained,
        rec: getRecoveryState(v.lastTrained)
      }));
      const fatigued = entries.filter((e) => e.rec.className === "heat-rec-fatigued").length;
      const recovering = entries.filter((e) => e.rec.className === "heat-rec-recovering").length;
      const ready = entries.length - fatigued - recovering;
      el.innerHTML = `
        <span class="eyebrow">Recovery &amp; Frequency</span>
        <div class="balance-grid">
          <div class="kpi-box"><span class="kpi-label">Fatigued / Rec</span><strong class="kpi-value">${fatigued} / ${recovering}</strong></div>
          <div class="kpi-box"><span class="kpi-label">Fresh / Rested</span><strong class="kpi-value">${ready}</strong></div>
        </div>
      `;
    }
  }

  function renderMusclePanel(stats, allTimeStats = stats) {
    const statusEl = document.getElementById("muscle-panel-status");
    const nameEl = document.getElementById("muscle-panel-name");
    const statsGrid = document.getElementById("muscle-panel-stats");
    const filterBtn = document.getElementById("btn-filter-by-muscle");
    const exList = document.getElementById("muscle-panel-exercises");

    if (!selectedMuscle) {
      statusEl.textContent = "Select a muscle";
      nameEl.textContent = "Tap the diagram above";
      statsGrid.classList.add("hidden");
      filterBtn.classList.add("hidden");
      exList.innerHTML = "";
      return;
    }

    const s = stats[selectedMuscle] || { weightedSets: 0, volume: 0, lastTrained: null };
    if (currentMetric === "recovery") {
      statusEl.textContent = getRecoveryState(allTimeStats[selectedMuscle]?.lastTrained).label;
    } else {
      const level = getHeatLevel(s.weightedSets, currentWindow);
      const labels = ["Untrained", "Light Stimulus", "Moderate Load", "High Volume", "Peak Load"];
      statusEl.textContent = labels[level];
    }

    nameEl.textContent = MUSCLES[selectedMuscle] || selectedMuscle;
    statsGrid.classList.remove("hidden");
    filterBtn.classList.remove("hidden");

    document.getElementById("muscle-stat-sets").textContent = s.weightedSets.toFixed(1).replace(/\.0$/, "");
    document.getElementById("muscle-stat-volume").textContent = fmtWt(s.volume);
    document.getElementById("muscle-stat-last").textContent = s.lastTrained ? formatDate(s.lastTrained) : "Never";

    const matching = state.exercises.filter(
      (ex) => ex.primary.includes(selectedMuscle) || ex.secondary.includes(selectedMuscle)
    );

    exList.innerHTML = matching
      .map((ex) => {
        const isPrimary = ex.primary.includes(selectedMuscle);
        return `
          <div class="muscle-ex-item">
            <span>${escapeHtml(ex.name)} <span class="muted-note">(${escapeHtml(ex.equipment)})</span></span>
            <div class="btn-row" style="align-items:center;">
              <span class="badge ${isPrimary ? "badge-primary" : "badge-secondary"}">
                ${isPrimary ? "1.0x" : "0.5x"}
              </span>
              <button class="btn btn-ghost btn-sm" type="button" data-open-form="${ex.id}">Form</button>
            </div>
          </div>`;
      })
      .join("");

    exList.querySelectorAll("[data-open-form]").forEach((btn) => {
      btn.addEventListener("click", () => openExerciseFormModal(btn.dataset.openForm));
    });
  }

  /* ---------------- WORKOUT RUNNER & ROUTINES ---------------- */
  function getActiveWorkout() {
    return state.activeWorkouts[state.activeProfileId] || null;
  }

  function setActiveWorkout(workout) {
    state.activeWorkouts[state.activeProfileId] = workout;
    saveState();
  }

  function startBlankWorkout() {
    setActiveWorkout({
      id: uid("wk"),
      title: "Evening Session",
      startedAt: new Date().toISOString(),
      exercises: []
    });
    switchView("workout");
  }

  function startWorkoutFromRoutine(routineId) {
    const routine = getProfileRoutines().find((r) => r.id === routineId);
    if (!routine) return;
    setActiveWorkout({
      id: uid("wk"),
      title: routine.name,
      startedAt: new Date().toISOString(),
      exercises: routine.exerciseIds
        .filter((id) => getExerciseById(id))
        .map((id) => ({
          exerciseId: id,
          sets: [{ weight: "", reps: "", completed: false }]
        }))
    });
    switchView("workout");
  }

  function openSwapModal(exIdx) {
    const active = getActiveWorkout();
    if (!active || !active.exercises[exIdx]) return;
    swapTargetExIdx = exIdx;
    const sourceEx = getExerciseById(active.exercises[exIdx].exerciseId);
    document.getElementById("swap-source-info").textContent = sourceEx
      ? `Replacing ${sourceEx.name} (${sourceEx.primary.map((m) => MUSCLES[m]).join(", ")})`
      : "";
    document.getElementById("swap-search-input").value = "";
    renderSwapList("");
    openModal("modal-exercise-swap");
  }

  function renderSwapList(query) {
    const active = getActiveWorkout();
    if (!active || swapTargetExIdx === null) return;
    const sourceEx = getExerciseById(active.exercises[swapTargetExIdx]?.exerciseId);
    if (!sourceEx) return;

    const q = query.trim().toLowerCase();
    const scored = state.exercises
      .filter((ex) => ex.id !== sourceEx.id)
      .map((ex) => {
        let score = 0;
        ex.primary.forEach((m) => {
          if (sourceEx.primary.includes(m)) score += 3;
          else if (sourceEx.secondary.includes(m)) score += 1;
        });
        ex.secondary.forEach((m) => {
          if (sourceEx.primary.includes(m)) score += 1.5;
          else if (sourceEx.secondary.includes(m)) score += 0.5;
        });
        return { ex, score };
      })
      .filter(({ ex }) => {
        if (!q) return true;
        return (
          ex.name.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q) ||
          ex.primary.some((m) => MUSCLES[m].toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.score - a.score || a.ex.name.localeCompare(b.ex.name));

    const list = document.getElementById("swap-exercise-list");
    list.innerHTML = scored
      .slice(0, 25)
      .map(
        ({ ex, score }) => `
        <div class="swap-card">
          <div>
            <strong>${escapeHtml(ex.name)}</strong>
            <div class="muted-note">${escapeHtml(ex.equipment)} · ${ex.primary.map((m) => MUSCLES[m]).join(", ")}</div>
            ${score > 0 ? `<span class="swap-score">Match score: ${score.toFixed(1).replace(/\.0$/, "")}</span>` : ""}
          </div>
          <button class="btn btn-primary btn-sm" type="button" data-confirm-swap="${ex.id}">Swap</button>
        </div>`
      )
      .join("");

    list.querySelectorAll("[data-confirm-swap]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (active && active.exercises[swapTargetExIdx]) {
          active.exercises[swapTargetExIdx].exerciseId = btn.dataset.confirmSwap;
          active.exercises[swapTargetExIdx].sets.forEach((s) => {
            s.completed = false;
          });
          saveState();
          closeModal("modal-exercise-swap");
          renderWorkoutView();
        }
      });
    });
  }

  function openPlateCalculator(prefillWeight) {
    const input = document.getElementById("plate-target-weight");
    if (prefillWeight && Number(prefillWeight) > 0) {
      input.value = String(prefillWeight);
    }
    renderPlateCalculation();
    openModal("modal-plate-calc");
  }

  function renderPlateCalculation() {
    const target = Number(document.getElementById("plate-target-weight").value) || 0;
    const bar = Number(document.getElementById("plate-bar-weight").value) || 0;
    const resultEl = document.getElementById("plate-calc-result");

    if (target < bar) {
      resultEl.innerHTML = `<div class="muted-note">Target weight (${target} kg) is less than the bar weight (${bar} kg).</div>`;
      return;
    }

    const plateSizes = [25, 20, 15, 10, 5, 2.5, 1.25];
    let perSideRemaining = (target - bar) / 2;
    const platesPerSide = [];

    for (const p of plateSizes) {
      while (perSideRemaining >= p - 0.001) {
        platesPerSide.push(p);
        perSideRemaining -= p;
      }
    }

    const achievedPerSide = platesPerSide.reduce((s, p) => s + p, 0);
    const achievedTotal = bar + achievedPerSide * 2;
    const counts = {};
    platesPerSide.forEach((p) => {
      counts[p] = (counts[p] || 0) + 1;
    });

    const summaryText = platesPerSide.length
      ? Object.entries(counts)
          .map(([p, c]) => `${c} × ${p} kg`)
          .join(" + ")
      : "Empty bar (no plates)";

    const chipClass = (p) => `p${String(p).replace(".", "_")}`;

    resultEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>Per Side: ${escapeHtml(summaryText)}</strong>
        <span class="badge badge-primary">${achievedTotal} kg total</span>
      </div>
      ${
        Math.abs(achievedTotal - target) > 0.01
          ? `<div class="muted-note" style="color:var(--warning);">Nearest standard load: ${achievedTotal} kg (diff ${(achievedTotal - target).toFixed(2)} kg)</div>`
          : ""
      }
      <div class="plate-bar-visual">
        <div class="plate-sleeve"></div>
        ${platesPerSide.map((p) => `<span class="plate-chip ${chipClass(p)}">${p}</span>`).join("")}
      </div>
    `;
  }

  function renderWorkoutView() {
    const active = getActiveWorkout();
    const idleEl = document.getElementById("workout-idle");
    const activeEl = document.getElementById("workout-active");

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (!active) {
      document.body.classList.remove("workout-focused");
      releaseWakeLock();
      stopRestTimer(false);
      idleEl.classList.remove("hidden");
      activeEl.classList.add("hidden");
      const planBox = document.getElementById("train-my-plan-box");
      if (planBox) {
        const plan = ensurePlanExists();
        const dayIdx = (plan.currentDayIdx || 0) % plan.days.length;
        planBox.innerHTML = `
          <div class="card-head">
            <div>
              <span class="eyebrow">MY PLAN · ${escapeHtml(plan.name)}</span>
              <strong>Recommended Program</strong>
            </div>
            <span class="muted-note">~${plan.estimatedMinutes || 45} min/session</span>
          </div>
          <div class="plan-days-row">
            ${plan.days.map((d, idx) => `
              <button class="plan-day-pill ${idx === dayIdx ? "next-day" : ""}" type="button" data-train-plan-day="${idx}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong>${escapeHtml(d.label)}</strong>
                  ${idx === dayIdx ? '<span class="badge badge-primary">Today</span>' : '<span class="muted-note">Start</span>'}
                </div>
                <div class="muted-note" style="margin-top:3px;">${escapeHtml(d.title)}</div>
              </button>
            `).join("")}
          </div>
        `;
        planBox.querySelectorAll("[data-train-plan-day]").forEach((btn) => {
          btn.addEventListener("click", () => startPlanDay(Number(btn.dataset.trainPlanDay)));
        });
      }
      renderWorkoutRecommendations();
      renderRoutinesList();
      return;
    }

    document.body.classList.add("workout-focused");
    requestWakeLock();
    idleEl.classList.add("hidden");
    activeEl.classList.remove("hidden");
    const unitBtn = document.getElementById("btn-unit-toggle");
    if (unitBtn) unitBtn.textContent = `Unit: ${getUnit().toUpperCase()}`;
    const totalW = active.exercises.reduce((s, ex) => s + ex.sets.length, 0);
    const doneW = active.exercises.reduce((s, ex) => s + ex.sets.filter((st) => st.completed).length, 0);
    const progPill = document.getElementById("workout-progress-pill");
    if (progPill) progPill.textContent = `${doneW} / ${totalW} sets`;
    document.getElementById("workout-title-input").value = active.title;
    updateAutosaveIndicator();
    updateAutoRestButton();
    restoreRestTimerIfNeeded();

    const updateTimer = () => {
      const elapsed = Date.now() - new Date(active.startedAt).getTime();
      document.getElementById("workout-timer").textContent = formatDuration(elapsed);
    };
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);

    const container = document.getElementById("active-exercises-list");
    if (!active.exercises.length) {
      container.innerHTML = `<div class="empty-state">Tap <strong>+ Add Exercise</strong> below to start logging sets.</div>`;
      return;
    }

    const computeIsPR = (s, histBest1RM) => {
      if (s.type === "W") return false;
      const set1RM = computeSet1RM(s.weight, s.reps);
      return set1RM > 0 && (histBest1RM === 0 || set1RM > histBest1RM);
    };

    container.innerHTML = active.exercises
      .map((item, exIdx) => {
        const ex = getExerciseById(item.exerciseId);
        if (!ex) return "";
        const lastHint = getLastExerciseSummary(ex.id);
        const overload = getOverloadSuggestion(ex.id);
        const histBest1RM = getHistoricalBest1RM(ex.id);

        const setsHtml = item.sets
          .map((s, setIdx) => {
            const isPR = computeIsPR(s, histBest1RM);
            const setType = s.type || "";
            const typeLabel = setType || String(setIdx + 1);
            const typeTitle = setType === "W" ? "Warmup (excluded from stats)" : setType === "D" ? "Drop set" : setType === "F" ? "Failure set" : "Working set (tap to cycle W/D/F)";
            const dispWt = s.weight === "" || s.weight == null ? "" : String(kgToDisplay(s.weight));
            return `
              <div class="set-row ${setType === "W" ? "warmup-row" : ""}" data-set-row="${exIdx}:${setIdx}">
                <span class="set-num">
                  <button class="set-type-btn ${setType ? `type-${setType}` : ""}" type="button" title="${typeTitle}" data-cycle-type="${exIdx}:${setIdx}">${typeLabel}</button>
                  <span class="pr-badge ${isPR ? "" : "hidden"}" data-pr-badge="${exIdx}:${setIdx}">PR!</span>
                </span>
                <input class="set-input" type="number" step="0.5" min="0" placeholder="${getUnit()}" value="${dispWt}" data-ex="${exIdx}" data-set="${setIdx}" data-field="weight" />
                <input class="set-input" type="number" min="0" placeholder="reps" value="${s.reps}" data-ex="${exIdx}" data-set="${setIdx}" data-field="reps" />
                <button class="set-check ${s.completed ? "done" : ""}" type="button" data-toggle-set="${exIdx}:${setIdx}">✓</button>
                <button class="set-del" type="button" data-del-set="${exIdx}:${setIdx}">&times;</button>
              </div>`;
          })
          .join("");

        const rigCue = (FORM_RIGS[ex.rig]?.cues?.[0]) || "";
        const savedSetup = getProfileSettings().exerciseSettings?.[ex.id] || "";
        return `
          <div class="ex-log-card">
            <div class="ex-log-head">
              <div>
                <strong>${escapeHtml(ex.name)}</strong>
                <div class="ex-reason-line">${escapeHtml(getExerciseWhy(ex.id))}</div>
                ${lastHint ? `<div class="last-hint">${escapeHtml(lastHint)}</div>` : ""}
                <div class="badge-row">
                  ${ex.primary.map((m) => `<span class="badge badge-primary">${MUSCLES[m]}</span>`).join("")}
                  ${ex.secondary.map((m) => `<span class="badge badge-secondary">${MUSCLES[m]}</span>`).join("")}
                </div>
              </div>
              <div class="btn-row">
                ${ex.equipment === "Barbell" ? `<button class="btn btn-ghost btn-sm" type="button" data-open-plates="${exIdx}">Plates</button>` : ""}
                <button class="btn btn-ghost btn-sm" type="button" data-swap-ex="${exIdx}">Swap</button>
                <button class="btn btn-ghost btn-sm" type="button" data-open-form="${ex.id}">Form</button>
                <button class="btn btn-danger-ghost btn-sm" type="button" data-remove-ex="${exIdx}">Remove</button>
              </div>
            </div>
            ${
              overload
                ? `<div class="overload-bar">
                    <span class="overload-text">${escapeHtml(overload.label)}</span>
                    <button class="btn btn-secondary btn-sm" type="button" data-apply-target="${exIdx}">Apply Target</button>
                  </div>`
                : ""
            }
            <div class="set-grid-head">
              <span>Set</span><span>Weight</span><span>Reps</span><span>Done</span><span></span>
            </div>
            ${setsHtml}
            ${rigCue ? `<div class="inline-cue-bar"><strong>Form cue:</strong> ${escapeHtml(rigCue)}</div>` : ""}
            <div class="ex-meta-row">
              <input class="ex-note-input" type="text" placeholder="Remembered setup (e.g., seat pin 4, 30° bench)..." value="${escapeHtml(item.note || savedSetup)}" data-ex-note="${exIdx}" />
              <input class="ex-rpe-input" type="number" step="0.5" min="5" max="10" placeholder="RPE" value="${item.rpe ?? ""}" data-ex-rpe="${exIdx}" />
            </div>
            <button class="btn btn-secondary btn-sm" type="button" data-add-set="${exIdx}">+ Add Set</button>
          </div>`;
      })
      .join("");

    container.querySelectorAll("[data-open-form]").forEach((btn) => {
      btn.addEventListener("click", () => openExerciseFormModal(btn.dataset.openForm));
    });

    container.querySelectorAll("[data-swap-ex]").forEach((btn) => {
      btn.addEventListener("click", () => openSwapModal(Number(btn.dataset.swapEx)));
    });

    container.querySelectorAll("[data-open-plates]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const exIdx = Number(btn.dataset.openPlates);
        const firstW = active.exercises[exIdx]?.sets.find((s) => Number(s.weight) > 0)?.weight || 60;
        openPlateCalculator(firstW);
      });
    });

    container.querySelectorAll("[data-apply-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const exIdx = Number(btn.dataset.applyTarget);
        const exItem = active.exercises[exIdx];
        if (!exItem) return;
        const overload = getOverloadSuggestion(exItem.exerciseId);
        if (!overload) return;
        exItem.sets.forEach((s) => {
          if (!s.completed && s.type !== "W") {
            if (overload.weightKg > 0) s.weight = String(overload.weightKg);
            s.reps = String(overload.reps);
          }
        });
        saveState();
        renderWorkoutView();
      });
    });

    container.querySelectorAll("[data-cycle-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [exIdx, setIdx] = btn.dataset.cycleType.split(":").map(Number);
        const setObj = active.exercises[exIdx]?.sets[setIdx];
        if (!setObj) return;
        const order = ["", "W", "D", "F"];
        const next = order[(order.indexOf(setObj.type || "") + 1) % order.length];
        setObj.type = next;
        saveState();
        renderWorkoutView();
      });
    });

    container.querySelectorAll("[data-ex-note]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const exIdx = Number(inp.dataset.exNote);
        if (active.exercises[exIdx]) {
          active.exercises[exIdx].note = inp.value;
          const s = getProfileSettings();
          if (!s.exerciseSettings) s.exerciseSettings = {};
          s.exerciseSettings[active.exercises[exIdx].exerciseId] = inp.value;
          saveState();
        }
      });
    });

    container.querySelectorAll("[data-ex-rpe]").forEach((inp) => {
      inp.addEventListener("input", () => {
        const exIdx = Number(inp.dataset.exRpe);
        if (active.exercises[exIdx]) {
          active.exercises[exIdx].rpe = inp.value;
          saveState();
        }
      });
    });

    container.querySelectorAll(".set-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const { ex, set, field } = inp.dataset;
        const exIdx = Number(ex);
        const setIdx = Number(set);
        const exItem = active.exercises[exIdx];
        const setObj = exItem.sets[setIdx];
        if (field === "weight") {
          setObj.weight = inp.value === "" ? "" : String(displayToKg(inp.value));
        } else {
          setObj[field] = inp.value;
        }
        saveState();
        const badge = container.querySelector(`[data-pr-badge="${exIdx}:${setIdx}"]`);
        if (badge) {
          const histBest = getHistoricalBest1RM(exItem.exerciseId);
          badge.classList.toggle("hidden", !computeIsPR(setObj, histBest));
        }
      });
    });

    container.querySelectorAll("[data-toggle-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [exIdx, setIdx] = btn.dataset.toggleSet.split(":").map(Number);
        const exItem = active.exercises[exIdx];
        const setObj = exItem.sets[setIdx];
        const nextCompleted = !setObj.completed;

        if (nextCompleted && !setObj.weight && !setObj.reps) {
          const prevSet = setIdx > 0 ? exItem.sets[setIdx - 1] : null;
          if (prevSet && (prevSet.weight || prevSet.reps)) {
            setObj.weight = prevSet.weight;
            setObj.reps = prevSet.reps;
          } else {
            const overload = getOverloadSuggestion(exItem.exerciseId);
            if (overload) {
              if (overload.weightKg > 0) setObj.weight = String(overload.weightKg);
              setObj.reps = String(overload.reps);
            }
          }
        }

        setObj.completed = nextCompleted;
        setObj.status = nextCompleted ? "completed" : "planned";
        saveState();
        if (nextCompleted && getProfileSettings().autoRest) {
          startRestTimer(getProfileSettings().defaultRestSec || 90);
        }
        renderWorkoutView();
      });
    });

    container.querySelectorAll("[data-del-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [exIdx, setIdx] = btn.dataset.delSet.split(":").map(Number);
        active.exercises[exIdx].sets.splice(setIdx, 1);
        saveState();
        renderWorkoutView();
      });
    });

    container.querySelectorAll("[data-add-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const exIdx = Number(btn.dataset.addSet);
        const prev = active.exercises[exIdx].sets.at(-1);
        active.exercises[exIdx].sets.push({
          weight: prev ? prev.weight : "",
          reps: prev ? prev.reps : "",
          type: "",
          completed: false
        });
        saveState();
        renderWorkoutView();
      });
    });

    container.querySelectorAll("[data-remove-ex]").forEach((btn) => {
      btn.addEventListener("click", () => {
        active.exercises.splice(Number(btn.dataset.removeEx), 1);
        saveState();
        renderWorkoutView();
      });
    });
  }

  function renderWorkoutRecommendations() {
    const list = document.getElementById("workout-recommendations-list");
    list.innerHTML = DAY_RECOMMENDATIONS.map(
      (rec) => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <div>
            <strong>${escapeHtml(rec.title)}</strong>
            <div class="muted-note">${escapeHtml(rec.summary)}</div>
          </div>
          <div class="btn-row">
            <button class="btn btn-secondary btn-sm" type="button" data-preview-rec="${rec.id}">View</button>
            <button class="btn btn-primary btn-sm" type="button" data-start-rec="${rec.id}">Start</button>
          </div>
        </div>
      </div>`
    ).join("");

    list.querySelectorAll("[data-preview-rec]").forEach((b) => {
      b.addEventListener("click", () => openRecommendationModal(b.dataset.previewRec));
    });
    list.querySelectorAll("[data-start-rec]").forEach((b) => {
      b.addEventListener("click", () => startWorkoutFromRecommendation(b.dataset.startRec));
    });
  }

  function openRoutineModal(routineId = null) {
    editingRoutineId = routineId;
    const routine = routineId ? getProfileRoutines().find((r) => r.id === routineId) : null;
    document.getElementById("routine-modal-title").textContent = routine ? "Edit Routine" : "Create Routine";
    document.getElementById("routine-name-input").value = routine ? routine.name : "";

    const selectedIds = routine ? [...routine.exerciseIds] : [];
    const selectedSet = new Set(selectedIds);
    const orderedExercises = [
      ...selectedIds.map((id) => getExerciseById(id)).filter(Boolean),
      ...state.exercises.filter((ex) => !selectedSet.has(ex.id))
    ];

    const listEl = document.getElementById("routine-exercise-checklist");
    listEl.innerHTML = orderedExercises
      .map(
        (ex) => `
        <div class="routine-order-row" data-routine-row="${ex.id}">
          <label>
            <input type="checkbox" name="routineEx" value="${ex.id}" ${selectedSet.has(ex.id) ? "checked" : ""} />
            <span>${escapeHtml(ex.name)}</span>
          </label>
          <div class="btn-row" style="gap:4px;">
            <button class="btn btn-ghost btn-sm" type="button" data-move-ex="up" title="Move up">&uarr;</button>
            <button class="btn btn-ghost btn-sm" type="button" data-move-ex="down" title="Move down">&darr;</button>
          </div>
        </div>`
      )
      .join("");

    listEl.querySelectorAll("[data-move-ex]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest("[data-routine-row]");
        if (!row) return;
        if (btn.dataset.moveEx === "up" && row.previousElementSibling) {
          listEl.insertBefore(row, row.previousElementSibling);
        } else if (btn.dataset.moveEx === "down" && row.nextElementSibling) {
          listEl.insertBefore(row.nextElementSibling, row);
        }
      });
    });

    openModal("modal-routine");
  }

  function renderRoutinesList() {
    const list = document.getElementById("routines-list");
    const routines = getProfileRoutines();
    if (!routines.length) {
      list.innerHTML = `<div class="empty-state">No custom routines saved for ${escapeHtml(getActiveProfile().name)}.</div>`;
      return;
    }

    list.innerHTML = routines
      .map((r) => {
        const names = r.exerciseIds
          .map((id) => getExerciseById(id)?.name)
          .filter(Boolean)
          .join(", ");
        return `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong>${escapeHtml(r.name)}</strong>
              <div class="btn-row">
                <button class="btn btn-primary btn-sm" type="button" data-run-routine="${r.id}">Start</button>
                <button class="btn btn-secondary btn-sm" type="button" data-edit-routine="${r.id}">Edit</button>
                <button class="btn btn-danger-ghost btn-sm" type="button" data-del-routine="${r.id}">&times;</button>
              </div>
            </div>
            <p class="muted-note" style="margin-top:6px;">${escapeHtml(names || "Empty routine")}</p>
          </div>`;
      })
      .join("");

    list.querySelectorAll("[data-run-routine]").forEach((b) => {
      b.addEventListener("click", () => startWorkoutFromRoutine(b.dataset.runRoutine));
    });
    list.querySelectorAll("[data-edit-routine]").forEach((b) => {
      b.addEventListener("click", () => openRoutineModal(b.dataset.editRoutine));
    });
    list.querySelectorAll("[data-del-routine]").forEach((b) => {
      b.addEventListener("click", () => {
        state.routines[state.activeProfileId] = getProfileRoutines().filter((r) => r.id !== b.dataset.delRoutine);
        saveState();
        renderRoutinesList();
      });
    });
  }

  function getWorkoutSummaryMetrics(workout) {
    const totals = computeWorkoutTotals(workout);
    const legacy = workout.schemaVersion == null;
    const muscleWeights = new Map();
    const exBreakdown = [];

    (workout.exercises || []).forEach((item) => {
      const ex = getExerciseById(item.exerciseId);
      const sets = (item.sets || []).filter((s) => isWorkingCompletedSet(s, legacy));
      if (!sets.length) return;
      const vol = sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
      let bestSet = sets[0];
      let best1RM = 0;
      sets.forEach((s) => {
        const est = computeSet1RM(s.weight, s.reps);
        if (est >= best1RM) {
          best1RM = est;
          bestSet = s;
        }
      });
      exBreakdown.push({
        name: ex ? ex.name : "Exercise",
        setsCount: sets.length,
        volume: vol,
        topSetLabel: `${fmtWt(bestSet.weight)} × ${Number(bestSet.reps) || 0}`
      });
      if (ex) {
        (ex.primary || []).forEach((m) => muscleWeights.set(m, (muscleWeights.get(m) || 0) + sets.length));
        (ex.secondary || []).forEach((m) => muscleWeights.set(m, (muscleWeights.get(m) || 0) + sets.length * 0.5));
      }
    });

    const muscles = Array.from(muscleWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([m, w]) => ({ key: m, label: MUSCLES[m] || m, sets: w }));

    return {
      durationMs: totals.durationMs,
      workingSets: totals.workingSets,
      totalVolume: totals.workingVolumeKg,
      muscles,
      exBreakdown
    };
  }

  function downloadWorkoutSummaryPng(workout, newPRs = []) {
    const m = getWorkoutSummaryMetrics(workout);
    const profile = getActiveProfile();
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background & Swiss Grid
    ctx.fillStyle = "#0B0D0F";
    ctx.fillRect(0, 0, 800, 640);
    ctx.strokeStyle = "rgba(43, 49, 53, 0.28)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 800; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke();
    }
    for (let y = 0; y <= 640; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
    }

    // Outer card frame + crimson top edge
    ctx.fillStyle = "rgba(17, 20, 22, 0.94)";
    ctx.fillRect(36, 36, 728, 568);
    ctx.strokeStyle = "#2B3135";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 728, 568);
    ctx.fillStyle = "#E3444D";
    ctx.fillRect(36, 36, 728, 3);

    // Header
    ctx.fillStyle = "#E3444D";
    ctx.font = "600 12px 'IBM Plex Mono', monospace";
    ctx.fillText("MUSCLEMAP // SYSTEM 01 · SESSION TELEMETRY", 64, 76);

    ctx.fillStyle = "#F0F1F1";
    ctx.font = "700 30px 'Space Grotesk', sans-serif";
    ctx.fillText((workout.title || "Workout").slice(0, 32), 64, 114);

    ctx.fillStyle = "#A0A7AA";
    ctx.font = "400 13px 'IBM Plex Mono', monospace";
    const dateStr = new Date(workout.endedAt).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    ctx.fillText(`${profile.name} · ${dateStr}`, 64, 138);

    // KPI Boxes
    const kpis = [
      { label: "DURATION", val: m.durationMs > 0 ? formatDuration(m.durationMs) : "—" },
      { label: "WORKING SETS", val: String(m.workingSets) },
      { label: "TOTAL VOLUME", val: fmtWt(m.totalVolume) },
      { label: "NEW 1RM PRS", val: String(newPRs.length) }
    ];
    kpis.forEach((k, idx) => {
      const bx = 64 + idx * 172;
      const by = 162;
      ctx.fillStyle = "#171B1E";
      ctx.fillRect(bx, by, 158, 74);
      ctx.strokeStyle = idx === 3 && newPRs.length > 0 ? "#C52F3A" : "#202629";
      ctx.strokeRect(bx, by, 158, 74);
      ctx.fillStyle = "#697277";
      ctx.font = "500 11px 'IBM Plex Mono', monospace";
      ctx.fillText(k.label, bx + 14, by + 24);
      ctx.fillStyle = idx === 3 && newPRs.length > 0 ? "#E3444D" : "#F0F1F1";
      ctx.font = "700 22px 'IBM Plex Mono', monospace";
      ctx.fillText(k.val, bx + 14, by + 56);
    });

    // Stimulated Muscles
    ctx.fillStyle = "#697277";
    ctx.font = "500 11px 'IBM Plex Mono', monospace";
    ctx.fillText("STIMULATED MUSCLES", 64, 268);
    const muscleLine = m.muscles.slice(0, 6).map((x) => `${x.label} (${x.sets.toFixed(1).replace(/\.0$/, "")}s)`).join("  ·  ") || "None logged";
    ctx.fillStyle = "#F0F1F1";
    ctx.font = "500 14px 'Space Grotesk', sans-serif";
    ctx.fillText(muscleLine.slice(0, 78), 64, 292);

    // PRs or Exercise Breakdown
    let curY = 330;
    if (newPRs.length) {
      ctx.fillStyle = "#E3444D";
      ctx.font = "600 11px 'IBM Plex Mono', monospace";
      ctx.fillText("NEW PERSONAL RECORDS", 64, curY);
      curY += 22;
      newPRs.slice(0, 3).forEach((pr) => {
        ctx.fillStyle = "#F0F1F1";
        ctx.font = "600 14px 'Space Grotesk', sans-serif";
        ctx.fillText(`★ ${pr.name}: ${fmtWt(pr.weightKg)} × ${pr.reps} (${fmtWt(pr.est1RMKg)} 1RM)`, 64, curY);
        curY += 22;
      });
      curY += 10;
    }

    ctx.fillStyle = "#697277";
    ctx.font = "500 11px 'IBM Plex Mono', monospace";
    ctx.fillText("EXERCISE BREAKDOWN", 64, curY);
    curY += 22;
    m.exBreakdown.slice(0, newPRs.length ? 5 : 8).forEach((ex) => {
      ctx.fillStyle = "#F0F1F1";
      ctx.font = "500 14px 'Space Grotesk', sans-serif";
      ctx.fillText(ex.name.slice(0, 36), 64, curY);
      ctx.fillStyle = "#A0A7AA";
      ctx.font = "500 13px 'IBM Plex Mono', monospace";
      ctx.fillText(`${ex.setsCount} sets · Top ${ex.topSetLabel} · ${fmtWt(ex.volume)}`, 380, curY);
      curY += 24;
    });

    // Footer
    ctx.fillStyle = "#697277";
    ctx.font = "400 11px 'IBM Plex Mono', monospace";
    ctx.fillText(`MUSCLEMAP ${APP_VERSION} · GENERATED LOCALLY`, 64, 582);

    const link = document.createElement("a");
    link.download = `musclemap_${(workout.title || "workout").toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${new Date(workout.endedAt).toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function openWorkoutSummaryModal(workout, newPRs = [], isJustFinished = false) {
    if (!workout) return;
    const m = getWorkoutSummaryMetrics(workout);
    const titleEl = document.getElementById("summary-modal-title");
    const dateEl = document.getElementById("summary-modal-date");
    const bodyEl = document.getElementById("summary-modal-body");
    if (titleEl) titleEl.textContent = workout.title || "Workout Summary";
    if (dateEl) dateEl.textContent = new Date(workout.endedAt).toLocaleString();
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="kpi-grid">
          <div class="kpi-box"><span class="kpi-label">Duration</span><strong class="kpi-value">${m.durationMs > 0 ? formatDuration(m.durationMs) : "—"}</strong></div>
          <div class="kpi-box"><span class="kpi-label">Working Sets</span><strong class="kpi-value">${m.workingSets}</strong></div>
          <div class="kpi-box"><span class="kpi-label">Total Volume</span><strong class="kpi-value">${fmtWt(m.totalVolume)}</strong></div>
        </div>
        ${
          newPRs.length
            ? `<div class="card" style="border-color:rgba(227,68,77,0.5);">
                <span class="eyebrow" style="color:#E3444D;">New 1RM Personal Records (${newPRs.length})</span>
                <div class="card-stack" style="margin-top:6px;">
                  ${newPRs
                    .map(
                      (pr) => `<div class="muscle-ex-item"><strong>${escapeHtml(pr.name)}</strong><span class="badge badge-primary">${fmtWt(pr.weightKg)} × ${pr.reps} · ${fmtWt(pr.est1RMKg)} 1RM</span></div>`
                    )
                    .join("")}
                </div>
              </div>`
            : ""
        }
        <div>
          <span class="eyebrow">Stimulated Muscles</span>
          <div class="badge-row">
            ${
              m.muscles.length
                ? m.muscles.map((x) => `<span class="badge badge-secondary">${escapeHtml(x.label)} (${x.sets.toFixed(1).replace(/\.0$/, "")}s)</span>`).join("")
                : `<span class="muted-note">No working sets logged</span>`
            }
          </div>
        </div>
        <div>
          <span class="eyebrow">Exercise Breakdown</span>
          <div class="card-stack">
            ${m.exBreakdown
              .map(
                (ex) => `<div class="muscle-ex-item"><span><strong>${escapeHtml(ex.name)}</strong></span><span class="muted-note">${ex.setsCount} sets · ${escapeHtml(ex.topSetLabel)} · ${fmtWt(ex.volume)}</span></div>`
              )
              .join("")}
          </div>
        </div>
      `;
    }
    const dlBtn = document.getElementById("btn-download-summary-png");
    if (dlBtn) dlBtn.onclick = () => downloadWorkoutSummaryPng(workout, newPRs);
    const mapBtn = document.getElementById("btn-summary-open-map");
    if (mapBtn) {
      mapBtn.onclick = () => {
        closeModal("modal-workout-summary");
        switchView("anatomy");
      };
    }
    const refBox = document.getElementById("summary-reflection-box");
    const refNote = document.getElementById("summary-reflection-note");
    if (refBox && refNote) {
      refBox.classList.toggle("hidden", !isJustFinished);
      refNote.textContent = "";
      refBox.querySelectorAll("[data-reflect]").forEach((btn) => {
        btn.onclick = () => {
          const val = btn.dataset.reflect;
          const sObj = getProfileSettings();
          if (val === "hard") {
            sObj.hardStreak = (sObj.hardStreak || 0) + 1;
            refNote.textContent = sObj.hardStreak >= 2
              ? "Two tough sessions in a row — consider a lighter recovery day or 1 fewer set per exercise next time."
              : "Got it — we'll keep weights steady next session so you can adapt comfortably.";
          } else if (val === "easy") {
            sObj.hardStreak = 0;
            refNote.textContent = "Great — next session we'll nudge your rep or weight target slightly higher.";
          } else {
            sObj.hardStreak = 0;
            refNote.textContent = "Right in the sweet spot. Consistency like this drives steady progress.";
          }
          saveState();
        };
      });
    }
    openModal("modal-workout-summary");
  }

  function finishWorkout() {
    const active = getActiveWorkout();
    if (!active) return;

    const title = document.getElementById("workout-title-input").value.trim() || "Workout";
    const finalized = finalizeActiveWorkout(active, {
      title,
      profileId: state.activeProfileId,
      weightsAreCanonicalKg: active.weightUnit === "kg"
    });

    if (!finalized.ok) {
      alert("Check off at least one completed set (✓) before saving.");
      return;
    }

    const savedWorkout = finalized.workout;
    const newPRs = computePersonalRecords(
      savedWorkout.exercises,
      getProfileWorkouts(state.activeProfileId),
      getExerciseById
    );

    state.workouts.push(savedWorkout);
    const sObj = getProfileSettings();
    if (sObj.plan && sObj.plan.days && sObj.plan.days.length) {
      const usedIdx = typeof active.planDayIdx === "number" ? active.planDayIdx : (sObj.plan.currentDayIdx || 0);
      sObj.plan.currentDayIdx = (usedIdx + 1) % sObj.plan.days.length;
    }

    document.body.classList.remove("workout-focused");
    releaseWakeLock();
    stopRestTimer();
    setActiveWorkout(null);
    switchView("anatomy");
    openWorkoutSummaryModal(savedWorkout, newPRs, true);
  }

  /* ---------------- EXERCISE PICKER & LIBRARY ---------------- */
  function openExercisePicker() {
    document.getElementById("picker-search-input").value = "";
    renderExercisePickerList("");
    openModal("modal-exercise-picker");
  }

  function renderExercisePickerList(query) {
    const q = query.trim().toLowerCase();
    const list = document.getElementById("picker-exercise-list");
    const filtered = state.exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        ex.primary.some((m) => MUSCLES[m].toLowerCase().includes(q))
    );

    list.innerHTML = filtered
      .map(
        (ex) => `
        <button class="card" type="button" data-pick-ex="${ex.id}" style="text-align:left;cursor:pointer;">
          <strong>${escapeHtml(ex.name)}</strong>
          <div class="muted-note">${escapeHtml(ex.equipment)} • ${ex.primary.map((m) => MUSCLES[m]).join(", ")}</div>
        </button>`
      )
      .join("");

    list.querySelectorAll("[data-pick-ex]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const active = getActiveWorkout();
        if (active) {
          active.exercises.push({
            exerciseId: btn.dataset.pickEx,
            sets: [{ weight: "", reps: "", completed: false }]
          });
          saveState();
          closeModal("modal-exercise-picker");
          renderWorkoutView();
        }
      });
    });
  }

  function renderLibrary() {
    const pillsEl = document.getElementById("muscle-filter-pills");
    const keys = ["all", ...Object.keys(MUSCLES)];
    pillsEl.innerHTML = keys
      .map(
        (k) => `
        <button class="filter-pill ${libraryMuscleFilter === k ? "active" : ""}" type="button" data-lib-filter="${k}">
          ${k === "all" ? "All Muscles" : MUSCLES[k]}
        </button>`
      )
      .join("");

    pillsEl.querySelectorAll("[data-lib-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        libraryMuscleFilter = btn.dataset.libFilter;
        renderLibrary();
      });
    });

    const q = document.getElementById("exercise-search-input").value.trim().toLowerCase();
    const filtered = state.exercises.filter((ex) => {
      const matchesMuscle =
        libraryMuscleFilter === "all" ||
        ex.primary.includes(libraryMuscleFilter) ||
        ex.secondary.includes(libraryMuscleFilter);
      const matchesText =
        !q || ex.name.toLowerCase().includes(q) || ex.equipment.toLowerCase().includes(q);
      return matchesMuscle && matchesText;
    });

    const listEl = document.getElementById("exercise-library-list");
    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-state">No exercises match that filter.</div>`;
      return;
    }

    const hasBodyInfo = getUserEffectiveWeight() !== null;

    listEl.innerHTML = filtered
      .map(
        (ex) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <strong>${escapeHtml(ex.name)}</strong>
              <div class="muted-note">${escapeHtml(ex.equipment)}</div>
            </div>
            <div class="btn-row">
              ${hasBodyInfo ? `<button class="btn btn-secondary btn-sm" type="button" data-toggle-tiers="${ex.id}">Tiers</button>` : ""}
              <button class="btn btn-ghost btn-sm" type="button" data-open-form="${ex.id}">Form</button>
            </div>
          </div>
          <div class="badge-row">
            ${ex.primary.map((m) => `<span class="badge badge-primary">${MUSCLES[m]} (1.0x)</span>`).join("")}
            ${ex.secondary.map((m) => `<span class="badge badge-secondary">${MUSCLES[m]} (0.5x)</span>`).join("")}
          </div>
          ${hasBodyInfo ? `<div class="lib-tier-box hidden" data-tiers-for="${ex.id}"></div>` : ""}
        </div>`
      )
      .join("");

    listEl.querySelectorAll("[data-open-form]").forEach((btn) => {
      btn.addEventListener("click", () => openExerciseFormModal(btn.dataset.openForm));
    });

    if (hasBodyInfo) {
      listEl.querySelectorAll("[data-toggle-tiers]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const exId = btn.dataset.toggleTiers;
          const box = listEl.querySelector(`[data-tiers-for="${exId}"]`);
          const ex = getExerciseById(exId);
          if (!box || !ex) return;
          const isHidden = box.classList.contains("hidden");
          if (isHidden) {
            box.innerHTML = renderExerciseTierTableHtml(ex);
            box.querySelectorAll("[data-apply-tier]").forEach((tBtn) => {
              tBtn.addEventListener("click", () => {
                const [id, idx] = tBtn.dataset.applyTier.split(":");
                applyTierToWorkout(id, Number(idx));
              });
            });
            box.classList.remove("hidden");
            btn.textContent = "Hide Tiers";
          } else {
            box.classList.add("hidden");
            btn.textContent = "Tiers";
          }
        });
      });
    }
  }

  function openCustomExerciseModal() {
    const buildGrid = (containerId, name) => {
      document.getElementById(containerId).innerHTML = Object.entries(MUSCLES)
        .map(
          ([key, label]) => `
          <label class="chip-toggle">
            <input type="checkbox" name="${name}" value="${key}" />
            <span>${label}</span>
          </label>`
        )
        .join("");
    };
    buildGrid("custom-ex-primary-grid", "primaryMuscle");
    buildGrid("custom-ex-secondary-grid", "secondaryMuscle");
    document.getElementById("form-custom-exercise").reset();
    openModal("modal-custom-exercise");
  }

  /* ---------------- ANALYTICS, CALENDAR, HISTORY & FULL BODY INFO ---------------- */
  function renderAnalyticsInsights() {
    const el = document.getElementById("analytics-insights-row");
    if (!el) return;
    const stats7 = computeMuscleStats(state.activeProfileId, "7");
    const statsAll = computeMuscleStats(state.activeProfileId, "all");
    const workouts = getProfileWorkouts(state.activeProfileId);
    if (!workouts.length) {
      el.innerHTML = `<div class="insight-card"><strong>No training insights yet</strong><div class="muted-note">Log your first session to see weekly volume and recovery trends here.</div></div>`;
      return;
    }
    const top7 = Object.entries(stats7).sort((a, b) => b[1].weightedSets - a[1].weightedSets)[0];
    const legSets = (stats7.quads?.weightedSets || 0) + (stats7.hamstrings?.weightedSets || 0);
    const legLast = statsAll.quads?.lastTrained || statsAll.hamstrings?.lastTrained;
    const legDaysAgo = legLast ? Math.floor((Date.now() - new Date(legLast).getTime()) / (24 * 60 * 60 * 1000)) : null;

    const cards = [];
    if (top7 && top7[1].weightedSets > 0) {
      cards.push(`<div class="insight-card positive"><strong>Top Focus: ${MUSCLES[top7[0]]}</strong><div class="muted-note">You logged ${top7[1].weightedSets.toFixed(1).replace(/\.0$/, "")} working sets for ${MUSCLES[top7[0]]} in the last 7 days.</div></div>`);
    }
    if (legSets === 0) {
      const msg = legDaysAgo !== null ? `Legs haven't been trained in ${legDaysAgo} days.` : "No leg sets logged yet this week.";
      cards.push(`<div class="insight-card attention"><strong>Lower Body Check</strong><div class="muted-note">${msg}</div></div>`);
    } else {
      cards.push(`<div class="insight-card positive"><strong>Lower Body Active</strong><div class="muted-note">${legSets.toFixed(1).replace(/\.0$/, "")} quad &amp; hamstring sets completed in the last 7 days.</div></div>`);
    }
    const plan = ensurePlanExists();
    const recentCount = workouts.filter((w) => Date.now() - new Date(w.endedAt).getTime() <= 7 * 86400000).length;
    cards.push(`<div class="insight-card"><strong>Weekly Adherence</strong><div class="muted-note">${recentCount} of ${plan.daysPerWeek || 3} planned sessions completed this week.</div></div>`);
    el.innerHTML = cards.join("");
  }

  function renderAnalytics() {
    renderAnalyticsInsights();
    renderVolumeChart();
    populateStrengthSelect();
    renderStrengthChart();
    renderWeeklyTrendChart();
    renderCalendar();
    renderWorkoutHistory();
    renderBodyStats();
  }

  function renderWeeklyTrendChart() {
    if (typeof Chart === "undefined") return;
    const canvas = document.getElementById("chart-weekly-trend");
    if (!canvas) return;

    const unit = getUnit();
    const weeks = buildWeeklyVolumeSeries(
      getProfileWorkouts(state.activeProfileId),
      unit,
      coreKgToDisplay
    );

    if (charts.weeklyTrend) charts.weeklyTrend.destroy();
    const ctx = canvas.getContext("2d");
    charts.weeklyTrend = new Chart(ctx, {
      type: "line",
      data: {
        labels: weeks.map((w) => w.label),
        datasets: [
          {
            label: `Weekly Volume (${unit})`,
            data: weeks.map((w) => w.displayVolume),
            borderColor: "#C52F3A",
            backgroundColor: "rgba(197, 47, 58, 0.15)",
            fill: true,
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#A0A7AA" }, grid: { display: false } },
          y: { ticks: { color: "#A0A7AA" }, grid: { color: "#202629" }, beginAtZero: true }
        }
      }
    });
  }

  function toLocalDateKey(isoOrDate) {
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function renderCalendar() {
    const labelEl = document.getElementById("cal-month-label");
    const summaryEl = document.getElementById("cal-month-summary");
    const gridEl = document.getElementById("cal-grid");
    const detailEl = document.getElementById("cal-day-detail");
    if (!labelEl || !gridEl) return;

    const firstOfMonth = new Date(calYear, calMonth, 1);
    labelEl.textContent = firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    const workouts = getProfileWorkouts(state.activeProfileId);
    const byDay = new Map();
    let monthSessions = 0;
    let monthVol = 0;

    workouts.forEach((w) => {
      const d = new Date(w.endedAt);
      const key = toLocalDateKey(d);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(w);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        monthSessions += 1;
        monthVol += computeWorkoutTotals(w).workingVolumeKg;
      }
    });

    summaryEl.textContent = `${monthSessions} session${monthSessions === 1 ? "" : "s"} · ${fmtWt(monthVol)} volume this month`;

    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // Mon=0..Sun=6
    const todayKey = toLocalDateKey(new Date());

    let cellsHtml = "";
    for (let i = 0; i < startOffset; i++) {
      cellsHtml += `<div class="cal-day empty"></div>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayWorkouts = byDay.get(key) || [];
      const dots = dayWorkouts
        .slice(0, 3)
        .map(() => `<span class="cal-dot"></span>`)
        .join("");
      const cls = [
        "cal-day",
        key === todayKey ? "today" : "",
        dayWorkouts.length ? "has-workout" : "",
        calSelectedDateKey === key ? "selected" : ""
      ]
        .filter(Boolean)
        .join(" ");
      cellsHtml += `
        <button class="${cls}" type="button" data-cal-day="${key}">
          <span>${day}</span>
          <div class="cal-dot-row">${dots}</div>
        </button>`;
    }
    gridEl.innerHTML = cellsHtml;

    gridEl.querySelectorAll("[data-cal-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        calSelectedDateKey = btn.dataset.calDay;
        renderCalendar();
      });
    });

    const activeKey = calSelectedDateKey || todayKey;
    const dayList = byDay.get(activeKey) || [];
    if (!dayList.length) {
      detailEl.innerHTML = `<div class="empty-state">No workouts logged on ${activeKey}.</div>`;
    } else {
      detailEl.innerHTML = dayList
        .map((w) => {
          const vol = computeWorkoutTotals(w).workingVolumeKg;
          return `
            <div class="card" data-open-workout="${w.id}" style="cursor:pointer;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${escapeHtml(w.title)}</strong>
                <span class="muted-note">${activeKey}</span>
              </div>
              <div class="muted-note" style="margin-top:4px;">${w.exercises.length} exercises · ${fmtWt(vol)}</div>
            </div>`;
        })
        .join("");
      detailEl.querySelectorAll("[data-open-workout]").forEach((card) => {
        card.addEventListener("click", () => openWorkoutDetail(card.dataset.openWorkout));
      });
    }
  }

  function renderVolumeChart() {
    if (typeof Chart === "undefined") return;
    const range = document.getElementById("chart-volume-range").value;
    const stats = computeMuscleStats(state.activeProfileId, range);

    const labels = [];
    const values = [];
    Object.entries(stats).forEach(([k, v]) => {
      if (v.weightedSets > 0) {
        labels.push(MUSCLES[k]);
        values.push(Number(v.weightedSets.toFixed(1)));
      }
    });

    if (!labels.length) {
      labels.push("No data yet");
      values.push(0);
    }

    if (charts.volume) charts.volume.destroy();
    const ctx = document.getElementById("chart-muscle-volume").getContext("2d");
    charts.volume = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Weighted Sets", data: values, backgroundColor: "#C52F3A", borderRadius: 3 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#A0A7AA", font: { size: 11 } }, grid: { display: false } },
          y: { ticks: { color: "#A0A7AA" }, grid: { color: "#202629" }, beginAtZero: true }
        }
      }
    });
  }

  function populateStrengthSelect() {
    const sel = document.getElementById("analytics-exercise-select");
    const prev = sel.value;
    sel.innerHTML = state.exercises.map((ex) => `<option value="${ex.id}">${escapeHtml(ex.name)}</option>`).join("");
    if (prev && state.exercises.some((e) => e.id === prev)) sel.value = prev;
  }

  function renderStrengthChart() {
    if (typeof Chart === "undefined") return;
    const exId = document.getElementById("analytics-exercise-select").value;
    const unit = getUnit();
    const points = buildStrengthSeries(
      getProfileWorkouts(state.activeProfileId),
      exId,
      unit,
      coreKgToDisplay
    );
    const labels = points.map((pt) => formatDate(pt.endedAt));
    const data = points.map((pt) => pt.display1RM);

    if (charts.strength) charts.strength.destroy();
    const ctx = document.getElementById("chart-strength-progress").getContext("2d");
    charts.strength = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.length ? labels : ["No sessions"],
        datasets: [
          {
            label: `Est. 1RM (${unit})`,
            data: data.length ? data : [0],
            borderColor: "#C52F3A",
            backgroundColor: "rgba(197, 47, 58, 0.15)",
            fill: true,
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#A0A7AA" }, grid: { display: false } },
          y: { ticks: { color: "#A0A7AA" }, grid: { color: "#202629" } }
        }
      }
    });
  }

  function renderWorkoutHistory() {
    const list = document.getElementById("workout-history-list");
    const workouts = getProfileWorkouts(state.activeProfileId);

    if (!workouts.length) {
      list.innerHTML = `<div class="empty-state">No workout history for ${escapeHtml(getActiveProfile().name)} yet.</div>`;
      return;
    }

    list.innerHTML = workouts
      .map((w) => {
        const totals = computeWorkoutTotals(w);
        return `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="cursor:pointer;" data-view-wk="${w.id}">${escapeHtml(w.title)}</strong>
              <button class="btn btn-danger-ghost btn-sm" type="button" data-del-wk="${w.id}">Delete</button>
            </div>
            <div class="muted-note" style="margin-top:4px;cursor:pointer;" data-view-wk="${w.id}">
              ${formatDate(w.endedAt)} • ${w.exercises.length} exercises • ${totals.workingSets} sets • ${fmtWt(totals.workingVolumeKg)}
            </div>
          </div>`;
      })
      .join("");

    list.querySelectorAll("[data-view-wk]").forEach((el) => {
      el.addEventListener("click", () => openWorkoutDetail(el.dataset.viewWk));
    });
    list.querySelectorAll("[data-del-wk]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.workouts = state.workouts.filter((w) => w.id !== btn.dataset.delWk);
        saveState();
        renderAnalytics();
      });
    });
  }


  function openEditWorkoutModal(workoutId) {
    const orig = state.workouts.find((item) => item.id === workoutId);
    if (!orig) return;
    const draft = {
      title: orig.title || "Workout",
      exercises: (orig.exercises || []).map((exItem) => ({
        exerciseId: exItem.exerciseId,
        note: exItem.note || "",
        rpe: exItem.rpe ?? null,
        sets: (exItem.sets || []).map((s) => ({
          weight: s.weight ? String(kgToDisplay(s.weight)) : "0",
          reps: String(s.reps ?? "0"),
          type: s.type || "",
          completed: true
        }))
      }))
    };

    const body = document.getElementById("edit-workout-body");
    if (!body) return;

    const renderEditor = () => {
      const unitLbl = getUnit();
      const exOptions = state.exercises
        .map((e) => `<option value="${e.id}">${escapeHtml(e.name)} (${escapeHtml(e.equipment)})</option>`)
        .join("");

      body.innerHTML = `
        <label class="field">
          <span>Workout Title</span>
          <input id="edit-wk-title" class="input" type="text" value="${escapeHtml(draft.title)}" />
        </label>
        <div class="card-stack">
          ${draft.exercises.map((item, exIdx) => {
            const ex = getExerciseById(item.exerciseId);
            return `
              <div class="card">
                <div class="card-head" style="margin-bottom:8px;">
                  <strong>${escapeHtml(ex ? ex.name : item.exerciseId)}</strong>
                  <button class="btn btn-danger-ghost btn-sm" type="button" data-edit-rem-ex="${exIdx}">Remove</button>
                </div>
                <div class="set-grid-head" style="grid-template-columns:46px 1fr 1fr 32px;">
                  <span>Type</span><span>Weight (${unitLbl})</span><span>Reps</span><span></span>
                </div>
                <div class="card-stack" style="gap:6px;margin-top:4px;">
                  ${item.sets.map((s, setIdx) => `
                    <div class="set-row" style="grid-template-columns:46px 1fr 1fr 32px;">
                      <button class="set-type-btn ${s.type ? `type-${s.type}` : ""}" type="button" data-edit-type="${exIdx}:${setIdx}">${s.type || (setIdx + 1)}</button>
                      <input class="set-input" type="number" step="0.5" min="0" value="${escapeHtml(s.weight)}" data-edit-wt="${exIdx}:${setIdx}" />
                      <input class="set-input" type="number" min="0" value="${escapeHtml(s.reps)}" data-edit-rp="${exIdx}:${setIdx}" />
                      <button class="set-del" type="button" data-edit-del-set="${exIdx}:${setIdx}">&times;</button>
                    </div>
                  `).join("")}
                </div>
                <button class="btn btn-secondary btn-sm" type="button" data-edit-add-set="${exIdx}" style="margin-top:8px;">+ Add Set</button>
              </div>
            `;
          }).join("")}
        </div>
        <div class="inline-row">
          <select id="edit-wk-add-ex-select" class="input">${exOptions}</select>
          <button id="btn-edit-wk-add-ex" class="btn btn-secondary btn-sm" type="button">+ Add</button>
        </div>
        <div class="btn-row" style="margin-top:6px;">
          <button id="btn-edit-wk-cancel" class="btn btn-ghost" type="button" style="flex:1;">Cancel</button>
          <button id="btn-edit-wk-save" class="btn btn-primary" type="button" style="flex:1;">Save Changes</button>
        </div>
      `;

      body.querySelector("#edit-wk-title")?.addEventListener("input", (e) => {
        draft.title = e.target.value;
      });
      body.querySelectorAll("[data-edit-wt]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const [ei, si] = inp.dataset.editWt.split(":").map(Number);
          draft.exercises[ei].sets[si].weight = inp.value;
        });
      });
      body.querySelectorAll("[data-edit-rp]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const [ei, si] = inp.dataset.editRp.split(":").map(Number);
          draft.exercises[ei].sets[si].reps = inp.value;
        });
      });
      body.querySelectorAll("[data-edit-type]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const [ei, si] = btn.dataset.editType.split(":").map(Number);
          const order = ["", "W", "D", "F"];
          const cur = draft.exercises[ei].sets[si].type || "";
          draft.exercises[ei].sets[si].type = order[(order.indexOf(cur) + 1) % order.length];
          renderEditor();
        });
      });
      body.querySelectorAll("[data-edit-del-set]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const [ei, si] = btn.dataset.editDelSet.split(":").map(Number);
          draft.exercises[ei].sets.splice(si, 1);
          renderEditor();
        });
      });
      body.querySelectorAll("[data-edit-add-set]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ei = Number(btn.dataset.editAddSet);
          const prev = draft.exercises[ei].sets.at(-1);
          draft.exercises[ei].sets.push({
            weight: prev ? prev.weight : "0",
            reps: prev ? prev.reps : "10",
            type: "",
            completed: true
          });
          renderEditor();
        });
      });
      body.querySelectorAll("[data-edit-rem-ex]").forEach((btn) => {
        btn.addEventListener("click", () => {
          draft.exercises.splice(Number(btn.dataset.editRemEx), 1);
          renderEditor();
        });
      });
      body.querySelector("#btn-edit-wk-add-ex")?.addEventListener("click", () => {
        const exId = body.querySelector("#edit-wk-add-ex-select")?.value;
        if (!exId) return;
        draft.exercises.push({
          exerciseId: exId,
          note: "",
          rpe: null,
          sets: [{ weight: "0", reps: "10", type: "", completed: true }]
        });
        renderEditor();
      });
      body.querySelector("#btn-edit-wk-cancel")?.addEventListener("click", () => {
        closeModal("modal-edit-workout");
      });
      body.querySelector("#btn-edit-wk-save")?.addEventListener("click", () => {
        const cleaned = draft.exercises
          .map((item) => ({
            exerciseId: item.exerciseId,
            note: item.note || "",
            rpe: item.rpe ?? null,
            sets: item.sets
              .filter((s) => Number(s.reps) > 0 || Number(s.weight) > 0)
              .map((s) => ({
                weight: getUnit() === "lb" ? displayToKg(s.weight) : (Number(s.weight) || 0),
                reps: Number(s.reps) || 0,
                type: s.type || "",
                completed: true
              }))
          }))
          .filter((item) => item.sets.length > 0);

        if (!cleaned.length) {
          alert("Keep at least one set with weight or reps.");
          return;
        }
        orig.title = (draft.title || "").trim() || "Workout";
        orig.exercises = cleaned;
        saveState();
        closeModal("modal-edit-workout");
        switchView(currentView);
        openWorkoutDetail(orig.id);
      });
    };

    renderEditor();
    openModal("modal-edit-workout");
  }

  function openWorkoutDetail(workoutId) {
    const w = state.workouts.find((item) => item.id === workoutId);
    if (!w) return;
    const body = document.getElementById("workout-detail-body");
    body.innerHTML = `
      <div class="muted-note">${new Date(w.endedAt).toLocaleString()}</div>
      ${w.exercises
        .map((item) => {
          const ex = getExerciseById(item.exerciseId);
          return `
            <div class="card">
              <strong>${escapeHtml(ex ? ex.name : "Exercise")}</strong>
              <div class="muted-note" style="margin-top:4px;">
                ${item.sets
                  .map((s, i) => {
                    const skipped = s.status === "skipped" || s.completed === false;
                    return `Set ${i + 1}: ${fmtWt(s.weight)} × ${s.reps}${skipped ? " (skipped)" : ""}`;
                  })
                  .join(" · ")}
              </div>
            </div>`;
        })
        .join("")}
      <div class="btn-row">
        <button id="btn-edit-past-workout" class="btn btn-primary" type="button" style="flex:1;">Edit Workout</button>
        <button id="btn-view-wk-summary" class="btn btn-secondary" type="button" style="flex:1;">Summary Card</button>
        <button id="btn-save-as-routine" class="btn btn-ghost" type="button" style="flex:1;">Save Routine</button>
      </div>
    `;
    document.getElementById("btn-edit-past-workout").addEventListener("click", () => {
      closeModal("modal-workout-detail");
      openEditWorkoutModal(w.id);
    });
    document.getElementById("btn-view-wk-summary").addEventListener("click", () => {
      closeModal("modal-workout-detail");
      openWorkoutSummaryModal(w, []);
    });
    document.getElementById("btn-save-as-routine").addEventListener("click", () => {
      if (!state.routines[state.activeProfileId]) state.routines[state.activeProfileId] = [];
      state.routines[state.activeProfileId].push({
        id: uid("rt"),
        name: w.title,
        exerciseIds: w.exercises.map((e) => e.exerciseId)
      });
      saveState();
      closeModal("modal-workout-detail");
      alert(`Saved "${w.title}" to your custom routines.`);
    });
    document.getElementById("detail-modal-title").textContent = w.title;
    openModal("modal-workout-detail");
  }

  function renderBodyStats() {
    const profile = getActiveProfile();
    const bp = getBodyProfile(profile.id);
    const entries = state.measurements
      .filter((m) => m.profileId === profile.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const latestWeight = entries[0]?.weight || Number(bp.weightKg) || 0;
    const latestBf = entries[0]?.bf || 0;
    const heightM = Number(bp.heightCm) ? Number(bp.heightCm) / 100 : 0;
    const bmi = latestWeight && heightM ? (latestWeight / (heightM * heightM)).toFixed(1) : "—";
    const leanMass = latestWeight && latestBf ? `${(latestWeight * (1 - latestBf / 100)).toFixed(1)} kg` : "—";

    document.getElementById("body-profile-title").textContent = `${profile.name}'s Body Profile`;
    document.getElementById("body-profile-summary").innerHTML = `
      <div class="kpi-box"><span class="kpi-label">Height / Age</span><strong class="kpi-value">${bp.heightCm ? `${bp.heightCm} cm` : "—"} · ${bp.age ? `${bp.age}y` : "—"}</strong></div>
      <div class="kpi-box"><span class="kpi-label">Weight / Target</span><strong class="kpi-value">${latestWeight ? `${latestWeight} kg` : "—"} / ${bp.targetWeightKg ? `${bp.targetWeightKg} kg` : "—"}</strong></div>
      <div class="kpi-box"><span class="kpi-label">BMI / Lean Mass</span><strong class="kpi-value">${bmi} · ${leanMass}</strong></div>
      <div class="kpi-box"><span class="kpi-label">Goal / Level</span><strong class="kpi-value">${escapeHtml(bp.goal)} · ${escapeHtml(bp.level)}</strong></div>
    `;

    const list = document.getElementById("measurements-list");
    if (!entries.length) {
      list.innerHTML = `<div class="empty-state">No body measurements logged for ${escapeHtml(profile.name)}.</div>`;
    } else {
      list.innerHTML = entries
        .map(
          (m) => `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>${m.weight} kg ${m.bf ? `(${m.bf}% BF)` : ""}</strong>
              <div class="btn-row" style="align-items:center;">
                <span class="muted-note">${formatDate(m.date)}</span>
                <button class="btn btn-danger-ghost btn-sm" type="button" data-del-meas="${m.id}">&times;</button>
              </div>
            </div>
            <div class="muted-note" style="margin-top:4px;">
              ${[
                m.neck ? `Neck ${m.neck}cm` : "",
                m.shoulders ? `Shoulders ${m.shoulders}cm` : "",
                m.chest ? `Chest ${m.chest}cm` : "",
                m.waist ? `Waist ${m.waist}cm` : "",
                m.hips ? `Hips ${m.hips}cm` : "",
                m.arm ? `Arm ${m.arm}cm` : "",
                m.forearm ? `Forearm ${m.forearm}cm` : "",
                m.thigh ? `Thigh ${m.thigh}cm` : "",
                m.calf ? `Calf ${m.calf}cm` : ""
              ]
                .filter(Boolean)
                .join(" · ") || "Weight entry"}
            </div>
          </div>`
        )
        .join("");

      list.querySelectorAll("[data-del-meas]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.measurements = state.measurements.filter((m) => m.id !== btn.dataset.delMeas);
          saveState();
          renderBodyStats();
        });
      });
    }

    if (typeof Chart === "undefined") return;
    const asc = [...entries].reverse();
    if (charts.weight) charts.weight.destroy();
    const ctx = document.getElementById("chart-body-weight").getContext("2d");
    charts.weight = new Chart(ctx, {
      type: "line",
      data: {
        labels: asc.length ? asc.map((e) => formatDate(e.date)) : ["No entries"],
        datasets: [
          {
            label: "Weight (kg)",
            data: asc.length ? asc.map((e) => e.weight) : [0],
            borderColor: "#C52F3A",
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#A0A7AA" }, grid: { display: false } },
          y: { ticks: { color: "#A0A7AA" }, grid: { color: "#202629" } }
        }
      }
    });
  }

  /* ---------------- MERGE-SAFE JSON EXPORT / IMPORT ---------------- */
  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `musclemap_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvEscape(val) {
    const s = String(val ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function exportCsv() {
    const profile = getActiveProfile();
    const workouts = getProfileWorkouts(profile.id);
    if (!workouts.length) {
      alert(`No completed workouts to export for ${profile.name}.`);
      return;
    }

    const rows = [
      ["Date", "Workout", "Exercise", "Equipment", "Set", "Set_Type", "Weight_kg", "Reps", "RPE", "Volume_kg", "Est_1RM_kg", "Notes"].join(",")
    ];
    workouts.forEach((w) => {
      const dateStr = new Date(w.endedAt).toISOString();
      w.exercises.forEach((item) => {
        const ex = getExerciseById(item.exerciseId);
        const exName = ex ? ex.name : item.exerciseId;
        const equip = ex ? ex.equipment : "";
        const exNote = item.note || "";
        const exRpe = item.rpe || "";
        item.sets.forEach((s, idx) => {
          const wt = Number(s.weight) || 0;
          const rp = Number(s.reps) || 0;
          const vol = wt * rp;
          const e1rm = s.type !== "W" && wt > 0 && rp > 0 ? (wt * (1 + rp / 30)).toFixed(1) : "0";
          rows.push(
            [
              csvEscape(dateStr),
              csvEscape(w.title),
              csvEscape(exName),
              csvEscape(equip),
              idx + 1,
              csvEscape(s.type || "Working"),
              wt,
              rp,
              csvEscape(exRpe),
              vol,
              e1rm,
              csvEscape(exNote)
            ].join(",")
          );
        });
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "user";
    a.download = `musclemap_${safeName}_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openImportPreviewModal(importedRaw, preview) {
    const body = document.getElementById("import-preview-body");
    if (!body) return;
    const c = preview.counts;
    const cf = preview.conflicts;
    const conflictCount =
      cf.profileConflicts.length +
      cf.exerciseConflicts.length +
      cf.routineConflicts.length +
      cf.settingsConflicts.length +
      cf.activeWorkoutConflicts.length;

    body.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-box"><span class="kpi-label">Profiles</span><strong class="kpi-value">${c.profiles}</strong></div>
        <div class="kpi-box"><span class="kpi-label">New Workouts</span><strong class="kpi-value">${c.newWorkouts}</strong></div>
        <div class="kpi-box"><span class="kpi-label">Duplicates</span><strong class="kpi-value">${c.duplicateWorkouts}</strong></div>
      </div>
      <div class="card">
        <strong>Conflict Summary (${conflictCount})</strong>
        <ul class="changelog-ul" style="margin-top:6px;">
          <li>Profile ID conflicts: ${cf.profileConflicts.length}</li>
          <li>Exercise ID conflicts: ${cf.exerciseConflicts.length}</li>
          <li>Routine ID conflicts: ${cf.routineConflicts.length}</li>
          <li>Profile settings overlaps: ${cf.settingsConflicts.length}</li>
          <li>Active workout overlaps: ${cf.activeWorkoutConflicts.length}</li>
          ${cf.unknownTopKeys.length ? `<li>Preserved unknown fields: ${escapeHtml(cf.unknownTopKeys.join(", "))}</li>` : ""}
        </ul>
      </div>
      <div class="form-stack">
        <button id="btn-import-merge-keep" class="btn btn-primary" type="button">Merge (Keep Existing on Conflict)</button>
        <button id="btn-import-merge-overwrite" class="btn btn-secondary" type="button">Merge (Overwrite Conflicts)</button>
        <button id="btn-import-restore" class="btn btn-danger-ghost" type="button">Full Restore (Replace Current State)</button>
      </div>
    `;

    const applyChoice = (mode, conflictPolicy) => {
      const res = commitImport(state, importedRaw, {
        mode,
        conflictPolicy,
        expectedFingerprint: preview.baseFingerprint,
        storage: localStorage,
        requireBackupForDestructive: true,
        createDefaultState,
        defaultExercises: DEFAULT_EXERCISES
      });
      if (!res.ok) {
        if (res.reason === "stale_preview") {
          alert("Your local state changed after this import preview was opened. Refreshing preview now.");
          const freshPreview = buildImportPreview(state, importedRaw);
          if (freshPreview.valid) openImportPreviewModal(importedRaw, freshPreview);
          return;
        }
        if (res.reason === "backup_failed") {
          alert("Import aborted: could not write a safety backup to LocalStorage before replacing existing data.");
          return;
        }
        alert(res.error?.message || "Import failed.");
        return;
      }
      state = res.nextState;
      storageStatus.recoveryRequired = false;
      saveState();
      applyVisualTone();
      renderHeader();
      renderProfileModal();
      switchView(currentView);
      closeModal("modal-import-preview");
      alert(
        mode === "restore"
          ? `Backup restored (${res.summary.workoutsTotal} workouts).`
          : `Backup merged: ${res.summary.addedWorkouts} new workout(s) added.`
      );
    };

    document.getElementById("btn-import-merge-keep")?.addEventListener("click", () => applyChoice("merge", "keep_existing"));
    document.getElementById("btn-import-merge-overwrite")?.addEventListener("click", () => applyChoice("merge", "overwrite"));
    document.getElementById("btn-import-restore")?.addEventListener("click", () => {
      if (confirm("Replace your current state with the imported backup?")) {
        applyChoice("restore", "overwrite");
      }
    });
    openModal("modal-import-preview");
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const preview = buildImportPreview(state, imported);
        if (!preview.valid) {
          alert(preview.error || "Invalid MUSCLEMAP backup file.");
          return;
        }
        openImportPreviewModal(imported, preview);
      } catch {
        alert("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
  }


  function openOnboardingModal() {
    const s = getProfileSettings();
    document.getElementById("ob-goal").value = s.goal || "Build Muscle";
    document.getElementById("ob-experience").value = s.experience || "Beginner";
    document.getElementById("ob-days").value = String(s.daysPerWeek || 3);
    document.getElementById("ob-duration").value = String(s.sessionMinutes || 45);
    document.getElementById("ob-equipment").value = s.equipment || "full_gym";
    document.getElementById("ob-tone").value = s.tone || "system";
    document.getElementById("ob-limitations").value = s.limitations || "";
    openModal("modal-onboarding");
  }

  /* ---------------- EVENT BINDING ---------------- */
  function bindEvents() {
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.addEventListener("click", () => switchView(btn.dataset.nav));
    });

    document.querySelectorAll(".close-modal").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.dataset.close));
    });

    // Form animation modal controls
    const redrawCurrentFormFrame = () => {
      const raw = formAnimPhase < 0.5 ? formAnimPhase * 2 : (1 - formAnimPhase) * 2;
      const t = Math.max(0, Math.min(1, (raw - 0.08) / 0.84));
      renderStickmanFrame(activeFormRig, t);
    };
    document.getElementById("btn-form-play").addEventListener("click", () => {
      formAnimPlaying = !formAnimPlaying;
      document.getElementById("btn-form-play").textContent = formAnimPlaying ? "Pause" : "Play";
    });
    document.getElementById("btn-form-start").addEventListener("click", () => {
      formAnimPlaying = false;
      formAnimPhase = 0;
      document.getElementById("btn-form-play").textContent = "Play";
      renderStickmanFrame(activeFormRig, 0);
    });
    document.getElementById("btn-form-peak").addEventListener("click", () => {
      formAnimPlaying = false;
      formAnimPhase = 0.5;
      document.getElementById("btn-form-play").textContent = "Play";
      renderStickmanFrame(activeFormRig, 1);
    });
    document.getElementById("btn-form-speed").addEventListener("click", () => {
      formAnimSpeed = formAnimSpeed === 1.0 ? 0.5 : 1.0;
      document.getElementById("btn-form-speed").textContent = `${formAnimSpeed.toFixed(1)}x`;
    });
    document.getElementById("btn-form-guides")?.addEventListener("click", (e) => {
      formGuidesOn = !formGuidesOn;
      e.currentTarget.classList.toggle("active", formGuidesOn);
      e.currentTarget.textContent = formGuidesOn ? "Guides: ON" : "Guides: OFF";
      redrawCurrentFormFrame();
    });
    document.getElementById("btn-form-mistake")?.addEventListener("click", (e) => {
      formMistakeOn = !formMistakeOn;
      e.currentTarget.classList.toggle("active", formMistakeOn);
      e.currentTarget.textContent = formMistakeOn ? "Mistake: ON" : "Mistake: OFF";
      const noteEl = document.getElementById("form-mistake-note");
      if (noteEl) {
        const meta = getFormCoachMeta(activeFormRigKey, activeFormExercise);
        const note = formMistakeOn ? meta.mistakeNote : "";
        noteEl.textContent = note;
        noteEl.classList.toggle("hidden", !formMistakeOn || !note);
      }
      redrawCurrentFormFrame();
    });

    document.getElementById("profile-switcher-btn").addEventListener("click", () => {
      renderProfileModal();
      openModal("modal-profile-data");
    });

    document.getElementById("btn-rename-profile").addEventListener("click", () => {
      const val = document.getElementById("rename-profile-input").value.trim();
      if (!val) return;
      getActiveProfile().name = val;
      saveState();
      renderHeader();
      renderProfileModal();
      switchView(currentView);
    });

    document.getElementById("btn-export-json").addEventListener("click", exportJson);
    document.getElementById("btn-export-csv").addEventListener("click", exportCsv);
    document.getElementById("btn-history-export-csv").addEventListener("click", exportCsv);
    document.getElementById("input-import-json").addEventListener("change", (e) => {
      if (e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = "";
    });

    document.getElementById("btn-hero-scan-front")?.addEventListener("click", () => {
      dashHeroSide = "front";
      renderDashboard();
    });
    document.getElementById("btn-hero-scan-back")?.addEventListener("click", () => {
      dashHeroSide = "back";
      renderDashboard();
    });
    document.getElementById("btn-edit-set-target")?.addEventListener("click", () => {
      openCustomizeDashboardModal();
      setTimeout(() => document.getElementById("dash-weekly-set-target")?.focus(), 40);
    });
    document.getElementById("btn-customize-dash").addEventListener("click", openCustomizeDashboardModal);
    document.getElementById("btn-save-dash-prefs").addEventListener("click", () => {
      const nextPrefs = {};
      document.querySelectorAll("[data-widget-pref]").forEach((cb) => {
        nextPrefs[cb.dataset.widgetPref] = cb.checked;
      });
      const targetVal = Number(document.getElementById("dash-weekly-set-target")?.value);
      if (targetVal >= 10 && targetVal <= 150) {
        getProfileSettings().weeklySetTarget = Math.round(targetVal);
      }
      state.dashboardPrefs[state.activeProfileId] = nextPrefs;
      saveState();
      closeModal("modal-customize-dash");
      renderDashboard();
    });

    document.querySelectorAll(".dash-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchDashPreset(btn.dataset.preset));
    });
    document.getElementById("btn-dash-start").addEventListener("click", () => {
      if (getActiveWorkout()) switchView("workout");
      else startBlankWorkout();
    });
    document.getElementById("btn-dash-blank").addEventListener("click", startBlankWorkout);
    document.getElementById("btn-start-blank").addEventListener("click", startBlankWorkout);
    document.getElementById("btn-add-exercise").addEventListener("click", openExercisePicker);
    document.getElementById("btn-open-plate-calc").addEventListener("click", () => openPlateCalculator());
    document.getElementById("plate-target-weight").addEventListener("input", renderPlateCalculation);
    document.getElementById("plate-bar-weight").addEventListener("change", renderPlateCalculation);
    document.getElementById("swap-search-input").addEventListener("input", (e) => renderSwapList(e.target.value));
    document.getElementById("btn-finish-workout").addEventListener("click", finishWorkout);
    document.getElementById("btn-discard-workout").addEventListener("click", () => {
      if (confirm("Discard this active workout?")) {
        stopRestTimer();
        setActiveWorkout(null);
        renderWorkoutView();
      }
    });
    document.getElementById("workout-title-input").addEventListener("input", (e) => {
      const active = getActiveWorkout();
      if (active) {
        active.title = e.target.value;
        saveState();
      }
    });

    document.getElementById("btn-auto-rest-toggle").addEventListener("click", () => {
      const settings = getProfileSettings();
      settings.autoRest = !settings.autoRest;
      saveState();
      updateAutoRestButton();
    });
    document.getElementById("btn-rest-minus").addEventListener("click", () => adjustRestTimer(-15));
    document.getElementById("btn-rest-plus").addEventListener("click", () => adjustRestTimer(15));
    document.querySelectorAll("[data-rest]").forEach((btn) => {
      btn.addEventListener("click", () => startRestTimer(Number(btn.dataset.rest)));
    });
    document.getElementById("btn-rest-stop").addEventListener("click", () => stopRestTimer(true));
    document.getElementById("btn-float-rest-minus")?.addEventListener("click", () => adjustRestTimer(-15));
    document.getElementById("btn-float-rest-plus")?.addEventListener("click", () => adjustRestTimer(15));
    document.getElementById("btn-float-rest-stop")?.addEventListener("click", () => stopRestTimer(true));

    document.getElementById("btn-unit-toggle")?.addEventListener("click", () => {
      const s = getProfileSettings();
      s.unit = s.unit === "lb" ? "kg" : "lb";
      saveState();
      renderWorkoutView();
    });

    document.getElementById("btn-setup-coach")?.addEventListener("click", openOnboardingModal);
    document.getElementById("btn-train-setup-plan")?.addEventListener("click", openOnboardingModal);
    document.getElementById("btn-open-onboarding-from-profile")?.addEventListener("click", () => {
      closeModal("modal-profile-data");
      openOnboardingModal();
    });

    document.getElementById("pref-unit-select")?.addEventListener("change", (e) => {
      getProfileSettings().unit = e.target.value;
      saveState();
      switchView(currentView);
    });
    document.getElementById("pref-tone-select")?.addEventListener("change", (e) => {
      getProfileSettings().tone = e.target.value;
      saveState();
      applyVisualTone();
    });

    document.getElementById("form-onboarding")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = getProfileSettings();
      s.goal = document.getElementById("ob-goal").value;
      s.experience = document.getElementById("ob-experience").value;
      s.daysPerWeek = Number(document.getElementById("ob-days").value) || 3;
      s.sessionMinutes = Number(document.getElementById("ob-duration").value) || 45;
      s.equipment = document.getElementById("ob-equipment").value;
      s.tone = document.getElementById("ob-tone").value;
      s.limitations = document.getElementById("ob-limitations").value.trim();
      s.onboardingDone = true;
      s.plan = generatePlanFromPrefs(s);
      saveState();
      applyVisualTone();
      closeModal("modal-onboarding");
      switchView("dashboard");
    });

    window.addEventListener("online", updateOfflineStatus);
    window.addEventListener("offline", updateOfflineStatus);

    document.getElementById("btn-view-front").addEventListener("click", () => {
      currentSide = "front";
      renderAnatomy();
    });
    document.getElementById("btn-view-back").addEventListener("click", () => {
      currentSide = "back";
      renderAnatomy();
    });
    document.querySelectorAll(".anatomy-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentAnatomyTab = btn.dataset.anatomyTab || "overview";
        currentMetric = btn.dataset.metric || "sets";
        renderAnatomy();
      });
    });
    document.querySelectorAll(".window-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentWindow = btn.dataset.window;
        document.querySelectorAll(".window-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderAnatomy();
      });
    });
    document.querySelectorAll(".muscle-part").forEach((part) => {
      part.addEventListener("click", () => {
        selectedMuscle = part.dataset.muscle;
        renderAnatomy();
      });
    });
    document.getElementById("btn-filter-by-muscle").addEventListener("click", () => {
      if (selectedMuscle) {
        libraryMuscleFilter = selectedMuscle;
        switchView("library");
      }
    });

    document.getElementById("btn-cal-prev").addEventListener("click", () => {
      calMonth -= 1;
      if (calMonth < 0) {
        calMonth = 11;
        calYear -= 1;
      }
      renderCalendar();
    });
    document.getElementById("btn-cal-next").addEventListener("click", () => {
      calMonth += 1;
      if (calMonth > 11) {
        calMonth = 0;
        calYear += 1;
      }
      renderCalendar();
    });
    document.getElementById("btn-cal-today").addEventListener("click", () => {
      const now = new Date();
      calYear = now.getFullYear();
      calMonth = now.getMonth();
      calSelectedDateKey = toLocalDateKey(now);
      renderCalendar();
    });

    window.addEventListener("beforeunload", saveState);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveState();
    });

    document.getElementById("exercise-search-input").addEventListener("input", renderLibrary);
    document.getElementById("picker-search-input").addEventListener("input", (e) => {
      renderExercisePickerList(e.target.value);
    });
    document.getElementById("btn-new-exercise").addEventListener("click", openCustomExerciseModal);
    document.getElementById("form-custom-exercise").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("custom-ex-name").value.trim();
      const equipment = document.getElementById("custom-ex-equipment").value;
      const primary = [...document.querySelectorAll('input[name="primaryMuscle"]:checked')].map((i) => i.value);
      const secondary = [...document.querySelectorAll('input[name="secondaryMuscle"]:checked')].map((i) => i.value);
      if (!name || !primary.length) {
        alert("Please enter a name and select at least one primary muscle.");
        return;
      }
      state.exercises.push({ id: uid("ex"), name, equipment, primary, secondary, rig: "curl" });
      saveState();
      closeModal("modal-custom-exercise");
      renderLibrary();
    });

    document.getElementById("btn-version-badge")?.addEventListener("click", openChangelogModal);
    document.getElementById("guide-search-input")?.addEventListener("input", renderGuide);
    document.getElementById("view-guide")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-guide-jump]");
      if (btn) handleGuideJump(btn.dataset.guideJump);
    });

    document.getElementById("btn-new-routine").addEventListener("click", () => openRoutineModal(null));
    document.getElementById("form-routine").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("routine-name-input").value.trim();
      const exerciseIds = [...document.querySelectorAll('input[name="routineEx"]:checked')].map((i) => i.value);
      if (!name || !exerciseIds.length) {
        alert("Enter a routine name and select at least one exercise.");
        return;
      }
      if (!state.routines[state.activeProfileId]) state.routines[state.activeProfileId] = [];
      if (editingRoutineId) {
        const idx = state.routines[state.activeProfileId].findIndex((r) => r.id === editingRoutineId);
        if (idx !== -1) {
          state.routines[state.activeProfileId][idx] = { id: editingRoutineId, name, exerciseIds };
        }
      } else {
        state.routines[state.activeProfileId].push({ id: uid("rt"), name, exerciseIds });
      }
      editingRoutineId = null;
      saveState();
      closeModal("modal-routine");
      renderRoutinesList();
    });

    document.querySelectorAll(".analytics-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".analytics-tab").forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".analytics-panel").forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
        renderAnalytics();
      });
    });
    document.getElementById("chart-volume-range").addEventListener("change", renderVolumeChart);
    document.getElementById("analytics-exercise-select").addEventListener("change", renderStrengthChart);

    document.getElementById("btn-edit-body-profile").addEventListener("click", () => {
      const bp = getBodyProfile();
      document.getElementById("bp-age").value = bp.age || "";
      document.getElementById("bp-height").value = bp.heightCm || "";
      document.getElementById("bp-weight").value = bp.weightKg || "";
      document.getElementById("bp-target-weight").value = bp.targetWeightKg || "";
      document.getElementById("bp-goal").value = bp.goal || "Hypertrophy";
      document.getElementById("bp-level").value = bp.level || "Intermediate";
      openModal("modal-body-profile");
    });

    document.getElementById("form-body-profile").addEventListener("submit", (e) => {
      e.preventDefault();
      state.bodyProfiles[state.activeProfileId] = {
        age: document.getElementById("bp-age").value,
        heightCm: document.getElementById("bp-height").value,
        weightKg: document.getElementById("bp-weight").value,
        targetWeightKg: document.getElementById("bp-target-weight").value,
        goal: document.getElementById("bp-goal").value,
        level: document.getElementById("bp-level").value
      };
      saveState();
      closeModal("modal-body-profile");
      renderBodyStats();
    });

    document.getElementById("btn-log-measurement").addEventListener("click", () => {
      document.getElementById("form-measurement").reset();
      openModal("modal-measurement");
    });
    document.getElementById("form-measurement").addEventListener("submit", (e) => {
      e.preventDefault();
      state.measurements.push({
        id: uid("ms"),
        profileId: state.activeProfileId,
        date: new Date().toISOString(),
        weight: Number(document.getElementById("meas-weight").value),
        bf: Number(document.getElementById("meas-bf").value) || null,
        neck: Number(document.getElementById("meas-neck").value) || null,
        shoulders: Number(document.getElementById("meas-shoulders").value) || null,
        chest: Number(document.getElementById("meas-chest").value) || null,
        waist: Number(document.getElementById("meas-waist").value) || null,
        hips: Number(document.getElementById("meas-hips").value) || null,
        arm: Number(document.getElementById("meas-arm").value) || null,
        forearm: Number(document.getElementById("meas-forearm").value) || null,
        thigh: Number(document.getElementById("meas-thigh").value) || null,
        calf: Number(document.getElementById("meas-calf").value) || null
      });
      saveState();
      closeModal("modal-measurement");
      renderBodyStats();
    });
  }

  function initAmbientBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const nodes = Array.from({ length: 26 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00022,
      vy: (Math.random() - 0.5) * 0.00022,
      red: i % 5 === 0
    }));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let offset = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Subtle drifting Swiss technical grid
      const step = 48;
      offset = (offset + 0.12) % step;
      ctx.strokeStyle = "rgba(43, 49, 53, 0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = offset; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = offset; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Telemetry nodes & subtle proximity links
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x = (n.x + n.vx + 1) % 1;
        n.y = (n.y + n.vy + 1) % 1;
        const px = n.x * w;
        const py = n.y * h;

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = (n.x - m.x) * w;
          const dy = (n.y - m.y) * h;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            ctx.strokeStyle = (n.red || m.red)
              ? `rgba(197, 47, 58, ${(1 - dist / 150) * 0.18})`
              : `rgba(160, 167, 170, ${(1 - dist / 150) * 0.09})`;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(m.x * w, m.y * h);
            ctx.stroke();
          }
        }

        ctx.fillStyle = n.red ? "rgba(227, 68, 77, 0.55)" : "rgba(160, 167, 170, 0.35)";
        ctx.beginPath();
        ctx.arc(px, py, n.red ? 2 : 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce && !document.hidden) requestAnimationFrame(draw);
    };

    draw();
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !reduce) requestAnimationFrame(draw);
    });
  }

  /* ---------------- INIT ---------------- */
  state = loadState();
  registerServiceWorker();
  initAmbientBackground();
  applyVisualTone();
  renderStorageAlert();
  updateOfflineStatus();
  renderHeader();
  bindEvents();
  switchView("dashboard");
  if (!getProfileSettings().onboardingDone && getProfileWorkouts(state.activeProfileId).length === 0) {
    openOnboardingModal();
  }
})();
