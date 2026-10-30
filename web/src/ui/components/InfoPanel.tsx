import { useGameStore } from "../../state/gameStore";

const AU_KM = 1.495978707e8;

function fmtNum(n: number, digits = 2): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(digits)}×10⁹`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(digits)}×10⁶`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(digits)}×10³`;
  return n.toFixed(digits);
}

function fmtMass(kg: number): string {
  if (kg >= 1e30) return `${(kg / 1e30).toFixed(3)}×10³⁰ кг`;
  if (kg >= 1e27) return `${(kg / 1e27).toFixed(3)}×10²⁷ кг`;
  if (kg >= 1e24) return `${(kg / 1e24).toFixed(3)}×10²⁴ кг`;
  if (kg >= 1e23) return `${(kg / 1e23).toFixed(3)}×10²³ кг`;
  return `${kg.toFixed(0)} кг`;
}

function fmtDistance(km: number): string {
  const au = km / AU_KM;
  if (au >= 0.01) return `${au.toFixed(3)} AU`;
  return `${fmtNum(km)} км`;
}

function fmtPeriod(sec: number): string {
  const days = sec / 86400;
  const years = days / 365.25;
  if (years >= 1) return `${years.toFixed(2)} лет`;
  return `${days.toFixed(2)} дней`;
}

export function InfoPanel() {
  const info = useGameStore((s) => s.selectedInfo);
  const setTransferTarget = useGameStore((s) => s.setTransferTarget);
  const transferTarget = useGameStore((s) => s.transferTarget);

  if (!info) {
    return (
      <div style={panelStyle}>
        <div style={{ color: "#556", fontSize: 12 }}>
          Кликните на планету или дважды — чтобы приблизиться
        </div>
      </div>
    );
  }

  const canTransfer =
    info.parentName === "Sun" && info.name !== "Earth";

  return (
    <div style={panelStyle}>
      <div style={{ color: "#00ffcc", fontWeight: "bold", marginBottom: 8, fontSize: 15 }}>
        {info.name}
      </div>

      <Row label="Радиус" value={`${fmtNum(info.radiusKm)} км`} />
      <Row label="Масса" value={fmtMass(info.massKg)} />
      {info.parentName && <Row label="Родитель" value={info.parentName} />}
      {info.soiRadiusKm && <Row label="SOI" value={fmtDistance(info.soiRadiusKm)} />}

      {info.aKm !== undefined && (
        <>
          <div style={divider} />
          <Row label="Большая полуось" value={fmtDistance(info.aKm)} />
          <Row label="Эксцентриситет" value={info.e!.toFixed(4)} />
          <Row label="Перигелий" value={fmtDistance(info.periapsisKm!)} />
          <Row label="Афелий" value={fmtDistance(info.apoapsisKm!)} />
          <Row label="Период" value={fmtPeriod(info.periodSeconds!)} />
          <div style={divider} />
          <Row label="Сейчас до родителя" value={fmtDistance(info.currentDistanceKm!)} />
          <Row label="Скорость" value={`${info.currentSpeedKmS!.toFixed(3)} км/с`} highlight />
        </>
      )}

      {canTransfer && (
        <button
          onClick={() =>
            setTransferTarget(transferTarget === info.name ? null : info.name)
          }
          style={{
            marginTop: 10,
            width: "100%",
            padding: "6px",
            background: transferTarget === info.name ? "#ffaa33" : "#1a1a2e",
            color: transferTarget === info.name ? "#000" : "#ffaa33",
            border: "1px solid #ffaa33",
            fontFamily: "monospace",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {transferTarget === info.name ? "Скрыть траекторию" : "Перелёт с Земли"}
        </button>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#667" }}>{label}</span>
      <span style={{ color: highlight ? "#ffcc33" : "#9ab" }}>{value}</span>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: 52,                     // ← было 16, теперь под TopBar (36 + 16)
  right: 16,
  width: 340,
  padding: "12px 16px",
  background: "rgba(10, 10, 30, 0.85)",
  border: "1px solid #2a3a5c",
  color: "#9ab",
  fontFamily: "monospace",
  fontSize: 13,
  lineHeight: 1.6,
  userSelect: "none",
  pointerEvents: "auto",
};

const divider: React.CSSProperties = {
  height: 1,
  background: "#2a3a5c",
  margin: "8px 0",
};