import type { Ticker } from "pixi.js";
import type { SolarSystem } from "../scene/SolarSystem";
import type { Camera } from "./Camera";
import { useGameStore } from "../../state/gameStore";

export function startGameLoop(
  ticker: Ticker,
  solarSystem: SolarSystem,
  camera: Camera,
) {
  ticker.add((t: Ticker) => {
    const dtReal = t.deltaMS / 1000;
    const newSimTime = useGameStore.getState().tick(dtReal);
    solarSystem.update(newSimTime);

    const name = camera.following;
    if (name) {
      const pos = solarSystem.getBodyWorldPos(name);
      if (pos) camera.tickFollow(pos);
    }
  });
}