import { useGameStore } from "../../state/gameStore";

export function TopBar() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const missionsProgress = useGameStore((s) => s.missionsProgress);
  const missions = useGameStore((s) => s.missions);

  const doneCount = Object.values(missionsProgress).filter(Boolean).length;
  const totalCount = missions.length;

  return (
    <div style={barStyle}>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={() => setActiveTab("sim")}
          style={tabBtn(activeTab === "sim")}
        >
          Симулятор
        </button>
        <button
          onClick={() => setActiveTab("missions")}
          style={tabBtn(activeTab === "missions")}
        >
          Миссии{" "}
          <span style={{ color: "#00ffcc" }}>
            {doneCount}/{totalCount}
          </span>
        </button>
      </div>
      <div style={{ color: "#556", fontSize: 11, fontFamily: "monospace" }}>
        SpaceEngine · pre-alpha
      </div>
    </div>
  );
}

const barStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 36,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 16px",
  background: "rgba(10, 10, 30, 0.95)",
  borderBottom: "1px solid #2a3a5c",
  fontFamily: "monospace",
  zIndex: 10,
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  background: active ? "#3a5fff" : "transparent",
  color: active ? "#fff" : "#9ab",
  border: "1px solid " + (active ? "#3a5fff" : "#2a3a5c"),
  padding: "5px 12px",
  fontFamily: "monospace",
  fontSize: 12,
  cursor: "pointer",
});