import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "../../state/gameStore";
import {
  computeHohmann,
  currentPhaseRad,
  formatDuration,
  getOriginPlanetName,
} from "../../game/physics/Transfer";
import { SOLAR_SYSTEM } from "../../game/data/bodies";
import { computeM0FromEphemeris, deg2rad } from "../../game/physics/Orbit";

const RAD2DEG = 180 / Math.PI;
const REFRESH_MS = 500;

interface TargetRow {
  name: string;
  dvTotal: number;
  transferTimeSec: number;
  secondsUntilWindow: number;
}

function computeAllTargets(originName: string, simTime: number): TargetRow[] {
  const origin = SOLAR_SYSTEM.children?.find((c) => c.name === originName);
  if (!origin?.orbit || origin.orbit.meanLongitudeDeg === undefined) return [];

  const r1 = origin.orbit.aKm;
  const T1 = origin.orbit.periodDays! * 86400;
  const oM0 = computeM0FromEphemeris({
    meanLongitudeDeg: origin.orbit.meanLongitudeDeg,
    periLongitudeDeg: origin.orbit.periLongitudeDeg!,
    periodDays: origin.orbit.periodDays!,
  });
  const oOmega = deg2rad(origin.orbit.periLongitudeDeg!);

  const rows: TargetRow[] = [];
  for (const p of SOLAR_SYSTEM.children ?? []) {
    if (!p.orbit || p.name === originName || p.name === "Sun") continue;
    if (p.orbit.meanLongitudeDeg === undefined) continue;

    const r2 = p.orbit.aKm;
    const T2 = p.orbit.periodDays! * 86400;
    const pM0 = computeM0FromEphemeris({
      meanLongitudeDeg: p.orbit.meanLongitudeDeg,
      periLongitudeDeg: p.orbit.periLongitudeDeg!,
      periodDays: p.orbit.periodDays!,
    });
    const pOmega = deg2rad(p.orbit.periLongitudeDeg!);

    const phase = currentPhaseRad(
      r1, origin.orbit.e, oM0, oOmega,
      r2, p.orbit.e, pM0, pOmega,
      simTime,
    );
    const res = computeHohmann(r1, r2, phase, T1, T2);

    rows.push({
      name: p.name,
      dvTotal: res.dvTotal,
      transferTimeSec: res.transferTimeSec,
      secondsUntilWindow: res.secondsUntilWindow,
    });
  }
  return rows;
}

export function TransferPanel() {
  const selectedBody = useGameStore((s) => s.selectedBody);
  const transferTarget = useGameStore((s) => s.transferTarget);
  const setTransferTarget = useGameStore((s) => s.setTransferTarget);
  const showSOI = useGameStore((s) => s.showSOI);
  const toggleSOI = useGameStore((s) => s.toggleSOI);

  const originName = getOriginPlanetName(selectedBody);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(
    () => computeAllTargets(originName, useGameStore.getState().simTime),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [originName, useGameStore.getState().simTime],
  );

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "#00ffcc", fontWeight: "bold" }}>
          Перелёты с {originName}
        </span>
        <button onClick={toggleSOI} style={toggleBtn(showSOI)}>
          SOI {showSOI ? "on" : "off"}
        </button>
      </div>

      <div style={{ fontSize: 11, color: "#667", marginBottom: 6 }}>
        Δv — Hohmann. Старт с планеты, выбранной/родительской.
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
              onClick={() => setTransferTarget(transferTarget === r.name ? null : r.name)}
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
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: "absolute", right: 16, bottom: 16, width: 340,
  padding: "12px 14px",
  background: "rgba(10, 10, 30, 0.85)",
  border: "1px solid #2a3a5c",
  color: "#9ab", fontFamily: "monospace", fontSize: 12, userSelect: "none",
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
  color: "#fff", border: "1px solid #3a5fff",
  padding: "2px 6px", fontFamily: "monospace",
  fontSize: 11, cursor: "pointer",
});