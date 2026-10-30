import { useGameStore } from "../../state/gameStore";
import { SOLAR_SYSTEM, type BodyData } from "../../game/data/bodies";
import { KM_PER_UNIT } from "../../game/physics/Scales";
import { VIRTUAL_HEIGHT } from "../../game/render/PixelApp";

const ZOOM_LEVELS = [
  1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2,
  1, 2, 4, 8, 16, 32, 64, 128,
  256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
];

function nearestZoom(rawZoom: number): number {
  let best = ZOOM_LEVELS[0];
  let bestDelta = Infinity;
  for (const z of ZOOM_LEVELS) {
    const d = Math.abs(Math.log(z) - Math.log(rawZoom));
    if (d < bestDelta) { bestDelta = d; best = z; }
  }
  return best;
}

/**
 * Зум для фокуса на тело:
 * - для планет с лунами — чтобы орбита дальней луны влезла (видна система)
 * - для планет без лун и спутников — чтобы диск занимал ~25% высоты экрана
 */
function focusZoomFor(name: string): number {
  const body = findBody(name);
  if (!body) return 16;

  const hasChildren = (body.children?.length ?? 0) > 0;
  if (hasChildren) {
    // диаметр системы = 2 × максимальная орбита среди детей
    let maxA = 0;
    for (const c of body.children!) {
      if (c.orbit && c.orbit.aKm > maxA) maxA = c.orbit.aKm;
    }
    if (maxA > 0) {
      const systemRadiusUnits = (maxA * 1.3) / KM_PER_UNIT;
      const desiredPx = (VIRTUAL_HEIGHT * 0.45) / 2;  // половина высоты 45%
      return nearestZoom(desiredPx / systemRadiusUnits);
    }
  }

  const radiusUnits = body.radiusKm / KM_PER_UNIT;
  const desiredPx = (VIRTUAL_HEIGHT * 0.25) / 2;
  return nearestZoom(desiredPx / radiusUnits);
}

function findBody(name: string): BodyData | null {
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

interface Item {
  name: string;
  depth: number;
  color: number;
}

function flattenBodies(): Item[] {
  const items: Item[] = [];
  function walk(node: BodyData, depth: number, skipRoot = false) {
    if (!skipRoot) items.push({ name: node.name, depth, color: node.color });
    for (const c of node.children ?? []) {
      walk(c, depth + (skipRoot ? 0 : 1));
    }
  }
  walk(SOLAR_SYSTEM, 0, true);
  return items;
}

const ITEMS = flattenBodies();

export function PlanetList() {
  const requestFocus = useGameStore((s) => s.requestFocus);
  const selected = useGameStore((s) => s.selectedBody);

  const handleClick = (name: string) => {
    requestFocus(name, focusZoomFor(name));
  };

  return (
    <div style={panelStyle}>
      <div style={{ color: "#00ffcc", fontWeight: "bold", fontSize: 12, marginBottom: 6 }}>
        Фокус
      </div>
      {ITEMS.map((item) => (
        <button
          key={item.name}
          onClick={() => handleClick(item.name)}
          style={{
            ...itemStyle,
            paddingLeft: 8 + item.depth * 12,
            background: selected === item.name ? "rgba(0,255,204,0.15)" : "transparent",
            color: selected === item.name ? "#00ffcc" : "#9ab",
          }}
          onMouseEnter={(e) => {
            if (selected !== item.name) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(58,95,255,0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== item.name) {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#" + item.color.toString(16).padStart(6, "0"),
              marginRight: 8,
            }}
          />
          {item.name}
        </button>
      ))}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: 210,                    // ← было 52, теперь ниже HUD
  bottom: 80,                  // ← вместо maxHeight — до TimeControls
  left: 16,
  width: 160,
  overflowY: "auto",
  padding: "10px 8px",
  background: "rgba(10, 10, 30, 0.85)",
  border: "1px solid #2a3a5c",
  fontFamily: "monospace",
  fontSize: 12,
  userSelect: "none",
};

const itemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "3px 8px",
  background: "transparent",
  border: "none",
  color: "#9ab",
  fontFamily: "monospace",
  fontSize: 12,
  cursor: "pointer",
};