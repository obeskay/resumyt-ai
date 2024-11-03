import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentStep: number;
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  progress: 0,
  currentStep: 0,
  setLoading: (loading) => set({ isLoading: loading }),
  setProgress: (progress) => set({ progress }),
  setCurrentStep: (step) => set({ currentStep: step }),
  reset: () => set({ isLoading: false, progress: 0, currentStep: 0 }),
}));
