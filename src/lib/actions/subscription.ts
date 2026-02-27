'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionType = 
  | 'invoices_created' 
  | 'emails_sent' 
  | 'pdf_downloads' 
  | 'templates_used' 
  | 'clients_created' 
  | 'products_created' 
  | 'report_exports';

export async function getActiveSubscription() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plans (*)
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  // If no subscription found, they are on "None" (which we might want to treat as Free or prompt)
  // Per docs, users without subscription go to PAYG.
  return subscription;
}

export async function getUsageStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get the most recent usage tracking record
  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', user.id)
    .order('billing_period_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching usage stats:', error);
    return null;
  }

  return usage;
}

/**
 * Checks if the user has reached their limit for a specific action.
 * Returns { allowed: boolean, limit?: number, current?: number, reason?: string }
 */
export async function checkUsageLimit(action: ActionType) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { allowed: false, reason: 'unauthorized' };

  const [subscription, usage] = await Promise.all([
    getActiveSubscription(),
    getUsageStats()
  ]);

  if (!subscription) {
    // No subscription means they must use PAYG or we default to Free plan limits if desired
    // For now, let's say they are restricted and need to pay or subscribe
    return { 
      allowed: false, 
      reason: 'subscription_required', 
      message: 'You need an active subscription or use Pay-As-You-Go for this action.' 
    };
  }

  const plan = subscription.plans;
  const currentUsage = usage ? (usage[action as keyof typeof usage] as number) : 0;
  
  let limit = 0;
  switch (action) {
    case 'invoices_created':
      limit = plan.max_invoices_per_month;
      break;
    case 'clients_created':
      limit = plan.max_clients;
      break;
    case 'products_created':
      limit = plan.max_products;
      break;
    case 'emails_sent':
      limit = plan.max_email_sends;
      break;
    case 'templates_used':
      limit = plan.max_templates_access;
      break;
    // ... add more as needed
  }

  // limit 0 usually means unlimited in our seed data for Business/Lifetime
  if (limit === 0 && (plan.name === 'Business' || plan.name === 'Lifetime')) {
    return { allowed: true, current: currentUsage, limit: Infinity };
  }

  if (currentUsage >= limit) {
    return { 
      allowed: false, 
      reason: 'limit_reached', 
      current: currentUsage, 
      limit,
      allowPayg: plan.allow_payg_after_limit
    };
  }

  return { allowed: true, current: currentUsage, limit };
}

/**
 * Increments the usage counter for an action.
 */
export async function incrementUsage(action: ActionType) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const usage = await getUsageStats();
  if (!usage) return;

  const { error } = await supabase
    .from('usage_tracking')
    .update({ [action]: (usage[action as keyof typeof usage] as number) + 1 })
    .eq('id', usage.id);

  if (error) {
    console.error('Error incrementing usage:', error);
  }

  revalidatePath('/dashboard');
  revalidatePath('/user-profile-settings');
}

/**
 * Logs an activity
 */
export async function logActivity(actionType: string, resourceId?: string, metadata: any = {}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action_type: actionType,
    resource_id: resourceId,
    metadata
  });
}

/**
 * Initiates a Free subscription for a new user
 */
export async function initializeFreeSubscription() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  // Check if they already have one
  const existing = await getActiveSubscription();
  if (existing) return;

  // Get Free plan ID
  const { data: freePlan } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Free')
    .single();

  if (!freePlan) return;

  await supabase.from('subscriptions').insert({
    user_id: user.id,
    plan_id: freePlan.id,
    status: 'active',
    billing_cycle: 'monthly',
    start_date: new Date().toISOString(),
  });
}

/**
 * Checks the status of a payment by CheckoutRequestID
 */
export async function checkPaymentStatus(checkoutRequestId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { status: 'unauthorized' };

  // Check subscription_payments
  const { data: subscriptionPayment } = await supabase
    .from('subscription_payments')
    .select('status, payment_type')
    .eq('checkout_request_id', checkoutRequestId)
    .maybeSingle();

  if (subscriptionPayment) {
    return { status: subscriptionPayment.status, type: 'subscription' };
  }

  // Check payg_transactions
  const { data: paygPayment } = await supabase
    .from('payg_transactions')
    .select('status')
    .eq('checkout_request_id', checkoutRequestId)
    .maybeSingle();

  if (paygPayment) {
    return { status: paygPayment.status, type: 'payg' };
  }

  return { status: 'not_found' };
}
