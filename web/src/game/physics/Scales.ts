import { SUN_MU } from "../data/bodies";

export const HELIO_KM_PER_UNIT     = 6.5e6;
export const BODY_KM_PER_UNIT      = 2e4;
export const SUN_RADIUS_UNITS      = 5.0;
export const MIN_BODY_RADIUS_UNITS = 0.05;

const SATELLITE_KM_PER_UNIT: Record<string, number> = {
  Earth:   8e4,
  Mars:    4e3,
  Jupiter: 1e5,
};
const DEFAULT_SATELLITE_KM_PER_UNIT = 8e4;

export function orbitKmPerUnit(parentName: string): number {
  if (parentName === "Sun") return HELIO_KM_PER_UNIT;
  return SATELLITE_KM_PER_UNIT[parentName] ?? DEFAULT_SATELLITE_KM_PER_UNIT;
}

export function bodyRadiusUnits(radiusKm: number, name: string): number {
  if (name === "Sun") return SUN_RADIUS_UNITS;
  return Math.max(radiusKm / BODY_KM_PER_UNIT, MIN_BODY_RADIUS_UNITS);
}

// ─── Сфера влияния (SOI) ───────────────────────────────────────
// r_SOI = a × (m_planet / M_sun)^(2/5)
// Для Луны — относительно Земли: a_lunar × (m_moon / m_earth)^(2/5).
const G_CONST = 6.6743e-20; // км³/(кг·с²)

export function soiRadiusKm(
  parentMassKg: number,
  parentMu: number,
  aKm: number,
  childMassKg: number,
): number {
  if (parentMassKg <= 0 || childMassKg <= 0) return 0;
  const ratio = childMassKg / parentMassKg;
  return aKm * Math.pow(ratio, 2 / 5);
}

// Для планет — родитель Солнце:
const SUN_MASS_KG = 1.989e30;
export function soiRadiusPlanetKm(aKm: number, planetMassKg: number): number {
  return aKm * Math.pow(planetMassKg / SUN_MASS_KG, 2 / 5);
}

// Для спутников — родитель планета:
export function soiRadiusMoonKm(
  aKm: number,
  moonMassKg: number,
  planetMassKg: number,
): number {
  return aKm * Math.pow(moonMassKg / planetMassKg, 2 / 5);
}

export { G_CONST };