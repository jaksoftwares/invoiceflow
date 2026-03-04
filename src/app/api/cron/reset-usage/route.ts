import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Cron job to reset monthly usage for all active users.
 * This should be triggered at the end of every month or daily to catch rolling cycles.
 */
export async function GET(request: Request) {
  // Simple auth check for cron (use a secret in production)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient();
  const now = new Date().toISOString();

  try {
    // 1. Find all active subscriptions where the billing period has ended
    const { data: expiredSubscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('status', 'active')
      .lt('end_date', now);

    if (subError) throw subError;

    console.log(`Found ${expiredSubscriptions?.length || 0} expired subscriptions to reset.`);

    const results = [];

    for (const sub of expiredSubscriptions || []) {
      // Calculate next billing period
      const oldEnd = new Date(sub.end_date);
      const newStart = oldEnd.toISOString();
      const newEnd = new Date(oldEnd.setMonth(oldEnd.getMonth() + 1)).toISOString();

      // Update subscription dates
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          start_date: newStart,
          end_date: newEnd,
          updated_at: now
        })
        .eq('id', sub.id);

      if (updateError) {
        results.push({ id: sub.id, status: 'error', error: updateError.message });
        continue;
      }

      // Initialize new usage tracking record
      // The trigger 'on_subscription_created' only runs on insert, so we need a new record here
      // But wait, the subscription already exists. We just updated it.
      // We should manually insert the new usage_tracking record.
      const { error: usageError } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: sub.user_id,
          subscription_id: sub.id,
          billing_period_start: newStart,
          billing_period_end: newEnd,
          invoices_created: 0,
          emails_sent: 0,
          pdf_downloads: 0,
          templates_used: 0,
          clients_created: 0,
          products_created: 0,
          report_exports: 0
        });

      if (usageError) {
          results.push({ id: sub.id, status: 'error_usage', error: usageError.message });
      } else {
          results.push({ id: sub.id, status: 'success' });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: expiredSubscriptions?.length || 0,
      details: results
    });

  } catch (error: any) {
    console.error('Cron Reset Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
