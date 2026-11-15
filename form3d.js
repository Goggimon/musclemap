(() => {
  "use strict";

  // 3D Biomechanical Pose & Equipment Engine for MUSCLEMAP (Three.js + OrbitControls)
  // Coordinate system: meters, Y-up, floor at y = 0, athlete faces +Z by default.

  const JOINT_KEYS = [
    "pelvis", "lumbar", "chest", "neck", "head",
    "shL", "elL", "wrL", "shR", "elR", "wrR",
    "hipL", "knL", "anL", "toeL", "hipR", "knR", "anR", "toeR"
  ];

  // Helper to build symmetric standing / seated / lying poses concisely
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
    // Lying supine on flat bench (bench top at y = 0.46), head toward -Z, feet toward +Z
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
    // Seated on upright seat (seat top at y = 0.46, backrest at z = -0.16)
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
      equip: "bench_flat",
      prop: "bar",
      guide: "bar_path",
      start: makeSupinePose({
        chest: [0, 0.59, -0.24],
        elL: [-0.34, 0.48, -0.16], wrL: [-0.32, 0.69, -0.22],
        elR: [0.34, 0.48, -0.16],  wrR: [0.32, 0.69, -0.22]
      }),
      end: makeSupinePose({
        chest: [0, 0.59, -0.24],
        elL: [-0.26, 0.80, -0.22], wrL: [-0.32, 1.04, -0.24],
        elR: [0.26, 0.80, -0.22],  wrR: [0.32, 1.04, -0.24]
      })
    },
    incline_press: {
      equip: "bench_incline",
      prop: "dumbbell_pair",
      guide: "bar_path",
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
      equip: "bench_flat",
      prop: "dumbbell_pair",
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
      equip: "bench_flat",
      prop: "dumbbell_single",
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
      equip: "cable_mid",
      prop: "cable_handles",
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
      equip: "machine_seat",
      prop: "none",
      start: makeSeatedPose({
        elL: [-0.46, 0.96, -0.02], wrL: [-0.46, 1.16, 0.04],
        elR: [0.46, 0.96, -0.02],  wrR: [0.46, 1.16, 0.04]
      }),
      end: makeSeatedPose({
        elL: [-0.20, 0.96, 0.22], wrL: [-0.08, 1.10, 0.36],
        elR: [0.20, 0.96, 0.22],  wrR: [0.08, 1.10, 0.36]
      })
    },
    machine_press: {
      equip: "machine_seat",
      prop: "none",
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
      equip: "dip_bars",
      prop: "none",
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
      equip: "floor",
      prop: "none",
      guide: "spine",
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
      equip: "floor",
      prop: "bar",
      guide: "bar_path",
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
      equip: "machine_seat",
      prop: "dumbbell_pair",
      start: makeSeatedPose({
        elL: [-0.30, 0.84, 0.04], wrL: [-0.30, 1.08, 0.04],
        elR: [0.30, 0.84, 0.04],  wrR: [0.30, 1.08, 0.04]
      }),
      end: makeSeatedPose({
        elL: [-0.20, 1.24, 0.0], wrL: [-0.16, 1.48, 0.0],
        elR: [0.20, 1.24, 0.0],  wrR: [0.16, 1.48, 0.0]
      })
    },
    lat_raise: {
      equip: "floor",
      prop: "dumbbell_pair",
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
      equip: "floor",
      prop: "dumbbell_pair",
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
      equip: "floor",
      prop: "dumbbell_pair",
      guide: "spine",
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
      equip: "cable_high",
      prop: "cable_handles",
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
      equip: "pullup_bar",
      prop: "none",
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
      equip: "lat_machine",
      prop: "none",
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
      equip: "floor",
      prop: "bar",
      guide: "spine",
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
      equip: "bench_flat",
      prop: "dumbbell_right",
      guide: "spine",
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
      equip: "bench_incline",
      prop: "dumbbell_pair",
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
      equip: "cable_mid",
      prop: "cable_handles",
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
    shrug: {
      equip: "floor",
      prop: "dumbbell_pair",
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
      equip: "floor",
      prop: "dumbbell_pair",
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
      equip: "bench_incline",
      prop: "dumbbell_pair",
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
      equip: "machine_seat",
      prop: "dumbbell_pair",
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
      equip: "cable_high",
      prop: "cable_handles",
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
      equip: "machine_seat",
      prop: "dumbbell_single",
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
      equip: "bench_flat",
      prop: "bar",
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
      equip: "bench_flat",
      prop: "dumbbell_right",
      guide: "spine",
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
      equip: "floor",
      prop: "bar",
      guide: "bar_path",
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
      equip: "floor",
      prop: "dumbbell_pair",
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
      equip: "leg_press",
      prop: "none",
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
      equip: "machine_seat",
      prop: "none",
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
      equip: "machine_seat",
      prop: "none",
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
      equip: "bench_flat",
      prop: "none",
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
      equip: "floor",
      prop: "bar",
      guide: "spine",
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
      equip: "bench_flat",
      prop: "bar",
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
      equip: "floor",
      prop: "dumbbell_pair",
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
      equip: "pullup_bar",
      prop: "none",
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
      equip: "cable_high",
      prop: "cable_handles",
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
      equip: "cable_high",
      prop: "cable_handles",
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

  /* ---------------- THREE.JS VIEWER STATE ---------------- */
  let renderer = null;
  let scene = null;
  let camera = null;
  let controls = null;
  let rootGroup = null;
  let equipGroup = null;
  let guideGroup = null;
  let showGuides = true;

  let parts = null;
  let materials = null;
  let currentRigKey = "curl";
  let currentPrimaryMuscles = [];

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

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 4 / 3, 0.1, 30);
    camera.position.set(1.65, 1.45, 2.05);

    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.92, 0);
    controls.minDistance = 0.9;
    controls.maxDistance = 5.0;
    controls.maxPolarAngle = Math.PI * 0.49;

    // Studio three-point lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.65);
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(2.5, 4.0, 3.0);
    const rim = new THREE.DirectionalLight(0xdc2626, 0.45);
    rim.position.set(-2.5, 2.5, -2.5);
    const fill = new THREE.DirectionalLight(0x9ca3af, 0.4);
    fill.position.set(0, 1.5, -3.0);
    scene.add(amb, key, rim, fill);

    // Subtle Swiss floor grid
    const grid = new THREE.GridHelper(3.2, 16, 0x262a34, 0x181b22);
    scene.add(grid);

    rootGroup = new THREE.Group();
    equipGroup = new THREE.Group();
    guideGroup = new THREE.Group();
    scene.add(rootGroup, equipGroup, guideGroup);

    buildMaterials();
    buildMannequin();
    resize();
    return true;
  }

  function buildMaterials() {
    const THREE = window.THREE;
    materials = {
      bone: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.45, metalness: 0.15 }),
      leg: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.5, metalness: 0.12 }),
      accent: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4, metalness: 0.18 }),
      joint: new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.35, metalness: 0.2 }),
      head: new THREE.MeshStandardMaterial({ color: 0x191c22, roughness: 0.4, metalness: 0.2 }),
      shoe: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.6, metalness: 0.1 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.35, metalness: 0.7 }),
      pad: new THREE.MeshStandardMaterial({ color: 0x1b1f27, roughness: 0.75, metalness: 0.05 }),
      plate: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.55 }),
      cable: new THREE.LineBasicMaterial({ color: 0x9ca3af }),
      guideBar: new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 }),
      guideSpine: new THREE.LineBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.85 })
    };
  }

  function makeTaperedSegment(rTop, rBot, mat) {
    const THREE = window.THREE;
    const g = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(rTop, rBot, 1, 14);
    const cyl = new THREE.Mesh(cylGeo, mat);
    g.add(cyl);
    const sTop = new THREE.Mesh(new THREE.SphereGeometry(rTop, 12, 10), mat);
    sTop.position.y = 0.5;
    const sBot = new THREE.Mesh(new THREE.SphereGeometry(rBot, 12, 10), mat);
    sBot.position.y = -0.5;
    g.add(sTop, sBot);
    return g;
  }

  function makeBoxSegment(w, d, mat) {
    const THREE = window.THREE;
    const geo = new THREE.CylinderGeometry(w, d, 1, 14);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(1, 1, 0.62); // Flatten Z slightly for athletic ribcage/pelvis cross-section
    return mesh;
  }

  function buildMannequin() {
    const THREE = window.THREE;
    parts = {
      pelvisSeg: makeBoxSegment(0.145, 0.135, materials.leg),
      lumbarSeg: makeBoxSegment(0.14, 0.135, materials.bone),
      chestSeg:  makeBoxSegment(0.19, 0.145, materials.bone),
      neckSeg:   makeTaperedSegment(0.05, 0.055, materials.bone),
      headMesh:  new THREE.Group(),

      armUL: makeTaperedSegment(0.044, 0.054, materials.accent),
      armFL: makeTaperedSegment(0.030, 0.042, materials.accent),
      armUR: makeTaperedSegment(0.044, 0.054, materials.accent),
      armFR: makeTaperedSegment(0.030, 0.042, materials.accent),

      thighL: makeTaperedSegment(0.052, 0.072, materials.leg),
      calfL:  makeTaperedSegment(0.034, 0.050, materials.leg),
      footL:  makeTaperedSegment(0.032, 0.038, materials.shoe),
      thighR: makeTaperedSegment(0.052, 0.072, materials.leg),
      calfR:  makeTaperedSegment(0.034, 0.050, materials.leg),
      footR:  makeTaperedSegment(0.032, 0.038, materials.shoe),

      // Barbell / Dumbbell props
      barGroup: new THREE.Group(),
      dbL: new THREE.Group(),
      dbR: new THREE.Group(),
      dbSingle: new THREE.Group(),

      // Dynamic cable lines & leg press sled
      cableLines: [],
      sledMesh: null
    };

    // Head + Brow Visor (so facing direction is unmistakable)
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 14), materials.head);
    skull.scale.set(0.92, 1.08, 0.98);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.04), materials.accent);
    visor.position.set(0, 0.02, 0.09);
    parts.headMesh.add(skull, visor);

    // Barbell prop
    const barShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.36, 12), materials.steel);
    barShaft.rotation.z = Math.PI / 2;
    const plateGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.045, 18);
    const plateL = new THREE.Mesh(plateGeo, materials.plate);
    plateL.rotation.z = Math.PI / 2;
    plateL.position.x = -0.56;
    const plateR = plateL.clone();
    plateR.position.x = 0.56;
    parts.barGroup.add(barShaft, plateL, plateR);

    // Dumbbell builder
    const buildDb = (grp) => {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 10), materials.steel);
      handle.rotation.z = Math.PI / 2;
      const endGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 10);
      const e1 = new THREE.Mesh(endGeo, materials.plate);
      e1.rotation.z = Math.PI / 2;
      e1.position.x = -0.10;
      const e2 = e1.clone();
      e2.position.x = 0.10;
      grp.add(handle, e1, e2);
    };
    buildDb(parts.dbL);
    buildDb(parts.dbR);
    buildDb(parts.dbSingle);

    Object.values(parts).forEach((obj) => {
      if (obj && obj.isObject3D) rootGroup.add(obj);
    });
  }

  function clearGroup(grp) {
    while (grp.children.length) {
      grp.remove(grp.children[0]);
    }
  }

  function buildEquipment(equip) {
    const THREE = window.THREE;
    clearGroup(equipGroup);
    parts.cableLines = [];
    parts.sledMesh = null;

    const addBox = (w, h, d, x, y, z, mat, rx = 0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.rotation.x = rx;
      equipGroup.add(m);
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
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.08, 12), materials.steel);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 1.92, 0);
      equipGroup.add(bar);
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
    } else if (equip === "lat_machine") {
      addBox(0.32, 0.07, 0.38, 0, 0.42, 0.04, materials.pad);
      addBox(0.07, 0.39, 0.07, 0, 0.195, 0.04, materials.steel);
      addBox(0.06, 1.95, 0.06, 0, 0.975, -0.45, materials.steel);
      addBox(0.06, 0.06, 0.55, 0, 1.92, -0.20, materials.steel);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.9, 0), new THREE.Vector3(0, 1.5, 0)]);
      const line = new THREE.Line(lineGeo, materials.cable);
      equipGroup.add(line);
      parts.cableLines.push({ line, origin: [0, 1.90, 0], target: "midWr" });
    } else if (equip === "cable_high" || equip === "cable_mid") {
      const py = equip === "cable_high" ? 1.72 : 1.06;
      addBox(0.08, 1.92, 0.08, 0, 0.96, 0.95, materials.steel);
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), materials.accent);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, py, 0.90);
      equipGroup.add(wheel);

      ["wrL", "wrR"].forEach((key) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, py, 0.9), new THREE.Vector3(0, 1, 0)]);
        const line = new THREE.Line(lineGeo, materials.cable);
        equipGroup.add(line);
        parts.cableLines.push({ line, origin: [0, py, 0.90], target: key });
      });
    } else if (equip === "leg_press") {
      addBox(0.36, 0.07, 0.36, 0, 0.36, -0.04, materials.pad);
      addBox(0.34, 0.54, 0.07, 0, 0.64, -0.34, materials.pad, -0.70);
      addBox(0.06, 0.06, 1.15, -0.24, 0.62, 0.24, materials.steel, -0.78);
      addBox(0.06, 0.06, 1.15, 0.24, 0.62, 0.24, materials.steel, -0.78);
      parts.sledMesh = addBox(0.46, 0.34, 0.05, 0, 1.0, 0.64, materials.plate, -0.78);
    }
  }

  function orientSegment(seg, a, b) {
    const THREE = window.THREE;
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = Math.max(0.01, dir.length());
    seg.position.copy(mid);
    seg.scale.y = len;
    seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  }

  function updatePose(rigKey, t, primaryMuscles = []) {
    if (!parts || !RIGS_3D[rigKey]) return;
    const THREE = window.THREE;
    const rig = RIGS_3D[rigKey];
    const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);

    const p = {};
    JOINT_KEYS.forEach((k) => {
      p[k] = lerpVec3(rig.start[k], rig.end[k], ease);
    });

    // Subtle primary-muscle highlighting (legs vs arms vs torso)
    const hasLeg = primaryMuscles.some((m) => ["quads", "hamstrings", "glutes", "calves"].includes(m));
    const hasTorso = primaryMuscles.some((m) => ["chest", "lats", "mid_back", "lower_back", "abs", "obliques", "traps"].includes(m));
    materials.leg.color.setHex(hasLeg ? 0xdc2626 : 0x9ca3af);
    materials.bone.color.setHex(hasTorso ? 0xe5e7eb : 0xd1d5db);

    orientSegment(parts.pelvisSeg, p.pelvis, p.lumbar);
    orientSegment(parts.lumbarSeg, p.lumbar, p.chest);
    orientSegment(parts.chestSeg, p.chest, p.neck);
    orientSegment(parts.neckSeg, p.neck, p.head);

    parts.headMesh.position.copy(p.head);
    const lookDir = new THREE.Vector3().subVectors(p.head, p.neck).normalize();
    parts.headMesh.rotation.x = Math.max(-0.5, Math.min(0.5, lookDir.z * 0.5));

    orientSegment(parts.armUL, p.shL, p.elL);
    orientSegment(parts.armFL, p.elL, p.wrL);
    orientSegment(parts.armUR, p.shR, p.elR);
    orientSegment(parts.armFR, p.elR, p.wrR);

    orientSegment(parts.thighL, p.hipL, p.knL);
    orientSegment(parts.calfL, p.knL, p.anL);
    orientSegment(parts.footL, p.anL, p.toeL);
    orientSegment(parts.thighR, p.hipR, p.knR);
    orientSegment(parts.calfR, p.knR, p.anR);
    orientSegment(parts.footR, p.anR, p.toeR);

    // Props
    parts.barGroup.visible = rig.prop === "bar";
    parts.dbL.visible = rig.prop === "dumbbell_pair";
    parts.dbR.visible = rig.prop === "dumbbell_pair" || rig.prop === "dumbbell_right";
    parts.dbSingle.visible = rig.prop === "dumbbell_single";

    if (rig.prop === "bar") {
      const midWr = new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5);
      parts.barGroup.position.copy(midWr);
      const barDir = new THREE.Vector3().subVectors(p.wrR, p.wrL).normalize();
      parts.barGroup.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), barDir);
    } else if (rig.prop === "dumbbell_pair") {
      parts.dbL.position.copy(p.wrL);
      parts.dbR.position.copy(p.wrR);
    } else if (rig.prop === "dumbbell_right") {
      parts.dbR.position.copy(p.wrR);
    } else if (rig.prop === "dumbbell_single") {
      const midWr = new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5);
      parts.dbSingle.position.copy(midWr);
    }

    // Dynamic cables
    parts.cableLines.forEach((c) => {
      const tgt = c.target === "midWr"
        ? new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5)
        : p[c.target];
      c.line.geometry.setFromPoints([
        new THREE.Vector3(c.origin[0], c.origin[1], c.origin[2]),
        tgt
      ]);
    });

    // Dynamic leg press sled
    if (parts.sledMesh) {
      const midFoot = new THREE.Vector3().addVectors(p.anL, p.anR).multiplyScalar(0.5);
      parts.sledMesh.position.set(midFoot.x, midFoot.y + 0.04, midFoot.z + 0.05);
    }

    // Alignment Guides (Bar path & Spine line)
    clearGroup(guideGroup);
    if (showGuides) {
      if (rig.guide === "bar_path") {
        const midWr = new THREE.Vector3().addVectors(p.wrL, p.wrR).multiplyScalar(0.5);
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(midWr.x, 0.02, midWr.z),
          new THREE.Vector3(midWr.x, 2.05, midWr.z)
        ]);
        guideGroup.add(new THREE.Line(geo, materials.guideBar));
      } else if (rig.guide === "spine") {
        const geo = new THREE.BufferGeometry().setFromPoints([
          p.pelvis, p.lumbar, p.chest, p.neck
        ]);
        guideGroup.add(new THREE.Line(geo, materials.guideSpine));
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
    const targetY = 0.92;
    controls.target.set(0, targetY, 0);
    if (preset === "front") camera.position.set(0, 1.15, 2.45);
    else if (preset === "side") camera.position.set(2.45, 1.15, 0);
    else if (preset === "back") camera.position.set(0, 1.15, -2.45);
    else camera.position.set(1.65, 1.45, 2.05); // 45-degree default
    controls.update();
    render();
  }

  function loadExercise(canvas, rigKey, primaryMuscles = []) {
    if (!initScene(canvas)) return false;
    currentRigKey = RIGS_3D[rigKey] ? rigKey : "curl";
    currentPrimaryMuscles = primaryMuscles;
    buildEquipment(RIGS_3D[currentRigKey].equip);
    resize();
    setCameraPreset("iso");
    updatePose(currentRigKey, 0, currentPrimaryMuscles);
    render();
    return true;
  }

  function setPhase(t) {
    updatePose(currentRigKey, t, currentPrimaryMuscles);
    render();
  }

  function toggleGuides() {
    showGuides = !showGuides;
    return showGuides;
  }

  window.MuscleMap3D = {
    isAvailable,
    loadExercise,
    setPhase,
    render,
    resize,
    setCameraPreset,
    toggleGuides,
    getGuidesEnabled: () => showGuides
  };
})();
