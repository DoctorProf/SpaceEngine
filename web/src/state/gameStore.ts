import { create } from "zustand";
import { MISSIONS, type Mission } from "../game/data/missions";

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

type Tab = "sim" | "missions";

interface FocusRequest {
  name: string;
  zoom: number;
}

interface GameState {
  paused: boolean;
  speed: number;
  simTime: number;
  zoom: number;
  selectedBody: string | null;
  selectedInfo: BodyInfo | null;
  transferTarget: string | null;
  showSOI: boolean;

  activeTab: Tab;
  missions: Mission[];
  missionsProgress: Record<string, boolean>;

  focusRequest: FocusRequest | null;

  togglePause: () => void;
  setSpeed: (speed: number) => void;
  tick: (dtRealSec: number) => number;
  setTransferTarget: (name: string | null) => void;
  toggleSOI: () => void;
  setActiveTab: (tab: Tab) => void;
  selectBody: (name: string | null) => void;
  focusBody: (name: string) => void;
  requestFocus: (name: string, zoom: number) => void;
  clearFocusRequest: () => void;
}

function markProgress(
  missions: Mission[],
  progress: Record<string, boolean>,
  name: string,
  type: Mission["type"],
): Record<string, boolean> {
  let changed = false;
  const next = { ...progress };
  for (const m of missions) {
    if (m.target === name && m.type === type && !next[m.id]) {
      next[m.id] = true;
      changed = true;
    }
  }
  return changed ? next : progress;
}

export const useGameStore = create<GameState>((set, get) => ({
  paused: false,
  speed: 1,
  simTime: 0,
  zoom: 0.25,
  selectedBody: null,
  selectedInfo: null,
  transferTarget: null,
  showSOI: false,

  activeTab: "sim",
  missions: MISSIONS,
  missionsProgress: {},
  focusRequest: null,

  togglePause: () => set((s) => ({ paused: !s.paused })),
  setSpeed: (speed) => set({ speed }),
  setTransferTarget: (name) => set({ transferTarget: name }),
  toggleSOI: () => set((s) => ({ showSOI: !s.showSOI })),
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectBody: (name) => {
    const { missions, missionsProgress } = get();
    const next = name
      ? markProgress(missions, missionsProgress, name, "visit")
      : missionsProgress;
    set({ selectedBody: name, missionsProgress: next });
  },

  focusBody: (name) => {
    const { missions, missionsProgress } = get();
    const next = markProgress(missions, missionsProgress, name, "focus");
    set({ selectedBody: name, missionsProgress: next });
  },

  requestFocus: (name, zoom) => set({ focusRequest: { name, zoom } }),
  clearFocusRequest: () => set({ focusRequest: null }),

  tick: (dtRealSec) => {
    const { paused, speed, simTime } = get();
    if (paused) return simTime;
    const newTime = simTime + dtRealSec * speed;
    set({ simTime: newTime });
    return newTime;
  },
}));