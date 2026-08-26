import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  fullName: string;
  birthDate: string;
}

interface ProfileState {
  profile: UserProfile | null;
  hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      hasHydrated: false,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'arcanum-profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => () => {
        useProfileStore.setState({ hasHydrated: true });
      },
    },
  ),
);
