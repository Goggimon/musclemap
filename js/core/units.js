export const LB_PER_KG = 2.20462262185;

export function normalizeUnit(unit) {
  return unit === "lb" ? "lb" : "kg";
}

export function kgToDisplay(kg, unit = "kg") {
  const n = Number(kg);
  if (!Number.isFinite(n) || n === 0) return 0;
  if (normalizeUnit(unit) === "lb") {
    return Math.round(n * LB_PER_KG * 2) / 2;
  }
  return Math.round(n * 10) / 10;
}

export function displayToKg(val, unit = "kg") {
  const n = Number(val);
  if (!Number.isFinite(n) || n === 0) return 0;
  if (normalizeUnit(unit) === "lb") {
    return Math.round((n / LB_PER_KG) * 100) / 100;
  }
  return Math.round(n * 100) / 100;
}

export function formatWeight(kg, unit = "kg") {
  const u = normalizeUnit(unit);
  return `${kgToDisplay(kg, u)} ${u}`;
}

export function roundGymWeight(kg, equipment) {
  if (equipment === "Barbell" || equipment === "Machine") {
    return Math.max(5, Math.round(kg / 2.5) * 2.5);
  }
  const step = kg >= 12 ? 2 : 1;
  return Math.max(2, Math.round(kg / step) * step);
}
