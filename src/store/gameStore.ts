import { create } from 'zustand';

interface GameState {
  currentSaveId: number | null;
  currentDate: string;
  setSave: (id: number, date: string) => void;
  advanceDate: (days: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentSaveId: null,
  currentDate: new Date('2024-01-01').toISOString(),
  setSave: (id, date) => set({ currentSaveId: id, currentDate: date }),
  advanceDate: (days) => set((state) => {
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() + days);
    return { currentDate: d.toISOString() };
  }),
}));
