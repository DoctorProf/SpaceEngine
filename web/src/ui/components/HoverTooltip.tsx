import { useGameStore } from "../../state/gameStore";

function fmtRadius(km: number): string {
  if (km < 1000) return `${km.toFixed(1)} км`;
  if (km < 1e6) return `${Math.round(km).toLocaleString("ru-RU")} км`;
  return `${(km / 1000).toFixed(0)} тыс км`;
}

function fmtDistance(km: number | undefined): string | null {
  if (km === undefined) return null;
  if (km < 1000) return `${km.toFixed(0)} км`;
  if (km < 1e6) return `${(km / 1000).toFixed(1)} тыс км`;
  if (km < 1e7) return `${(km / 1e6).toFixed(2)} млн км`;
  const au = km / 1.495978707e8;
  if (au < 0.01) return `${(km / 1e6).toFixed(0)} млн км`;
  if (au < 10) return `${au.toFixed(3)} AU`;
  return `${au.toFixed(1)} AU`;
}

export function HoverTooltip() {
  const hovered = useGameStore((s) => s.hovered);
  const selectedBody = useGameStore((s) => s.selectedBody);

  if (!hovered) return null;
  if (hovered.name === selectedBody) return null;

  const offset = 14;
  const maxRight = window.innerWidth - 220 - 8;
  const maxBottom = window.innerHeight - 110 - 8;
  const left = Math.min(hovered.screenX + offset, maxRight);
  const top = Math.min(hovered.screenY + offset, maxBottom);

  const distanceStr = fmtDistance(hovered.distanceKm);
  const showParent = hovered.parentName !== null && distanceStr !== null;
  
  const distToSelectedStr = fmtDistance(hovered.distToSelectedKm);

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        padding: "6px 10px",
        background: "rgba(10, 10, 30, 0.92)",
        border: "1px solid #2a3a5c",
        borderRadius: 3,
        color: "#9ab",
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: 1.5,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 100,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#" + (hovered.color ?? 0xffffff).toString(16).padStart(6, "0"),
          }}
        />
        <span style={{ color: "#00ffcc", fontWeight: "bold", fontSize: 12 }}>
          {hovered.name}
        </span>
      </div>
      <div style={{ color: "#667" }}>
        R {fmtRadius(hovered.radiusKm)}
      </div>
      {showParent && (
        <div style={{ color: "#667" }}>
          от {hovered.parentName} · {distanceStr}
        </div>
      )}
      
      {/* --- НОВОЕ ПОЛЕ --- */}
      {distToSelectedStr && selectedBody && (
        <div style={{ color: "#ffaa33", marginTop: 2 }}>
          до {selectedBody} · {distToSelectedStr}
        </div>
      )}

    </div>
  );
}