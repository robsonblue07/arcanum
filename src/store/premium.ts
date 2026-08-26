import { isSupabaseConfigured, updateProfilePremium } from '../services';
import { useAuthStore } from './auth-store';
import { useProfileStore } from './profile-store';

export function useIsPremium(): boolean {
  return useProfileStore((state) => state.profile?.isPremium === true);
}

export async function setPremiumUnlocked(isPremium: boolean): Promise<void> {
  const current = useProfileStore.getState().profile;
  if (current !== null) {
    useProfileStore.getState().setProfile({ ...current, isPremium });
  }

  if (!isSupabaseConfigured()) {
    return;
  }

  const userId = useAuthStore.getState().session?.user.id;
  if (userId === undefined) {
    return;
  }

  const row = await updateProfilePremium(userId, isPremium);
  useProfileStore.getState().setProfile({
    fullName: row.nome_completo,
    birthDate: row.data_nascimento,
    isPremium: row.is_premium === true,
  });
}
