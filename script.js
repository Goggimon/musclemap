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
        { id: "u1", name: "Person 1", color: "#dc2626" },
        { id: "u2", name: "Person 2", color: "#9ca3af" }
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
      { label: "Tier 1 - Beginner", mult: 0.55, reps: "12–15", sets: "2–3", failure: "No (RIR 3)", failCls: "tier-fail-no" },
      { label: "Tier 2 - Moderate", mult: 0.75, reps: "8–12",  sets: "3",   failure: "No (RIR 1–2)", failCls: "tier-fail-no" },
      { label: "Tier 3 - Heavy",    mult: 0.95, reps: "6–8",   sets: "3–4", failure: "Last set", failCls: "tier-fail-last" },
      { label: "Tier 4 - Maximum",  mult: 1.12, reps: "3–5",   sets: "2–3", failure: "Yes", failCls: "tier-fail-yes" }
    ];

    const rows = tiersMeta.map((t, idx) => {
      let weightStr = "";
      if (spec.bw) {
        if (idx === 0) weightStr = spec.weighted ? "BW (Assisted)" : "BW";
        else if (idx === 1) weightStr = "BW";
        else if (idx === 2) weightStr = spec.weighted ? `BW + ${roundGymWeight(bw * 0.08 * mod, "Barbell")} kg` : "BW";
        else weightStr = spec.weighted ? `BW + ${roundGymWeight(bw * 0.18 * mod, "Barbell")} kg` : "BW + 5 kg";
      } else {
        const raw = bw * spec.r * t.mult * mod;
        const rounded = roundGymWeight(raw, ex.equipment);
        weightStr = spec.perHand ? `${rounded} kg × 2` : `${rounded} kg`;
      }
      return { ...t, weight: weightStr };
    });

    return { bw, goal: bp.goal || "Hypertrophy", rows };
  }

  function renderExerciseTierTableHtml(ex) {
    const data = getExerciseWeightTiers(ex);
    if (!data) return "";
    return `
      <div class="tier-head">
        <span class="eyebrow" style="margin-bottom:0;">Recommended Load Tiers</span>
        <span class="muted-note">Based on ${data.bw} kg · ${escapeHtml(data.goal)}</span>
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
            </tr>
          </thead>
          <tbody>
            ${data.rows
              .map(
                (r) => `
              <tr>
                <td>${r.label}</td>
                <td><strong>${escapeHtml(r.weight)}</strong></td>
                <td>${r.reps}</td>
                <td>${r.sets}</td>
                <td class="${r.failCls}">${r.failure}</td>
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

  function drawEquipmentSvg(equip, wr) {
    let html = `<line x1="12" y1="152" x2="208" y2="152" stroke="#262a34" stroke-width="2" stroke-linecap="round"/>`;
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
        <line x1="68" y1="26" x2="152" y2="26" stroke="#9ca3af" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="72" y1="26" x2="72" y2="152" stroke="#2a303c" stroke-width="2.5"/>
        <line x1="148" y1="26" x2="148" y2="152" stroke="#2a303c" stroke-width="2.5"/>`;
    } else if (equip === "dip_bars") {
      html += `
        <line x1="84" y1="92" x2="132" y2="92" stroke="#9ca3af" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="90" y1="92" x2="90" y2="152" stroke="#3a404d" stroke-width="3.5"/>
        <line x1="126" y1="92" x2="126" y2="152" stroke="#3a404d" stroke-width="3.5"/>`;
    } else if (equip === "machine_seat") {
      html += `
        <rect x="86" y="42" width="9" height="66" rx="2.5" fill="#1b1f27" stroke="#3f4654" stroke-width="1.2"/>
        <rect x="86" y="106" width="46" height="9" rx="2.5" fill="#1b1f27" stroke="#3f4654" stroke-width="1.2"/>
        <line x1="102" y1="115" x2="102" y2="152" stroke="#3a404d" stroke-width="3.5"/>`;
    } else if (equip === "lat_machine") {
      html += `
        <line x1="114" y1="14" x2="114" y2="${wr[1]}" stroke="#9ca3af" stroke-width="1.6" stroke-dasharray="3 2"/>
        <line x1="70" y1="14" x2="156" y2="14" stroke="#3f4654" stroke-width="4.5" stroke-linecap="round"/>
        <rect x="86" y="108" width="46" height="9" rx="2.5" fill="#1b1f27" stroke="#3f4654" stroke-width="1.2"/>
        <line x1="104" y1="117" x2="104" y2="152" stroke="#3a404d" stroke-width="3.5"/>`;
    } else if (equip === "cable_high" || equip === "cable_mid") {
      const py = equip === "cable_high" ? 36 : 78;
      html += `
        <line x1="36" y1="20" x2="36" y2="152" stroke="#3f4654" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="36" cy="${py}" r="5" fill="#191c22" stroke="#dc2626" stroke-width="2"/>
        <line x1="36" y1="${py}" x2="${wr[0]}" y2="${wr[1]}" stroke="#9ca3af" stroke-width="1.6" stroke-dasharray="3 2"/>`;
    } else if (equip === "leg_press") {
      html += `
        <line x1="50" y1="74" x2="88" y2="122" stroke="#3f4654" stroke-width="9" stroke-linecap="round"/>
        <line x1="88" y1="124" x2="116" y2="124" stroke="#3f4654" stroke-width="8" stroke-linecap="round"/>
        <line x1="138" y1="102" x2="174" y2="68" stroke="#2a303c" stroke-width="3.5"/>`;
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

  function renderStickmanFrame(rig, t) {
    const svg = document.getElementById("form-stickman-svg");
    if (!svg || !rig) return;

    const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const p = lerpPose(rig.start, rig.end, ease);
    const equipSvg = drawEquipmentSvg(rig.equip, p.wr);

    // Subtle far-side limb silhouette offset for 3D athletic depth
    const off = [4, 2];
    const farHip = [p.hip[0] + off[0], p.hip[1] + off[1]];
    const farKn = [p.kn[0] + off[0], p.kn[1] + off[1]];
    const farAn = [p.an[0] + off[0], p.an[1] + off[1]];
    const farSh = [p.sh[0] + off[0], p.sh[1] - 1];
    const farEl = [p.el[0] + off[0], p.el[1] + 1];
    const farWr = [p.wr[0] + off[0], p.wr[1] + 1];

    // Direction facing for shoe & head orientation
    const dir = p.head[0] <= p.hip[0] ? -1 : 1;
    const footDir = p.kn[0] >= p.hip[0] ? 1 : -1;

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

    svg.innerHTML = `
      ${equipSvg}

      <!-- Far-side limbs (subtle depth) -->
      ${taperedLimb(farHip, farKn, 5.2, 3.8, "#2a303c")}
      ${taperedLimb(farKn, farAn, 3.6, 2.3, "#2a303c")}
      ${taperedLimb(farSh, farEl, 3.8, 2.8, "#5a2024")}
      ${taperedLimb(farEl, farWr, 2.8, 2.0, "#5a2024")}

      <!-- Near-side Lower Body -->
      ${taperedLimb(p.hip, p.kn, 6.2, 4.4, "#6b7280", "#111318")}
      ${taperedLimb(p.kn, p.an, 4.3, 2.7, "#9ca3af", "#111318")}
      ${shoe(p.an, "#e5e7eb")}

      <!-- Neck & Structured Athletic Torso -->
      ${taperedLimb(p.neck, p.head, 3.2, 2.8, "#d1d5db")}
      ${taperedLimb(p.hip, p.neck, 5.4, 7.8, "#e5e7eb", "#111318")}

      <!-- Head with subtle brow orientation -->
      <circle cx="${p.head[0]}" cy="${p.head[1]}" r="8.5" fill="#191c22" stroke="#f3f4f6" stroke-width="2.2"/>
      <line x1="${p.head[0] + 2 * dir}" y1="${p.head[1] - 1.5}" x2="${p.head[0] + 7 * dir}" y2="${p.head[1] - 1.5}" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>

      <!-- Near-side Working Arm (Highlighted) -->
      ${taperedLimb(p.sh, p.el, 4.6, 3.3, "#dc2626", "#0b0c0e")}
      ${taperedLimb(p.el, p.wr, 3.3, 2.3, "#ef4444", "#0b0c0e")}
      <circle cx="${p.wr[0]}" cy="${p.wr[1]}" r="3" fill="#f3f4f6"/>

      <!-- Joint Markers -->
      <circle cx="${p.sh[0]}" cy="${p.sh[1]}" r="2.2" fill="#fca5a5"/>
      <circle cx="${p.el[0]}" cy="${p.el[1]}" r="1.8" fill="#fca5a5"/>
      <circle cx="${p.hip[0]}" cy="${p.hip[1]}" r="2.2" fill="#d1d5db"/>
      <circle cx="${p.kn[0]}" cy="${p.kn[1]}" r="1.8" fill="#e5e7eb"/>

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

    const tiersEl = document.getElementById("form-modal-tiers");
    const tierHtml = renderExerciseTierTableHtml(ex);
    if (tierHtml) {
      tiersEl.innerHTML = tierHtml;
      tiersEl.classList.remove("hidden");
    } else {
      tiersEl.innerHTML = "";
      tiersEl.classList.add("hidden");
    }

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

  function startRestTimer(seconds) {
    stopRestTimer(false);
    const settings = getProfileSettings();
    settings.defaultRestSec = seconds;
    restEndsAt = Date.now() + seconds * 1000;
    const active = getActiveWorkout();
    if (active) active.restEndsAt = restEndsAt;
    saveState();

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
      const validSets = match.sets.filter((s) => Number(s.reps) > 0 || Number(s.weight) > 0);
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

    document.querySelectorAll(".metric-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.metric === currentMetric);
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
    renderBalancePanel(stats);
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
      stopRestTimer(false);
      idleEl.classList.remove("hidden");
      activeEl.classList.add("hidden");
      renderWorkoutRecommendations();
      renderRoutinesList();
      return;
    }

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

    container.innerHTML = active.exercises
      .map((item, exIdx) => {
        const ex = getExerciseById(item.exerciseId);
        if (!ex) return "";
        const lastHint = getLastExerciseSummary(ex.id);
        const overload = getOverloadSuggestion(ex.id);
        const histBest1RM = getHistoricalBest1RM(ex.id);

        const setsHtml = item.sets
          .map((s, setIdx) => {
            const wNum = Number(s.weight) || 0;
            const rNum = Number(s.reps) || 0;
            const set1RM = wNum > 0 && rNum > 0 ? wNum * (1 + rNum / 30) : 0;
            const isPR = histBest1RM > 0 && set1RM > histBest1RM;
            return `
              <div class="set-row">
                <span class="set-num">${setIdx + 1}${isPR ? '<span class="pr-badge">PR!</span>' : ""}</span>
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
          if (!s.completed) {
            if (overload.weight > 0) s.weight = String(overload.weight);
            s.reps = String(overload.reps);
          }
        });
        saveState();
        renderWorkoutView();
      });
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
    renderCalendar();
    renderWorkoutHistory();
    renderBodyStats();
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
        datasets: [{ label: "Weighted Sets", data: values, backgroundColor: "#dc2626", borderRadius: 3 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#9ca3af", font: { size: 11 } }, grid: { display: false } },
          y: { ticks: { color: "#9ca3af" }, grid: { color: "#262a34" }, beginAtZero: true }
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
            borderColor: "#dc2626",
            backgroundColor: "rgba(220, 38, 38, 0.14)",
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
          x: { ticks: { color: "#9ca3af" }, grid: { display: false } },
          y: { ticks: { color: "#9ca3af" }, grid: { color: "#262a34" } }
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
            borderColor: "#dc2626",
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#9ca3af" }, grid: { display: false } },
          y: { ticks: { color: "#9ca3af" }, grid: { color: "#262a34" } }
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
      ["Date", "Workout", "Exercise", "Equipment", "Set", "Weight_kg", "Reps", "Volume_kg", "Est_1RM_kg"].join(",")
    ];
    workouts.forEach((w) => {
      const dateStr = new Date(w.endedAt).toISOString();
      w.exercises.forEach((item) => {
        const ex = getExerciseById(item.exerciseId);
        const exName = ex ? ex.name : item.exerciseId;
        const equip = ex ? ex.equipment : "";
        item.sets.forEach((s, idx) => {
          const wt = Number(s.weight) || 0;
          const rp = Number(s.reps) || 0;
          const vol = wt * rp;
          const e1rm = wt > 0 && rp > 0 ? (wt * (1 + rp / 30)).toFixed(1) : "0";
          rows.push(
            [
              csvEscape(dateStr),
              csvEscape(w.title),
              csvEscape(exName),
              csvEscape(equip),
              idx + 1,
              wt,
              rp,
              vol,
              e1rm
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
    document.querySelectorAll(".metric-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentMetric = btn.dataset.metric;
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
