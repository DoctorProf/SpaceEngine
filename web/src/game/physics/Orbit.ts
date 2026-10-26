export interface Orbit {
  a: number;      // Р±РѕР»СЊС€Р°СЏ РїРѕР»СѓРѕСЃСЊ
  e: number;      // СЌРєСЃС†РµРЅС‚СЂРёСЃРёС‚РµС‚
  omega: number;  // Р°СЂРіСѓРјРµРЅС‚ РїРµСЂРёС†РµРЅС‚СЂР°
  M0: number;     // СЃСЂРµРґРЅСЏСЏ Р°РЅРѕРјР°Р»РёСЏ РІ t=0
  mu: number;     // РіСЂР°РІРёС‚Р°С†РёРѕРЅРЅС‹Р№ РїР°СЂР°РјРµС‚СЂ (G*M)
}

/** РЎСЂРµРґРЅСЏСЏ Р°РЅРѕРјР°Р»РёСЏ M(t) = M0 + n*t, n = sqrt(mu / a^3) */
export function meanAnomaly(orbit: Orbit, t: number): number {
  const n = Math.sqrt(orbit.mu / orbit.a ** 3);
  return orbit.M0 + n * t;
}

/** РњРµС‚РѕРґ РќСЊСЋС‚РѕРЅР°: M = E - e*sin(E) => РЅР°С…РѕРґРёРј E */
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

/** РџРѕР·РёС†РёСЏ С‚РµР»Р° РЅР° РѕСЂР±РёС‚Рµ РІ РјРѕРјРµРЅС‚ t (РІ РєРѕРѕСЂРґРёРЅР°С‚Р°С… РѕСЂР±РёС‚С‹) */
export function positionAt(orbit: Orbit, t: number): { x: number; y: number } {
  const M = meanAnomaly(orbit, t);
  const E = solveKepler(M, orbit.e);

  // РєРѕРѕСЂРґРёРЅР°С‚С‹ РІ РѕСЂР±РёС‚Р°Р»СЊРЅРѕР№ РїР»РѕСЃРєРѕСЃС‚Рё
  const xOrb = orbit.a * (Math.cos(E) - orbit.e);
  const yOrb = orbit.a * Math.sqrt(1 - orbit.e ** 2) * Math.sin(E);

  // РїРѕРІРѕСЂРѕС‚ РЅР° Р°СЂРіСѓРјРµРЅС‚ РїРµСЂРёС†РµРЅС‚СЂР°
  const c = Math.cos(orbit.omega);
  const s = Math.sin(orbit.omega);
  return {
    x: xOrb * c - yOrb * s,
    y: xOrb * s + yOrb * c,
  };
}