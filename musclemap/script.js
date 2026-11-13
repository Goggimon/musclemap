(() => {
  "use strict";

  const STORAGE_KEY = "musclemap_v1_state";

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
        { id: "u1", name: "Person 1", color: "#38bdf8" },
        { id: "u2", name: "Person 2", color: "#a855f7" }
      ],
      bodyProfiles: {
        u1: { age: "", heightCm: "", weightKg: "", targetWeightKg: "", goal: "Hypertrophy", level: "Intermediate" },
        u2: { age: "", heightCm: "", weightKg: "", targetWeightKg: "", goal: "Hypertrophy", level: "Intermediate" }
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
  let currentSide = "front";
  let currentWindow = "7";
  let selectedMuscle = null;
  let libraryMuscleFilter = "all";
  let timerInterval = null;
  let restInterval = null;
  let restRemaining = 0;
  let charts = { volume: null, strength: null, weight: null };

  // Form animation state
  let formAnimRaf = null;
  let formAnimPlaying = true;
  let formAnimSpeed = 1.0;
  let formAnimPhase = 0;
  let formLastTs = 0;
  let activeFormRig = null;

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  function drawEquipmentSvg(equip, wr) {
    let html = `<line x1="12" y1="152" x2="208" y2="152" stroke="#27324a" stroke-width="2" stroke-linecap="round"/>`;
    if (equip === "bench_flat") {
      html += `
        <rect x="46" y="106" width="96" height="8" rx="3" fill="#222c42" stroke="#3b4968" stroke-width="1"/>
        <line x1="58" y1="114" x2="58" y2="152" stroke="#3b4968" stroke-width="3"/>
        <line x1="130" y1="114" x2="130" y2="152" stroke="#3b4968" stroke-width="3"/>`;
    } else if (equip === "bench_incline") {
      html += `
        <line x1="62" y1="62" x2="112" y2="118" stroke="#3b4968" stroke-width="8" stroke-linecap="round"/>
        <line x1="112" y1="122" x2="144" y2="122" stroke="#3b4968" stroke-width="7" stroke-linecap="round"/>
        <line x1="86" y1="92" x2="86" y2="152" stroke="#3b4968" stroke-width="3"/>
        <line x1="134" y1="125" x2="134" y2="152" stroke="#3b4968" stroke-width="3"/>`;
    } else if (equip === "pullup_bar") {
      html += `
        <line x1="70" y1="26" x2="150" y2="26" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
        <line x1="72" y1="26" x2="72" y2="152" stroke="#27324a" stroke-width="2"/>
        <line x1="148" y1="26" x2="148" y2="152" stroke="#27324a" stroke-width="2"/>`;
    } else if (equip === "dip_bars") {
      html += `
        <line x1="84" y1="92" x2="132" y2="92" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
        <line x1="90" y1="92" x2="90" y2="152" stroke="#3b4968" stroke-width="3"/>
        <line x1="126" y1="92" x2="126" y2="152" stroke="#3b4968" stroke-width="3"/>`;
    } else if (equip === "machine_seat") {
      html += `
        <rect x="88" y="44" width="8" height="64" rx="3" fill="#222c42" stroke="#3b4968" stroke-width="1"/>
        <rect x="88" y="106" width="44" height="8" rx="3" fill="#222c42" stroke="#3b4968" stroke-width="1"/>
        <line x1="102" y1="114" x2="102" y2="152" stroke="#3b4968" stroke-width="3"/>`;
    } else if (equip === "lat_machine") {
      html += `
        <line x1="114" y1="14" x2="114" y2="${wr[1]}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 2"/>
        <line x1="70" y1="14" x2="156" y2="14" stroke="#3b4968" stroke-width="4" stroke-linecap="round"/>
        <rect x="88" y="108" width="44" height="8" rx="3" fill="#222c42" stroke="#3b4968" stroke-width="1"/>
        <line x1="104" y1="116" x2="104" y2="152" stroke="#3b4968" stroke-width="3"/>`;
    } else if (equip === "cable_high" || equip === "cable_mid") {
      const py = equip === "cable_high" ? 36 : 78;
      html += `
        <line x1="36" y1="20" x2="36" y2="152" stroke="#3b4968" stroke-width="4" stroke-linecap="round"/>
        <circle cx="36" cy="${py}" r="4" fill="#38bdf8"/>
        <line x1="36" y1="${py}" x2="${wr[0]}" y2="${wr[1]}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 2"/>`;
    } else if (equip === "leg_press") {
      html += `
        <line x1="50" y1="74" x2="88" y2="122" stroke="#3b4968" stroke-width="8" stroke-linecap="round"/>
        <line x1="88" y1="124" x2="116" y2="124" stroke="#3b4968" stroke-width="7" stroke-linecap="round"/>
        <line x1="138" y1="102" x2="174" y2="68" stroke="#27324a" stroke-width="3"/>`;
    }
    return html;
  }

  function renderStickmanFrame(rig, t) {
    const svg = document.getElementById("form-stickman-svg");
    if (!svg || !rig) return;

    const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const p = lerpPose(rig.start, rig.end, ease);
    const equipSvg = drawEquipmentSvg(rig.equip, p.wr);

    let propSvg = "";
    if (rig.prop === "bar") {
      propSvg = `
        <line x1="${p.wr[0] - 12}" y1="${p.wr[1]}" x2="${p.wr[0] + 12}" y2="${p.wr[1]}" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="${p.wr[0] - 12}" cy="${p.wr[1]}" r="5" fill="#f59e0b"/>
        <circle cx="${p.wr[0] + 12}" cy="${p.wr[1]}" r="5" fill="#f59e0b"/>`;
    } else if (rig.prop === "dumbbell") {
      propSvg = `
        <rect x="${p.wr[0] - 6}" y="${p.wr[1] - 4}" width="12" height="8" rx="2.5" fill="#38bdf8" stroke="#0b0f17" stroke-width="1"/>`;
    }

    const line = (a, b, color = "#e2e8f0", w = 4.5) =>
      `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
    const joint = (pt, r = 3.2, color = "#38bdf8") =>
      `<circle cx="${pt[0]}" cy="${pt[1]}" r="${r}" fill="${color}"/>`;

    svg.innerHTML = `
      ${equipSvg}
      ${line(p.hip, p.kn, "#94a3b8", 5)}
      ${line(p.kn, p.an, "#94a3b8", 4.5)}
      ${line(p.hip, p.neck, "#e2e8f0", 5.5)}
      ${line(p.sh, p.el, "#38bdf8", 4.5)}
      ${line(p.el, p.wr, "#38bdf8", 4)}
      <circle cx="${p.head[0]}" cy="${p.head[1]}" r="8.5" fill="#1e293b" stroke="#e2e8f0" stroke-width="2.5"/>
      ${joint(p.sh, 3.5, "#38bdf8")}
      ${joint(p.el, 3, "#7dd3fc")}
      ${joint(p.hip, 3.5, "#cbd5e1")}
      ${joint(p.kn, 3, "#cbd5e1")}
      ${propSvg}
    `;
  }

  function stepFormAnimation(ts) {
    if (!activeFormRig) return;
    if (!formLastTs) formLastTs = ts;
    const dt = Math.min(0.05, (ts - formLastTs) / 1000);
    formLastTs = ts;

    if (formAnimPlaying) {
      formAnimPhase = (formAnimPhase + dt * 0.45 * formAnimSpeed) % 1;
    }
    // Ping-pong with slight hold at Start (0) and Peak (1)
    const raw = formAnimPhase < 0.5 ? formAnimPhase * 2 : (1 - formAnimPhase) * 2;
    const t = Math.max(0, Math.min(1, (raw - 0.08) / 0.84));
    renderStickmanFrame(activeFormRig, t);
    formAnimRaf = requestAnimationFrame(stepFormAnimation);
  }

  function openExerciseFormModal(exerciseId) {
    const ex = getExerciseById(exerciseId);
    if (!ex) return;
    const rigKey = ex.rig && FORM_RIGS[ex.rig] ? ex.rig : "curl";
    activeFormRig = FORM_RIGS[rigKey];
    formAnimPlaying = true;
    formAnimPhase = 0;
    formLastTs = 0;

    document.getElementById("form-modal-title").textContent = ex.name;
    document.getElementById("form-modal-equip").textContent = `${ex.equipment} · Proper Form & Positioning`;
    document.getElementById("btn-form-play").textContent = "Pause";
    document.getElementById("btn-form-speed").textContent = `${formAnimSpeed.toFixed(1)}x`;

    document.getElementById("form-modal-muscles").innerHTML = `
      ${ex.primary.map((m) => `<span class="badge badge-primary">${MUSCLES[m]} (Primary)</span>`).join("")}
      ${ex.secondary.map((m) => `<span class="badge badge-secondary">${MUSCLES[m]} (Secondary)</span>`).join("")}
    `;
    document.getElementById("form-modal-cues").innerHTML = activeFormRig.cues
      .map((c) => `<li>${escapeHtml(c)}</li>`)
      .join("");

    if (formAnimRaf) cancelAnimationFrame(formAnimRaf);
    openModal("modal-exercise-form");
    formAnimRaf = requestAnimationFrame(stepFormAnimation);
  }

  function stopFormAnimation() {
    if (formAnimRaf) {
      cancelAnimationFrame(formAnimRaf);
      formAnimRaf = null;
    }
    activeFormRig = null;
  }

  /* ---------------- REST TIMER ---------------- */
  function updateRestDisplay() {
    const disp = document.getElementById("rest-timer-display");
    const stopBtn = document.getElementById("btn-rest-stop");
    if (!disp || !stopBtn) return;

    if (restRemaining > 0) {
      disp.textContent = `Rest: ${formatDuration(restRemaining * 1000)}`;
      disp.style.color = "var(--primary)";
      stopBtn.classList.remove("hidden");
    } else {
      disp.textContent = "Rest: Ready";
      disp.style.color = "";
      stopBtn.classList.add("hidden");
    }
  }

  function startRestTimer(seconds) {
    stopRestTimer();
    restRemaining = seconds;
    updateRestDisplay();
    restInterval = setInterval(() => {
      restRemaining -= 1;
      if (restRemaining <= 0) {
        stopRestTimer();
        document.getElementById("rest-timer-display").textContent = "Rest Done!";
        document.getElementById("rest-timer-display").style.color = "var(--success)";
      } else {
        updateRestDisplay();
      }
    }, 1000);
  }

  function stopRestTimer() {
    if (restInterval) {
      clearInterval(restInterval);
      restInterval = null;
    }
    restRemaining = 0;
    updateRestDisplay();
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

        const workingSets = item.sets.filter((s) => s.completed !== false && (Number(s.reps) > 0 || Number(s.weight) > 0));
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

    if (viewName === "dashboard") renderDashboard();
    if (viewName === "anatomy") renderAnatomy();
    if (viewName === "workout") renderWorkoutView();
    if (viewName === "library") renderLibrary();
    if (viewName === "analytics") renderAnalytics();
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
  function renderDashboard() {
    const profile = getActiveProfile();
    document.getElementById("dash-greeting").textContent = `Hey, ${profile.name}`;

    const cutoff7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent7 = getProfileWorkouts(profile.id).filter((w) => new Date(w.endedAt).getTime() >= cutoff7);

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
    const userWorkouts = getProfileWorkouts(profile.id).slice(0, 6);
    if (!userWorkouts.length) {
      feed.innerHTML = `<div class="empty-state">No workouts logged for <strong>${escapeHtml(profile.name)}</strong> yet. Tap <strong>+ Start Workout</strong> or pick a recommended day above.</div>`;
      return;
    }

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
  function renderAnatomy() {
    document.getElementById("svg-front").classList.toggle("active", currentSide === "front");
    document.getElementById("svg-back").classList.toggle("active", currentSide === "back");
    document.getElementById("btn-view-front").classList.toggle("active", currentSide === "front");
    document.getElementById("btn-view-back").classList.toggle("active", currentSide === "back");

    const cutoff =
      currentWindow === "all" ? 0 : Date.now() - Number(currentWindow) * 24 * 60 * 60 * 1000;
    const windowWorkouts = getProfileWorkouts(state.activeProfileId).filter(
      (w) => new Date(w.endedAt).getTime() >= cutoff
    );
    const windowLabel =
      currentWindow === "7" ? "7-Day Stimulus" : currentWindow === "30" ? "30-Day Volume" : "All-Time Total";
    document.getElementById("heatmap-window-summary").textContent =
      `${windowLabel} · ${windowWorkouts.length} workout${windowWorkouts.length === 1 ? "" : "s"} · Tap any muscle`;

    const stats = computeMuscleStats(state.activeProfileId, currentWindow);

    document.querySelectorAll(".muscle-part").forEach((el) => {
      const m = el.dataset.muscle;
      const level = getHeatLevel(stats[m]?.weightedSets || 0, currentWindow);
      el.classList.remove("heat-0", "heat-1", "heat-2", "heat-3", "heat-4", "selected");
      el.classList.add(`heat-${level}`);
      if (m === selectedMuscle) el.classList.add("selected");
    });

    renderMusclePanel(stats);
  }

  function renderMusclePanel(stats) {
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
    const level = getHeatLevel(s.weightedSets, currentWindow);
    const labels = ["Untrained", "Light Stimulus", "Moderate Load", "High Volume", "Peak Load"];

    statusEl.textContent = labels[level];
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

  function renderWorkoutView() {
    const active = getActiveWorkout();
    const idleEl = document.getElementById("workout-idle");
    const activeEl = document.getElementById("workout-active");

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (!active) {
      stopRestTimer();
      idleEl.classList.remove("hidden");
      activeEl.classList.add("hidden");
      renderWorkoutRecommendations();
      renderRoutinesList();
      return;
    }

    idleEl.classList.add("hidden");
    activeEl.classList.remove("hidden");
    document.getElementById("workout-title-input").value = active.title;

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

    container.innerHTML = active.exercises
      .map((item, exIdx) => {
        const ex = getExerciseById(item.exerciseId);
        if (!ex) return "";
        const lastHint = getLastExerciseSummary(ex.id);
        const setsHtml = item.sets
          .map(
            (s, setIdx) => `
            <div class="set-row">
              <span class="set-num">${setIdx + 1}</span>
              <input class="set-input" type="number" step="0.5" min="0" placeholder="kg" value="${s.weight}" data-ex="${exIdx}" data-set="${setIdx}" data-field="weight" />
              <input class="set-input" type="number" min="0" placeholder="reps" value="${s.reps}" data-ex="${exIdx}" data-set="${setIdx}" data-field="reps" />
              <button class="set-check ${s.completed ? "done" : ""}" type="button" data-toggle-set="${exIdx}:${setIdx}">✓</button>
              <button class="set-del" type="button" data-del-set="${exIdx}:${setIdx}">&times;</button>
            </div>`
          )
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
                <button class="btn btn-ghost btn-sm" type="button" data-open-form="${ex.id}">Form</button>
                <button class="btn btn-danger-ghost btn-sm" type="button" data-remove-ex="${exIdx}">Remove</button>
              </div>
            </div>
            <div class="set-grid-head">
              <span>Set</span><span>Weight</span><span>Reps</span><span>Done</span><span></span>
            </div>
            ${setsHtml}
            <button class="btn btn-secondary btn-sm" type="button" data-add-set="${exIdx}">+ Add Set</button>
          </div>`;
      })
      .join("");

    container.querySelectorAll("[data-open-form]").forEach((btn) => {
      btn.addEventListener("click", () => openExerciseFormModal(btn.dataset.openForm));
    });

    container.querySelectorAll(".set-input").forEach((inp) => {
      inp.addEventListener("input", () => {
        const { ex, set, field } = inp.dataset;
        active.exercises[ex].sets[set][field] = inp.value;
        saveState();
      });
    });

    container.querySelectorAll("[data-toggle-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [exIdx, setIdx] = btn.dataset.toggleSet.split(":").map(Number);
        active.exercises[exIdx].sets[setIdx].completed = !active.exercises[exIdx].sets[setIdx].completed;
        saveState();
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
        sets: item.sets
          .filter((s) => Number(s.reps) > 0 || Number(s.weight) > 0)
          .map((s) => ({
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
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

    listEl.innerHTML = filtered
      .map(
        (ex) => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
              <strong>${escapeHtml(ex.name)}</strong>
              <div class="muted-note">${escapeHtml(ex.equipment)}</div>
            </div>
            <button class="btn btn-ghost btn-sm" type="button" data-open-form="${ex.id}">Form</button>
          </div>
          <div class="badge-row">
            ${ex.primary.map((m) => `<span class="badge badge-primary">${MUSCLES[m]} (1.0x)</span>`).join("")}
            ${ex.secondary.map((m) => `<span class="badge badge-secondary">${MUSCLES[m]} (0.5x)</span>`).join("")}
          </div>
        </div>`
      )
      .join("");

    listEl.querySelectorAll("[data-open-form]").forEach((btn) => {
      btn.addEventListener("click", () => openExerciseFormModal(btn.dataset.openForm));
    });
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

  /* ---------------- ANALYTICS, HISTORY & FULL BODY INFO ---------------- */
  function renderAnalytics() {
    renderVolumeChart();
    populateStrengthSelect();
    renderStrengthChart();
    renderWorkoutHistory();
    renderBodyStats();
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
        datasets: [{ label: "Weighted Sets", data: values, backgroundColor: "#38bdf8", borderRadius: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8", font: { size: 11 } }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" }, beginAtZero: true }
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
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }
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
            borderColor: "#38bdf8",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
          y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }
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
    document.getElementById("btn-form-play").addEventListener("click", () => {
      formAnimPlaying = !formAnimPlaying;
      document.getElementById("btn-form-play").textContent = formAnimPlaying ? "Pause" : "Play";
    });
    document.getElementById("btn-form-start").addEventListener("click", () => {
      formAnimPlaying = false;
      document.getElementById("btn-form-play").textContent = "Play";
      renderStickmanFrame(activeFormRig, 0);
    });
    document.getElementById("btn-form-peak").addEventListener("click", () => {
      formAnimPlaying = false;
      document.getElementById("btn-form-play").textContent = "Play";
      renderStickmanFrame(activeFormRig, 1);
    });
    document.getElementById("btn-form-speed").addEventListener("click", () => {
      formAnimSpeed = formAnimSpeed === 1.0 ? 0.5 : 1.0;
      document.getElementById("btn-form-speed").textContent = `${formAnimSpeed.toFixed(1)}x`;
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
    document.getElementById("input-import-json").addEventListener("change", (e) => {
      if (e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = "";
    });

    document.getElementById("btn-dash-start").addEventListener("click", () => {
      if (getActiveWorkout()) switchView("workout");
      else startBlankWorkout();
    });
    document.getElementById("btn-start-blank").addEventListener("click", startBlankWorkout);
    document.getElementById("btn-add-exercise").addEventListener("click", openExercisePicker);
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

    document.querySelectorAll("[data-rest]").forEach((btn) => {
      btn.addEventListener("click", () => startRestTimer(Number(btn.dataset.rest)));
    });
    document.getElementById("btn-rest-stop").addEventListener("click", stopRestTimer);

    document.getElementById("btn-view-front").addEventListener("click", () => {
      currentSide = "front";
      renderAnatomy();
    });
    document.getElementById("btn-view-back").addEventListener("click", () => {
      currentSide = "back";
      renderAnatomy();
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

    document.getElementById("btn-new-routine").addEventListener("click", () => {
      document.getElementById("routine-name-input").value = "";
      document.getElementById("routine-exercise-checklist").innerHTML = state.exercises
        .map(
          (ex) => `
          <label class="chip-toggle" style="justify-content:space-between;border-radius:10px;padding:8px 10px;">
            <span>${escapeHtml(ex.name)}</span>
            <input type="checkbox" name="routineEx" value="${ex.id}" />
          </label>`
        )
        .join("");
      openModal("modal-routine");
    });
    document.getElementById("form-routine").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("routine-name-input").value.trim();
      const exerciseIds = [...document.querySelectorAll('input[name="routineEx"]:checked')].map((i) => i.value);
      if (!name || !exerciseIds.length) {
        alert("Enter a routine name and select at least one exercise.");
        return;
      }
      if (!state.routines[state.activeProfileId]) state.routines[state.activeProfileId] = [];
      state.routines[state.activeProfileId].push({ id: uid("rt"), name, exerciseIds });
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

  /* ---------------- INIT ---------------- */
  renderHeader();
  bindEvents();
  switchView("dashboard");
})();
