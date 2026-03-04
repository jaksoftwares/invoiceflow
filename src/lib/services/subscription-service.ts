import { SupabaseClient } from '@supabase/supabase-js';

export type ActionType = 
  | 'invoices_created' 
  | 'emails_sent' 
  | 'pdf_downloads' 
  | 'templates_used' 
  | 'clients_created' 
  | 'products_created' 
  | 'report_exports';

export async function getActiveSubscription(supabase: SupabaseClient, userId: string) {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plans (*)
    `)
    .eq('user_id', userId)
    .in('status', ['active', 'grace_period'])
    .maybeSingle();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return subscription;
}

export async function getUsageStats(supabase: SupabaseClient, userId: string) {
  // Get the most recent usage record
  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .order('billing_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching usage stats:', error);
    return null;
  }

  // Auto-reset logic: if today is after billing_period_end, create a new record
  if (usage) {
    const now = new Date();
    const periodEnd = new Date(usage.billing_period_end);
    
    if (now > periodEnd) {
      const subscription = await getActiveSubscription(supabase, userId);
      
      // If subscription expired, we still reset usage for the new "Free" period
      // but we link it to the current subscription if it's still somewhat relevant
      const nextStart = usage.billing_period_end;
      const nextEnd = new Date(periodEnd);
      nextEnd.setMonth(nextEnd.getMonth() + 1);

      const { data: newUsage, error: resetError } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          subscription_id: subscription?.id || null,
          billing_period_start: nextStart,
          billing_period_end: nextEnd.toISOString(),
          invoices_created: 0,
          emails_sent: 0,
          pdf_downloads: 0,
          templates_used: 0,
          clients_created: 0,
          products_created: 0,
          report_exports: 0
        })
        .select()
        .single();
      
      if (!resetError && newUsage) return newUsage;
    }
  }

  return usage;
}

export async function checkUsageLimit(supabase: SupabaseClient, userId: string, action: ActionType) {
  const [subscription, usage] = await Promise.all([
    getActiveSubscription(supabase, userId),
    getUsageStats(supabase, userId)
  ]);

  let plan;
  if (!subscription) {
    const { data: freePlan } = await supabase.from('plans').select('*').eq('name', 'Free').single();
    plan = freePlan;
  } else {
    plan = subscription.plans;
  }

  if (!plan) return { allowed: false, reason: 'plan_not_found' };

  const currentUsage = usage ? (usage[action as keyof typeof usage] as number) : 0;
  
  let baseLimit = 0;
  switch (action) {
    case 'invoices_created': baseLimit = plan.max_invoices_per_month; break;
    case 'clients_created': baseLimit = plan.max_clients; break;
    case 'products_created': baseLimit = plan.max_products; break;
    case 'emails_sent': baseLimit = plan.max_email_sends; break;
    case 'templates_used': baseLimit = plan.max_templates_access; break;
    case 'pdf_downloads': baseLimit = plan.max_invoices_per_month; break;
    case 'report_exports': baseLimit = plan.allow_csv_export ? 0 : -1; break;
  }

  if (baseLimit === 0) return { allowed: true, current: currentUsage, limit: Infinity };
  if (baseLimit === -1) return { allowed: false, reason: 'feature_not_included' };

  // Calculate successful PAYG credits for this action in the current period
  let paygCredits = 0;
  if (usage) {
    const { data: paygCounts } = await supabase
      .from('payg_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('action_type', action)
      .eq('status', 'completed')
      .gte('created_at', usage.billing_period_start);
      
    paygCredits = paygCounts?.length || 0;
  }

  const effectiveLimit = baseLimit + paygCredits;

  if (currentUsage >= effectiveLimit) {
    return { 
      allowed: false, 
      reason: 'limit_reached', 
      current: currentUsage, 
      limit: effectiveLimit,
      allowPayg: plan.allow_payg_after_limit
    };
  }

  return { allowed: true, current: currentUsage, limit: effectiveLimit };
}

export async function incrementUsage(supabase: SupabaseClient, userId: string, action: ActionType) {
  const usage = await getUsageStats(supabase, userId);
  
  if (!usage) {
    const subscription = await getActiveSubscription(supabase, userId);
    if (!subscription) return;

    await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        billing_period_start: subscription.start_date,
        billing_period_end: subscription.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        [action]: 1
      });
    return;
  }

  await supabase
    .from('usage_tracking')
    .update({ 
      [action]: (usage[action as keyof typeof usage] as number || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', usage.id);
}

export async function logActivity(supabase: SupabaseClient, userId: string, actionType: string, resourceId?: string, metadata: any = {}) {
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action_type: actionType,
    resource_id: resourceId,
    metadata
  });
}
