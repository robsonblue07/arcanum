import { create } from 'zustand';

interface CheckoutUiState {
  confirming: boolean;
  beginConfirming: () => void;
  endConfirming: () => void;
}

export const useCheckoutStore = create<CheckoutUiState>((set) => ({
  confirming: false,
  beginConfirming: () => set({ confirming: true }),
  endConfirming: () => set({ confirming: false }),
}));
