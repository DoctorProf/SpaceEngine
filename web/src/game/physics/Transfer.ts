import { SUN_MU, SOLAR_SYSTEM, type BodyData } from "../data/bodies";
import { orbitalPeriod, positionAt, type Orbit } from "./Orbit";

const AU_KM = 1.495978707e8;
const TWO_PI = Math.PI * 2;

export interface HohmannResult {
  dv1: number;
  dv2: number;
  dvTotal: number;
  transferTimeSec: number;
  targetPhaseAngle: number;
  currentPhaseAngle: number;
  secondsUntilWindow: number;
  synodicPeriod: number;
}

function wrap2pi(a: number): number {
  return ((a % TWO_PI) + TWO_PI) % TWO_PI;
}

export function computeHohmann(
  r1Km: number,
  r2Km: number,
  currentPhaseRad: number,
  periodFromSec: number,
  periodToSec: number,
): HohmannResult {
  const aT = (r1Km + r2Km) / 2;
  const v1 = Math.sqrt(SUN_MU / r1Km);
  const v2 = Math.sqrt(SUN_MU / r2Km);
  const vTp = Math.sqrt(SUN_MU * (2 / r1Km - 1 / aT));
  const vTa = Math.sqrt(SUN_MU * (2 / r2Km - 1 / aT));

  const dv1 = Math.abs(vTp - v1);
  const dv2 = Math.abs(v2 - vTa);
  const transferTimeSec = Math.PI * Math.sqrt(aT ** 3 / SUN_MU);

  const omegaTo = TWO_PI / periodToSec;
  const targetPhase = wrap2pi(Math.PI - omegaTo * transferTimeSec);
  const currentPhase = wrap2pi(currentPhaseRad);

  const synodicPeriod = Math.abs(1 / (1 / periodFromSec - 1 / periodToSec));
  const omegaRel = omegaTo - TWO_PI / periodFromSec;
  let delta = wrap2pi(targetPhase - currentPhase);
  if (omegaRel < 0) delta = wrap2pi(currentPhase - targetPhase);

  const secondsUntilWindow =
    delta < 1e-4 ? 0 : Math.abs(delta / Math.abs(omegaRel));

  return {
    dv1, dv2,
    dvTotal: dv1 + dv2,
    transferTimeSec,
    targetPhaseAngle: targetPhase,
    currentPhaseAngle: currentPhase,
    secondsUntilWindow,
    synodicPeriod,
  };
}

export function periodFromOrbit(orbit: Orbit): number {
  return orbitalPeriod(orbit);
}

export function polarFromXY(xKm: number, yKm: number): { rKm: number; angle: number } {
  const rKm = Math.sqrt(xKm * xKm + yKm * yKm);
  return { rKm, angle: wrap2pi(Math.atan2(yKm, xKm)) };
}

export function currentPhaseRad(
  fromA: number, fromE: number, fromM0: number, fromOmega: number,
  targetA: number, targetE: number, targetM0: number, targetOmega: number,
  simTime: number,
): number {
  const pF = positionAt(
    { a: fromA, e: fromE, M0: fromM0, omega: fromOmega, mu: SUN_MU }, simTime);
  const pT = positionAt(
    { a: targetA, e: targetE, M0: targetM0, omega: targetOmega, mu: SUN_MU }, simTime);
  return wrap2pi(Math.atan2(pT.y, pT.x) - Math.atan2(pF.y, pF.x));
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec.toFixed(0)} сек`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)} мин`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} ч`;
  if (sec < 365.25 * 86400) return `${(sec / 86400).toFixed(1)} дней`;
  return `${(sec / (365.25 * 86400)).toFixed(2)} лет`;
}

// ─── Поиск тела и стартовой планеты ───────────────────────────

export function findBodyByName(
  name: string,
): { body: BodyData; parentName: string | null } | null {
  function search(
    node: BodyData,
    parentName: string | null,
  ): { body: BodyData; parentName: string | null } | null {
    if (node.name === name) return { body: node, parentName };
    for (const c of node.children ?? []) {
      const r = search(c, node.name);
      if (r) return r;
    }
    return null;
  }
  return search(SOLAR_SYSTEM, null);
}

/**
 * Из выбранного тела определить, с какой планеты стартовать.
 * Планета → она сама. Луна → Земля. Ио → Юпитер. Ничего не выбрано → Земля.
 */
export function getOriginPlanetName(selected: string | null): string {
  if (!selected) return "Earth";
  const found = findBodyByName(selected);
  if (!found) return "Earth";
  if (found.parentName === "Sun") return selected;
  if (found.parentName) {
    const parent = findBodyByName(found.parentName);
    if (parent?.parentName === "Sun") return found.parentName;
  }
  return "Earth";
}

export { AU_KM };