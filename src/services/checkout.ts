import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { fetchProfile, profileRowToLocal } from './profiles';
import {
  CHECKOUT_SUCCESS_SCHEME_URL,
  makeCheckoutRedirectUrl,
  parseCheckoutReturn,
  type CheckoutReturn,
} from '../lib/checkout-linking';
import { useAuthStore } from '../store/auth-store';
import { useCheckoutStore } from '../store/checkout-store';
import { useProfileStore } from '../store/profile-store';

WebBrowser.maybeCompleteAuthSession();

export type CheckoutPlan = 'lifetime' | 'monthly';

const POLL_INTERVAL_MS = 2000;
const POLL_ATTEMPTS = 15;

let premiumPoll: Promise<boolean> | null = null;

interface CheckoutSessionResponse {
  url?: string;
  error?: string;
}

export async function startStripeCheckout(plan: CheckoutPlan): Promise<CheckoutReturn> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase não configurado para o checkout.');
  }

  const accessToken = useAuthStore.getState().session?.access_token;
  if (accessToken === undefined || accessToken.length === 0) {
    throw new Error('Entre na sua conta para concluir a compra.');
  }

  const { data, error } = await getSupabase().functions.invoke<CheckoutSessionResponse>(
    'create-checkout-session',
    {
      body: {
        plan,
        platform: Platform.OS === 'web' ? 'web' : 'native',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (error !== null) {
    throw error;
  }

  const checkoutUrl = data?.url;
  if (checkoutUrl === undefined || checkoutUrl.length === 0) {
    throw new Error(data?.error ?? 'Não foi possível abrir o Stripe Checkout.');
  }

  const redirectUrl = Platform.OS === 'web' ? makeCheckoutRedirectUrl() : CHECKOUT_SUCCESS_SCHEME_URL;
  const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl);
  if (result.type === 'success') {
    return parseCheckoutReturn(result.url);
  }
  if (result.type === 'cancel' || result.type === 'dismiss') {
    return 'cancel';
  }
  return 'unknown';
}

export async function refreshPremiumFromServer(): Promise<boolean> {
  const userId = useAuthStore.getState().session?.user.id;
  if (userId === undefined) {
    throw new Error('Entre na sua conta para restaurar compras.');
  }

  const row = await fetchProfile(userId);
  if (row === null) {
    return false;
  }
  useProfileStore.getState().setProfile(profileRowToLocal(row));
  return row.is_premium === true;
}

export function waitForPremiumUnlock(): Promise<boolean> {
  if (premiumPoll !== null) {
    return premiumPoll;
  }

  useCheckoutStore.getState().beginConfirming();
  premiumPoll = pollPremiumFlag()
    .catch((caught: unknown) => {
      useCheckoutStore.getState().endConfirming();
      throw caught;
    })
    .finally(() => {
      premiumPoll = null;
    });

  return premiumPoll;
}

async function pollPremiumFlag(): Promise<boolean> {
  let lastError: unknown;

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const userId = useAuthStore.getState().session?.user.id;
    if (userId === undefined) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    try {
      const unlocked = await refreshPremiumFromServer();
      if (unlocked) {
        useCheckoutStore.getState().endConfirming();
        return true;
      }
      lastError = undefined;
    } catch (caught) {
      lastError = caught;
    }
    await sleep(POLL_INTERVAL_MS);
  }

  useCheckoutStore.getState().endConfirming();
  if (lastError !== undefined) {
    throw lastError;
  }
  return false;
}

export function handleCheckoutReturnUrl(url: string): void {
  if (parseCheckoutReturn(url) !== 'success') {
    return;
  }
  useCheckoutStore.getState().beginConfirming();
  void waitForPremiumUnlock().catch(() => {
    // Paywall surface shows the error; keep bootstrap from crashing boot.
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
