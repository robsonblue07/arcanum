import * as Linking from 'expo-linking';

export const CHECKOUT_SUCCESS_SCHEME_URL = 'arcanum://paywall?checkout=success';
export const CHECKOUT_CANCEL_SCHEME_URL = 'arcanum://paywall?checkout=cancel';

export type CheckoutReturn = 'success' | 'cancel' | 'unknown';

/** URL that Stripe / AuthSession should bounce back into the app. */
export function makeCheckoutRedirectUrl(): string {
  return Linking.createURL('paywall', {
    queryParams: { checkout: 'success' },
  });
}

export function parseCheckoutReturn(url: string | null | undefined): CheckoutReturn {
  if (url === null || url === undefined || url.length === 0) {
    return 'unknown';
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return fallbackCheckoutToken(url);
  }

  const checkout = parsed.searchParams.get('checkout');
  if (checkout === 'success') {
    return 'success';
  }
  if (checkout === 'cancel') {
    return 'cancel';
  }

  return fallbackCheckoutToken(url);
}

function fallbackCheckoutToken(url: string): CheckoutReturn {
  if (url.includes('checkout=success')) {
    return 'success';
  }
  if (url.includes('checkout=cancel')) {
    return 'cancel';
  }
  return 'unknown';
}
