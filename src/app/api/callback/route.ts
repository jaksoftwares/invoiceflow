import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { sendSubscriptionConfirmationEmail } from '@/lib/actions/subscription-emails';

/**
 * M-Pesa Callback Endpoint (Production)
 * 
 * Safaricom sends payment results to this URL.
 * Matches: https://invoiceflow.dovepeakdigital.com/api/callback
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('--- M-PESA CALLBACK START ---');
    console.log(JSON.stringify(body, null, 2));
    
    if (!body?.Body?.stkCallback) {
        return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid body' }, { status: 400 });
    }

    const result = body.Body.stkCallback;
    const checkoutRequestId = result.CheckoutRequestID;
    const resultCode = result.ResultCode; // 0 means success

    const supabase = createAdminClient();

    if (resultCode === 0) {
      // Success
      const metadata = result.CallbackMetadata.Item;
      const mpesaReceipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
      const phone = metadata.find((i: any) => i.Name === 'PhoneNumber')?.Value;

      console.log(`Payment Success: ${mpesaReceipt}, Amount: ${amount}, Phone: ${phone}`);

      // 1. Update subscription_payments record
      const { data: payment } = await supabase
        .from('subscription_payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
          mpesa_receipt_number: mpesaReceipt
        })
        .eq('checkout_request_id', checkoutRequestId)
        .select()
        .maybeSingle();

      if (payment) {
        console.log('Subscription payment record updated. Activating subscription...');
        // Correct plan ID is now explicitly tracked in plan_id column
        // Fallback to currency for older records during transition
        const planId = payment.plan_id || (payment as any).currency;
        await activateSubscription(supabase, payment.user_id, planId, mpesaReceipt, amount);
      } else {
        // 2. Check PAYG transactions if not found in subscriptions
        const { data: payg } = await supabase
          .from('payg_transactions')
          .update({
            status: 'completed',
            mpesa_receipt_number: mpesaReceipt
          })
          .eq('checkout_request_id', checkoutRequestId)
          .select()
          .maybeSingle();
          
        if (payg) {
          console.log('PAYG transaction record updated.');
        } else {
          console.error(`CheckoutRequestID ${checkoutRequestId} not found in any transaction table.`);
        }
      }
    } else {
      // Failed (ResultCode != 0)
      console.log(`Payment Failed: ResultCode ${resultCode}, Message: ${result.ResultDesc}`);
      
      await supabase
        .from('subscription_payments')
        .update({ status: 'failed' })
        .eq('checkout_request_id', checkoutRequestId);
      
      await supabase
        .from('payg_transactions')
        .update({ status: 'failed' })
        .eq('checkout_request_id', checkoutRequestId);
    }

    console.log('--- M-PESA CALLBACK END ---');
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error: any) {
    console.error('Webhook processing Error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal Error' }, { status: 500 });
  }
}

async function activateSubscription(supabase: any, userId: string, planId: string, mpesaReceipt: string, amount: number) {
  // Get the plan details
  const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).maybeSingle();
  
  if (!plan) {
    console.error('Plan not found for ID:', planId);
    return;
  }

  const now = new Date();
  const expiry = new Date();
  
  if (plan.name === 'Lifetime') {
    expiry.setFullYear(now.getFullYear() + 100); 
  } else if (plan.name === 'yearly') {
    expiry.setFullYear(now.getFullYear() + 1);
  } else {
    expiry.setMonth(now.getMonth() + 1); 
  }

  // Update or Insert subscription record
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingSub) {
    await supabase
      .from('subscriptions')
      .update({
        plan_id: planId,
        status: 'active',
        start_date: now.toISOString(),
        end_date: expiry.toISOString(),
        updated_at: now.toISOString(),
        billing_cycle: plan.name === 'Lifetime' ? 'lifetime' : 'monthly'
      })
      .eq('id', existingSub.id);
  } else {
    await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: now.toISOString(),
        end_date: expiry.toISOString(),
        billing_cycle: plan.name === 'Lifetime' ? 'lifetime' : 'monthly'
      });
  }
  
  console.log(`Subscription activated for user ${userId} on plan ${plan.name}`);

  // Send the final Receipt/Confirmation email
  await sendSubscriptionConfirmationEmail({
    userId,
    planName: plan.name,
    amount,
    mpesaReceipt,
    expiryDate: expiry.toISOString()
  });
}
