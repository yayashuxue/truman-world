import { create } from 'zustand';

type EventType = 'MOVEMENT' | 'INTERACTION' | 'WEATHER' | 'BET' | 'DISCOVERY';

interface GlobalEvent {
  type: EventType;
  timestamp: number;
  description: string;
  location?: string;
  actors?: string[];
  betId?: string;
}

interface GlobalContextStore {
  recentEvents: GlobalEvent[];
  activeBets: string[];
  globalSuspicion: number;
  addEvent: (event: Omit<GlobalEvent, 'timestamp'>) => void;
  cleanup: () => void;
  updateSuspicion: (delta: number) => void;
}

export const useGlobalContext = create<GlobalContextStore>((set) => ({
  recentEvents: [],
  activeBets: [],
  globalSuspicion: 0,

  addEvent: (event) => set((state) => ({
    recentEvents: [...state.recentEvents, { ...event, timestamp: Date.now() }],
  })),

  cleanup: () => set((state) => ({
    recentEvents: state.recentEvents.filter(
      event => Date.now() - event.timestamp <= 5 * 60 * 1000
    ),
  })),

  updateSuspicion: (delta) => set((state) => ({
    globalSuspicion: Math.max(0, Math.min(100, state.globalSuspicion + delta))
  }))
})); 