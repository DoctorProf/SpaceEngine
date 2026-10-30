export const KM_PER_UNIT = 1e6;   // 1 unit = 1 млн км — единый масштаб для всего

export function bodyRadiusUnits(radiusKm: number): number {
  return radiusKm / KM_PER_UNIT;
}

export function orbitKmPerUnit(): number {
  return KM_PER_UNIT;
}

// ─── Сфера влияния ────────────────────────────────────────────

const SUN_MASS_KG = 1.989e30;

export function soiRadiusPlanetKm(aKm: number, planetMassKg: number): number {
  return aKm * Math.pow(planetMassKg / SUN_MASS_KG, 2 / 5);
}

export function soiRadiusMoonKm(
  aKm: number,
  moonMassKg: number,
  planetMassKg: number,
): number {
  return aKm * Math.pow(moonMassKg / planetMassKg, 2 / 5);
}