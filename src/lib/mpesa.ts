'use server';

import { createClient } from '@/lib/supabase/server';
import { sendSubscriptionInvoiceEmail } from '@/lib/actions/subscription-emails';

/**
 * M-Pesa Integration Service (Production - Buy Goods)
 */

export interface MpesaResponse {
  success: boolean;
  checkoutRequestId?: string;
  error?: string;
  mock?: boolean;
}

const MPESA_ENV = process.env.MPESA_ENV || 'production';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '3020359'; 
const MPESA_PARTY_B = process.env.MPESA_PARTY_B || '4781510'; 
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || 'ecc3379b9fa0a724a83155caaa3ee3f0900326a703dd0e434b5ccc9fad4117b1';
const MPESA_TRANSACTION_TYPE = process.env.MPESA_TRANSACTION_TYPE || 'CustomerBuyGoodsOnline';

const MPESA_AUTH_URL = MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const MPESA_STK_PUSH_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

async function getMpesaAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY || 'XyHuUKsSF2y0jaCCK8oDuINDXPo5tEhlOM4SluiAUwtsrEzA';
  const secret = process.env.MPESA_CONSUMER_SECRET || 'vZC8yeAWWJfiTqbepeZs0acoPCtk098a6ahojRSM5iEbGU1uKosxadhAEl5Br2GX';
  
  const credentials = btoa(`${key}:${secret}`);
  
  try {
    const response = await fetch(MPESA_AUTH_URL, {
      headers: {
        Authorization: `Basic ${credentials}`
      },
      cache: 'no-store'
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    return null;
  }
}

export async function initiateStkPush(phoneNumber: string, amount: number, paymentType: 'subscription' | 'payg', referenceId: string): Promise<MpesaResponse> {
  let formattedPhone = phoneNumber.replace(/\+/g, '').replace(/^0/, '254');
  if (!formattedPhone.startsWith('254')) formattedPhone = `254${formattedPhone}`;

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);
  
  const token = await getMpesaAccessToken();
  if (!token) {
    if (MPESA_ENV !== 'production' && process.env.NODE_ENV === 'development') {
      console.warn('M-Pesa auth failed. Returning mock success for dev.');
      return mockStkPush(formattedPhone, amount, paymentType, referenceId);
    }
    throw new Error('Failed to authenticate with M-Pesa. Please check credentials.');
  }

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: MPESA_TRANSACTION_TYPE,
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: MPESA_PARTY_B,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://invoiceflow.dovepeakdigital.com/api/callback',
    AccountReference: referenceId.slice(0, 12), 
    TransactionDesc: `InvoiceFlow ${paymentType}`
  };

  try {
    const response = await fetch(MPESA_STK_PUSH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('M-Pesa STK Response:', data);
    
    if (data.ResponseCode === '0') {
      await recordPendingPayment(formattedPhone, amount, paymentType, referenceId, data.CheckoutRequestID);
      return { success: true, checkoutRequestId: data.CheckoutRequestID };
    } else {
      return { success: false, error: data.ResponseDescription };
    }
  } catch (error: any) {
    console.error('STK Push Fetch Error:', error);
    return { success: false, error: error.message || 'Network error during payment initiation' };
  }
}

async function recordPendingPayment(phone: string, amount: number, type: string, referenceId: string, checkoutRequestId: string) {
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const userClient = createServerClient();
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      console.error('CRITICAL: No authenticated user found in recordPendingPayment');
      return;
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment!');
    }

    console.log(`[PAYMENT] Recording ${type} for ${user.email} (ID: ${user.id}). Request: ${checkoutRequestId}`);

    if (type === 'subscription') {
      const planId = referenceId;
      const { data: plan } = await supabase.from('plans').select('name').eq('id', planId).single();

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const { error: insertError } = await supabase.from('subscription_payments').insert({
        user_id: user.id,
        amount,
        phone_number: phone,
        status: 'pending',
        payment_type: 'upgrade',
        subscription_id: subscription?.id || null, 
        plan_id: planId,
        checkout_request_id: checkoutRequestId
      });

      if (insertError) {
        console.error('[DATABASE ERROR] Failed to record subscription payment:', insertError);
      } else {
        console.log(`[SUCCESS] Pending subscription payment recorded: ${checkoutRequestId}`);
        try {
          await sendSubscriptionInvoiceEmail({
            userId: user.id,
            planName: plan?.name || 'Pro',
            amount,
            invoiceNumber: checkoutRequestId.slice(0, 10).toUpperCase()
          });
        } catch (emailErr) {
          console.error('Failed to send invoice email:', emailErr);
        }
      }
    } else {
      let actionType = referenceId;
      if (actionType === 'templates_used') actionType = 'premium_template';
      if (actionType === 'emails_sent') actionType = 'email_send';
      if (actionType === 'pdf_downloads') actionType = 'pdf_download';
      if (actionType === 'invoices_created') actionType = 'extra_invoice';
      if (actionType === 'report_exports') actionType = 'pdf_download';

      const { error } = await supabase.from('payg_transactions').insert({
        user_id: user.id,
        amount,
        action_type: actionType as any,
        status: 'pending',
        checkout_request_id: checkoutRequestId
      });

      if (error) {
        console.error('[DATABASE ERROR] Error recording PAYG transaction:', error);
      } else {
        console.log(`[SUCCESS] Pending PAYG transaction recorded: ${checkoutRequestId}`);
      }
    }
  } catch (err: any) {
    console.error('[CRITICAL] Exception in recordPendingPayment:', err);
  }
}

async function mockStkPush(phone: string, amount: number, type: string, referenceId: string): Promise<MpesaResponse> {
  const mockRequestId = `ws_CO_${Math.random().toString(36).substring(7)}`;
  await recordPendingPayment(phone, amount, type, referenceId, mockRequestId);
  return { success: true, checkoutRequestId: mockRequestId, mock: true };
}
