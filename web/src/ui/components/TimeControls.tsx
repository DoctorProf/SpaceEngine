import { useEffect } from "react";
import { useGameStore } from "../../state/gameStore";

const SPEEDS: { value: number; label: string }[] = [
  { value: 1, label: "1" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 100, label: "100" },
  { value: 1000, label: "1k" },
  { value: 10000, label: "10k" },
  { value: 50000, label: "50k" },
  { value: 100000, label: "100k" },
  { value: 1000000, label: "1кк" },
  { value: 10000000, label: "10kк" }
];

export function TimeControls() {
  const paused = useGameStore((s) => s.paused);
  const speed = useGameStore((s) => s.speed);
  const togglePause = useGameStore((s) => s.togglePause);
  const setSpeed = useGameStore((s) => s.setSpeed);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        useGameStore.getState().togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        display: "flex",
        gap: 4,
        fontFamily: "monospace",
        flexWrap: "wrap",
      }}
    >
      <button onClick={togglePause} style={btn(paused)}>
        {paused ? "▶" : "⏸"}
      </button>
      <div style={{ width: 8 }} />
      {SPEEDS.map((s) => (
        <button
          key={s.value}
          onClick={() => setSpeed(s.value)}
          style={btn(speed === s.value && !paused)}
        >
          ×{s.label}
        </button>
      ))}
    </div>
  );
}

const btn = (active: boolean): React.CSSProperties => ({
  background: active ? "#3a5fff" : "#1a1a2e",
  color: "#fff",
  border: "2px solid #3a5fff",
  padding: "6px 10px",
  fontFamily: "monospace",
  fontSize: 13,
  fontWeight: "bold",
  cursor: "pointer",
  imageRendering: "pixelated",
  minWidth: 36,
});