import { SUN_MU } from "../data/bodies";
import { orbitalPeriod, type Orbit } from "./Orbit";

const AU_KM = 1.495978707e8;
const TWO_PI = Math.PI * 2;

export interface HohmannResult {
  /** Стартовый Δv с круговой орбиты r1 (км/с). */
  dv1: number;
  /** Δv для выхода на орбиту цели (км/с). */
  dv2: number;
  /** Суммарный Δv (км/с). */
  dvTotal: number;
  /** Время перелёта (сек). */
  transferTimeSec: number;
  /** Целевой фазовый угол в момент старта (рад, 0..2π). */
  targetPhaseAngle: number;
  /** Текущий фазовый угол (рад). */
  currentPhaseAngle: number;
  /** Секунд до следующего окна (0 = окно сейчас). */
  secondsUntilWindow: number;
  /** Синодический период (сек). */
  synodicPeriod: number;
}

function wrap2pi(a: number): number {
  return ((a % TWO_PI) + TWO_PI) % TWO_PI;
}

/**
 * Hohmann transfer от круговой орбиты r1Km к r2Km вокруг Солнца.
 * t1Sec — текущий момент симуляции, angleFrom/angleTo — текущие углы тел (рад).
 * periodFrom/periodTo — сидерические периоды тел (сек).
 */
export function computeHohmann(
  r1Km: number,
  r2Km: number,
  angleFrom: number,
  angleTo: number,
  periodFromSec: number,
  periodToSec: number,
): HohmannResult {
  const aT = (r1Km + r2Km) / 2;

  const v1 = Math.sqrt(SUN_MU / r1Km);
  const v2 = Math.sqrt(SUN_MU / r2Km);
  const vTp = Math.sqrt(SUN_MU * (2 / r1Km - 1 / aT));
  const vTa = Math.sqrt(SUN_MU * (2 / r2Km - 1 / aT));

  // Для перелёта изнутри наружу: ускоряемся в перигелии, потом ещё в афелии.
  // Для перелёта снаружи внутрь: тормозим в афелии, потом ещё в перигелии.
  const outbound = r2Km > r1Km;
  const dv1 = Math.abs(vTp - v1);
  const dv2 = Math.abs(v2 - vTa);

  const transferTimeSec = Math.PI * Math.sqrt(aT ** 3 / SUN_MU);

  // Фазовый угол: цель должна опережать старт на θ в момент старта.
  // θ = π − (2π / T_to) × t_transfer  (для внешней цели)
  // θ = π − (2π / T_to) × t_transfer  (для внутренней — цель «отстаёт», знак учтён)
  const omegaTo = TWO_PI / periodToSec;
  const targetPhaseRaw = Math.PI - omegaTo * transferTimeSec;
  const targetPhase = wrap2pi(outbound ? targetPhaseRaw : -targetPhaseRaw);

  const currentPhase = wrap2pi(angleTo - angleFrom);

  // Синодический период: T_syn = |1 / (1/T1 − 1/T2)|
  const synodicPeriod = Math.abs(1 / (1 / periodFromSec - 1 / periodToSec));

  // Сколько секунд до следующего окна:
  // фаза меняется со скоростью (ω_to − ω_from). Считаем разницу до targetPhase.
  const omegaRel = TWO_PI / periodToSec - TWO_PI / periodFromSec;
  let delta = wrap2pi(targetPhase - currentPhase);
  if (omegaRel < 0) {
    // относительное движение в обратную сторону — переворачиваем
    delta = wrap2pi(currentPhase - targetPhase);
  }
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

/** Период орбиты в секундах через Кеплер (для тела с известными a, mu). */
export function periodFromOrbit(orbit: Orbit): number {
  return orbitalPeriod(orbit);
}

/** Достать r (км) и текущий угол (рад) из позиции (км). */
export function polarFromXY(xKm: number, yKm: number): { rKm: number; angle: number } {
  const rKm = Math.sqrt(xKm * xKm + yKm * yKm);
  const angle = Math.atan2(yKm, xKm);
  return { rKm, angle: wrap2pi(angle) };
}

/** Форматирование: секунды → «3.5 дней» / «47 лет» / «2.3 часа». */
export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec.toFixed(0)} сек`;
  if (sec < 3600) return `${(sec / 60).toFixed(1)} мин`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} ч`;
  if (sec < 365.25 * 86400) return `${(sec / 86400).toFixed(1)} дней`;
  return `${(sec / (365.25 * 86400)).toFixed(2)} лет`;
}

export { AU_KM };