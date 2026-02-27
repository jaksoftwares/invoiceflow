import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
    
    const result = body.Body.stkCallback;
    const checkoutRequestId = result.CheckoutRequestID;
    const resultCode = result.ResultCode; // 0 means success

    const supabase = createClient();

    if (resultCode === 0) {
      // Success
      const metadata = result.CallbackMetadata.Item;
      const mpesaReceipt = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
      const phone = metadata.find((i: any) => i.Name === 'PhoneNumber')?.Value;

      console.log(`Payment Success: ${mpesaReceipt}, Amount: ${amount}, Phone: ${phone}`);

      // 1. Try to update subscription_payments first
      const { data: payment, error: pError } = await supabase
        .from('subscription_payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
          mpesa_receipt_number: mpesaReceipt
        })
        .eq('checkout_request_id', checkoutRequestId)
        .select()
        .single();

      if (payment) {
        console.log('Subscription payment record updated. Activating subscription...');
        await activateSubscription(supabase, payment.user_id, payment.subscription_id);
      } else {
        // 2. If not found in subscriptions, check PAYG transactions
        const { data: payg, error: paygError } = await supabase
          .from('payg_transactions')
          .update({
            status: 'completed',
            mpesa_receipt_number: mpesaReceipt
          })
          .eq('checkout_request_id', checkoutRequestId)
          .select()
          .single();
          
        if (payg) {
          console.log('PAYG transaction record updated.');
          // Additional PAYG logic if needed (e.g. creating invoice if linked)
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

async function activateSubscription(supabase: any, userId: string, planId: string) {
  // Get the plan details to calculate duration (usually 1 month)
  const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single();
  
  if (!plan) {
    console.error('Plan not found for ID:', planId);
    return;
  }

  const now = new Date();
  const expiry = new Date();
  
  if (plan.name === 'Lifetime') {
    expiry.setFullYear(now.getFullYear() + 100); // 100 years for lifetime
  } else if (plan.name === 'yearly') {
    expiry.setFullYear(now.getFullYear() + 1);
  } else {
    expiry.setMonth(now.getMonth() + 1); // Default monthly
  }

  // Update or Insert subscription
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
}
