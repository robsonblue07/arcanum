import { isSupabaseConfigured } from '../services';
import { useAuthStore } from './auth-store';
import { useProfileStore } from './profile-store';

export type BootGate =
  | { type: 'splash' }
  | { type: 'error'; message: string }
  | { type: 'login' }
  | { type: 'onboarding' }
  | { type: 'app' };

export function useBootGate(): BootGate {
  const bootStatus = useAuthStore((state) => state.bootStatus);
  const bootError = useAuthStore((state) => state.bootError);
  const profileLoading = useAuthStore((state) => state.profileLoading);
  const session = useAuthStore((state) => state.session);
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const profile = useProfileStore((state) => state.profile);

  if (bootStatus === 'loading' || profileLoading || !hasHydrated) {
    return { type: 'splash' };
  }

  if (bootStatus === 'error') {
    return {
      type: 'error',
      message: bootError ?? 'Não foi possível conectar. Tente novamente.',
    };
  }

  if (isSupabaseConfigured() && session === null) {
    return { type: 'login' };
  }

  if (profile === null) {
    return { type: 'onboarding' };
  }

  return { type: 'app' };
}
