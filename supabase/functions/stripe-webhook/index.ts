import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

const PREMIUM_STATUSES = new Set(['active', 'trialing']);
const DELINQUENT_STATUSES = new Set([
  'canceled',
  'unpaid',
  'past_due',
  'incomplete_expired',
  'paused',
]);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405 });
  }

  const signature = req.headers.get('Stripe-Signature');
  if (signature === null || signature.length === 0) {
    return new Response('missing_stripe_signature', { status: 400 });
  }

  const stripe = new Stripe(requiredEnv('STRIPE_SECRET_KEY'));
  const cryptoProvider = Stripe.createSubtleCryptoProvider();
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      requiredEnv('STRIPE_WEBHOOK_SECRET'),
      undefined,
      cryptoProvider,
    );
  } catch {
    return new Response('invalid_stripe_signature', { status: 400 });
  }

  const admin = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const claimed = await claimEvent(admin, event);
  if (claimed === 'duplicate') {
    return json({ received: true, duplicate: true });
  }

  try {
    await handleEvent(admin, event);
  } catch (caught) {
    await admin.from('stripe_events').delete().eq('id', event.id);
    const message = caught instanceof Error ? caught.message : 'webhook_failed';
    return new Response(message, { status: 500 });
  }

  return json({ received: true });
});

async function handleEvent(admin: SupabaseClient, event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await onCheckoutCompleted(admin, event.data.object as Stripe.Checkout.Session);
      return;
    case 'invoice.paid':
      await onInvoicePaid(admin, event.data.object as Stripe.Invoice);
      return;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await onSubscriptionChange(admin, event.data.object as Stripe.Subscription);
      return;
    default:
      return;
  }
}

async function onCheckoutCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
  if (userId === undefined || userId.length === 0) {
    throw new Error('missing_supabase_user_id');
  }

  const plan = parsePlan(session.metadata?.plan) ?? (session.mode === 'subscription' ? 'monthly' : 'lifetime');
  const customerId = customerIdOf(session.customer);
  const subscriptionId = idOf(session.subscription);
  const paid = session.payment_status === 'paid';

  await updateProfile(admin, {
    id: userId,
    is_premium: paid,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscription_status: plan === 'lifetime' ? 'lifetime' : (paid ? 'active' : 'incomplete'),
    plan_type: plan,
  });
}

async function onInvoicePaid(admin: SupabaseClient, invoice: Stripe.Invoice): Promise<void> {
  const customerId = customerIdOf(invoice.customer);
  const userId = await userIdByCustomer(admin, customerId);

  if (userId === null) {
    throw new Error('missing_supabase_user_id');
  }

  const subscriptionId = subscriptionIdFromInvoice(invoice);
  const isMonthly = subscriptionId !== null;

  await updateProfile(admin, {
    id: userId,
    is_premium: true,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscription_status: isMonthly ? 'active' : 'lifetime',
    plan_type: isMonthly ? 'monthly' : 'lifetime',
  });
}

async function onSubscriptionChange(
  admin: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = customerIdOf(subscription.customer);
  const userId =
    subscription.metadata?.supabase_user_id ?? (await userIdByCustomer(admin, customerId));

  if (userId === null) {
    throw new Error('missing_supabase_user_id');
  }

  const status = subscription.status;
  const premium = PREMIUM_STATUSES.has(status);
  const delinquent = DELINQUENT_STATUSES.has(status);

  await updateProfile(admin, {
    id: userId,
    is_premium: premium && !delinquent,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: status,
    plan_type: 'monthly',
  });
}

async function updateProfile(
  admin: SupabaseClient,
  patch: {
    id: string;
    is_premium: boolean;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string;
    plan_type: 'lifetime' | 'monthly';
  },
): Promise<void> {
  const { error } = await admin
    .from('profiles')
    .update({
      is_premium: patch.is_premium,
      stripe_customer_id: patch.stripe_customer_id,
      stripe_subscription_id: patch.stripe_subscription_id,
      subscription_status: patch.subscription_status,
      plan_type: patch.plan_type,
    })
    .eq('id', patch.id);

  if (error !== null) {
    throw error;
  }
}

async function userIdByCustomer(
  admin: SupabaseClient,
  customerId: string | null,
): Promise<string | null> {
  if (customerId === null) {
    return null;
  }
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (error !== null) {
    throw error;
  }
  return data?.id ?? null;
}

async function claimEvent(
  admin: SupabaseClient,
  event: Stripe.Event,
): Promise<'claimed' | 'duplicate'> {
  const { error } = await admin.from('stripe_events').insert({
    id: event.id,
    type: event.type,
  });

  if (error === null) {
    return 'claimed';
  }
  if (error.code === '23505') {
    return 'duplicate';
  }
  throw error;
}

function parsePlan(value: string | undefined): 'lifetime' | 'monthly' | null {
  if (value === 'lifetime' || value === 'monthly') {
    return value;
  }
  return null;
}

function customerIdOf(value: string | { id: string } | null): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (value !== null && typeof value === 'object' && typeof value.id === 'string') {
    return value.id;
  }
  return null;
}

function idOf(value: string | { id: string } | null): string | null {
  return customerIdOf(value);
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parentSub = (
    invoice as {
      parent?: { subscription_details?: { subscription?: string | { id: string } | null } };
    }
  ).parent?.subscription_details?.subscription;
  if (typeof parentSub === 'string') {
    return parentSub;
  }
  if (parentSub !== null && parentSub !== undefined && typeof parentSub === 'object') {
    return parentSub.id;
  }
  const legacy = (invoice as { subscription?: string | { id: string } | null }).subscription;
  return idOf(legacy ?? null);
}

function json(payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim() ?? '';
  if (value.length === 0) {
    throw new Error(`missing_env:${name}`);
  }
  return value;
}
