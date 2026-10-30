import { useGameStore } from "../../state/gameStore";

const YEAR = 365.25 * 86400;
const DAY = 86400;
const HOUR = 3600;
const MINUTE = 60;

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const years = Math.floor(s / YEAR);
  const days = Math.floor((s % YEAR) / DAY);
  const hours = Math.floor((s % DAY) / HOUR);
  const minutes = Math.floor((s % HOUR) / MINUTE);
  const secs = s % MINUTE;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${years}y ${days}d ${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

export function HUD() {
  const simTime = useGameStore((s) => s.simTime);
  const paused = useGameStore((s) => s.paused);
  const speed = useGameStore((s) => s.speed);
  const zoom = useGameStore((s) => s.zoom);
  const selected = useGameStore((s) => s.selectedBody);

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        color: "#9ab",
        fontFamily: "monospace",
        fontSize: 14,
        userSelect: "none",
        pointerEvents: "none",
        lineHeight: 1.5,
      }}
    >
      <div style={{ color: paused ? "#ff6644" : "#5a8fff", fontWeight: "bold" }}>
        {paused ? "PAUSED" : `RUNNING ×${speed}`}
      </div>
      <div>T+ {formatTime(simTime)}</div>
      <div style={{ color: "#556" }}>zoom ×{zoom}</div>
      <div style={{ color: "#00ffcc", marginTop: 4 }}>
        {selected ? `▸ ${selected}` : "▸ нет выбора"}
      </div>
      <div style={{ color: "#445", marginTop: 8, fontSize: 12 }}>
        ЛКМ — выбор · 2×ЛКМ — фокус · ПКМ — панорама
      </div>
      <div style={{ color: "#445", fontSize: 12 }}>
        колесо — зум · R — сброс · F — вся система
      </div>
    </div>
  );
}