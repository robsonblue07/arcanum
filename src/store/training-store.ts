import { create } from 'zustand';

interface TrainingState {
  signature: string | null;
  startTraining: (signature: string) => void;
  clearTraining: () => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  signature: null,
  startTraining: (signature) => set({ signature }),
  clearTraining: () => set({ signature: null }),
}));
