import { useProfileStore } from './profile-store';

export function useIsPremium(): boolean {
  return useProfileStore((state) => state.profile?.isPremium === true);
}

/** Dev-only. Never writes `is_premium` to Supabase. */
export function setLocalPremiumUnlocked(isPremium: boolean): void {
  const current = useProfileStore.getState().profile;
  if (current === null) {
    return;
  }
  useProfileStore.getState().setProfile({ ...current, isPremium });
}
