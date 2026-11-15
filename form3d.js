(() => {
  "use strict";

  // 3D Skinned GLB + Procedural Fallback Engine for MUSCLEMAP (Three.js + OrbitControls + GLTFLoader)
  // Coordinate system: meters, Y-up, floor at y = 0, athlete faces +Z by default.

  const GLB_URL = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r147/examples/models/gltf/Xbot.glb";

  const JOINT_KEYS = [
    "pelvis", "lumbar", "chest", "neck", "head",
    "shL", "elL", "wrL", "shR", "elR", "wrR",
    "hipL", "knL", "anL", "toeL", "hipR", "knR", "anR", "toeR"
  ];

  const MUSCLE_KEYS = [
    "chest", "front_delts", "side_delts", "rear_delts", "traps",
    "lats", "mid_back", "lower_back", "biceps", "triceps", "forearms",
    "abs", "obliques", "quads", "hamstrings", "glutes", "calves"
  ];

  function makePose(overrides) {
    const base = {
      pelvis: [0, 0.92, 0],
      lumbar: [0, 1.10, 0],
      chest:  [0, 1.34, 0],
      neck:   [0, 1.48, 0],
      head:   [0, 1.62, 0.01],
      shL:    [-0.20, 1.38, 0],
      elL:    [-0.24, 1.12, 0.02],
      wrL:    [-0.24, 0.86, 0.08],
      shR:    [0.20, 1.38, 0],
      elR:    [0.24, 1.12, 0.02],
      wrR:    [0.24, 0.86, 0.08],
      hipL:   [-0.11, 0.90, 0],
      knL:    [-0.12, 0.48, 0.02],
      anL:    [-0.12, 0.07, 0],
      toeL:   [-0.12, 0.03, 0.14],
      hipR:   [0.11, 0.90, 0],
      knR:    [0.12, 0.48, 0.02],
      anR:    [0.12, 0.07, 0],
      toeR:   [0.12, 0.03, 0.14]
    };
    return { ...base, ...overrides };
  }

  function makeSupinePose(overrides) {
    const base = {
      pelvis: [0, 0.54, 0.18],
      lumbar: [0, 0.55, 0.0],
      chest:  [0, 0.57, -0.24],
      neck:   [0, 0.56, -0.38],
      head:   [0, 0.58, -0.52],
      shL:    [-0.20, 0.55, -0.26],
      elL:    [-0.32, 0.50, -0.18],
      wrL:    [-0.28, 0.72, -0.22],
      shR:    [0.20, 0.55, -0.26],
      elR:    [0.32, 0.50, -0.18],
      wrR:    [0.28, 0.72, -0.22],
      hipL:   [-0.12, 0.52, 0.22],
      knL:    [-0.18, 0.44, 0.56],
      anL:    [-0.20, 0.07, 0.60],
      toeL:   [-0.20, 0.03, 0.72],
      hipR:   [0.12, 0.52, 0.22],
      knR:    [0.18, 0.44, 0.56],
      anR:    [0.20, 0.07, 0.60],
      toeR:   [0.20, 0.03, 0.72]
    };
    return { ...base, ...overrides };
  }

  function makeSeatedPose(overrides) {
    const base = {
      pelvis: [0, 0.54, 0],
      lumbar: [0, 0.72, -0.04],
      chest:  [0, 0.96, -0.06],
      neck:   [0, 1.10, -0.05],
      head:   [0, 1.24, -0.03],
      shL:    [-0.20, 1.00, -0.06],
      elL:    [-0.26, 0.76, 0.04],
      wrL:    [-0.22, 0.62, 0.22],
      shR:    [0.20, 1.00, -0.06],
      elR:    [0.26, 0.76, 0.04],
      wrR:    [0.22, 0.62, 0.22],
      hipL:   [-0.12, 0.53, 0.04],
      knL:    [-0.16, 0.48, 0.44],
      anL:    [-0.16, 0.07, 0.46],
      toeL:   [-0.16, 0.03, 0.58],
      hipR:   [0.12, 0.53, 0.04],
      knR:    [0.16, 0.48, 0.44],
      anR:    [0.16, 0.07, 0.46],
      toeR:   [0.16, 0.03, 0.58]
    };
    return { ...base, ...overrides };
  }

  const RIGS_3D = {
    bench_press: {
      equip: "bench_flat", prop: "bar", track: "midWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSupinePose({
        chest: [0, 0.59, -0.24],
        elL: [-0.34, 0.48, -0.16], wrL: [-0.32, 0.69, -0.20],
        elR: [0.34, 0.48, -0.16],  wrR: [0.32, 0.69, -0.20]
      }),
      end: makeSupinePose({
        chest: [0, 0.59, -0.24],
        elL: [-0.26, 0.80, -0.22], wrL: [-0.32, 1.04, -0.25],
        elR: [0.26, 0.80, -0.22],  wrR: [0.32, 1.04, -0.25]
      })
    },
    incline_press: {
      equip: "bench_incline", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSeatedPose({
        pelvis: [0, 0.50, 0.06], lumbar: [0, 0.65, -0.06], chest: [0, 0.86, -0.22],
        neck: [0, 0.98, -0.30], head: [0, 1.10, -0.36],
        shL: [-0.20, 0.88, -0.22], elL: [-0.34, 0.76, -0.10], wrL: [-0.30, 0.96, -0.12],
        shR: [0.20, 0.88, -0.22],  elR: [0.34, 0.76, -0.10],  wrR: [0.30, 0.96, -0.12]
      }),
      end: makeSeatedPose({
        pelvis: [0, 0.50, 0.06], lumbar: [0, 0.65, -0.06], chest: [0, 0.86, -0.22],
        neck: [0, 0.98, -0.30], head: [0, 1.10, -0.36],
        shL: [-0.20, 0.88, -0.22], elL: [-0.20, 1.08, -0.16], wrL: [-0.14, 1.32, -0.16],
        shR: [0.20, 0.88, -0.22],  elR: [0.20, 1.08, -0.16],  wrR: [0.14, 1.32, -0.16]
      })
    },
    chest_fly: {
      equip: "bench_flat", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSupinePose({
        elL: [-0.46, 0.50, -0.24], wrL: [-0.66, 0.56, -0.24],
        elR: [0.46, 0.50, -0.24],  wrR: [0.66, 0.56, -0.24]
      }),
      end: makeSupinePose({
        elL: [-0.20, 0.82, -0.24], wrL: [-0.08, 1.04, -0.24],
        elR: [0.20, 0.82, -0.24],  wrR: [0.08, 1.04, -0.24]
      })
    },
    db_pullover: {
      equip: "bench_flat", prop: "dumbbell_single", track: "midWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSupinePose({
        shL: [-0.18, 0.55, -0.26], elL: [-0.12, 0.58, -0.54], wrL: [-0.06, 0.44, -0.76],
        shR: [0.18, 0.55, -0.26],  elR: [0.12, 0.58, -0.54],  wrR: [0.06, 0.44, -0.76]
      }),
      end: makeSupinePose({
        shL: [-0.18, 0.55, -0.26], elL: [-0.12, 0.82, -0.26], wrL: [-0.06, 1.02, -0.20],
        shR: [0.18, 0.55, -0.26],  elR: [0.12, 0.82, -0.26],  wrR: [0.06, 1.02, -0.20]
      })
    },
    cable_fly: {
      equip: "cable_dual", prop: "cable_handles", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        lumbar: [0, 1.10, 0.03], chest: [0, 1.33, 0.06], neck: [0, 1.47, 0.07], head: [0, 1.61, 0.09],
        shL: [-0.20, 1.36, 0.06], elL: [-0.46, 1.28, -0.02], wrL: [-0.64, 1.24, -0.08],
        shR: [0.20, 1.36, 0.06],  elR: [0.46, 1.28, -0.02],  wrR: [0.64, 1.24, -0.08],
        knL: [-0.12, 0.48, 0.14], anL: [-0.12, 0.07, 0.18], toeL: [-0.12, 0.03, 0.30],
        knR: [0.12, 0.48, -0.10], anR: [0.12, 0.07, -0.18], toeR: [0.12, 0.03, -0.06]
      }),
      end: makePose({
        lumbar: [0, 1.10, 0.03], chest: [0, 1.33, 0.06], neck: [0, 1.47, 0.07], head: [0, 1.61, 0.09],
        shL: [-0.20, 1.36, 0.06], elL: [-0.26, 1.22, 0.30], wrL: [-0.06, 1.18, 0.46],
        shR: [0.20, 1.36, 0.06],  elR: [0.26, 1.22, 0.30],  wrR: [0.06, 1.18, 0.46],
        knL: [-0.12, 0.48, 0.14], anL: [-0.12, 0.07, 0.18], toeL: [-0.12, 0.03, 0.30],
        knR: [0.12, 0.48, -0.10], anR: [0.12, 0.07, -0.18], toeR: [0.12, 0.03, -0.06]
      })
    },
    pec_deck: {
      equip: "pec_deck_machine", prop: "none", track: "bothWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSeatedPose({
        elL: [-0.46, 0.96, -0.02], wrL: [-0.46, 1.16, 0.04],
        elR: [0.46, 0.96, -0.02],  wrR: [0.46, 1.16, 0.04]
      }),
      end: makeSeatedPose({
        elL: [-0.20, 0.96, 0.22], wrL: [-0.08, 1.10, 0.36],
        elR: [0.20, 0.96, 0.22],  wrR: [0.08, 1.10, 0.36]
      })
    },
    reverse_pec_deck: {
      equip: "pec_deck_machine", prop: "none", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makeSeatedPose({
        elL: [-0.14, 0.98, 0.26], wrL: [-0.08, 0.98, 0.48],
        elR: [0.14, 0.98, 0.26],  wrR: [0.08, 0.98, 0.48]
      }),
      end: makeSeatedPose({
        elL: [-0.44, 0.98, -0.04], wrL: [-0.66, 0.98, -0.12],
        elR: [0.44, 0.98, -0.04],  wrR: [0.66, 0.98, -0.12]
      })
    },
    machine_press: {
      equip: "chest_press_machine", prop: "none", track: "bothWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSeatedPose({
        elL: [-0.34, 0.92, -0.14], wrL: [-0.28, 0.96, 0.12],
        elR: [0.34, 0.92, -0.14],  wrR: [0.28, 0.96, 0.12]
      }),
      end: makeSeatedPose({
        elL: [-0.26, 0.96, 0.16], wrL: [-0.24, 0.98, 0.44],
        elR: [0.26, 0.96, 0.16],  wrR: [0.24, 0.98, 0.44]
      })
    },
    dips: {
      equip: "dip_bars", prop: "none", track: "pelvis", angleType: "elbow", mistakeType: "press_flare",
      start: makePose({
        pelvis: [0, 1.12, 0], lumbar: [0, 1.29, 0.04], chest: [0, 1.52, 0.08],
        neck: [0, 1.65, 0.10], head: [0, 1.78, 0.12],
        shL: [-0.22, 1.54, 0.08], elL: [-0.28, 1.30, 0.04], wrL: [-0.28, 1.06, 0.04],
        shR: [0.22, 1.54, 0.08],  elR: [0.28, 1.30, 0.04],  wrR: [0.28, 1.06, 0.04],
        hipL: [-0.11, 1.10, 0], knL: [-0.12, 0.72, -0.06], anL: [-0.12, 0.44, -0.22], toeL: [-0.12, 0.38, -0.14],
        hipR: [0.11, 1.10, 0],  knR: [0.12, 0.72, -0.06],  anR: [0.12, 0.44, -0.22],  toeR: [0.12, 0.38, -0.14]
      }),
      end: makePose({
        pelvis: [0, 0.84, 0], lumbar: [0, 1.01, 0.06], chest: [0, 1.24, 0.12],
        neck: [0, 1.37, 0.14], head: [0, 1.50, 0.16],
        shL: [-0.22, 1.26, 0.12], elL: [-0.32, 1.24, -0.12], wrL: [-0.28, 1.06, 0.04],
        shR: [0.22, 1.26, 0.12],  elR: [0.32, 1.24, -0.12],  wrR: [0.28, 1.06, 0.04],
        hipL: [-0.11, 0.82, 0], knL: [-0.12, 0.46, -0.08], anL: [-0.12, 0.20, -0.26], toeL: [-0.12, 0.14, -0.18],
        hipR: [0.11, 0.82, 0],  knR: [0.12, 0.46, -0.08],  anR: [0.12, 0.20, -0.26],  toeR: [0.12, 0.14, -0.18]
      })
    },
    pushup: {
      equip: "floor", prop: "none", track: "pelvis", angleType: "elbow", mistakeType: "press_flare", prone: true,
      start: makePose({
        pelvis: [0, 0.34, -0.08], lumbar: [0, 0.40, 0.08], chest: [0, 0.48, 0.28],
        neck: [0, 0.52, 0.40], head: [0, 0.56, 0.54],
        shL: [-0.20, 0.46, 0.28], elL: [-0.26, 0.25, 0.26], wrL: [-0.26, 0.04, 0.30],
        shR: [0.20, 0.46, 0.28],  elR: [0.26, 0.25, 0.26],  wrR: [0.26, 0.04, 0.30],
        hipL: [-0.11, 0.33, -0.10], knL: [-0.12, 0.22, -0.44], anL: [-0.12, 0.10, -0.78], toeL: [-0.12, 0.03, -0.82],
        hipR: [0.11, 0.33, -0.10],  knR: [0.12, 0.22, -0.44],  anR: [0.12, 0.10, -0.78],  toeR: [0.12, 0.03, -0.82]
      }),
      end: makePose({
        pelvis: [0, 0.20, -0.08], lumbar: [0, 0.20, 0.08], chest: [0, 0.20, 0.28],
        neck: [0, 0.21, 0.40], head: [0, 0.22, 0.54],
        shL: [-0.20, 0.18, 0.28], elL: [-0.34, 0.22, 0.14], wrL: [-0.26, 0.04, 0.30],
        shR: [0.20, 0.18, 0.28],  elR: [0.34, 0.22, 0.14],  wrR: [0.26, 0.04, 0.30],
        hipL: [-0.11, 0.19, -0.10], knL: [-0.12, 0.13, -0.44], anL: [-0.12, 0.08, -0.78], toeL: [-0.12, 0.03, -0.82],
        hipR: [0.11, 0.19, -0.10],  knR: [0.12, 0.13, -0.44],  anR: [0.12, 0.08, -0.78],  toeR: [0.12, 0.03, -0.82]
      })
    },
    ohp: {
      equip: "floor", prop: "bar", track: "midWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        elL: [-0.24, 1.18, 0.14], wrL: [-0.26, 1.42, 0.12],
        elR: [0.24, 1.18, 0.14],  wrR: [0.26, 1.42, 0.12]
      }),
      end: makePose({
        head: [0, 1.62, 0.04],
        elL: [-0.24, 1.64, 0.02], wrL: [-0.26, 1.90, 0.0],
        elR: [0.24, 1.64, 0.02],  wrR: [0.26, 1.90, 0.0]
      })
    },
    seated_ohp: {
      equip: "machine_seat", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSeatedPose({
        elL: [-0.30, 0.84, 0.04], wrL: [-0.30, 1.08, 0.04],
        elR: [0.30, 0.84, 0.04],  wrR: [0.30, 1.08, 0.04]
      }),
      end: makeSeatedPose({
        elL: [-0.20, 1.24, 0.0], wrL: [-0.16, 1.48, 0.0],
        elR: [0.20, 1.24, 0.0],  wrR: [0.16, 1.48, 0.0]
      })
    },
    shoulder_machine: {
      equip: "shoulder_press_machine", prop: "none", track: "bothWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSeatedPose({
        elL: [-0.32, 0.84, 0.04], wrL: [-0.32, 1.08, 0.04],
        elR: [0.32, 0.84, 0.04],  wrR: [0.32, 1.08, 0.04]
      }),
      end: makeSeatedPose({
        elL: [-0.24, 1.24, 0.0], wrL: [-0.26, 1.48, 0.0],
        elR: [0.24, 1.24, 0.0],  wrR: [0.26, 1.48, 0.0]
      })
    },
    lat_raise: {
      equip: "floor", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        elL: [-0.24, 1.12, 0.04], wrL: [-0.22, 0.88, 0.08],
        elR: [0.24, 1.12, 0.04],  wrR: [0.22, 0.88, 0.08]
      }),
      end: makePose({
        elL: [-0.46, 1.38, 0.06], wrL: [-0.70, 1.36, 0.08],
        elR: [0.46, 1.38, 0.06],  wrR: [0.70, 1.36, 0.08]
      })
    },
    front_raise: {
      equip: "floor", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        elL: [-0.22, 1.12, 0.04], wrL: [-0.20, 0.88, 0.10],
        elR: [0.22, 1.12, 0.04],  wrR: [0.20, 0.88, 0.10]
      }),
      end: makePose({
        elL: [-0.20, 1.38, 0.26], wrL: [-0.18, 1.38, 0.50],
        elR: [0.20, 1.38, 0.26],  wrR: [0.18, 1.38, 0.50]
      })
    },
    rear_delt_fly: {
      equip: "floor", prop: "dumbbell_pair", track: "bothWr", angleType: "hip", mistakeType: "round_back",
      start: makePose({
        pelvis: [0, 0.88, -0.06], lumbar: [0, 0.94, 0.10], chest: [0, 1.00, 0.30],
        neck: [0, 1.03, 0.42], head: [0, 1.06, 0.54],
        shL: [-0.20, 1.00, 0.30], elL: [-0.22, 0.76, 0.32], wrL: [-0.20, 0.52, 0.32],
        shR: [0.20, 1.00, 0.30],  elR: [0.22, 0.76, 0.32],  wrR: [0.20, 0.52, 0.32],
        knL: [-0.13, 0.48, -0.02], knR: [0.13, 0.48, -0.02]
      }),
      end: makePose({
        pelvis: [0, 0.88, -0.06], lumbar: [0, 0.94, 0.10], chest: [0, 1.00, 0.30],
        neck: [0, 1.03, 0.42], head: [0, 1.06, 0.54],
        shL: [-0.20, 1.00, 0.30], elL: [-0.44, 1.04, 0.28], wrL: [-0.66, 1.04, 0.24],
        shR: [0.20, 1.00, 0.30],  elR: [0.44, 1.04, 0.28],  wrR: [0.66, 1.04, 0.24],
        knL: [-0.13, 0.48, -0.02], knR: [0.13, 0.48, -0.02]
      })
    },
    face_pull: {
      equip: "cable_high", prop: "rope", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        shL: [-0.20, 1.38, 0], elL: [-0.16, 1.40, 0.26], wrL: [-0.08, 1.44, 0.48],
        shR: [0.20, 1.38, 0],  elR: [0.16, 1.40, 0.26],  wrR: [0.08, 1.44, 0.48],
        knL: [-0.12, 0.48, 0.08], anL: [-0.12, 0.07, 0.10],
        knR: [0.12, 0.48, -0.08], anR: [0.12, 0.07, -0.14]
      }),
      end: makePose({
        shL: [-0.20, 1.38, 0], elL: [-0.36, 1.44, 0.04], wrL: [-0.22, 1.56, 0.16],
        shR: [0.20, 1.38, 0],  elR: [0.36, 1.44, 0.04],  wrR: [0.22, 1.56, 0.16],
        knL: [-0.12, 0.48, 0.08], anL: [-0.12, 0.07, 0.10],
        knR: [0.12, 0.48, -0.08], anR: [0.12, 0.07, -0.14]
      })
    },
    pullup: {
      equip: "pullup_bar", prop: "none", track: "pelvis", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        pelvis: [0, 0.92, 0], lumbar: [0, 1.10, 0], chest: [0, 1.34, 0],
        neck: [0, 1.48, 0], head: [0, 1.62, 0.02],
        shL: [-0.20, 1.40, 0], elL: [-0.28, 1.64, 0], wrL: [-0.30, 1.90, 0],
        shR: [0.20, 1.40, 0],  elR: [0.28, 1.64, 0],  wrR: [0.30, 1.90, 0],
        hipL: [-0.11, 0.90, 0], knL: [-0.12, 0.52, -0.06], anL: [-0.12, 0.24, -0.22], toeL: [-0.12, 0.18, -0.14],
        hipR: [0.11, 0.90, 0],  knR: [0.12, 0.52, -0.06],  anR: [0.12, 0.24, -0.22],  toeR: [0.12, 0.18, -0.14]
      }),
      end: makePose({
        pelvis: [0, 1.34, 0.06], lumbar: [0, 1.52, 0.04], chest: [0, 1.76, -0.02],
        neck: [0, 1.90, -0.04], head: [0, 2.02, -0.04],
        shL: [-0.20, 1.78, -0.02], elL: [-0.34, 1.64, -0.04], wrL: [-0.30, 1.90, 0],
        shR: [0.20, 1.78, -0.02],  elR: [0.34, 1.64, -0.04],  wrR: [0.30, 1.90, 0],
        hipL: [-0.11, 1.32, 0.06], knL: [-0.12, 0.94, 0.02], anL: [-0.12, 0.64, -0.14], toeL: [-0.12, 0.58, -0.06],
        hipR: [0.11, 1.32, 0.06],  knR: [0.12, 0.94, 0.02],  anR: [0.12, 0.64, -0.14],  toeR: [0.12, 0.58, -0.06]
      })
    },
    lat_pulldown: {
      equip: "lat_machine", prop: "lat_bar", track: "midWr", angleType: "elbow", mistakeType: "swing",
      start: makeSeatedPose({
        chest: [0, 0.96, -0.08], neck: [0, 1.10, -0.10], head: [0, 1.24, -0.10],
        shL: [-0.20, 1.02, -0.08], elL: [-0.28, 1.28, -0.04], wrL: [-0.32, 1.54, 0.0],
        shR: [0.20, 1.02, -0.08],  elR: [0.28, 1.28, -0.04],  wrR: [0.32, 1.54, 0.0]
      }),
      end: makeSeatedPose({
        chest: [0, 0.96, -0.10], neck: [0, 1.10, -0.14], head: [0, 1.24, -0.14],
        shL: [-0.20, 1.00, -0.10], elL: [-0.32, 0.78, -0.04], wrL: [-0.32, 1.00, 0.06],
        shR: [0.20, 1.00, -0.10],  elR: [0.32, 0.78, -0.04],  wrR: [0.32, 1.00, 0.06]
      })
    },
    bent_row: {
      equip: "floor", prop: "bar", track: "midWr", angleType: "hip", mistakeType: "round_back",
      start: makePose({
        pelvis: [0, 0.88, -0.06], lumbar: [0, 1.00, 0.08], chest: [0, 1.14, 0.24],
        neck: [0, 1.22, 0.34], head: [0, 1.30, 0.44],
        shL: [-0.20, 1.14, 0.24], elL: [-0.22, 0.88, 0.24], wrL: [-0.24, 0.62, 0.24],
        shR: [0.20, 1.14, 0.24],  elR: [0.22, 0.88, 0.24],  wrR: [0.24, 0.62, 0.24],
        knL: [-0.14, 0.48, 0.04], knR: [0.14, 0.48, 0.04]
      }),
      end: makePose({
        pelvis: [0, 0.88, -0.06], lumbar: [0, 1.00, 0.08], chest: [0, 1.14, 0.24],
        neck: [0, 1.22, 0.34], head: [0, 1.30, 0.44],
        shL: [-0.20, 1.14, 0.24], elL: [-0.24, 1.12, 0.02], wrL: [-0.24, 0.90, 0.14],
        shR: [0.20, 1.14, 0.24],  elR: [0.24, 1.12, 0.02],  wrR: [0.24, 0.90, 0.14],
        knL: [-0.14, 0.48, 0.04], knR: [0.14, 0.48, 0.04]
      })
    },
    single_arm_row: {
      equip: "bench_flat", prop: "dumbbell_right", track: "wrR", angleType: "elbow", mistakeType: "round_back", prone: true,
      start: makePose({
        pelvis: [0.02, 0.78, 0.20], lumbar: [0.02, 0.80, 0.02], chest: [0.02, 0.82, -0.18],
        neck: [0.02, 0.84, -0.30], head: [0.02, 0.86, -0.44],
        shL: [-0.18, 0.80, -0.18], elL: [-0.18, 0.64, -0.22], wrL: [-0.16, 0.48, -0.24],
        shR: [0.20, 0.80, -0.18],  elR: [0.22, 0.56, -0.16],  wrR: [0.22, 0.32, -0.14],
        hipL: [-0.10, 0.76, 0.22], knL: [-0.12, 0.48, 0.22], anL: [-0.12, 0.46, 0.48], toeL: [-0.12, 0.42, 0.54],
        hipR: [0.14, 0.76, 0.22],  knR: [0.22, 0.46, 0.24],  anR: [0.24, 0.07, 0.26],  toeR: [0.24, 0.03, 0.38]
      }),
      end: makePose({
        pelvis: [0.02, 0.78, 0.20], lumbar: [0.02, 0.80, 0.02], chest: [0.02, 0.82, -0.18],
        neck: [0.02, 0.84, -0.30], head: [0.02, 0.86, -0.44],
        shL: [-0.18, 0.80, -0.18], elL: [-0.18, 0.64, -0.22], wrL: [-0.16, 0.48, -0.24],
        shR: [0.20, 0.80, -0.18],  elR: [0.24, 0.92, -0.02],  wrR: [0.22, 0.68, -0.02],
        hipL: [-0.10, 0.76, 0.22], knL: [-0.12, 0.48, 0.22], anL: [-0.12, 0.46, 0.48], toeL: [-0.12, 0.42, 0.54],
        hipR: [0.14, 0.76, 0.22],  knR: [0.22, 0.46, 0.24],  anR: [0.24, 0.07, 0.26],  toeR: [0.24, 0.03, 0.38]
      })
    },
    incline_row: {
      equip: "bench_incline", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "round_back", prone: true,
      start: makeSeatedPose({
        pelvis: [0, 0.54, 0.06], lumbar: [0, 0.68, -0.04], chest: [0, 0.88, -0.20],
        neck: [0, 0.98, -0.28], head: [0, 1.08, -0.34],
        shL: [-0.20, 0.88, -0.20], elL: [-0.24, 0.64, -0.18], wrL: [-0.24, 0.40, -0.16],
        shR: [0.20, 0.88, -0.20],  elR: [0.24, 0.64, -0.18],  wrR: [0.24, 0.40, -0.16]
      }),
      end: makeSeatedPose({
        pelvis: [0, 0.54, 0.06], lumbar: [0, 0.68, -0.04], chest: [0, 0.88, -0.20],
        neck: [0, 0.98, -0.28], head: [0, 1.08, -0.34],
        shL: [-0.20, 0.88, -0.20], elL: [-0.26, 0.92, -0.02], wrL: [-0.24, 0.68, -0.02],
        shR: [0.20, 0.88, -0.20],  elR: [0.26, 0.92, -0.02],  wrR: [0.24, 0.68, -0.02]
      })
    },
    seated_row: {
      equip: "cable_row_bench", prop: "v_bar", track: "midWr", angleType: "elbow", mistakeType: "round_back",
      start: makeSeatedPose({
        pelvis: [0, 0.46, -0.12], lumbar: [0, 0.64, -0.10], chest: [0, 0.88, -0.08],
        neck: [0, 1.02, -0.08], head: [0, 1.16, -0.06],
        shL: [-0.20, 0.90, -0.06], elL: [-0.14, 0.86, 0.22], wrL: [-0.08, 0.84, 0.48],
        shR: [0.20, 0.90, -0.06],  elR: [0.14, 0.86, 0.22],  wrR: [0.08, 0.84, 0.48],
        knL: [-0.14, 0.46, 0.30], anL: [-0.14, 0.34, 0.64], toeL: [-0.14, 0.40, 0.72],
        knR: [0.14, 0.46, 0.30],  anR: [0.14, 0.34, 0.64],  toeR: [0.14, 0.40, 0.72]
      }),
      end: makeSeatedPose({
        pelvis: [0, 0.46, -0.12], lumbar: [0, 0.64, -0.14], chest: [0, 0.88, -0.16],
        neck: [0, 1.02, -0.16], head: [0, 1.16, -0.14],
        shL: [-0.20, 0.90, -0.16], elL: [-0.24, 0.74, -0.34], wrL: [-0.12, 0.72, -0.08],
        shR: [0.20, 0.90, -0.16],  elR: [0.24, 0.74, -0.34],  wrR: [0.12, 0.72, -0.08],
        knL: [-0.14, 0.46, 0.30], anL: [-0.14, 0.34, 0.64], toeL: [-0.14, 0.40, 0.72],
        knR: [0.14, 0.46, 0.30],  anR: [0.14, 0.34, 0.64],  toeR: [0.14, 0.40, 0.72]
      })
    },
    row_machine: {
      equip: "row_machine", prop: "none", track: "bothWr", angleType: "elbow", mistakeType: "round_back",
      start: makeSeatedPose({
        elL: [-0.22, 0.90, 0.22], wrL: [-0.20, 0.90, 0.46],
        elR: [0.22, 0.90, 0.22],  wrR: [0.20, 0.90, 0.46]
      }),
      end: makeSeatedPose({
        elL: [-0.24, 0.88, -0.26], wrL: [-0.20, 0.88, 0.04],
        elR: [0.24, 0.88, -0.26],  wrR: [0.20, 0.88, 0.04]
      })
    },
    shrug: {
      equip: "floor", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        shL: [-0.20, 1.36, 0], elL: [-0.24, 1.10, 0.02], wrL: [-0.24, 0.84, 0.04],
        shR: [0.20, 1.36, 0],  elR: [0.24, 1.10, 0.02],  wrR: [0.24, 0.84, 0.04]
      }),
      end: makePose({
        shL: [-0.20, 1.44, 0], elL: [-0.24, 1.18, 0.02], wrL: [-0.24, 0.92, 0.04],
        shR: [0.20, 1.44, 0],  elR: [0.24, 1.18, 0.02],  wrR: [0.24, 0.92, 0.04]
      })
    },
    curl: {
      equip: "floor", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        elL: [-0.22, 1.12, 0.02], wrL: [-0.22, 0.86, 0.06],
        elR: [0.22, 1.12, 0.02],  wrR: [0.22, 0.86, 0.06]
      }),
      end: makePose({
        elL: [-0.22, 1.12, 0.06], wrL: [-0.20, 1.34, 0.16],
        elR: [0.22, 1.12, 0.06],  wrR: [0.20, 1.34, 0.16]
      })
    },
    incline_curl: {
      equip: "bench_incline", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makeSeatedPose({
        pelvis: [0, 0.50, 0.06], lumbar: [0, 0.65, -0.06], chest: [0, 0.86, -0.22],
        neck: [0, 0.98, -0.30], head: [0, 1.10, -0.36],
        shL: [-0.20, 0.88, -0.22], elL: [-0.22, 0.62, -0.26], wrL: [-0.22, 0.38, -0.24],
        shR: [0.20, 0.88, -0.22],  elR: [0.22, 0.62, -0.26],  wrR: [0.22, 0.38, -0.24]
      }),
      end: makeSeatedPose({
        pelvis: [0, 0.50, 0.06], lumbar: [0, 0.65, -0.06], chest: [0, 0.86, -0.22],
        neck: [0, 0.98, -0.30], head: [0, 1.10, -0.36],
        shL: [-0.20, 0.88, -0.22], elL: [-0.22, 0.62, -0.22], wrL: [-0.20, 0.84, -0.10],
        shR: [0.20, 0.88, -0.22],  elR: [0.22, 0.62, -0.22],  wrR: [0.20, 0.84, -0.10]
      })
    },
    preacher_curl: {
      equip: "preacher_machine", prop: "dumbbell_pair", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makeSeatedPose({
        chest: [0, 0.94, 0.06], neck: [0, 1.08, 0.08], head: [0, 1.20, 0.12],
        shL: [-0.20, 0.96, 0.08], elL: [-0.20, 0.78, 0.28], wrL: [-0.20, 0.62, 0.44],
        shR: [0.20, 0.96, 0.08],  elR: [0.20, 0.78, 0.28],  wrR: [0.20, 0.62, 0.44]
      }),
      end: makeSeatedPose({
        chest: [0, 0.94, 0.06], neck: [0, 1.08, 0.08], head: [0, 1.20, 0.12],
        shL: [-0.20, 0.96, 0.08], elL: [-0.20, 0.78, 0.28], wrL: [-0.18, 1.00, 0.20],
        shR: [0.20, 0.96, 0.08],  elR: [0.20, 0.78, 0.28],  wrR: [0.18, 1.00, 0.20]
      })
    },
    tricep_pushdown: {
      equip: "cable_high", prop: "rope", track: "bothWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        chest: [0, 1.32, 0.04], neck: [0, 1.46, 0.06], head: [0, 1.60, 0.08],
        shL: [-0.20, 1.34, 0.04], elL: [-0.18, 1.10, 0.06], wrL: [-0.10, 1.22, 0.26],
        shR: [0.20, 1.34, 0.04],  elR: [0.18, 1.10, 0.06],  wrR: [0.10, 1.22, 0.26]
      }),
      end: makePose({
        chest: [0, 1.32, 0.04], neck: [0, 1.46, 0.06], head: [0, 1.60, 0.08],
        shL: [-0.20, 1.34, 0.04], elL: [-0.18, 1.10, 0.06], wrL: [-0.14, 0.84, 0.12],
        shR: [0.20, 1.34, 0.04],  elR: [0.18, 1.10, 0.06],  wrR: [0.14, 0.84, 0.12]
      })
    },
    tricep_overhead: {
      equip: "machine_seat", prop: "dumbbell_single", track: "midWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSeatedPose({
        elL: [-0.12, 1.26, -0.02], wrL: [-0.06, 1.08, -0.20],
        elR: [0.12, 1.26, -0.02],  wrR: [0.06, 1.08, -0.20]
      }),
      end: makeSeatedPose({
        elL: [-0.12, 1.26, -0.02], wrL: [-0.06, 1.50, -0.02],
        elR: [0.12, 1.26, -0.02],  wrR: [0.06, 1.50, -0.02]
      })
    },
    skullcrusher: {
      equip: "bench_flat", prop: "bar", track: "midWr", angleType: "elbow", mistakeType: "press_flare",
      start: makeSupinePose({
        elL: [-0.18, 0.82, -0.34], wrL: [-0.18, 0.72, -0.56],
        elR: [0.18, 0.82, -0.34],  wrR: [0.18, 0.72, -0.56]
      }),
      end: makeSupinePose({
        elL: [-0.18, 0.82, -0.34], wrL: [-0.18, 1.04, -0.38],
        elR: [0.18, 0.82, -0.34],  wrR: [0.18, 1.04, -0.38]
      })
    },
    kickback: {
      equip: "bench_flat", prop: "dumbbell_right", track: "wrR", angleType: "elbow", mistakeType: "round_back", prone: true,
      start: makePose({
        pelvis: [0.02, 0.78, 0.20], lumbar: [0.02, 0.80, 0.02], chest: [0.02, 0.82, -0.18],
        neck: [0.02, 0.84, -0.30], head: [0.02, 0.86, -0.44],
        shL: [-0.18, 0.80, -0.18], elL: [-0.18, 0.64, -0.22], wrL: [-0.16, 0.48, -0.24],
        shR: [0.20, 0.80, -0.18],  elR: [0.22, 0.80, 0.06],   wrR: [0.22, 0.56, 0.04],
        hipL: [-0.10, 0.76, 0.22], knL: [-0.12, 0.48, 0.22], anL: [-0.12, 0.46, 0.48], toeL: [-0.12, 0.42, 0.54],
        hipR: [0.14, 0.76, 0.22],  knR: [0.22, 0.46, 0.24],  anR: [0.24, 0.07, 0.26],  toeR: [0.24, 0.03, 0.38]
      }),
      end: makePose({
        pelvis: [0.02, 0.78, 0.20], lumbar: [0.02, 0.80, 0.02], chest: [0.02, 0.82, -0.18],
        neck: [0.02, 0.84, -0.30], head: [0.02, 0.86, -0.44],
        shL: [-0.18, 0.80, -0.18], elL: [-0.18, 0.64, -0.22], wrL: [-0.16, 0.48, -0.24],
        shR: [0.20, 0.80, -0.18],  elR: [0.22, 0.80, 0.06],   wrR: [0.22, 0.80, 0.32],
        hipL: [-0.10, 0.76, 0.22], knL: [-0.12, 0.48, 0.22], anL: [-0.12, 0.46, 0.48], toeL: [-0.12, 0.42, 0.54],
        hipR: [0.14, 0.76, 0.22],  knR: [0.22, 0.46, 0.24],  anR: [0.24, 0.07, 0.26],  toeR: [0.24, 0.03, 0.38]
      })
    },
    squat: {
      equip: "squat_rack", prop: "bar", track: "midWr", angleType: "knee", mistakeType: "knee_valgus",
      start: makePose({
        shL: [-0.21, 1.38, 0], elL: [-0.30, 1.20, -0.06], wrL: [-0.30, 1.40, -0.06],
        shR: [0.21, 1.38, 0],  elR: [0.30, 1.20, -0.06],  wrR: [0.30, 1.40, -0.06],
        hipL: [-0.14, 0.90, 0], knL: [-0.18, 0.48, 0.02], anL: [-0.18, 0.07, 0], toeL: [-0.22, 0.03, 0.14],
        hipR: [0.14, 0.90, 0],  knR: [0.18, 0.48, 0.02],  anR: [0.18, 0.07, 0],  toeR: [0.22, 0.03, 0.14]
      }),
      end: makePose({
        pelvis: [0, 0.50, -0.18], lumbar: [0, 0.66, -0.08], chest: [0, 0.88, 0.04],
        neck: [0, 1.00, 0.10], head: [0, 1.14, 0.14],
        shL: [-0.21, 0.90, 0.04], elL: [-0.30, 0.72, -0.02], wrL: [-0.30, 0.92, -0.02],
        shR: [0.21, 0.90, 0.04],  elR: [0.30, 0.72, -0.02],  wrR: [0.30, 0.92, -0.02],
        hipL: [-0.15, 0.48, -0.18], knL: [-0.22, 0.46, 0.22], anL: [-0.18, 0.07, 0], toeL: [-0.22, 0.03, 0.14],
        hipR: [0.15, 0.48, -0.18],  knR: [0.22, 0.46, 0.22],  anR: [0.18, 0.07, 0],  toeR: [0.22, 0.03, 0.14]
      })
    },
    lunge: {
      equip: "floor", prop: "dumbbell_pair", track: "pelvis", angleType: "knee", mistakeType: "knee_valgus",
      start: makePose({
        knL: [-0.14, 0.48, 0.22], anL: [-0.14, 0.07, 0.22], toeL: [-0.14, 0.03, 0.36],
        knR: [0.14, 0.48, -0.22], anR: [0.14, 0.07, -0.26], toeR: [0.14, 0.03, -0.14]
      }),
      end: makePose({
        pelvis: [0, 0.56, 0.04], lumbar: [0, 0.74, 0.06], chest: [0, 0.98, 0.08],
        neck: [0, 1.12, 0.08], head: [0, 1.26, 0.10],
        shL: [-0.20, 1.02, 0.08], elL: [-0.24, 0.76, 0.10], wrL: [-0.24, 0.50, 0.12],
        shR: [0.20, 1.02, 0.08],  elR: [0.24, 0.76, 0.10],  wrR: [0.24, 0.50, 0.12],
        hipL: [-0.12, 0.54, 0.04], knL: [-0.14, 0.46, 0.36], anL: [-0.14, 0.07, 0.36], toeL: [-0.14, 0.03, 0.50],
        hipR: [0.12, 0.54, 0.04],  knR: [0.14, 0.16, -0.10], anR: [0.14, 0.12, -0.44], toeR: [0.14, 0.03, -0.44]
      })
    },
    leg_press: {
      equip: "leg_press", prop: "none", track: "anBoth", angleType: "knee", mistakeType: "knee_valgus",
      start: makeSeatedPose({
        pelvis: [0, 0.44, -0.06], lumbar: [0, 0.56, -0.20], chest: [0, 0.74, -0.36],
        neck: [0, 0.84, -0.44], head: [0, 0.96, -0.50],
        shL: [-0.20, 0.74, -0.36], elL: [-0.24, 0.56, -0.22], wrL: [-0.22, 0.44, -0.08],
        shR: [0.20, 0.74, -0.36],  elR: [0.24, 0.56, -0.22],  wrR: [0.22, 0.44, -0.08],
        hipL: [-0.13, 0.44, -0.04], knL: [-0.16, 0.74, 0.28], anL: [-0.16, 1.02, 0.60], toeL: [-0.16, 1.12, 0.56],
        hipR: [0.13, 0.44, -0.04],  knR: [0.16, 0.74, 0.28],  anR: [0.16, 1.02, 0.60],  toeR: [0.16, 1.12, 0.56]
      }),
      end: makeSeatedPose({
        pelvis: [0, 0.44, -0.06], lumbar: [0, 0.56, -0.20], chest: [0, 0.74, -0.36],
        neck: [0, 0.84, -0.44], head: [0, 0.96, -0.50],
        shL: [-0.20, 0.74, -0.36], elL: [-0.24, 0.56, -0.22], wrL: [-0.22, 0.44, -0.08],
        shR: [0.20, 0.74, -0.36],  elR: [0.24, 0.56, -0.22],  wrR: [0.22, 0.44, -0.08],
        hipL: [-0.13, 0.44, -0.04], knL: [-0.18, 0.76, 0.04], anL: [-0.16, 0.80, 0.38], toeL: [-0.16, 0.90, 0.34],
        hipR: [0.13, 0.44, -0.04],  knR: [0.18, 0.76, 0.04],  anR: [0.16, 0.80, 0.38],  toeR: [0.16, 0.90, 0.34]
      })
    },
    leg_ext: {
      equip: "leg_ext_machine", prop: "none", track: "anBoth", angleType: "knee", mistakeType: "swing",
      start: makeSeatedPose({
        knL: [-0.14, 0.48, 0.42], anL: [-0.14, 0.12, 0.42], toeL: [-0.14, 0.08, 0.54],
        knR: [0.14, 0.48, 0.42],  anR: [0.14, 0.12, 0.42],  toeR: [0.14, 0.08, 0.54]
      }),
      end: makeSeatedPose({
        knL: [-0.14, 0.48, 0.42], anL: [-0.14, 0.48, 0.82], toeL: [-0.14, 0.58, 0.84],
        knR: [0.14, 0.48, 0.42],  anR: [0.14, 0.48, 0.82],  toeR: [0.14, 0.58, 0.84]
      })
    },
    leg_curl: {
      equip: "leg_curl_machine", prop: "none", track: "anBoth", angleType: "knee", mistakeType: "swing",
      start: makeSeatedPose({
        knL: [-0.14, 0.48, 0.42], anL: [-0.14, 0.46, 0.80], toeL: [-0.14, 0.56, 0.82],
        knR: [0.14, 0.48, 0.42],  anR: [0.14, 0.46, 0.80],  toeR: [0.14, 0.56, 0.82]
      }),
      end: makeSeatedPose({
        knL: [-0.14, 0.48, 0.42], anL: [-0.14, 0.12, 0.26], toeL: [-0.14, 0.06, 0.36],
        knR: [0.14, 0.48, 0.42],  anR: [0.14, 0.12, 0.26],  toeR: [0.14, 0.06, 0.36]
      })
    },
    lying_curl: {
      equip: "lying_curl_machine", prop: "none", track: "anBoth", angleType: "knee", mistakeType: "swing", prone: true,
      start: makeSupinePose({
        pelvis: [0, 0.52, 0.16], lumbar: [0, 0.53, 0.0], chest: [0, 0.55, -0.24],
        neck: [0, 0.54, -0.38], head: [0, 0.54, -0.52],
        shL: [-0.20, 0.53, -0.26], elL: [-0.22, 0.48, -0.44], wrL: [-0.18, 0.44, -0.52],
        shR: [0.20, 0.53, -0.26],  elR: [0.22, 0.48, -0.44],  wrR: [0.18, 0.44, -0.52],
        hipL: [-0.12, 0.51, 0.20], knL: [-0.12, 0.50, 0.58], anL: [-0.12, 0.50, 0.94], toeL: [-0.12, 0.44, 0.98],
        hipR: [0.12, 0.51, 0.20],  knR: [0.12, 0.50, 0.58],  anR: [0.12, 0.50, 0.94],  toeR: [0.12, 0.44, 0.98]
      }),
      end: makeSupinePose({
        pelvis: [0, 0.52, 0.16], lumbar: [0, 0.53, 0.0], chest: [0, 0.55, -0.24],
        neck: [0, 0.54, -0.38], head: [0, 0.54, -0.52],
        shL: [-0.20, 0.53, -0.26], elL: [-0.22, 0.48, -0.44], wrL: [-0.18, 0.44, -0.52],
        shR: [0.20, 0.53, -0.26],  elR: [0.22, 0.48, -0.44],  wrR: [0.18, 0.44, -0.52],
        hipL: [-0.12, 0.51, 0.20], knL: [-0.12, 0.50, 0.58], anL: [-0.12, 0.84, 0.34], toeL: [-0.12, 0.88, 0.24],
        hipR: [0.12, 0.51, 0.20],  knR: [0.12, 0.50, 0.58],  anR: [0.12, 0.84, 0.34],  toeR: [0.12, 0.88, 0.24]
      })
    },
    rdl: {
      equip: "floor", prop: "bar", track: "midWr", angleType: "hip", mistakeType: "round_back",
      start: makePose({
        wrL: [-0.24, 0.84, 0.12], wrR: [0.24, 0.84, 0.12]
      }),
      end: makePose({
        pelvis: [0, 0.86, -0.14], lumbar: [0, 0.94, 0.02], chest: [0, 1.02, 0.22],
        neck: [0, 1.06, 0.34], head: [0, 1.10, 0.46],
        shL: [-0.20, 1.00, 0.22], elL: [-0.22, 0.74, 0.20], wrL: [-0.24, 0.46, 0.18],
        shR: [0.20, 1.00, 0.22],  elR: [0.22, 0.74, 0.20],  wrR: [0.24, 0.46, 0.18],
        hipL: [-0.12, 0.84, -0.14], knL: [-0.12, 0.48, 0.04],
        hipR: [0.12, 0.84, -0.14],  knR: [0.12, 0.48, 0.04]
      })
    },
    hip_thrust: {
      equip: "bench_flat", prop: "bar", track: "pelvis", angleType: "hip", mistakeType: "round_back",
      start: makeSupinePose({
        pelvis: [0, 0.22, 0.16], lumbar: [0, 0.34, 0.02], chest: [0, 0.48, -0.14],
        neck: [0, 0.56, -0.24], head: [0, 0.66, -0.32],
        shL: [-0.20, 0.46, -0.14], elL: [-0.24, 0.34, 0.02], wrL: [-0.22, 0.28, 0.16],
        shR: [0.20, 0.46, -0.14],  elR: [0.24, 0.34, 0.02],  wrR: [0.22, 0.28, 0.16],
        hipL: [-0.12, 0.20, 0.18], knL: [-0.16, 0.44, 0.48], anL: [-0.16, 0.07, 0.54],
        hipR: [0.12, 0.20, 0.18],  knR: [0.16, 0.44, 0.48],  anR: [0.16, 0.07, 0.54]
      }),
      end: makeSupinePose({
        pelvis: [0, 0.48, 0.20], lumbar: [0, 0.50, 0.02], chest: [0, 0.52, -0.16],
        neck: [0, 0.58, -0.26], head: [0, 0.66, -0.34],
        shL: [-0.20, 0.50, -0.16], elL: [-0.24, 0.52, 0.02], wrL: [-0.22, 0.54, 0.20],
        shR: [0.20, 0.50, -0.16],  elR: [0.24, 0.52, 0.02],  wrR: [0.22, 0.54, 0.20],
        hipL: [-0.12, 0.48, 0.22], knL: [-0.16, 0.48, 0.54], anL: [-0.16, 0.07, 0.54],
        hipR: [0.12, 0.48, 0.22],  knR: [0.16, 0.48, 0.54],  anR: [0.16, 0.07, 0.54]
      })
    },
    calf_raise: {
      equip: "calf_machine", prop: "dumbbell_pair", track: "anBoth", angleType: "knee", mistakeType: "swing",
      start: makePose({}),
      end: makePose({
        pelvis: [0, 1.00, 0], lumbar: [0, 1.18, 0], chest: [0, 1.42, 0],
        neck: [0, 1.56, 0], head: [0, 1.70, 0.01],
        shL: [-0.20, 1.46, 0], elL: [-0.24, 1.20, 0.02], wrL: [-0.24, 0.94, 0.08],
        shR: [0.20, 1.46, 0],  elR: [0.24, 1.20, 0.02],  wrR: [0.24, 0.94, 0.08],
        hipL: [-0.11, 0.98, 0], knL: [-0.12, 0.56, 0.02], anL: [-0.12, 0.16, 0.04], toeL: [-0.12, 0.03, 0.14],
        hipR: [0.11, 0.98, 0],  knR: [0.12, 0.56, 0.02],  anR: [0.12, 0.16, 0.04],  toeR: [0.12, 0.03, 0.14]
      })
    },
    hanging_raise: {
      equip: "pullup_bar", prop: "none", track: "anBoth", angleType: "hip", mistakeType: "swing",
      start: makePose({
        pelvis: [0, 0.92, 0], lumbar: [0, 1.10, 0], chest: [0, 1.34, 0],
        neck: [0, 1.48, 0], head: [0, 1.62, 0.02],
        shL: [-0.20, 1.40, 0], elL: [-0.24, 1.64, 0], wrL: [-0.24, 1.90, 0],
        shR: [0.20, 1.40, 0],  elR: [0.24, 1.64, 0],  wrR: [0.24, 1.90, 0],
        hipL: [-0.11, 0.90, 0], knL: [-0.12, 0.50, 0], anL: [-0.12, 0.14, 0], toeL: [-0.12, 0.08, 0.12],
        hipR: [0.11, 0.90, 0],  knR: [0.12, 0.50, 0],  anR: [0.12, 0.14, 0],  toeR: [0.12, 0.08, 0.12]
      }),
      end: makePose({
        pelvis: [0, 0.94, 0.06], lumbar: [0, 1.10, 0], chest: [0, 1.34, 0],
        neck: [0, 1.48, 0], head: [0, 1.62, 0.02],
        shL: [-0.20, 1.40, 0], elL: [-0.24, 1.64, 0], wrL: [-0.24, 1.90, 0],
        shR: [0.20, 1.40, 0],  elR: [0.24, 1.64, 0],  wrR: [0.24, 1.90, 0],
        hipL: [-0.11, 0.92, 0.08], knL: [-0.12, 1.12, 0.36], anL: [-0.12, 1.24, 0.64], toeL: [-0.12, 1.32, 0.66],
        hipR: [0.11, 0.92, 0.08],  knR: [0.12, 1.12, 0.36],  anR: [0.12, 1.24, 0.64],  toeR: [0.12, 1.32, 0.66]
      })
    },
    cable_crunch: {
      equip: "cable_high", prop: "rope", track: "bothWr", angleType: "hip", mistakeType: "round_back",
      start: makePose({
        pelvis: [0, 0.48, -0.10], lumbar: [0, 0.66, -0.06], chest: [0, 0.90, -0.02],
        neck: [0, 1.04, 0], head: [0, 1.18, 0.02],
        shL: [-0.20, 0.92, -0.02], elL: [-0.16, 1.06, 0.14], wrL: [-0.12, 1.16, 0.08],
        shR: [0.20, 0.92, -0.02],  elR: [0.16, 1.06, 0.14],  wrR: [0.12, 1.16, 0.08],
        hipL: [-0.12, 0.46, -0.10], knL: [-0.14, 0.06, 0.0], anL: [-0.14, 0.06, -0.34], toeL: [-0.14, 0.03, -0.40],
        hipR: [0.12, 0.46, -0.10],  knR: [0.14, 0.06, 0.0],  anR: [0.14, 0.06, -0.34],  toeR: [0.14, 0.03, -0.40]
      }),
      end: makePose({
        pelvis: [0, 0.48, -0.10], lumbar: [0, 0.56, 0.06], chest: [0, 0.60, 0.24],
        neck: [0, 0.64, 0.34], head: [0, 0.68, 0.46],
        shL: [-0.20, 0.60, 0.24], elL: [-0.16, 0.66, 0.40], wrL: [-0.12, 0.72, 0.36],
        shR: [0.20, 0.60, 0.24],  elR: [0.16, 0.66, 0.40],  wrR: [0.12, 0.72, 0.36],
        hipL: [-0.12, 0.46, -0.10], knL: [-0.14, 0.06, 0.0], anL: [-0.14, 0.06, -0.34], toeL: [-0.14, 0.03, -0.40],
        hipR: [0.12, 0.46, -0.10],  knR: [0.14, 0.06, 0.0],  anR: [0.14, 0.06, -0.34],  toeR: [0.14, 0.03, -0.40]
      })
    },
    woodchop: {
      equip: "cable_high", prop: "cable_handles", track: "midWr", angleType: "elbow", mistakeType: "swing",
      start: makePose({
        chest: [0, 1.34, 0], shL: [-0.14, 1.38, 0.14], shR: [0.14, 1.38, -0.14],
        elL: [-0.28, 1.50, 0.28], wrL: [-0.36, 1.62, 0.44],
        elR: [-0.20, 1.52, 0.26], wrR: [-0.32, 1.60, 0.44],
        hipL: [-0.16, 0.90, 0], knL: [-0.18, 0.48, 0.04], anL: [-0.20, 0.07, 0],
        hipR: [0.16, 0.90, 0],  knR: [0.18, 0.48, 0.04],  anR: [0.20, 0.07, 0]
      }),
      end: makePose({
        chest: [0, 1.30, 0.04], shL: [-0.14, 1.34, -0.14], shR: [0.14, 1.34, 0.14],
        elL: [0.22, 1.06, 0.24], wrL: [0.34, 0.86, 0.34],
        elR: [0.30, 1.06, 0.20], wrR: [0.38, 0.86, 0.30],
        hipL: [-0.16, 0.88, 0], knL: [-0.18, 0.48, 0.08], anL: [-0.20, 0.07, 0],
        hipR: [0.16, 0.88, 0],  knR: [0.18, 0.48, 0.08],  anR: [0.20, 0.07, 0]
      })
    }
  };

  const MISTAKE_NOTES = {
    press_flare: "Mistake shown: Elbows flared 90° out and hips/ribcage over-arched — stresses shoulders and reduces pec drive.",
    round_back: "Mistake shown: Rounded lower back and dropped chest — shifts load onto lumbar discs instead of target muscles.",
    knee_valgus: "Mistake shown: Knees caving inward (valgus) with shallow depth — stresses knee ligaments and loses glute/quad power.",
    swing: "Mistake shown: Excessive body swing and shrugged traps — uses momentum instead of isolating the target muscle."
  };

  /* ---------------- THREE.JS VIEWER STATE ---------------- */
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let procGroup = null;
  let muscleGroup = null;
  let equipGroup = null;
  let guideGroup = null;
  let angleGroup = null;

  let showGuides = true;
  let showMistake = false;

  // GLB Skinned Human Model state
  let glbModel = null;
  let glbLoading = false;
  let glbReady = false;
  let glbBones = {};
  let glbRest = {};

  let parts = null;
  let muscleMeshes = {};
  let materials = null;
  let muscleMats = {};
  let currentRigKey = "curl";
  let currentPrimaryMuscles = [];
  let currentSecondaryMuscles = [];
  let currentPhase = 0;
  let animEquip = {};

  function isAvailable() {
    return typeof window.THREE !== "undefined" && typeof window.THREE.OrbitControls !== "undefined";
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpVec3(a, b, t) {
    return new window.THREE.Vector3(
      lerp(a[0], b[0], t),
      lerp(a[1], b[1], t),
      lerp(a[2], b[2], t)
    );
  }

  function initScene(canvas) {
    if (renderer && renderer.domElement === canvas) return true;
    if (!isAvailable()) return false;

    const THREE = window.THREE;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return false;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x0b0c0e, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 4 / 3, 0.1, 30);
    camera.position.set(1.65, 1.45, 2.05);

    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.92, 0);
    controls.minDistance = 0.85;
    controls.maxDistance = 5.2;
    controls.maxPolarAngle = Math.PI * 0.49;

    const amb = new THREE.AmbientLight(0xffffff, 0.55);
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(2.4, 4.4, 2.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    key.shadow.camera.left = -2;
    key.shadow.camera.right = 2;
    key.shadow.camera.top = 2.5;
    key.shadow.camera.bottom = -1.5;
    key.shadow.bias = -0.001;

    const rim = new THREE.DirectionalLight(0xdc2626, 0.45);
    rim.position.set(-2.5, 2.6, -2.5);
    const fill = new THREE.DirectionalLight(0x9ca3af, 0.42);
    fill.position.set(0, 1.5, -3.0);
    scene.add(amb, key, rim, fill);

    // Studio floor + grid
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x0e1015, roughness: 0.88, metalness: 0.08 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.002;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(3.4, 17, 0x262a34, 0x181b22);
    scene.add(grid);

    procGroup = new THREE.Group();
    muscleGroup = new THREE.Group();
    equipGroup = new THREE.Group();
    guideGroup = new THREE.Group();
    angleGroup = new THREE.Group();
    scene.add(procGroup, muscleGroup, equipGroup, guideGroup, angleGroup);

    buildMaterials();
    buildMannequin();
    loadGlbHuman();
    resize();
    return true;
  }

  function loadGlbHuman() {
    if (glbLoading || glbReady || typeof window.THREE.GLTFLoader === "undefined") return;
    glbLoading = true;
    const THREE = window.THREE;
    const loader = new THREE.GLTFLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      GLB_URL,
      (gltf) => {
        const model = gltf.scene;
        model.updateMatrixWorld(true);

        const boneNames = [
          "mixamorigHips", "mixamorigSpine", "mixamorigSpine1", "mixamorigSpine2",
          "mixamorigNeck", "mixamorigHead",
          "mixamorigLeftShoulder", "mixamorigLeftArm", "mixamorigLeftForeArm", "mixamorigLeftHand",
          "mixamorigRightShoulder", "mixamorigRightArm", "mixamorigRightForeArm", "mixamorigRightHand",
          "mixamorigLeftUpLeg", "mixamorigLeftLeg", "mixamorigLeftFoot",
          "mixamorigRightUpLeg", "mixamorigRightLeg", "mixamorigRightFoot"
        ];

        model.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            obj.frustumCulled = false;
            const name = (obj.name || "").toLowerCase();
            obj.material = new THREE.MeshStandardMaterial({
              color: name.includes("joint") ? 0x64748b : 0x4b5563,
              roughness: name.includes("joint") ? 0.38 : 0.48,
              metalness: 0.22
            });
          }
          if (obj.isBone && boneNames.includes(obj.name)) {
            glbBones[obj.name] = obj;
          }
        });

        // Normalize height using actual skeleton bone span (immune to SkinnedMesh Box3 bugs)
        model.updateMatrixWorld(true);
        if (glbBones.mixamorigHead && glbBones.mixamorigLeftFoot) {
          const pHead = new THREE.Vector3();
          const pFoot = new THREE.Vector3();
          glbBones.mixamorigHead.getWorldPosition(pHead);
          glbBones.mixamorigLeftFoot.getWorldPosition(pFoot);
          const boneSpan = Math.abs(pHead.y - pFoot.y);
          if (boneSpan > 0.05) {
            model.scale.multiplyScalar(1.52 / boneSpan);
            model.updateMatrixWorld(true);
          }
        }

        // Capture rest-pose world directions & quaternions for exact IK-like orientation
        const childMap = {
          mixamorigSpine: "mixamorigSpine2",
          mixamorigSpine2: "mixamorigNeck",
          mixamorigNeck: "mixamorigHead",
          mixamorigLeftArm: "mixamorigLeftForeArm",
          mixamorigLeftForeArm: "mixamorigLeftHand",
          mixamorigRightArm: "mixamorigRightForeArm",
          mixamorigRightForeArm: "mixamorigRightHand",
          mixamorigLeftUpLeg: "mixamorigLeftLeg",
          mixamorigLeftLeg: "mixamorigLeftFoot",
          mixamorigRightUpLeg: "mixamorigRightLeg",
          mixamorigRightLeg: "mixamorigRightFoot"
        };

        Object.entries(childMap).forEach(([bName, cName]) => {
          const b = glbBones[bName];
          const c = glbBones[cName];
          if (!b || !c) return;
          const pB = new THREE.Vector3();
          const pC = new THREE.Vector3();
          const qB = new THREE.Quaternion();
          b.getWorldPosition(pB);
          c.getWorldPosition(pC);
          b.getWorldQuaternion(qB);
          glbRest[bName] = {
            restDir: pC.sub(pB).normalize(),
            restWorldQuat: qB.clone()
          };
        });

        if (glbBones.mixamorigHips) {
          const qH = new THREE.Quaternion();
          glbBones.mixamorigHips.getWorldQuaternion(qH);
          glbRest.mixamorigHips = { restWorldQuat: qH.clone() };
        }

        glbModel = model;
        glbReady = Object.keys(glbRest).length >= 10;
        if (glbReady) {
          scene.add(glbModel);
          procGroup.visible = false;
          updatePose(currentRigKey, currentPhase, currentPrimaryMuscles, currentSecondaryMuscles);
          render();
        }
      },
      undefined,
      () => {
        glbLoading = false;
        glbReady = false;
      }
    );
  }

  function buildMaterials() {
    const THREE = window.THREE;
    materials = {
      skin: new THREE.MeshStandardMaterial({ color: 0x3b404d, roughness: 0.55, metalness: 0.14 }),
      headSkin: new THREE.MeshStandardMaterial({ color: 0x333844, roughness: 0.52, metalness: 0.15 }),
      hair: new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.75, metalness: 0.05 }),
      eye: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.2, metalness: 0.1, emissive: 0x374151, emissiveIntensity: 0.3 }),
      hand: new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.5, metalness: 0.12 }),
      shoe: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.55, metalness: 0.1 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x717885, roughness: 0.30, metalness: 0.78 }),
      darkSteel: new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.42, metalness: 0.65 }),
      pad: new THREE.MeshStandardMaterial({ color: 0x181b22, roughness: 0.80, metalness: 0.05 }),
      plate: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.32, metalness: 0.58 }),
      accent: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.3 }),
      cable: new THREE.LineBasicMaterial({ color: 0xd1d5db }),
      guideCurve: new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.6, roughness: 0.3 }),
      guideMistake: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.75, roughness: 0.3 }),
      guideStart: new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.7 }),
      guidePeak: new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.7 }),
      guideSpine: new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x166534, emissiveIntensity: 0.45, roughness: 0.4 }),
      angleArc: new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.38, side: THREE.DoubleSide })
    };

    muscleMats = {};
    MUSCLE_KEYS.forEach((m) => {
      muscleMats[m] = new THREE.MeshStandardMaterial({
        color: 0x374151,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.42,
        metalness: 0.15,
        transparent: true,
        opacity: 0.88
      });
    });
  }

  function makeTaperedSegment(rTop, rBot, mat) {
    const THREE = window.THREE;
    const g = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, 1, 14), mat);
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    g.add(cyl);
    const sTop = new THREE.Mesh(new THREE.SphereGeometry(rTop, 12, 10), mat);
    sTop.position.y = 0.5;
    sTop.castShadow = true;
    const sBot = new THREE.Mesh(new THREE.SphereGeometry(rBot, 12, 10), mat);
    sBot.position.y = -0.5;
    sBot.castShadow = true;
    g.add(sTop, sBot);
    return g;
  }

  function addMuscleMesh(muscleKey, parent, rx, ry, rz, x, y, z, rxRot = 0, rzRot = 0) {
    const THREE = window.THREE;
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 12), muscleMats[muscleKey]);
    m.scale.set(rx, ry, rz);
    m.position.set(x, y, z);
    m.rotation.x = rxRot;
    m.rotation.z = rzRot;
    m.userData.baseScale = [rx, ry, rz];
    if (!muscleMeshes[muscleKey]) muscleMeshes[muscleKey] = [];
    muscleMeshes[muscleKey].push(m);
    parent.add(m);
    return m;
  }

  function buildSculptedHead() {
    const THREE = window.THREE;
    const g = new THREE.Group();
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 16), materials.headSkin);
    cranium.scale.set(0.88, 1.05, 0.96);
    cranium.position.set(0, 0.02, -0.01);
    cranium.castShadow = true;
    g.add(cranium);

    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.097, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.54), materials.hair);
    crown.scale.set(0.89, 1.02, 0.98);
    crown.position.set(0, 0.025, -0.015);
    crown.rotation.x = -0.22;
    g.add(crown);

    const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.048, 0.095, 12), materials.headSkin);
    jaw.scale.set(0.95, 1, 0.88);
    jaw.position.set(0, -0.045, 0.022);
    jaw.rotation.x = 0.25;
    g.add(jaw);

    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.018, 0.032), materials.headSkin);
    brow.position.set(0, 0.035, 0.078);
    g.add(brow);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.042, 6), materials.headSkin);
    nose.position.set(0, 0.004, 0.096);
    nose.rotation.x = 0.45;
    g.add(nose);

    [-0.032, 0.032].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), materials.eye);
      eye.position.set(ex, 0.020, 0.082);
      g.add(eye);
    });
    [-0.084, 0.084].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), materials.headSkin);
      ear.scale.set(0.45, 1.2, 0.7);
      ear.position.set(ex, 0.01, -0.005);
      g.add(ear);
    });
    return g;
  }

  function buildHand() {
    const THREE = window.THREE;
    const g = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.068, 0.026), materials.hand);
    palm.position.set(0, 0.028, 0);
    palm.castShadow = true;
    const fingers = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.014, 0.056, 10), materials.hand);
    fingers.rotation.z = Math.PI / 2;
    fingers.position.set(0, 0.062, 0.014);
    const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.032, 8), materials.hand);
    thumb.position.set(0.032, 0.034, 0.016);
    thumb.rotation.z = -0.5;
    thumb.rotation.x = 0.4;
    g.add(palm, fingers, thumb);
    return g;
  }

  function buildMannequin() {
    const THREE = window.THREE;
    muscleMeshes = {};

    // Procedural body segments (visible while GLB loads or if offline)
    const pelvisCore = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.125, 1, 14), materials.skin);
    pelvisCore.scale.set(1, 1, 0.65);
    pelvisCore.castShadow = true;
    const lumbarCore = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.128, 1, 14), materials.skin);
    lumbarCore.scale.set(1, 1, 0.64);
    lumbarCore.castShadow = true;
    const chestCore = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.135, 1, 14), materials.skin);
    chestCore.scale.set(1, 1, 0.64);
    chestCore.castShadow = true;

    // Dedicated Muscle Overlay Groups (shared across GLB & procedural!)
    const mPelvis = new THREE.Group();
    addMuscleMesh("glutes", mPelvis, 0.074, 0.44, 0.068, -0.062, 0, -0.076);
    addMuscleMesh("glutes", mPelvis, 0.074, 0.44, 0.068, 0.062, 0, -0.076);

    const mLumbar = new THREE.Group();
    [-0.22, 0.06, 0.32].forEach((ay) => {
      addMuscleMesh("abs", mLumbar, 0.044, 0.13, 0.032, -0.042, ay, 0.078);
      addMuscleMesh("abs", mLumbar, 0.044, 0.13, 0.032, 0.042, ay, 0.078);
    });
    addMuscleMesh("obliques", mLumbar, 0.038, 0.36, 0.056, -0.118, 0.04, 0.015);
    addMuscleMesh("obliques", mLumbar, 0.038, 0.36, 0.056, 0.118, 0.04, 0.015);
    addMuscleMesh("lower_back", mLumbar, 0.040, 0.42, 0.036, -0.048, -0.02, -0.074);
    addMuscleMesh("lower_back", mLumbar, 0.040, 0.42, 0.036, 0.048, -0.02, -0.074);

    const mChest = new THREE.Group();
    addMuscleMesh("chest", mChest, 0.090, 0.28, 0.046, -0.078, 0.05, 0.090, 0, 0.08);
    addMuscleMesh("chest", mChest, 0.090, 0.28, 0.046, 0.078, 0.05, 0.090, 0, -0.08);
    addMuscleMesh("lats", mChest, 0.078, 0.40, 0.054, -0.135, -0.08, -0.055, 0, -0.18);
    addMuscleMesh("lats", mChest, 0.078, 0.40, 0.054, 0.135, -0.08, -0.055, 0, 0.18);
    addMuscleMesh("mid_back", mChest, 0.082, 0.28, 0.040, 0, 0.05, -0.090);
    addMuscleMesh("traps", mChest, 0.074, 0.18, 0.050, -0.08, 0.42, -0.02, 0, -0.28);
    addMuscleMesh("traps", mChest, 0.074, 0.18, 0.050, 0.08, 0.42, -0.02, 0, 0.28);

    const buildMuscleArm = () => {
      const g = new THREE.Group();
      addMuscleMesh("front_delts", g, 0.044, 0.16, 0.038, 0, 0.36, 0.034);
      addMuscleMesh("side_delts", g, 0.050, 0.18, 0.044, -0.02, 0.38, 0);
      addMuscleMesh("rear_delts", g, 0.044, 0.16, 0.038, 0, 0.36, -0.034);
      addMuscleMesh("biceps", g, 0.040, 0.32, 0.034, 0, -0.02, 0.036);
      addMuscleMesh("triceps", g, 0.042, 0.34, 0.036, 0, 0.02, -0.036);
      return g;
    };

    const buildMuscleForearm = () => {
      const g = new THREE.Group();
      addMuscleMesh("forearms", g, 0.038, 0.30, 0.036, 0, 0.12, 0.008);
      return g;
    };

    const buildMuscleThigh = () => {
      const g = new THREE.Group();
      addMuscleMesh("quads", g, 0.060, 0.38, 0.044, 0, 0.02, 0.046);
      addMuscleMesh("hamstrings", g, 0.056, 0.36, 0.040, 0, 0.04, -0.044);
      return g;
    };

    const buildMuscleCalf = () => {
      const g = new THREE.Group();
      addMuscleMesh("calves", g, 0.046, 0.24, 0.040, 0, 0.16, -0.034);
      return g;
    };

    parts = {
      pelvisSeg: pelvisCore,
      lumbarSeg: lumbarCore,
      chestSeg:  chestCore,
      neckSeg:   makeTaperedSegment(0.046, 0.052, materials.skin),
      headMesh:  buildSculptedHead(),
      armUL: makeTaperedSegment(0.042, 0.050, materials.skin),
      armFL: makeTaperedSegment(0.028, 0.038, materials.skin),
      handL: buildHand(),
      armUR: makeTaperedSegment(0.042, 0.050, materials.skin),
      armFR: makeTaperedSegment(0.028, 0.038, materials.skin),
      handR: buildHand(),
      thighL: makeTaperedSegment(0.050, 0.068, materials.skin),
      calfL:  makeTaperedSegment(0.032, 0.046, materials.skin),
      footL:  makeTaperedSegment(0.032, 0.038, materials.shoe),
      thighR: makeTaperedSegment(0.050, 0.068, materials.skin),
      calfR:  makeTaperedSegment(0.032, 0.046, materials.skin),
      footR:  makeTaperedSegment(0.032, 0.038, materials.shoe),

      // Shared Muscle Overlays
      mPelvis, mLumbar, mChest,
      mArmUL: buildMuscleArm(), mArmFL: buildMuscleForearm(),
      mArmUR: buildMuscleArm(), mArmFR: buildMuscleForearm(),
      mThighL: buildMuscleThigh(), mCalfL: buildMuscleCalf(),
      mThighR: buildMuscleThigh(), mCalfR: buildMuscleCalf(),

      // Props
      barGroup: new THREE.Group(),
      dbL: new THREE.Group(),
      dbR: new THREE.Group(),
      dbSingle: new THREE.Group(),
      latBar: new THREE.Group(),
      vBar: new THREE.Group(),
      ropeGroup: new THREE.Group(),

      cableLines: []
    };

    // Olympic Barbell with knurl bands & collars
    const barShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.48, 12), materials.steel);
    barShaft.rotation.z = Math.PI / 2;
    barShaft.castShadow = true;
    const plateGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.045, 22);
    const innerPlateGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.03, 18);
    [-0.58, 0.58].forEach((px) => {
      const p1 = new THREE.Mesh(plateGeo, materials.plate);
      p1.rotation.z = Math.PI / 2;
      p1.position.x = px;
      p1.castShadow = true;
      const p2 = new THREE.Mesh(innerPlateGeo, materials.darkSteel);
      p2.rotation.z = Math.PI / 2;
      p2.position.x = px + (px > 0 ? -0.042 : 0.042);
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 10), materials.accent);
      collar.rotation.z = Math.PI / 2;
      collar.position.x = px + (px > 0 ? 0.038 : -0.038);
      parts.barGroup.add(p1, p2, collar);
    });
    parts.barGroup.add(barShaft);

    const buildDb = (grp) => {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 10), materials.steel);
      handle.rotation.z = Math.PI / 2;
      handle.castShadow = true;
      const endGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.052, 8);
      const e1 = new THREE.Mesh(endGeo, materials.plate);
      e1.rotation.z = Math.PI / 2;
      e1.position.x = -0.10;
      e1.castShadow = true;
      const e2 = e1.clone();
      e2.position.x = 0.10;
      grp.add(handle, e1, e2);
    };
    buildDb(parts.dbL);
    buildDb(parts.dbR);
    buildDb(parts.dbSingle);

    // Wide Lat Bar
    const latMid = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.56, 10), materials.steel);
    latMid.rotation.z = Math.PI / 2;
    const latEndL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 10), materials.steel);
    latEndL.rotation.z = Math.PI / 2 - 0.35;
    latEndL.position.set(-0.36, -0.04, 0);
    const latEndR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 10), materials.steel);
    latEndR.rotation.z = Math.PI / 2 + 0.35;
    latEndR.position.set(0.36, -0.04, 0);
    parts.latBar.add(latMid, latEndL, latEndR);

    // V-Bar
    const vHandle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.025), materials.steel);
    parts.vBar.add(vHandle);

    // Split V-Rope (2 dynamic lines + end stoppers)
    parts.ropeL = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 8), materials.darkSteel);
    parts.ropeR = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 8), materials.darkSteel);
    parts.ropeStopL = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 10), materials.accent);
    parts.ropeStopR = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 10), materials.accent);
    parts.ropeGroup.add(parts.ropeL, parts.ropeR, parts.ropeStopL, parts.ropeStopR);

    // Route procedural segments into procGroup, muscles into muscleGroup, props into scene
    ["pelvisSeg", "lumbarSeg", "chestSeg", "neckSeg", "headMesh",
     "armUL", "armFL", "handL", "armUR", "armFR", "handR",
     "thighL", "calfL", "footL", "thighR", "calfR", "footR"].forEach((k) => {
      procGroup.add(parts[k]);
    });
    ["mPelvis", "mLumbar", "mChest", "mArmUL", "mArmFL", "mArmUR", "mArmFR",
     "mThighL", "mCalfL", "mThighR", "mCalfR"].forEach((k) => {
      muscleGroup.add(parts[k]);
    });
    ["barGroup", "dbL", "dbR", "dbSingle", "latBar", "vBar", "ropeGroup"].forEach((k) => {
      scene.add(parts[k]);
    });
  }

  function clearGroup(grp) {
    while (grp.children.length) {
      const obj = grp.children[0];
      grp.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }
  }

  function resolveEquipment(rigKey, exId) {
    if (exId === "ex_mach_row") return "row_machine";
    if (exId === "ex_shoulder_mach") return "shoulder_press_machine";
    if (exId === "ex_preacher_mach" || exId === "ex_conc_curl") return "preacher_machine";
    if (exId === "ex_ab_mach") return "ab_machine";
    if (exId === "ex_smith_squat") return "smith_machine";
    if (exId === "ex_cable_lat_raise") return "cable_low";
    return RIGS_3D[rigKey]?.equip || "floor";
  }

  function makeWeightStack(x, z, height = 1.45) {
    const THREE = window.THREE;
    const g = new THREE.Group();
    const frameL = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, height, 8), materials.steel);
    frameL.position.set(x - 0.14, height / 2, z);
    const frameR = frameL.clone();
    frameR.position.x = x + 0.14;
    g.add(frameL, frameR);

    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.14), materials.darkSteel);
      p.position.set(x, 0.12 + i * 0.042, z);
      p.castShadow = true;
      p.receiveShadow = true;
      g.add(p);
    }

    const movingStack = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const mp = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.034, 0.14), materials.plate);
      mp.position.y = (i - 1.5) * 0.042;
      mp.castShadow = true;
      movingStack.add(mp);
    }
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8), materials.accent);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(0, -0.02, 0.03);
    movingStack.add(pin);
    movingStack.position.set(x, 0.45, z);
    g.add(movingStack);
    return { group: g, movingStack };
  }

  function buildEquipment(equip) {
    const THREE = window.THREE;
    clearGroup(equipGroup);
    parts.cableLines = [];
    animEquip = {};

    const addBox = (w, h, d, x, y, z, mat, rx = 0, parent = equipGroup) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.rotation.x = rx;
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    const addCyl = (r, len, x, y, z, mat, rotZ = 0, rotX = 0, parent = equipGroup) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
      m.position.set(x, y, z);
      m.rotation.z = rotZ;
      m.rotation.x = rotX;
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };

    if (equip === "bench_flat") {
      addBox(0.30, 0.07, 1.18, 0, 0.425, -0.06, materials.pad);
      addBox(0.06, 0.39, 0.06, 0, 0.195, -0.52, materials.steel);
      addBox(0.06, 0.39, 0.06, 0, 0.195, 0.40, materials.steel);
      addBox(0.36, 0.04, 0.08, 0, 0.02, -0.52, materials.steel);
      addBox(0.36, 0.04, 0.08, 0, 0.02, 0.40, materials.steel);
    } else if (equip === "bench_incline") {
      addBox(0.28, 0.07, 0.36, 0, 0.42, 0.12, materials.pad);
      addBox(0.28, 0.07, 0.72, 0, 0.68, -0.26, materials.pad, -0.68);
      addBox(0.06, 0.39, 0.06, 0, 0.195, 0.16, materials.steel);
      addBox(0.06, 0.56, 0.06, 0, 0.28, -0.30, materials.steel);
    } else if (equip === "pullup_bar") {
      addBox(0.05, 1.96, 0.05, -0.52, 0.98, 0, materials.steel);
      addBox(0.05, 1.96, 0.05, 0.52, 0.98, 0, materials.steel);
      addBox(0.55, 0.04, 0.55, -0.52, 0.02, 0, materials.darkSteel);
      addBox(0.55, 0.04, 0.55, 0.52, 0.02, 0, materials.darkSteel);
      addCyl(0.02, 1.08, 0, 1.92, 0, materials.steel, Math.PI / 2);
    } else if (equip === "dip_bars") {
      [-0.28, 0.28].forEach((x) => {
        addBox(0.045, 1.05, 0.045, x, 0.525, -0.18, materials.steel);
        addBox(0.045, 1.05, 0.045, x, 0.525, 0.26, materials.steel);
        addBox(0.045, 0.045, 0.52, x, 1.06, 0.04, materials.steel);
      });
    } else if (equip === "machine_seat") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.06, materials.pad);
      addBox(0.28, 0.58, 0.07, 0, 0.78, -0.16, materials.pad);
      addBox(0.07, 0.39, 0.07, 0, 0.195, 0.02, materials.steel);
    } else if (equip === "pec_deck_machine") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.06, materials.pad);
      addBox(0.28, 0.62, 0.07, 0, 0.78, -0.16, materials.pad);
      addBox(0.08, 1.50, 0.08, 0, 0.75, -0.34, materials.steel);
      addBox(0.68, 0.06, 0.06, 0, 1.48, -0.22, materials.steel);
      const ws = makeWeightStack(0, -0.58, 1.48);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;

      const buildArm = (side) => {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.24, 1.38, -0.14);
        addBox(0.04, 0.04, 0.40, 0, 0, 0.20, materials.steel, 0, pivot);
        addBox(0.04, 0.38, 0.04, 0, -0.19, 0.38, materials.steel, 0, pivot);
        addBox(0.07, 0.24, 0.07, 0, -0.26, 0.38, materials.pad, 0, pivot);
        addCyl(0.016, 0.14, 0, -0.10, 0.38, materials.accent, 0, 0, pivot);
        equipGroup.add(pivot);
        return pivot;
      };
      animEquip.pecArmL = buildArm(-1);
      animEquip.pecArmR = buildArm(1);
    } else if (equip === "chest_press_machine") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.06, materials.pad);
      addBox(0.28, 0.62, 0.07, 0, 0.78, -0.16, materials.pad);
      addBox(0.08, 1.40, 0.08, 0, 0.70, -0.32, materials.steel);
      const ws = makeWeightStack(0, -0.56, 1.40);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;

      const pressPivot = new THREE.Group();
      pressPivot.position.set(0, 1.36, -0.26);
      addBox(0.56, 0.04, 0.04, 0, 0, 0.12, materials.steel, 0, pressPivot);
      addBox(0.04, 0.42, 0.04, -0.26, -0.21, 0.28, materials.steel, 0, pressPivot);
      addBox(0.04, 0.42, 0.04, 0.26, -0.21, 0.28, materials.steel, 0, pressPivot);
      addCyl(0.018, 0.14, -0.26, -0.38, 0.34, materials.accent, Math.PI / 2, 0, pressPivot);
      addCyl(0.018, 0.14, 0.26, -0.38, 0.34, materials.accent, Math.PI / 2, 0, pressPivot);
      equipGroup.add(pressPivot);
      animEquip.pressPivot = pressPivot;
    } else if (equip === "shoulder_press_machine") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.06, materials.pad);
      addBox(0.28, 0.62, 0.07, 0, 0.78, -0.16, materials.pad);
      const ws = makeWeightStack(0, -0.48, 1.55);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;

      const ohPivot = new THREE.Group();
      ohPivot.position.set(0, 1.08, -0.26);
      addBox(0.62, 0.04, 0.04, 0, 0, 0.28, materials.steel, 0, ohPivot);
      addCyl(0.018, 0.16, -0.30, 0, 0.30, materials.accent, Math.PI / 2, 0, ohPivot);
      addCyl(0.018, 0.16, 0.30, 0, 0.30, materials.accent, Math.PI / 2, 0, ohPivot);
      equipGroup.add(ohPivot);
      animEquip.ohPivot = ohPivot;
    } else if (equip === "row_machine") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.06, materials.pad);
      addBox(0.26, 0.36, 0.07, 0, 0.86, 0.22, materials.pad);
      addBox(0.06, 0.88, 0.06, 0, 0.44, 0.26, materials.steel);
      const ws = makeWeightStack(0, 0.56, 1.38);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;

      const rowPivot = new THREE.Group();
      rowPivot.position.set(0, 0.88, 0.46);
      addBox(0.44, 0.04, 0.34, 0, 0, -0.18, materials.steel, 0, rowPivot);
      addCyl(0.018, 0.14, -0.20, 0, -0.34, materials.accent, 0, 0, rowPivot);
      addCyl(0.018, 0.14, 0.20, 0, -0.34, materials.accent, 0, 0, rowPivot);
      equipGroup.add(rowPivot);
      animEquip.rowPivot = rowPivot;
    } else if (equip === "preacher_machine") {
      addBox(0.32, 0.07, 0.36, 0, 0.42, 0.02, materials.pad);
      addBox(0.06, 0.40, 0.06, 0, 0.20, 0.02, materials.steel);
      addBox(0.44, 0.28, 0.06, 0, 0.80, 0.24, materials.pad, 0.72);
      addBox(0.06, 0.76, 0.06, 0, 0.38, 0.28, materials.steel);
    } else if (equip === "lat_machine") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.04, materials.pad);
      addBox(0.07, 0.39, 0.07, 0, 0.195, 0.04, materials.steel);
      addBox(0.05, 0.26, 0.05, 0, 0.48, 0.32, materials.steel);
      addCyl(0.05, 0.34, 0, 0.58, 0.32, materials.pad, Math.PI / 2);
      addBox(0.08, 1.95, 0.08, 0, 0.975, -0.46, materials.steel);
      addBox(0.08, 0.06, 0.56, 0, 1.92, -0.20, materials.steel);
      const ws = makeWeightStack(0, -0.62, 1.80);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;

      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.9, 0), new THREE.Vector3(0, 1.5, 0)]);
      const line = new THREE.Line(lineGeo, materials.cable);
      equipGroup.add(line);
      parts.cableLines.push({ line, origin: [0, 1.90, 0], target: "midWr" });
    } else if (equip === "cable_row_bench") {
      addBox(0.32, 0.07, 0.62, 0, 0.38, -0.06, materials.pad);
      addBox(0.06, 0.36, 0.06, 0, 0.18, -0.28, materials.steel);
      addBox(0.06, 0.36, 0.06, 0, 0.18, 0.20, materials.steel);
      addBox(0.34, 0.26, 0.05, 0, 0.36, 0.72, materials.darkSteel, -0.3);
      const ws = makeWeightStack(0, 1.02, 1.50);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.72, 0.95), new THREE.Vector3(0, 0.8, 0.4)]);
      const line = new THREE.Line(lineGeo, materials.cable);
      equipGroup.add(line);
      parts.cableLines.push({ line, origin: [0, 0.72, 0.95], target: "midWr" });
    } else if (equip === "cable_dual") {
      [-0.88, 0.88].forEach((x, idx) => {
        addBox(0.08, 1.94, 0.08, x, 0.97, -0.16, materials.steel);
        const wheel = addCyl(0.05, 0.03, x, 1.24, -0.14, materials.accent, Math.PI / 2);
        wheel.rotation.y = Math.PI / 2;
        const key = idx === 0 ? "wrL" : "wrR";
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 1.24, -0.14), new THREE.Vector3(0, 1.2, 0)]);
        const line = new THREE.Line(lineGeo, materials.cable);
        equipGroup.add(line);
        parts.cableLines.push({ line, origin: [x, 1.24, -0.14], target: key });
      });
    } else if (equip === "cable_high" || equip === "cable_mid" || equip === "cable_low") {
      const py = equip === "cable_high" ? 1.72 : equip === "cable_mid" ? 1.06 : 0.32;
      addBox(0.08, 1.92, 0.08, 0, 0.96, 0.95, materials.steel);
      const ws = makeWeightStack(0, 1.16, 1.85);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), materials.accent);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, py, 0.90);
      equipGroup.add(wheel);

      const prop = RIGS_3D[currentRigKey]?.prop;
      if (prop === "rope") {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, py, 0.9), new THREE.Vector3(0, 1.2, 0.3)]);
        const line = new THREE.Line(lineGeo, materials.cable);
        equipGroup.add(line);
        parts.cableLines.push({ line, origin: [0, py, 0.90], target: "ropeApex" });
      } else {
        ["wrL", "wrR"].forEach((key) => {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, py, 0.9), new THREE.Vector3(0, 1, 0)]);
          const line = new THREE.Line(lineGeo, materials.cable);
          equipGroup.add(line);
          parts.cableLines.push({ line, origin: [0, py, 0.90], target: key });
        });
      }
    } else if (equip === "leg_press") {
      addBox(0.36, 0.07, 0.36, 0, 0.36, -0.04, materials.pad);
      addBox(0.34, 0.54, 0.07, 0, 0.64, -0.34, materials.pad, -0.70);
      addBox(0.06, 0.06, 1.25, -0.24, 0.64, 0.24, materials.steel, -0.78);
      addBox(0.06, 0.06, 1.25, 0.24, 0.64, 0.24, materials.steel, -0.78);
      const sledGroup = new THREE.Group();
      addBox(0.48, 0.36, 0.05, 0, 0, 0, materials.darkSteel, -0.78, sledGroup);
      const pL = addCyl(0.15, 0.04, -0.28, 0.04, 0.04, materials.plate, Math.PI / 2, 0, sledGroup);
      const pR = pL.clone();
      pR.position.x = 0.28;
      sledGroup.add(pR);
      equipGroup.add(sledGroup);
      animEquip.sledGroup = sledGroup;
    } else if (equip === "leg_ext_machine" || equip === "leg_curl_machine") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.06, materials.pad);
      addBox(0.28, 0.58, 0.07, 0, 0.78, -0.16, materials.pad);
      addBox(0.07, 0.39, 0.07, 0, 0.195, 0.02, materials.steel);
      const ws = makeWeightStack(0.44, 0.06, 1.35);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;

      const legPivot = new THREE.Group();
      legPivot.position.set(0, 0.48, 0.42);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 10), materials.steel);
      bar.position.set(0, -0.21, 0);
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.40, 12), materials.pad);
      roller.rotation.z = Math.PI / 2;
      roller.position.set(0, -0.38, 0);
      legPivot.add(bar, roller);
      equipGroup.add(legPivot);
      animEquip.legPivot = legPivot;
    } else if (equip === "lying_curl_machine") {
      addBox(0.32, 0.07, 1.18, 0, 0.425, -0.06, materials.pad);
      addBox(0.06, 0.39, 0.06, 0, 0.195, -0.52, materials.steel);
      addBox(0.06, 0.39, 0.06, 0, 0.195, 0.40, materials.steel);
      const ws = makeWeightStack(0.44, 0.10, 1.25);
      equipGroup.add(ws.group);
      animEquip.weightStack = ws.movingStack;

      const legPivot = new THREE.Group();
      legPivot.position.set(0, 0.50, 0.58);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.38, 10), materials.steel);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(0, 0, 0.19);
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.38, 12), materials.pad);
      roller.rotation.z = Math.PI / 2;
      roller.position.set(0, 0.04, 0.36);
      legPivot.add(bar, roller);
      equipGroup.add(legPivot);
      animEquip.legPivot = legPivot;
    } else if (equip === "squat_rack" || equip === "smith_machine") {
      [-0.56, 0.56].forEach((x) => {
        addBox(0.05, 1.95, 0.05, x, 0.975, -0.04, materials.steel);
        addBox(0.05, 0.04, 0.72, x, 0.02, 0, materials.darkSteel);
      });
      if (equip === "smith_machine") {
        addCyl(0.014, 1.92, -0.52, 0.96, 0, materials.accent);
        addCyl(0.014, 1.92, 0.52, 0.96, 0, materials.accent);
      }
    } else if (equip === "calf_machine") {
      addBox(0.46, 0.07, 0.24, 0, 0.035, 0.12, materials.darkSteel);
    }
  }

  function orientSegment(seg, a, b, torsoForward = null) {
    const THREE = window.THREE;
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = Math.max(0.01, dir.length());
    seg.position.copy(mid);
    seg.scale.y = len;

    const up = dir.clone().normalize();
    if (torsoForward) {
      const fwd = torsoForward.clone().sub(up.clone().multiplyScalar(torsoForward.dot(up)));
      if (fwd.lengthSq() > 1e-5) {
        fwd.normalize();
        const right = new THREE.Vector3().crossVectors(up, fwd).normalize();
        const orthoFwd = new THREE.Vector3().crossVectors(right, up).normalize();
        const m = new THREE.Matrix4().makeBasis(right, up, orthoFwd);
        seg.quaternion.setFromRotationMatrix(m);
        return;
      }
    }
    seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
  }

  function applyMuscleHighlights(primaryMuscles, secondaryMuscles, ease) {
    const prim = new Set(primaryMuscles || []);
    const sec = new Set(secondaryMuscles || []);
    MUSCLE_KEYS.forEach((m) => {
      const mat = muscleMats[m];
      if (!mat) return;
      let mult = 1.0;
      const isPrim = prim.has(m);
      const isSec = sec.has(m);
      if (isPrim) {
        mat.color.setHex(0xef4444);
        mat.emissive.setHex(0x991b1b);
        mat.emissiveIntensity = 0.45 + ease * 0.75;
        mat.opacity = 0.94;
        mult = 1 + ease * 0.09;
      } else if (isSec) {
        mat.color.setHex(0xf59e0b);
        mat.emissive.setHex(0x92400e);
        mat.emissiveIntensity = 0.22 + ease * 0.36;
        mat.opacity = 0.86;
        mult = 1 + ease * 0.04;
      } else {
        mat.color.setHex(0x4b5563);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.opacity = 0.75;
      }
      (muscleMeshes[m] || []).forEach((mesh) => {
        mesh.visible = glbReady ? (isPrim || isSec) : true;
        const bs = mesh.userData.baseScale;
        if (bs) mesh.scale.set(bs[0] * mult, bs[1], bs[2] * mult);
      });
    });
  }

  function applyMistakeOffset(rig, p, ease) {
    if (!showMistake) return;
    const type = rig.mistakeType || "swing";
    if (type === "press_flare") {
      // Flared 90° elbows + arched lower back
      p.elL.x -= 0.14;
      p.elR.x += 0.14;
      p.elL.z -= 0.10;
      p.elR.z -= 0.10;
      p.lumbar.y += 0.07;
    } else if (type === "round_back") {
      // Rounded lumbar flexion + forward head
      p.lumbar.y -= 0.08 * (0.4 + 0.6 * ease);
      p.lumbar.z -= 0.08 * (0.4 + 0.6 * ease);
      p.chest.y -= 0.05;
      p.head.y -= 0.06;
    } else if (type === "knee_valgus") {
      // Knees caving inward (valgus) + shallow depth
      p.knL.x += 0.11 * ease;
      p.knR.x -= 0.11 * ease;
      p.pelvis.y += 0.14 * ease;
      p.lumbar.z -= 0.06 * ease;
    } else if (type === "swing") {
      // Momentum body swing + shrugged shoulders
      p.chest.z -= 0.12 * ease;
      p.neck.z -= 0.14 * ease;
      p.head.z -= 0.14 * ease;
      p.shL.y += 0.05 * ease;
      p.shR.y += 0.05 * ease;
      p.elL.z += 0.08 * ease;
      p.elR.z += 0.08 * ease;
    }
  }

  function computePoseAt(rig, t) {
    const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
    const p = {};
    JOINT_KEYS.forEach((k) => {
      p[k] = lerpVec3(rig.start[k], rig.end[k], ease);
    });
    applyMistakeOffset(rig, p, ease);
    return { p, ease };
  }

  function buildMovementGuides(rig) {
    const THREE = window.THREE;
    clearGroup(guideGroup);
    if (!showGuides || !rig) return;

    const samples = 24;
    const ptsL = [];
    const ptsR = [];
    const ptsMid = [];

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const { p } = computePoseAt(rig, t);
      if (rig.track === "anBoth") {
        ptsL.push(p.anL.clone());
        ptsR.push(p.anR.clone());
      } else if (rig.track === "pelvis") {
        ptsMid.push(p.pelvis.clone());
      } else if (rig.track === "wrR") {
        ptsMid.push(p.wrR.clone());
      } else if (rig.track === "midWr") {
        ptsMid.push(new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5));
      } else {
        ptsL.push(p.wrL.clone());
        ptsR.push(p.wrR.clone());
      }
    }

    const curveMat = showMistake ? materials.guideMistake : materials.guideCurve;

    const addCurveTube = (pts) => {
      if (pts.length < 2) return;
      const dist = pts[0].distanceTo(pts[pts.length - 1]);
      if (dist < 0.015) return;

      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.011, 8, false), curveMat);
      guideGroup.add(tube);

      const sDot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), materials.guideStart);
      sDot.position.copy(pts[0]);
      const eDot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), materials.guidePeak);
      eDot.position.copy(pts[pts.length - 1]);
      guideGroup.add(sDot, eDot);

      const midPt = curve.getPointAt(0.55);
      const tan = curve.getTangentAt(0.55).normalize();
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.065, 10), curveMat);
      cone.position.copy(midPt);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
      guideGroup.add(cone);
    };

    if (ptsMid.length) addCurveTube(ptsMid);
    if (ptsL.length) addCurveTube(ptsL);
    if (ptsR.length) addCurveTube(ptsR);
  }

  function updateJointAngleArc(a, pivot, b) {
    const THREE = window.THREE;
    const v1 = new THREE.Vector3().subVectors(a, pivot).normalize();
    const v2 = new THREE.Vector3().subVectors(b, pivot).normalize();
    const dot = Math.max(-0.999, Math.min(0.999, v1.dot(v2)));
    const angle = Math.acos(dot);
    if (angle < 0.15) return;

    const radius = 0.12;
    const segs = 12;
    const verts = [pivot.x, pivot.y, pivot.z];
    const q = new THREE.Quaternion().setFromUnitVectors(v1, v2);
    for (let i = 0; i <= segs; i++) {
      const dir = v1.clone().applyQuaternion(new THREE.Quaternion().slerpQuaternions(new THREE.Quaternion(), q, i / segs));
      const pt = pivot.clone().addScaledVector(dir, radius);
      verts.push(pt.x, pt.y, pt.z);
    }
    const indices = [];
    for (let i = 1; i <= segs; i++) {
      indices.push(0, i, i + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(indices);
    const mesh = new THREE.Mesh(geo, materials.angleArc);
    angleGroup.add(mesh);
  }

  function driveGlbSkeleton(p, torsoFwd) {
    if (!glbReady || !glbModel || !glbBones.mixamorigHips) return;
    const THREE = window.THREE;

    // Orient hips in world space (accounting for Armature parent transform)
    const spineUp = new THREE.Vector3().subVectors(p.chest, p.pelvis);
    if (spineUp.lengthSq() < 1e-6) spineUp.set(0, 1, 0);
    else spineUp.normalize();

    const fwd = torsoFwd.clone().sub(spineUp.clone().multiplyScalar(torsoFwd.dot(spineUp)));
    if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, 1);
    else fwd.normalize();

    const right = new THREE.Vector3().crossVectors(spineUp, fwd).normalize();
    const orthoFwd = new THREE.Vector3().crossVectors(right, spineUp).normalize();
    const hipsTargetWorldQ = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(right, spineUp, orthoFwd)
    );

    const hips = glbBones.mixamorigHips;
    if (hips.parent) {
      const parentQ = new THREE.Quaternion();
      hips.parent.getWorldQuaternion(parentQ);
      hips.quaternion.copy(parentQ.invert().multiply(hipsTargetWorldQ));
    } else {
      hips.quaternion.copy(hipsTargetWorldQ);
    }

    // Place glbModel so mixamorigHips world position matches p.pelvis exactly
    glbModel.position.set(0, 0, 0);
    glbModel.updateMatrixWorld(true);
    const hipsWorldPos = new THREE.Vector3();
    hips.getWorldPosition(hipsWorldPos);
    glbModel.position.copy(p.pelvis).sub(hipsWorldPos);
    glbModel.updateMatrixWorld(true);

    const safeUnitQuat = (vFrom, vTo) => {
      const d = vFrom.dot(vTo);
      if (d < -0.9999) {
        const axis = new THREE.Vector3(1, 0, 0).cross(vFrom);
        if (axis.lengthSq() < 1e-6) axis.set(0, 0, 1).cross(vFrom);
        axis.normalize();
        return new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
      }
      return new THREE.Quaternion().setFromUnitVectors(vFrom, vTo);
    };

    const alignBone = (bName, ptA, ptB) => {
      const bone = glbBones[bName];
      const rest = glbRest[bName];
      if (!bone || !rest || !bone.parent) return;
      const diff = new THREE.Vector3().subVectors(ptB, ptA);
      if (diff.lengthSq() < 1e-6) return;
      const targetDir = diff.normalize();
      const deltaWorld = safeUnitQuat(rest.restDir, targetDir);
      const targetWorldQ = deltaWorld.multiply(rest.restWorldQuat);
      const parentWorldQ = new THREE.Quaternion();
      bone.parent.getWorldQuaternion(parentWorldQ);
      bone.quaternion.copy(parentWorldQ.invert().multiply(targetWorldQ));
      bone.updateMatrixWorld(true);
    };

    alignBone("mixamorigSpine", p.pelvis, p.chest);
    alignBone("mixamorigSpine2", p.chest, p.neck);
    alignBone("mixamorigNeck", p.neck, p.head);

    alignBone("mixamorigLeftArm", p.shL, p.elL);
    alignBone("mixamorigLeftForeArm", p.elL, p.wrL);
    alignBone("mixamorigRightArm", p.shR, p.elR);
    alignBone("mixamorigRightForeArm", p.elR, p.wrR);

    alignBone("mixamorigLeftUpLeg", p.hipL, p.knL);
    alignBone("mixamorigLeftLeg", p.knL, p.anL);
    alignBone("mixamorigRightUpLeg", p.hipR, p.knR);
    alignBone("mixamorigRightLeg", p.knR, p.anR);
  }

  function updatePose(rigKey, t, primaryMuscles = [], secondaryMuscles = []) {
    if (!parts || !RIGS_3D[rigKey]) return;
    const THREE = window.THREE;
    const rig = RIGS_3D[rigKey];
    const { p, ease } = computePoseAt(rig, t);

    applyMuscleHighlights(primaryMuscles, secondaryMuscles, ease);

    const spineUp = new THREE.Vector3().subVectors(p.neck, p.pelvis).normalize();
    const shRight = new THREE.Vector3().subVectors(p.shR, p.shL).normalize();
    let torsoFwd = new THREE.Vector3().crossVectors(shRight, spineUp).normalize();
    if (rig.prone) torsoFwd.multiplyScalar(-1);
    if (torsoFwd.lengthSq() < 0.01) torsoFwd.set(0, 0, 1);

    // Drive GLB skeleton if ready, else procedural segments
    if (glbReady && glbModel) {
      procGroup.visible = false;
      glbModel.visible = true;
      driveGlbSkeleton(p, torsoFwd);
    } else {
      procGroup.visible = true;
      orientSegment(parts.pelvisSeg, p.pelvis, p.lumbar, torsoFwd);
      orientSegment(parts.lumbarSeg, p.lumbar, p.chest, torsoFwd);
      orientSegment(parts.chestSeg, p.chest, p.neck, torsoFwd);
      orientSegment(parts.neckSeg, p.neck, p.head, torsoFwd);

      parts.headMesh.position.copy(p.head);
      const headUp = new THREE.Vector3().subVectors(p.head, p.neck).normalize();
      const headFwd = torsoFwd.clone().sub(headUp.clone().multiplyScalar(torsoFwd.dot(headUp)));
      if (headFwd.lengthSq() > 1e-4) {
        headFwd.normalize();
        const headRight = new THREE.Vector3().crossVectors(headUp, headFwd).normalize();
        const orthoFwd = new THREE.Vector3().crossVectors(headRight, headUp).normalize();
        parts.headMesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(headRight, headUp, orthoFwd));
      }

      orientSegment(parts.armUL, p.shL, p.elL, torsoFwd);
      orientSegment(parts.armFL, p.elL, p.wrL, torsoFwd);
      orientSegment(parts.armUR, p.shR, p.elR, torsoFwd);
      orientSegment(parts.armFR, p.elR, p.wrR, torsoFwd);

      const orientHand = (hand, el, wr) => {
        hand.position.copy(wr);
        const dir = new THREE.Vector3().subVectors(wr, el).normalize();
        hand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      };
      orientHand(parts.handL, p.elL, p.wrL);
      orientHand(parts.handR, p.elR, p.wrR);

      orientSegment(parts.thighL, p.hipL, p.knL, torsoFwd);
      orientSegment(parts.calfL, p.knL, p.anL, torsoFwd);
      orientSegment(parts.footL, p.anL, p.toeL);
      orientSegment(parts.thighR, p.hipR, p.knR, torsoFwd);
      orientSegment(parts.calfR, p.knR, p.anR, torsoFwd);
      orientSegment(parts.footR, p.anR, p.toeR);
    }

    // Orient Shared Muscle Overlay Groups
    orientSegment(parts.mPelvis, p.pelvis, p.lumbar, torsoFwd);
    orientSegment(parts.mLumbar, p.lumbar, p.chest, torsoFwd);
    orientSegment(parts.mChest, p.chest, p.neck, torsoFwd);
    orientSegment(parts.mArmUL, p.shL, p.elL, torsoFwd);
    orientSegment(parts.mArmFL, p.elL, p.wrL, torsoFwd);
    orientSegment(parts.mArmUR, p.shR, p.elR, torsoFwd);
    orientSegment(parts.mArmFR, p.elR, p.wrR, torsoFwd);
    orientSegment(parts.mThighL, p.hipL, p.knL, torsoFwd);
    orientSegment(parts.mCalfL, p.knL, p.anL, torsoFwd);
    orientSegment(parts.mThighR, p.hipR, p.knR, torsoFwd);
    orientSegment(parts.mCalfR, p.knR, p.anR, torsoFwd);

    // Props
    parts.barGroup.visible = rig.prop === "bar";
    parts.dbL.visible = rig.prop === "dumbbell_pair";
    parts.dbR.visible = rig.prop === "dumbbell_pair" || rig.prop === "dumbbell_right";
    parts.dbSingle.visible = rig.prop === "dumbbell_single";
    parts.latBar.visible = rig.prop === "lat_bar";
    parts.vBar.visible = rig.prop === "v_bar";
    parts.ropeGroup.visible = rig.prop === "rope";

    if (rig.prop === "bar" || rig.prop === "lat_bar" || rig.prop === "v_bar") {
      const midWr = new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5);
      const grp = rig.prop === "bar" ? parts.barGroup : rig.prop === "lat_bar" ? parts.latBar : parts.vBar;
      grp.position.copy(midWr);
      const barDir = new THREE.Vector3().subVectors(p.wrR, p.wrL).normalize();
      grp.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), barDir);
    } else if (rig.prop === "dumbbell_pair") {
      parts.dbL.position.copy(p.wrL);
      parts.dbR.position.copy(p.wrR);
    } else if (rig.prop === "dumbbell_right") {
      parts.dbR.position.copy(p.wrR);
    } else if (rig.prop === "dumbbell_single") {
      const midWr = new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5);
      parts.dbSingle.position.copy(midWr);
    } else if (rig.prop === "rope") {
      const apex = new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.16, 0.08));
      orientSegment(parts.ropeL, apex, p.wrL);
      orientSegment(parts.ropeR, apex, p.wrR);
      parts.ropeStopL.position.copy(p.wrL);
      parts.ropeStopR.position.copy(p.wrR);
      p.ropeApex = apex;
    }

    // Dynamic cables
    parts.cableLines.forEach((c) => {
      const tgt = c.target === "midWr"
        ? new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5)
        : c.target === "ropeApex" && p.ropeApex
          ? p.ropeApex
          : p[c.target];
      if (tgt) {
        c.line.geometry.setFromPoints([
          new THREE.Vector3(c.origin[0], c.origin[1], c.origin[2]),
          tgt
        ]);
      }
    });

    // Animated Machine Parts
    if (animEquip.weightStack) animEquip.weightStack.position.y = 0.42 + ease * 0.28;
    if (animEquip.pecArmL && animEquip.pecArmR) {
      const angleL = Math.atan2(p.wrL.x - (-0.24), p.wrL.z - (-0.14));
      const angleR = Math.atan2(p.wrR.x - 0.24, p.wrR.z - (-0.14));
      animEquip.pecArmL.rotation.y = angleL * 0.65;
      animEquip.pecArmR.rotation.y = angleR * 0.65;
    }
    if (animEquip.pressPivot) animEquip.pressPivot.rotation.x = -0.18 - ease * 0.42;
    if (animEquip.ohPivot) animEquip.ohPivot.position.y = 1.08 + ease * 0.40;
    if (animEquip.rowPivot) animEquip.rowPivot.position.z = 0.46 - ease * 0.36;
    if (animEquip.sledGroup) {
      const midFoot = new THREE.Vector3().addVectors(p.anL, p.anR).multiplyScalar(0.5);
      animEquip.sledGroup.position.set(midFoot.x, midFoot.y + 0.04, midFoot.z + 0.06);
    }
    if (animEquip.legPivot) {
      const midAn = new THREE.Vector3().addVectors(p.anL, p.anR).multiplyScalar(0.5);
      const midKn = new THREE.Vector3().addVectors(p.knL, p.knR).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(midAn, midKn).normalize();
      animEquip.legPivot.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    }

    // Dynamic Spine Posture Line & Joint-Angle Arcs
    clearGroup(angleGroup);
    if (showGuides) {
      let spineObj = guideGroup.getObjectByName("spineGuide");
      const sCurve = new THREE.CatmullRomCurve3([p.pelvis, p.lumbar, p.chest, p.neck]);
      if (!spineObj) {
        spineObj = new THREE.Mesh(new THREE.TubeGeometry(sCurve, 12, 0.009, 6, false), materials.guideSpine);
        spineObj.name = "spineGuide";
        guideGroup.add(spineObj);
      } else {
        spineObj.geometry.dispose();
        spineObj.geometry = new THREE.TubeGeometry(sCurve, 12, 0.009, 6, false);
      }

      if (rig.angleType === "knee") {
        updateJointAngleArc(p.hipR, p.knR, p.anR);
      } else if (rig.angleType === "hip") {
        updateJointAngleArc(p.chest, p.pelvis, p.knR);
      } else {
        updateJointAngleArc(p.shR, p.elR, p.wrR);
      }
    }
  }

  function render() {
    if (!renderer || !scene || !camera) return;
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  function resize() {
    if (!renderer || !camera) return;
    const canvas = renderer.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = Math.max(220, parent.clientWidth);
    const h = Math.round(w * 0.75);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function setCameraPreset(preset) {
    if (!camera || !controls) return;
    controls.target.set(0, 0.92, 0);
    if (preset === "front") camera.position.set(0, 1.15, 2.45);
    else if (preset === "side") camera.position.set(2.45, 1.15, 0);
    else if (preset === "back") camera.position.set(0, 1.15, -2.45);
    else camera.position.set(1.65, 1.45, 2.05);
    controls.update();
    render();
  }

  function resolveRigKey(rigKey, exId) {
    if (exId === "ex_rear_delt_mach" && RIGS_3D.reverse_pec_deck) return "reverse_pec_deck";
    if (exId === "ex_mach_row" && RIGS_3D.row_machine) return "row_machine";
    if (exId === "ex_shoulder_mach" && RIGS_3D.shoulder_machine) return "shoulder_machine";
    return RIGS_3D[rigKey] ? rigKey : "curl";
  }

  function loadExercise(canvas, rigKey, primaryMuscles = [], secondaryMuscles = [], exId = "") {
    if (!initScene(canvas)) return false;
    currentRigKey = resolveRigKey(rigKey, exId);
    currentPrimaryMuscles = primaryMuscles || [];
    currentSecondaryMuscles = secondaryMuscles || [];
    currentPhase = 0;
    showMistake = false;
    const equip = resolveEquipment(currentRigKey, exId);
    buildEquipment(equip);
    buildMovementGuides(RIGS_3D[currentRigKey]);
    resize();
    setCameraPreset("iso");
    updatePose(currentRigKey, 0, currentPrimaryMuscles, currentSecondaryMuscles);
    render();
    return true;
  }

  function setPhase(t) {
    currentPhase = t;
    updatePose(currentRigKey, t, currentPrimaryMuscles, currentSecondaryMuscles);
    render();
  }

  function toggleGuides() {
    showGuides = !showGuides;
    buildMovementGuides(RIGS_3D[currentRigKey]);
    updatePose(currentRigKey, currentPhase, currentPrimaryMuscles, currentSecondaryMuscles);
    render();
    return showGuides;
  }

  function toggleMistake() {
    showMistake = !showMistake;
    buildMovementGuides(RIGS_3D[currentRigKey]);
    updatePose(currentRigKey, currentPhase, currentPrimaryMuscles, currentSecondaryMuscles);
    render();
    return showMistake;
  }

  function getMistakeNote() {
    if (!showMistake) return "";
    const type = RIGS_3D[currentRigKey]?.mistakeType || "swing";
    return MISTAKE_NOTES[type] || MISTAKE_NOTES.swing;
  }

  window.MuscleMap3D = {
    isAvailable,
    loadExercise,
    setPhase,
    render,
    resize,
    setCameraPreset,
    toggleGuides,
    getGuidesEnabled: () => showGuides,
    toggleMistake,
    getMistakeEnabled: () => showMistake,
    getMistakeNote
  };
})();
