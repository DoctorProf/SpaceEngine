import { GameCanvas } from "./GameCanvas";
import { HUD } from "./ui/components/HUD";
import { TimeControls } from "./ui/components/TimeControls";
import { InfoPanel } from "./ui/components/InfoPanel";
import { TransferPanel } from "./ui/components/TransferPanel";

export default function App() {
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
      <HUD />
      <InfoPanel />
      <TransferPanel />
      <TimeControls />
    </div>
  );
}