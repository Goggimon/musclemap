(() => {
  "use strict";

  const APP_VERSION = "v6.3";
  const STORAGE_KEY = "musclemap_v1_state";

  const CHANGELOG = [
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

    // Core
    { id: "ex_hanging_raise", name: "Hanging Leg Raise", equipment: "Bodyweight", primary: ["abs"], secondary: ["obliques", "forearms"], rig: "hanging_raise" },
    { id: "ex_cable_crunch", name: "Cable Crunch", equipment: "Cable", primary: ["abs"], secondary: ["obliques"], rig: "cable_crunch" },
    { id: "ex_ab_mach", name: "Ab Crunch Machine", equipment: "Machine", primary: ["abs"], secondary: ["obliques"], rig: "cable_crunch" },
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
        u1: { autoRest: true, defaultRestSec: 90 },
        u2: { autoRest: true, defaultRestSec: 90 }
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

  let state = loadState();
  let currentView = "dashboard";
  let currentDashPreset = "overview";
  let currentSide = "front";
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

  function mergeById(existing, incoming) {
    const map = new Map(existing.map((item) => [item.id, item]));
    incoming.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    return Array.from(map.values());
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      const parsed = JSON.parse(raw);
      const base = createDefaultState();
      return {
        ...base,
        ...parsed,
        profiles: parsed.profiles?.length ? parsed.profiles : base.profiles,
        bodyProfiles: { ...base.bodyProfiles, ...(parsed.bodyProfiles || {}) },
        settings: {
          u1: { ...base.settings.u1, ...(parsed.settings?.u1 || {}) },
          u2: { ...base.settings.u2, ...(parsed.settings?.u2 || {}) },
          ...(parsed.settings || {})
        },
        dashboardPrefs: {
          u1: { ...base.dashboardPrefs.u1, ...(parsed.dashboardPrefs?.u1 || {}) },
          u2: { ...base.dashboardPrefs.u2, ...(parsed.dashboardPrefs?.u2 || {}) },
          ...(parsed.dashboardPrefs || {})
        },
        exercises: mergeById(DEFAULT_EXERCISES, parsed.exercises || []),
        routines: Array.isArray(parsed.routines)
          ? { u1: parsed.routines, u2: [] }
          : { ...base.routines, ...(parsed.routines || {}) },
        workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
        measurements: Array.isArray(parsed.measurements) ? parsed.measurements : [],
        activeWorkouts: { ...base.activeWorkouts, ...(parsed.activeWorkouts || {}) }
      };
    } catch {
      return createDefaultState();
    }
  }

  function saveState() {
    const active = state.activeWorkouts?.[state.activeProfileId];
    if (active) {
      active.lastSavedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateAutosaveIndicator();
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

  function getProfileSettings(profileId = state.activeProfileId) {
    if (!state.settings[profileId]) state.settings[profileId] = { autoRest: true, defaultRestSec: 90 };
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
          .slice(0, 3)
          .map((s) => `${s.weight}kg×${s.reps}`)
          .join(", ");
        return `Last (${formatDate(w.endedAt)}): ${preview}`;
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

  function roundGymWeight(kg, equipment) {
    if (equipment === "Barbell" || equipment === "Machine") {
      return Math.max(5, Math.round(kg / 2.5) * 2.5);
    }
    const step = kg >= 12 ? 2 : 1;
    return Math.max(2, Math.round(kg / step) * step);
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
    if (remainingSec > 0) {
      disp.textContent = `Rest: ${formatDuration(remainingSec * 1000)}`;
      disp.style.color = "var(--primary)";
      stopBtn.classList.remove("hidden");
      minusBtn?.classList.remove("hidden");
      plusBtn?.classList.remove("hidden");
    } else {
      disp.textContent = "Rest: Ready";
      disp.style.color = "";
      stopBtn.classList.add("hidden");
      minusBtn?.classList.add("hidden");
      plusBtn?.classList.add("hidden");
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
    let best = 0;
    const workouts = getProfileWorkouts(state.activeProfileId);
    for (const w of workouts) {
      const match = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (!match) continue;
      for (const s of match.sets) {
        if (s.type === "W") continue;
        const weight = Number(s.weight) || 0;
        const reps = Number(s.reps) || 0;
        if (weight > 0 && reps > 0) {
          const est = weight * (1 + reps / 30);
          if (est > best) best = est;
        }
      }
    }
    return best;
  }

  function getOverloadSuggestion(exerciseId) {
    const workouts = getProfileWorkouts(state.activeProfileId);
    for (const w of workouts) {
      const match = w.exercises.find((e) => e.exerciseId === exerciseId);
      if (!match || !match.sets.length) continue;
      const validSets = match.sets.filter((s) => s.type !== "W" && (Number(s.reps) > 0 || Number(s.weight) > 0));
      if (!validSets.length) continue;

      const topSet = validSets.reduce((best, s) => {
        const bw = Number(best.weight) || 0;
        const sw = Number(s.weight) || 0;
        if (sw > bw) return s;
        if (sw === bw && (Number(s.reps) || 0) > (Number(best.reps) || 0)) return s;
        return best;
      }, validSets[0]);

      const lastW = Number(topSet.weight) || 0;
      const lastR = Number(topSet.reps) || 0;
      if (lastW > 0 && lastR >= 10) {
        return {
          weight: Number((lastW + 2.5).toFixed(2)),
          reps: 8,
          label: `Target: ${lastW + 2.5} kg × 8 (+2.5 kg)`
        };
      }
      if (lastW > 0) {
        return {
          weight: lastW,
          reps: lastR + 1,
          label: `Target: ${lastW} kg × ${lastR + 1} (+1 rep)`
        };
      }
      return {
        weight: 0,
        reps: lastR + 1,
        label: `Target: ${lastR + 1} reps (+1 rep)`
      };
    }
    return null;
  }

  /* ---------------- MUSCLE STIMULUS ENGINE ---------------- */
  function computeMuscleStats(profileId, windowDays) {
    const stats = {};
    Object.keys(MUSCLES).forEach((m) => {
      stats[m] = { weightedSets: 0, volume: 0, lastTrained: null };
    });

    const cutoff =
      windowDays === "all" ? 0 : Date.now() - Number(windowDays) * 24 * 60 * 60 * 1000;

    const workouts = getProfileWorkouts(profileId);
    for (const w of workouts) {
      const wTime = new Date(w.endedAt).getTime();
      if (wTime < cutoff) continue;

      for (const item of w.exercises) {
        const ex = getExerciseById(item.exerciseId);
        if (!ex) continue;

        const workingSets = item.sets.filter((s) => s.type !== "W" && s.completed !== false && (Number(s.reps) > 0 || Number(s.weight) > 0));
        if (!workingSets.length) continue;

        const setCount = workingSets.length;
        const exVolume = workingSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);

        for (const m of ex.primary) {
          if (!stats[m]) continue;
          stats[m].weightedSets += setCount * 1.0;
          stats[m].volume += exVolume * 1.0;
          if (!stats[m].lastTrained || wTime > new Date(stats[m].lastTrained).getTime()) {
            stats[m].lastTrained = w.endedAt;
          }
        }
        for (const m of ex.secondary) {
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

  function getHeatLevel(weightedSets, windowDays) {
    if (weightedSets <= 0) return 0;
    const scale = windowDays === "7" ? 1 : windowDays === "30" ? 3 : 5;
    const norm = weightedSets / scale;
    if (norm < 3) return 1;
    if (norm < 7) return 2;
    if (norm < 12) return 3;
    return 4;
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
        ["Version Pill (v6.3)", "Tap the version badge in the top-right header anytime to check the current build and release notes."]
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
    // 1. Mini anatomy muscle highlights inside hero panel
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

    // 3. 10-segment weekly set target meter
    const targetSets = 40;
    const fracEl = document.getElementById("dash-target-fraction");
    const meterEl = document.getElementById("dash-target-bars");
    if (fracEl) fracEl.textContent = `${totalSets} / ${targetSets} sets`;
    if (meterEl) {
      const litCount = Math.min(10, Math.round((totalSets / targetSets) * 10));
      meterEl.innerHTML = Array.from({ length: 10 }, (_, i) =>
        `<div class="bento-seg-pill ${i < litCount ? "lit" : ""}"></div>`
      ).join("");
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
      const setPct = Math.min(1, totalSets / 40);
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

    let totalSets = 0;
    let totalVol = 0;
    recent7.forEach((w) => {
      w.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          totalSets += 1;
          totalVol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        });
      });
    });

    document.getElementById("kpi-workouts-7d").textContent = String(recent7.length);
    document.getElementById("kpi-volume-7d").textContent = `${Math.round(totalVol).toLocaleString()} kg`;
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
      w.exercises.forEach((item) => {
        const ex = getExerciseById(item.exerciseId);
        if (!ex) return;
        item.sets.forEach((s) => {
          const weight = Number(s.weight) || 0;
          const reps = Number(s.reps) || 0;
          if (weight <= 0 || reps <= 0) return;
          const est1RM = weight * (1 + reps / 30);
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
          const vol = w.exercises.reduce(
            (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0),
            0
          );
          return `
            <div class="card" data-open-workout="${w.id}" style="cursor:pointer;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${escapeHtml(w.title)}</strong>
                <span class="muted-note">${formatDate(w.endedAt)}</span>
              </div>
              <div class="muted-note" style="margin-top:4px;">
                ${w.exercises.length} exercises • ${Math.round(vol).toLocaleString()} kg
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
            <span class="muted-note">${val.weightedSets.toFixed(1).replace(/\.0$/, "")} sets · ${Math.round(val.volume).toLocaleString()} kg</span>
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
              <div class="muted-note">${pr.weight} kg × ${pr.reps} · ${formatDate(pr.date)}</div>
            </div>
            <span class="badge badge-primary">${Math.round(pr.est1RM)} kg 1RM</span>
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
  function getRecoveryState(lastTrainedIso) {
    if (!lastTrainedIso) return { className: "heat-rec-rested", label: "Rested (Not trained recently)" };
    const hours = (Date.now() - new Date(lastTrainedIso).getTime()) / (1000 * 60 * 60);
    if (hours < 24) return { className: "heat-rec-fatigued", label: `Fatigued (${Math.round(hours)}h ago)` };
    if (hours < 48) return { className: "heat-rec-recovering", label: `Recovering (${Math.round(hours)}h ago)` };
    if (hours <= 96) return { className: "heat-rec-fresh", label: `Fresh (${Math.round(hours / 24)}d ago)` };
    return { className: "heat-rec-rested", label: `Rested (${Math.round(hours / 24)}d ago)` };
  }

  function renderBalancePanel(stats) {
    const el = document.getElementById("anatomy-balance-panel");
    if (!el) return;

    const sumSets = (keys) => keys.reduce((sum, k) => sum + (stats[k]?.weightedSets || 0), 0);
    const pushSets = sumSets(["chest", "front_delts", "triceps"]);
    const pullSets = sumSets(["lats", "mid_back", "rear_delts", "biceps"]);
    const upperSets = sumSets(["chest", "front_delts", "side_delts", "rear_delts", "traps", "lats", "mid_back", "biceps", "triceps", "forearms"]);
    const lowerSets = sumSets(["quads", "hamstrings", "glutes", "calves"]);

    const pushPullRatio = pullSets > 0 ? (pushSets / pullSets).toFixed(2) : pushSets > 0 ? "∞" : "—";
    const upperLowerRatio = lowerSets > 0 ? (upperSets / lowerSets).toFixed(2) : upperSets > 0 ? "∞" : "—";

    const lowestMuscle = Object.entries(stats)
      .sort((a, b) => a[1].weightedSets - b[1].weightedSets)[0];

    el.innerHTML = `
      <span class="eyebrow">Balance Diagnostics</span>
      <div class="balance-grid">
        <div class="kpi-box">
          <span class="kpi-label">Push / Pull Ratio</span>
          <strong class="kpi-value">${pushPullRatio}</strong>
          <span class="muted-note">${pushSets.toFixed(1).replace(/\.0$/, "")} vs ${pullSets.toFixed(1).replace(/\.0$/, "")} sets</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">Upper / Lower</span>
          <strong class="kpi-value">${upperLowerRatio}</strong>
          <span class="muted-note">${upperSets.toFixed(1).replace(/\.0$/, "")} vs ${lowerSets.toFixed(1).replace(/\.0$/, "")} sets</span>
        </div>
      </div>
      ${
        lowestMuscle
          ? `<div class="muted-note">Least stimulated: <strong>${MUSCLES[lowestMuscle[0]]}</strong> (${lowestMuscle[1].weightedSets.toFixed(1).replace(/\.0$/, "")} sets)</div>`
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
          ? top.map(([m, v]) => `<div class="muscle-ex-item"><strong>${MUSCLES[m]}</strong><span class="muted-note">${Math.round(v.volume).toLocaleString()} kg</span></div>`).join("")
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
    document.getElementById("muscle-stat-volume").textContent = `${Math.round(s.volume).toLocaleString()} kg`;
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
      releaseWakeLock();
      stopRestTimer(false);
      idleEl.classList.remove("hidden");
      activeEl.classList.add("hidden");
      renderWorkoutRecommendations();
      renderRoutinesList();
      return;
    }

    requestWakeLock();
    idleEl.classList.add("hidden");
    activeEl.classList.remove("hidden");
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
      const wNum = Number(s.weight) || 0;
      const rNum = Number(s.reps) || 0;
      if (wNum <= 0 || rNum <= 0) return false;
      const set1RM = wNum * (1 + rNum / 30);
      return histBest1RM === 0 || set1RM > histBest1RM;
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
            return `
              <div class="set-row" data-set-row="${exIdx}:${setIdx}">
                <span class="set-num">
                  <button class="set-type-btn ${setType ? `type-${setType}` : ""}" type="button" title="${typeTitle}" data-cycle-type="${exIdx}:${setIdx}">${typeLabel}</button>
                  <span class="pr-badge ${isPR ? "" : "hidden"}" data-pr-badge="${exIdx}:${setIdx}">PR!</span>
                </span>
                <input class="set-input" type="number" step="0.5" min="0" placeholder="kg" value="${s.weight}" data-ex="${exIdx}" data-set="${setIdx}" data-field="weight" />
                <input class="set-input" type="number" min="0" placeholder="reps" value="${s.reps}" data-ex="${exIdx}" data-set="${setIdx}" data-field="reps" />
                <button class="set-check ${s.completed ? "done" : ""}" type="button" data-toggle-set="${exIdx}:${setIdx}">✓</button>
                <button class="set-del" type="button" data-del-set="${exIdx}:${setIdx}">&times;</button>
              </div>`;
          })
          .join("");

        return `
          <div class="ex-log-card">
            <div class="ex-log-head">
              <div>
                <strong>${escapeHtml(ex.name)}</strong>
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
            <div class="ex-meta-row">
              <input class="ex-note-input" type="text" placeholder="Exercise note (e.g., pause reps, seat pin 4)..." value="${escapeHtml(item.note || "")}" data-ex-note="${exIdx}" />
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
            if (overload.weight > 0) s.weight = String(overload.weight);
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
        setObj[field] = inp.value;
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
              if (overload.weight > 0) setObj.weight = String(overload.weight);
              setObj.reps = String(overload.reps);
            }
          }
        }

        setObj.completed = nextCompleted;
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

  function finishWorkout() {
    const active = getActiveWorkout();
    if (!active) return;

    const cleanedExercises = active.exercises
      .map((item) => ({
        exerciseId: item.exerciseId,
        note: (item.note || "").trim(),
        rpe: item.rpe ? Number(item.rpe) : null,
        sets: item.sets
          .filter((s) => Number(s.reps) > 0 || Number(s.weight) > 0)
          .map((s) => ({
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            type: s.type || "",
            completed: true
          }))
      }))
      .filter((item) => item.sets.length > 0);

    if (!cleanedExercises.length) {
      alert("Log at least one set with weight or reps before saving.");
      return;
    }

    state.workouts.push({
      id: active.id,
      profileId: state.activeProfileId,
      title: document.getElementById("workout-title-input").value.trim() || "Workout",
      startedAt: active.startedAt,
      endedAt: new Date().toISOString(),
      exercises: cleanedExercises
    });

    releaseWakeLock();
    stopRestTimer();
    setActiveWorkout(null);
    switchView("anatomy");
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
  function renderAnalytics() {
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

    const getMonday = (d) => {
      const copy = new Date(d);
      const day = copy.getDay();
      const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
      copy.setDate(diff);
      copy.setHours(0, 0, 0, 0);
      return copy;
    };

    const thisMonday = getMonday(new Date());
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(thisMonday.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      weeks.push({
        startMs: start.getTime(),
        endMs: start.getTime() + 7 * 24 * 60 * 60 * 1000,
        label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        volume: 0
      });
    }

    const workouts = getProfileWorkouts(state.activeProfileId);
    workouts.forEach((w) => {
      const t = new Date(w.endedAt).getTime();
      const bucket = weeks.find((wk) => t >= wk.startMs && t < wk.endMs);
      if (!bucket) return;
      w.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.type === "W") return;
          bucket.volume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        });
      });
    });

    if (charts.weeklyTrend) charts.weeklyTrend.destroy();
    const ctx = canvas.getContext("2d");
    charts.weeklyTrend = new Chart(ctx, {
      type: "line",
      data: {
        labels: weeks.map((w) => w.label),
        datasets: [
          {
            label: "Weekly Volume (kg)",
            data: weeks.map((w) => Math.round(w.volume)),
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
        monthVol += w.exercises.reduce(
          (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0),
          0
        );
      }
    });

    summaryEl.textContent = `${monthSessions} session${monthSessions === 1 ? "" : "s"} · ${Math.round(monthVol).toLocaleString()} kg volume this month`;

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
          const vol = w.exercises.reduce(
            (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0),
            0
          );
          return `
            <div class="card" data-open-workout="${w.id}" style="cursor:pointer;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>${escapeHtml(w.title)}</strong>
                <span class="muted-note">${activeKey}</span>
              </div>
              <div class="muted-note" style="margin-top:4px;">${w.exercises.length} exercises · ${Math.round(vol).toLocaleString()} kg</div>
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
    const workouts = [...getProfileWorkouts(state.activeProfileId)].reverse();

    const labels = [];
    const data = [];
    workouts.forEach((w) => {
      const match = w.exercises.find((e) => e.exerciseId === exId);
      if (!match) return;
      const best1RM = Math.max(
        ...match.sets.map((s) => (Number(s.weight) || 0) * (1 + (Number(s.reps) || 0) / 30))
      );
      if (best1RM > 0) {
        labels.push(formatDate(w.endedAt));
        data.push(Math.round(best1RM * 10) / 10);
      }
    });

    if (charts.strength) charts.strength.destroy();
    const ctx = document.getElementById("chart-strength-progress").getContext("2d");
    charts.strength = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.length ? labels : ["No sessions"],
        datasets: [
          {
            label: "Est. 1RM (kg)",
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
        const setsCount = w.exercises.reduce((s, e) => s + e.sets.length, 0);
        const vol = w.exercises.reduce(
          (sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + s.weight * s.reps, 0),
          0
        );
        return `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong style="cursor:pointer;" data-view-wk="${w.id}">${escapeHtml(w.title)}</strong>
              <button class="btn btn-danger-ghost btn-sm" type="button" data-del-wk="${w.id}">Delete</button>
            </div>
            <div class="muted-note" style="margin-top:4px;cursor:pointer;" data-view-wk="${w.id}">
              ${formatDate(w.endedAt)} • ${w.exercises.length} exercises • ${setsCount} sets • ${Math.round(vol).toLocaleString()} kg
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
                ${item.sets.map((s, i) => `Set ${i + 1}: ${s.weight} kg × ${s.reps}`).join(" · ")}
              </div>
            </div>`;
        })
        .join("")}
      <button id="btn-save-as-routine" class="btn btn-secondary btn-full" type="button">Save as Custom Routine</button>
    `;
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

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported.workouts) || !Array.isArray(imported.profiles)) {
          alert("Invalid MUSCLEMAP backup file.");
          return;
        }
        state.exercises = mergeById(state.exercises, imported.exercises || []);
        state.workouts = mergeById(state.workouts, imported.workouts || []);
        state.measurements = mergeById(state.measurements, imported.measurements || []);
        if (imported.routines && !Array.isArray(imported.routines)) {
          state.routines.u1 = mergeById(state.routines.u1 || [], imported.routines.u1 || []);
          state.routines.u2 = mergeById(state.routines.u2 || [], imported.routines.u2 || []);
        }
        saveState();
        renderHeader();
        renderProfileModal();
        switchView(currentView);
        alert("Backup merged safely without overwriting existing records.");
      } catch {
        alert("Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
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

    document.getElementById("btn-customize-dash").addEventListener("click", openCustomizeDashboardModal);
    document.getElementById("btn-save-dash-prefs").addEventListener("click", () => {
      const nextPrefs = {};
      document.querySelectorAll("[data-widget-pref]").forEach((cb) => {
        nextPrefs[cb.dataset.widgetPref] = cb.checked;
      });
      state.dashboardPrefs[state.activeProfileId] = nextPrefs;
      saveState();
      closeModal("modal-customize-dash");
      applyDashboardWidgetPrefs();
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
  registerServiceWorker();
  initAmbientBackground();
  renderHeader();
  bindEvents();
  switchView("dashboard");
})();
