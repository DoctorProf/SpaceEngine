import { create } from "zustand";

export interface BodyInfo {
  name: string;
  radiusKm: number;
  massKg: number;
  parentName: string | null;
  aKm?: number;
  e?: number;
  periapsisKm?: number;
  apoapsisKm?: number;
  periodSeconds?: number;
  currentDistanceKm?: number;
  currentSpeedKmS?: number;
  soiRadiusKm?: number;
}

interface GameState {
  paused: boolean;
  speed: number;
  simTime: number;
  zoom: number;
  selectedBody: string | null;
  selectedInfo: BodyInfo | null;
  /** Имя цели для preview Hohmann-перелёта (null = не показывать). */
  transferTarget: string | null;
  /** Показывать SOI-круги планет. */
  showSOI: boolean;

  togglePause: () => void;
  setSpeed: (speed: number) => void;
  tick: (dtRealSec: number) => number;
  setTransferTarget: (name: string | null) => void;
  toggleSOI: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  paused: false,
  speed: 1,
  simTime: 0,
  zoom: 1,
  selectedBody: null,
  selectedInfo: null,
  transferTarget: null,
  showSOI: false,

  togglePause: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),
  setTransferTarget: (name) => set({ transferTarget: name }),
  toggleSOI: () => set((s) => ({ showSOI: !s.showSOI })),

  tick: (dtRealSec) => {
    const { paused, speed, simTime } = get();
    if (paused) return simTime;
    const newTime = simTime + dtRealSec * speed;
    set({ simTime: newTime });
    return newTime;
  },
}));