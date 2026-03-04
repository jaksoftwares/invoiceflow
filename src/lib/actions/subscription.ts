'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import * as subService from '@/lib/services/subscription-service';

export type ActionType = subService.ActionType;

export interface UsageLimitResult {
  allowed: boolean;
  reason?: string;
  message?: string;
  current?: number;
  limit?: number;
  allowPayg?: boolean;
}

export async function getActiveSubscription() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return subService.getActiveSubscription(supabase, user.id);
}

export async function getUsageStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return subService.getUsageStats(supabase, user.id);
}

export async function checkUsageLimit(action: ActionType): Promise<UsageLimitResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, reason: 'unauthorized' };
  return subService.checkUsageLimit(supabase, user.id, action);
}

export async function incrementUsage(action: ActionType) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await subService.incrementUsage(supabase, user.id, action);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/subscription');
  revalidatePath('/user-profile-settings');
}

export async function checkFeatureAccess(feature: 'watermark_enabled' | 'allow_csv_export' | 'allow_branding' | 'allow_priority_email') {
  const subscription = await getActiveSubscription();
  if (!subscription) {
    return {
      watermark_enabled: true,
      allow_csv_export: false,
      allow_branding: false,
      allow_priority_email: false
    }[feature];
  }
  return subscription.plans[feature];
}

export async function getUserPlan() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const subscription = await subService.getActiveSubscription(supabase, user.id);
  if (!subscription) {
     const { data: freePlan } = await supabase.from('plans').select('*').eq('name', 'Free').single();
     return freePlan;
  }
  return subscription.plans;
}

export async function logActivity(actionType: string, resourceId?: string, metadata: any = {}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await subService.logActivity(supabase, user.id, actionType, resourceId, metadata);
}

export async function initializeFreeSubscription() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const existing = await getActiveSubscription();
  if (existing) return;

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

export async function checkPaymentStatus(checkoutRequestId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'unauthorized' };

  const { data: subscriptionPayment } = await supabase
    .from('subscription_payments')
    .select('status, payment_type')
    .eq('checkout_request_id', checkoutRequestId)
    .maybeSingle();

  if (subscriptionPayment) {
    return { status: subscriptionPayment.status, type: 'subscription' };
  }

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

export async function trackActionAction(action: ActionType, resourceId?: string, metadata: any = {}): Promise<{ success: boolean; error?: string } & Partial<UsageLimitResult>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const usageCheck = await subService.checkUsageLimit(supabase, user.id, action);
  if (!usageCheck.allowed) {
    return { success: false, error: 'Limit reached', ...usageCheck };
  }

  await subService.incrementUsage(supabase, user.id, action);
  await subService.logActivity(supabase, user.id, action, resourceId, metadata);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/subscription');
  
  return { success: true };
}
