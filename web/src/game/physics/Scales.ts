export const HELIO_KM_PER_UNIT     = 6.5e6;
export const SATELLITE_KM_PER_UNIT = 8e4;
export const BODY_KM_PER_UNIT      = 2e4;
export const SUN_RADIUS_UNITS      = 5.0;

export function orbitKmPerUnit(parentName: string): number {
  return parentName === "Sun" ? HELIO_KM_PER_UNIT : SATELLITE_KM_PER_UNIT;
}

export function bodyRadiusUnits(radiusKm: number, name: string): number {
  if (name === "Sun") return SUN_RADIUS_UNITS;
  return radiusKm / BODY_KM_PER_UNIT;
}

export const SIM_SECONDS_PER_REAL_SECOND = 1e5;