import { useEffect } from "react";
import { useGameStore } from "../../state/gameStore";

const SPEEDS = [1, 10, 100];

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
        gap: 6,
        fontFamily: "monospace",
      }}
    >
      <button onClick={togglePause} style={btn(paused)}>
        {paused ? "▶" : "⏸"}
      </button>
      {SPEEDS.map((s) => (
        <button key={s} onClick={() => setSpeed(s)} style={btn(speed === s && !paused)}>
          ×{s}
        </button>
      ))}
    </div>
  );
}

const btn = (active: boolean): React.CSSProperties => ({
  background: active ? "#3a5fff" : "#1a1a2e",
  color: "#fff",
  border: "2px solid #3a5fff",
  padding: "6px 12px",
  fontFamily: "monospace",
  fontSize: 14,
  fontWeight: "bold",
  cursor: "pointer",
  imageRendering: "pixelated",
});