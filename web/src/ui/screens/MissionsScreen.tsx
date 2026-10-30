import { useMemo, useState } from "react";
import { useGameStore } from "../../state/gameStore";

type Filter = "all" | "done" | "active";

export function MissionsScreen() {
  const missions = useGameStore((s) => s.missions);
  const progress = useGameStore((s) => s.missionsProgress);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    return missions.filter((m) => {
      if (filter === "done") return progress[m.id];
      if (filter === "active") return !progress[m.id];
      return true;
    });
  }, [missions, progress, filter]);

  const doneCount = Object.values(progress).filter(Boolean).length;

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 28, color: "#00ffcc", fontWeight: "bold" }}>
            Миссии
          </div>
          <div style={{ fontSize: 12, color: "#667", marginTop: 4 }}>
            Выполнено {doneCount} из {missions.length}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "active", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={filterBtn(filter === f)}
            >
              {f === "all" ? "Все" : f === "active" ? "Активные" : "Выполненные"}
            </button>
          ))}
        </div>
      </div>

      <div style={gridStyle}>
        {visible.map((m) => {
          const done = !!progress[m.id];
          return (
            <div key={m.id} style={cardStyle(done)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 15, color: done ? "#00ffcc" : "#9ab", fontWeight: "bold" }}>
                  {m.title}
                </span>
                <span style={{ color: done ? "#00ffcc" : "#445", fontSize: 18 }}>
                  {done ? "✓" : "○"}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#667", lineHeight: 1.5 }}>
                {m.description}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "#445" }}>
                Цель: <span style={{ color: "#9ab" }}>{m.target}</span> ·{" "}
                {m.type === "visit" ? "выбрать" : "приблизиться (двойной клик)"}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div style={{ color: "#556", fontStyle: "italic" }}>
            Нет миссий в этой категории.
          </div>
        )}
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: "absolute",
  top: 36,
  left: 0,
  right: 0,
  bottom: 0,
  background: "#000010",
  padding: "32px 40px",
  overflowY: "auto",
  fontFamily: "monospace",
  color: "#9ab",
  zIndex: 5,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 16,
};

const cardStyle = (done: boolean): React.CSSProperties => ({
  padding: "14px 16px",
  background: done ? "rgba(0, 255, 204, 0.05)" : "rgba(20, 20, 40, 0.7)",
  border: `1px solid ${done ? "#00ffcc" : "#2a3a5c"}`,
  borderRadius: 4,
});

const filterBtn = (active: boolean): React.CSSProperties => ({
  background: active ? "#3a5fff" : "transparent",
  color: active ? "#fff" : "#9ab",
  border: "1px solid " + (active ? "#3a5fff" : "#2a3a5c"),
  padding: "4px 10px",
  fontFamily: "monospace",
  fontSize: 11,
  cursor: "pointer",
});