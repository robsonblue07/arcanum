import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured } from '../services/supabase';

export interface UserProfile {
  fullName: string;
  birthDate: string;
  isPremium: boolean;
}

interface ProfileState {
  profile: UserProfile | null;
  hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

const PROFILE_STORAGE_KEY = 'arcanum-profile';
const cloudMode = isSupabaseConfigured();

const createProfileState: StateCreator<ProfileState> = (set) => ({
  profile: null,
  hasHydrated: cloudMode,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
});

export const useProfileStore = cloudMode
  ? create<ProfileState>()(createProfileState)
  : create<ProfileState>()(
      persist(createProfileState, {
        name: PROFILE_STORAGE_KEY,
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ profile: state.profile }),
        onRehydrateStorage: () => () => {
          useProfileStore.setState({ hasHydrated: true });
        },
      }),
    );

export async function wipeLocalProfileCache(): Promise<void> {
  useProfileStore.getState().clearProfile();
  await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
}
