import { useMemo } from "react";
import { useGameStore } from "../../state/gameStore";
import {
  computeHohmann,
  formatDuration,
  AU_KM,
} from "../../game/physics/Transfer";
import { SOLAR_SYSTEM } from "../../game/data/bodies";

const RAD2DEG = 180 / Math.PI;

interface TargetRow {
  name: string;
  dv1: number;
  dv2: number;
  dvTotal: number;
  transferTimeSec: number;
  currentPhaseDeg: number;
  targetPhaseDeg: number;
  secondsUntilWindow: number;
}

function computeAllTargets(): TargetRow[] {
  const earth = SOLAR_SYSTEM.children?.find((c) => c.name === "Earth");
  if (!earth?.orbit) return [];

  const r1 = earth.orbit.aKm;
  const T1 = earth.orbit.periodDays! * 86400;

  const rows: TargetRow[] = [];
  for (const p of SOLAR_SYSTEM.children ?? []) {
    if (!p.orbit || p.name === "Earth" || p.name === "Sun") continue;
    const r2 = p.orbit.aKm;
    const T2 = p.orbit.periodDays! * 86400;

    // Текущие углы нам неизвестны без simTime — приблизим M0, но
    // для таблицы достаточно «фазовый угол сейчас» через эфемериды:
    // в нашем случае — считаем фазу на момент 0, что совпадает с реальным «сейчас».
    const angleFrom = 0;
    const angleTo = 0;

    const res = computeHohmann(r1, r2, angleFrom, angleTo, T1, T2);
    rows.push({
      name: p.name,
      dv1: res.dv1,
      dv2: res.dv2,
      dvTotal: res.dvTotal,
      transferTimeSec: res.transferTimeSec,
      currentPhaseDeg: res.currentPhaseAngle * RAD2DEG,
      targetPhaseDeg: res.targetPhaseAngle * RAD2DEG,
      secondsUntilWindow: res.secondsUntilWindow,
    });
  }
  return rows;
}

export function TransferPanel() {
  const transferTarget = useGameStore((s) => s.transferTarget);
  const setTransferTarget = useGameStore((s) => s.setTransferTarget);
  const showSOI = useGameStore((s) => s.showSOI);
  const toggleSOI = useGameStore((s) => s.toggleSOI);

  const rows = useMemo(() => computeAllTargets(), []);

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "#00ffcc", fontWeight: "bold" }}>Перелёты с Земли</span>
        <button onClick={toggleSOI} style={toggleBtn(showSOI)}>
          SOI {showSOI ? "on" : "off"}
        </button>
      </div>

      <div style={{ fontSize: 11, color: "#667", marginBottom: 6 }}>
        Δv — с низкой орбиты Земли (Hohmann). Клик — preview.
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ color: "#667" }}>
            <th style={th}>Цель</th>
            <th style={thR}>Δv, км/с</th>
            <th style={thR}>Время</th>
            <th style={thR}>Окно</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              onClick={() =>
                setTransferTarget(transferTarget === r.name ? null : r.name)
              }
              style={{
                cursor: "pointer",
                background: transferTarget === r.name ? "rgba(255,170,51,0.15)" : "transparent",
                color: transferTarget === r.name ? "#ffaa33" : "#9ab",
              }}
            >
              <td style={td}>{r.name}</td>
              <td style={tdR}>{r.dvTotal.toFixed(2)}</td>
              <td style={tdR}>{formatDuration(r.transferTimeSec)}</td>
              <td style={tdR}>{formatDuration(r.secondsUntilWindow)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 8, fontSize: 11, color: "#556" }}>
        Пример: {rows[0]?.name} — {rows[0]?.dvTotal.toFixed(2)} км/с
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: "absolute",
  right: 16,
  bottom: 16,
  width: 320,
  padding: "12px 14px",
  background: "rgba(10, 10, 30, 0.85)",
  border: "1px solid #2a3a5c",
  color: "#9ab",
  fontFamily: "monospace",
  fontSize: 12,
  userSelect: "none",
};

const th: React.CSSProperties = {
  textAlign: "left", fontWeight: "normal", paddingBottom: 4,
  borderBottom: "1px solid #2a3a5c",
};
const thR: React.CSSProperties = { ...th, textAlign: "right" };
const td: React.CSSProperties = { padding: "2px 0" };
const tdR: React.CSSProperties = { ...td, textAlign: "right" };

const toggleBtn = (active: boolean): React.CSSProperties => ({
  background: active ? "#3a5fff" : "#1a1a2e",
  color: "#fff",
  border: "1px solid #3a5fff",
  padding: "2px 6px",
  fontFamily: "monospace",
  fontSize: 11,
  cursor: "pointer",
});