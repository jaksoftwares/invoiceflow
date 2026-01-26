'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Invoice } from '@/types/database';

export async function createInvoiceAction(invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify client belongs to user
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', invoiceData.client_id)
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    throw new Error('Client not found or access denied');
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      ...invoiceData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create invoice');
  }

  revalidatePath('/invoice-management');
  revalidatePath('/dashboard');
  revalidatePath(`/client-management/${invoiceData.client_id}`);

  return invoice;
}

export async function updateInvoiceAction(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Invoice> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // If client_id is being updated, verify it belongs to user
  if (invoiceData.client_id) {
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', invoiceData.client_id)
      .eq('user_id', user.id)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found or access denied');
    }
  }

  // Check if invoice exists and belongs to user
  const { data: existingInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    throw new Error('Invoice not found');
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update invoice');
  }

  revalidatePath('/invoice-management');
  revalidatePath('/dashboard');
  revalidatePath(`/invoice-management/${id}`);

  return invoice;
}

export async function deleteInvoiceAction(id: string): Promise<void> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to delete invoice');
  }

  revalidatePath('/invoice-management');
  revalidatePath('/dashboard');
}

export async function bulkDeleteInvoicesAction(invoiceIds: string[]): Promise<{ affected: number }> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { count, error } = await supabase
    .from('invoices')
    .delete()
    .in('id', invoiceIds)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to delete invoices');
  }

  revalidatePath('/invoice-management');
  revalidatePath('/dashboard');

  return { affected: count || 0 };
}

export async function bulkUpdateInvoiceStatusAction(invoiceIds: string[], status: Invoice['status']): Promise<{ affected: number }> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { count, error } = await supabase
    .from('invoices')
    .update({ status })
    .in('id', invoiceIds)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to update invoice status');
  }

  revalidatePath('/invoice-management');
  revalidatePath('/dashboard');

  return { affected: count || 0 };
}