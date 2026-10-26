import { create } from "zustand";
import { SIM_SECONDS_PER_REAL_SECOND } from "../game/physics/Scales";

interface GameState {
  paused: boolean;
  speed: number;
  simTime: number;
  zoom: number;
  selectedBody: string | null;

  togglePause: () => void;
  setSpeed: (speed: number) => void;
  tick: (dtRealSec: number) => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  paused: false,
  speed: 1,
  simTime: 0,
  zoom: 1,
  selectedBody: null,

  togglePause: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),

  tick: (dtRealSec) => {
    const { paused, speed, simTime } = get();
    if (paused) return simTime;
    const newTime =
      simTime + dtRealSec * speed * SIM_SECONDS_PER_REAL_SECOND;
    set({ simTime: newTime });
    return newTime;
  },
}));