import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

export type BootStatus = 'loading' | 'ready' | 'error';

interface AuthState {
  session: Session | null;
  bootStatus: BootStatus;
  bootError: string | undefined;
  bootGeneration: number;
  profileLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfileLoading: (value: boolean) => void;
  markReady: () => void;
  markError: (message: string) => void;
  retryBoot: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  bootStatus: 'loading',
  bootError: undefined,
  bootGeneration: 0,
  profileLoading: false,
  setSession: (session) => set({ session }),
  setProfileLoading: (value) => set({ profileLoading: value }),
  markReady: () => set({ bootStatus: 'ready', bootError: undefined }),
  markError: (message) => set({ bootStatus: 'error', bootError: message }),
  retryBoot: () =>
    set((state) => ({
      bootStatus: 'loading',
      bootError: undefined,
      bootGeneration: state.bootGeneration + 1,
    })),
}));
