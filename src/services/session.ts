import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { useAuthStore } from '../store/auth-store';
import { wipeLocalProfileCache } from '../store/profile-store';

export async function signOutCurrentUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await getSupabase().auth.signOut();
    } catch {
      // Continua a limpeza local mesmo se a nuvem falhar.
    }
  }

  useAuthStore.getState().setSession(null);
  useAuthStore.getState().markReady();
  await wipeLocalProfileCache();
  await AsyncStorage.removeItem('arcanum-profile');
}
