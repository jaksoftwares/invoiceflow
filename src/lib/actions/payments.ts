'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Payment } from '@/types/database';

export async function createPaymentAction(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify invoice belongs to user
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', paymentData.invoice_id)
    .eq('user_id', user.id)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found or access denied');
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create payment');
  }

  revalidatePath('/payments');
  revalidatePath('/dashboard');
  revalidatePath(`/invoice-management/${paymentData.invoice_id}`);

  return payment;
}

export async function updatePaymentAction(id: string, paymentData: Partial<Omit<Payment, 'id' | 'created_at'>>): Promise<Payment> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Check if payment exists and belongs to user (via invoice)
  const { data: existingPayment, error: fetchError } = await supabase
    .from('payments')
    .select('id, invoices!inner(user_id)')
    .eq('id', id)
    .eq('invoices.user_id', user.id)
    .single();

  if (fetchError) {
    throw new Error('Payment not found');
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .update(paymentData)
    .eq('id', id)
    .select('*, invoices!inner(user_id)')
    .eq('invoices.user_id', user.id)
    .single();

  if (error) {
    throw new Error('Failed to update payment');
  }

  revalidatePath('/payments');
  revalidatePath('/dashboard');
  revalidatePath(`/payments/${id}`);

  return payment;
}

export async function deletePaymentAction(id: string): Promise<void> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Check if payment exists and belongs to user before deleting
  const { data: existingPayment, error: fetchError } = await supabase
    .from('payments')
    .select('id, invoices!inner(user_id)')
    .eq('id', id)
    .eq('invoices.user_id', user.id)
    .single();

  if (fetchError) {
    throw new Error('Payment not found');
  }

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to delete payment');
  }

  revalidatePath('/payments');
  revalidatePath('/dashboard');
}