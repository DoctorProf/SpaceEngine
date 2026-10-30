export interface Orbit {
  a: number;
  e: number;
  omega: number;
  M0: number;
  mu: number;
}

const J2000_JD = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;
const MS_PER_DAY = 86_400_000;

/** Момент старта симуляции (Julian Date). Один на всю сессию. */
export const SIM_EPOCH_JD = Date.now() / MS_PER_DAY + UNIX_EPOCH_JD;

export interface J2000Elements {
  meanLongitudeDeg: number;    // L0
  periLongitudeDeg: number;    // ω̄
  periodDays: number;
}

/** Средняя аномалия (рад) на момент старта — из J2000-элементов. */
export function computeM0FromEphemeris(el: J2000Elements): number {
  const daysSinceJ2000 = SIM_EPOCH_JD - J2000_JD;
  const n = 360 / el.periodDays;                 // град/день
  const L = el.meanLongitudeDeg + n * daysSinceJ2000;
  const M = L - el.periLongitudeDeg;
  const Mnorm = ((M % 360) + 360) % 360;
  return (Mnorm * Math.PI) / 180;
}

export function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

export function meanAnomaly(orbit: Orbit, t: number): number {
  const n = Math.sqrt(orbit.mu / orbit.a ** 3);
  return orbit.M0 + n * t;
}

export function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 12; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

export function positionAt(orbit: Orbit, t: number): { x: number; y: number } {
  const M = meanAnomaly(orbit, t);
  const E = solveKepler(M, orbit.e);
  const xOrb = orbit.a * (Math.cos(E) - orbit.e);
  const yOrb = orbit.a * Math.sqrt(1 - orbit.e ** 2) * Math.sin(E);
  const c = Math.cos(orbit.omega);
  const s = Math.sin(orbit.omega);
  return {
    x: xOrb * c - yOrb * s,
    y: xOrb * s + yOrb * c,
  };
}

export function orbitalPeriod(orbit: Orbit): number {
  return 2 * Math.PI * Math.sqrt(orbit.a ** 3 / orbit.mu);
}

export function periapsis(orbit: Orbit): number {
  return orbit.a * (1 - orbit.e);
}

export function apoapsis(orbit: Orbit): number {
  return orbit.a * (1 + orbit.e);
}

export function speedAt(orbit: Orbit, r: number): number {
  return Math.sqrt(orbit.mu * (2 / r - 1 / orbit.a));
}