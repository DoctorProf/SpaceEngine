import { useGameStore } from "../../state/gameStore";
import { SOLAR_SYSTEM, type BodyData } from "../../game/data/bodies";
import { focusZoomFor, findBodyByName } from "../../game/focus";

interface Item {
  name: string;
  depth: number;
  color: number;
}

function flattenBodies(): Item[] {
  const items: Item[] = [];
  function walk(node: BodyData, depth: number) {
    items.push({ name: node.name, depth, color: node.color });
    for (const c of node.children ?? []) {
      walk(c, depth + 1);
    }
  }
  walk(SOLAR_SYSTEM, 0);
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
  top: 210,
  bottom: 80,
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