import { GameCanvas } from "./GameCanvas";
import { HUD } from "./ui/components/HUD";
import { TimeControls } from "./ui/components/TimeControls";
import { InfoPanel } from "./ui/components/InfoPanel";
import { TransferPanel } from "./ui/components/TransferPanel";
import { TopBar } from "./ui/components/TopBar";
import { PlanetList } from "./ui/components/PlanetList";
import { MissionsScreen } from "./ui/screens/MissionsScreen";
import { useGameStore } from "./state/gameStore";

export default function App() {
  const activeTab = useGameStore((s) => s.activeTab);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <GameCanvas />
      <TopBar />
      {activeTab === "sim" && (
        <>
          <HUD />
          <PlanetList />
          <InfoPanel />
          <TransferPanel />
          <TimeControls />
        </>
      )}
      {activeTab === "missions" && <MissionsScreen />}
    </div>
  );
}