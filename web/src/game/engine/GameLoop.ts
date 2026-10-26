import type { Ticker } from "pixi.js";
import type { SolarSystem } from "../scene/SolarSystem";
import { useGameStore } from "../../state/gameStore";

export function startGameLoop(ticker: Ticker, solarSystem: SolarSystem) {
  ticker.add((t: Ticker) => {
    const dtReal = t.deltaMS / 1000;
    const newSimTime = useGameStore.getState().tick(dtReal);
    solarSystem.update(newSimTime);
  });
}