import { useEffect } from 'react';
import { fetchProfile, isSupabaseConfigured, profileRowToLocal } from '../services';
import { getSupabase } from '../services/supabase';
import { toUserError } from '../lib/to-user-error';
import { withTimeout } from '../lib/with-timeout';
import { useAuthStore } from './auth-store';
import { useProfileStore } from './profile-store';

const BOOT_TIMEOUT_MS = 5000;

export function useAuthBootstrap(): void {
  const bootGeneration = useAuthStore((state) => state.bootGeneration);
  const markReady = useAuthStore((state) => state.markReady);
  const markError = useAuthStore((state) => state.markError);
  const setSession = useAuthStore((state) => state.setSession);
  const setProfileLoading = useAuthStore((state) => state.setProfileLoading);

  useEffect(() => {
    let cancelled = false;

    if (!isSupabaseConfigured()) {
      const finishLocal = (): void => {
        if (!cancelled) {
          markReady();
        }
      };

      if (useProfileStore.getState().hasHydrated) {
        finishLocal();
        return () => {
          cancelled = true;
        };
      }

      const timeout = setTimeout(finishLocal, BOOT_TIMEOUT_MS);
      const unsubscribe = useProfileStore.subscribe((state) => {
        if (state.hasHydrated) {
          clearTimeout(timeout);
          finishLocal();
        }
      });

      return () => {
        cancelled = true;
        clearTimeout(timeout);
        unsubscribe();
      };
    }

    const supabase = getSupabase();

    const syncProfile = async (userId: string | undefined): Promise<'ok' | 'missing'> => {
      if (userId === undefined) {
        useProfileStore.getState().clearProfile();
        return 'missing';
      }

      setProfileLoading(true);
      try {
        const row = await withTimeout(fetchProfile(userId), BOOT_TIMEOUT_MS);
        if (cancelled) {
          return 'ok';
        }
        if (row === null) {
          useProfileStore.getState().clearProfile();
          return 'missing';
        }
        useProfileStore.getState().setProfile(profileRowToLocal(row));
        return 'ok';
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    const boot = async (): Promise<void> => {
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession(), BOOT_TIMEOUT_MS);
        if (cancelled) {
          return;
        }
        if (error) {
          throw error;
        }
        setSession(data.session);
        if (data.session?.user.id !== undefined) {
          await syncProfile(data.session.user.id);
        } else {
          useProfileStore.getState().clearProfile();
        }
        if (!cancelled) {
          markReady();
        }
      } catch (caught) {
        if (!cancelled) {
          markError(toUserError(caught));
        }
      }
    };

    void boot();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }
      setSession(session);
      if (event === 'SIGNED_OUT') {
        useProfileStore.getState().clearProfile();
        setProfileLoading(false);
        return;
      }
      void syncProfile(session?.user.id).catch((caught: unknown) => {
        if (!cancelled) {
          markError(toUserError(caught));
        }
      });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [
    bootGeneration,
    markError,
    markReady,
    setProfileLoading,
    setSession,
  ]);
}
