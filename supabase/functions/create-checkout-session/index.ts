import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CheckoutPlan = 'lifetime' | 'monthly';
type CheckoutPlatform = 'native' | 'web';

interface CheckoutBody {
  plan?: unknown;
  platform?: unknown;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  try {
    const stripeKey = requiredEnv('STRIPE_SECRET_KEY');
    const lifetimePrice = requiredEnv('STRIPE_PRICE_LIFETIME');
    const monthlyPrice = requiredEnv('STRIPE_PRICE_MONTHLY');

    const authHeader = req.headers.get('Authorization');
    if (authHeader === null || !authHeader.toLowerCase().startsWith('bearer ')) {
      return json({ error: 'missing_authorization' }, 401);
    }

    const supabase = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_ANON_KEY'), {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const token = authHeader.slice('bearer '.length).trim();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError !== null || user === null) {
      return json({ error: 'invalid_jwt' }, 401);
    }

    const body = (await req.json()) as CheckoutBody;
    const plan = parsePlan(body.plan);
    if (plan === null) {
      return json({ error: 'invalid_plan' }, 400);
    }

    const platform = parsePlatform(body.platform);
    const { successUrl, cancelUrl } = checkoutUrls(platform);

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey);
    const isLifetime = plan === 'lifetime';
    const existingCustomer = profileHasCustomer(profile) ? profile.stripe_customer_id : null;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: isLifetime ? 'payment' : 'subscription',
      payment_method_types: isLifetime ? ['card', 'pix'] : ['card'],
      line_items: [{ price: isLifetime ? lifetimePrice : monthlyPrice, quantity: 1 }],
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (existingCustomer !== null) {
      sessionParams.customer = existingCustomer;
    } else if (user.email !== undefined && user.email.length > 0) {
      sessionParams.customer_email = user.email;
    }

    if (!isLifetime) {
      sessionParams.subscription_data = {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (session.url === null || session.url.length === 0) {
      return json({ error: 'missing_checkout_url' }, 500);
    }

    return json({ url: session.url });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'checkout_failed';
    return json({ error: message }, 500);
  }
});

function json(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim() ?? '';
  if (value.length === 0) {
    throw new Error(`missing_env:${name}`);
  }
  return value;
}

function parsePlan(value: unknown): CheckoutPlan | null {
  if (value === 'lifetime' || value === 'monthly') {
    return value;
  }
  return null;
}

function parsePlatform(value: unknown): CheckoutPlatform {
  return value === 'web' ? 'web' : 'native';
}

function checkoutUrls(platform: CheckoutPlatform): { successUrl: string; cancelUrl: string } {
  const webOrigin = (Deno.env.get('CHECKOUT_WEB_ORIGIN') ?? 'https://arcanum.app').replace(/\/$/, '');
  if (platform === 'web') {
    return {
      successUrl: `${webOrigin}/paywall?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${webOrigin}/paywall?checkout=cancel`,
    };
  }
  return {
    successUrl: 'arcanum://paywall?checkout=success&session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: 'arcanum://paywall?checkout=cancel',
  };
}

function profileHasCustomer(
  profile: { stripe_customer_id?: string | null } | null,
): profile is { stripe_customer_id: string } {
  return typeof profile?.stripe_customer_id === 'string' && profile.stripe_customer_id.length > 0;
}
