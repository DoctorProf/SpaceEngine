import { SOLAR_SYSTEM, type BodyData } from "./data/bodies";
import { KM_PER_UNIT } from "./physics/Scales";
import { VIRTUAL_HEIGHT } from "./render/PixelApp";

export const ZOOM_LEVELS = [
  1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2,
  1, 2, 4, 8, 16, 32, 64, 128,
  256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
  65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608,
];

export function nearestZoom(rawZoom: number): number {
  let best = ZOOM_LEVELS[0];
  let bestDelta = Infinity;
  for (const z of ZOOM_LEVELS) {
    const d = Math.abs(Math.log(z) - Math.log(rawZoom));
    if (d < bestDelta) {
      bestDelta = d;
      best = z;
    }
  }
  return best;
}

export function findBodyByName(name: string): BodyData | null {
  function search(node: BodyData): BodyData | null {
    if (node.name === name) return node;
    for (const c of node.children ?? []) {
      const r = search(c);
      if (r) return r;
    }
    return null;
  }
  return search(SOLAR_SYSTEM);
}

/**
 * Подобрать зум для фокуса на тело:
 * - если у тела есть луны и это планета — показать всю систему (луны в кадре)
 * - если это Солнце — показать диск (не всю систему: система огромная)
 * - иначе — показать диск тела (25% высоты экрана)
 */
export function focusZoomFor(name: string): number {
  const body = findBodyByName(name);
  if (!body) return 16;

  const hasChildren = (body.children?.length ?? 0) > 0;
  if (hasChildren) {
    let maxA = 0;
    for (const c of body.children!) {
      if (c.orbit && c.orbit.aKm > maxA) maxA = c.orbit.aKm;
    }
    if (maxA > 0) {
      const ratio = maxA / body.radiusKm;
      if (ratio > 100) {
        // Солнце: фокус на диске
        const radiusUnits = body.radiusKm / KM_PER_UNIT;
        const desiredPx = (VIRTUAL_HEIGHT * 0.25) / 2;
        return nearestZoom(desiredPx / radiusUnits);
      }
      // Планеты с лунами: показать систему
      const systemRadiusUnits = (maxA * 1.3) / KM_PER_UNIT;
      const desiredPx = (VIRTUAL_HEIGHT * 0.45) / 2;
      return nearestZoom(desiredPx / systemRadiusUnits);
    }
  }

  // Диск тела
  const radiusUnits = body.radiusKm / KM_PER_UNIT;
  const desiredPx = (VIRTUAL_HEIGHT * 0.25) / 2;
  return nearestZoom(desiredPx / radiusUnits);
}
export function findBodyWithParent(
    name: string,
  ): 
  { body: BodyData; parentName: string | null } | null {
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