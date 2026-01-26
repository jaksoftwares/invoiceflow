'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InvoiceItem } from '@/types/database';

export async function createInvoiceItemAction(invoiceId: string, itemData: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>): Promise<InvoiceItem> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify invoice belongs to user
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found or access denied');
  }

  const { data: item, error } = await supabase
    .from('invoice_items')
    .insert({
      ...itemData,
      invoice_id: invoiceId,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create invoice item');
  }

  revalidatePath(`/invoice-management/${invoiceId}`);
  revalidatePath('/create-invoice');

  return item;
}

export async function updateInvoiceItemAction(invoiceId: string, itemId: string, itemData: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>): Promise<InvoiceItem> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify invoice belongs to user
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found or access denied');
  }

  // Verify item belongs to the invoice
  const { data: existingItem, error: itemError } = await supabase
    .from('invoice_items')
    .select('id')
    .eq('id', itemId)
    .eq('invoice_id', invoiceId)
    .single();

  if (itemError || !existingItem) {
    throw new Error('Invoice item not found');
  }

  const { data: item, error } = await supabase
    .from('invoice_items')
    .update(itemData)
    .eq('id', itemId)
    .eq('invoice_id', invoiceId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update invoice item');
  }

  revalidatePath(`/invoice-management/${invoiceId}`);
  revalidatePath('/create-invoice');

  return item;
}

export async function deleteInvoiceItemAction(invoiceId: string, itemId: string): Promise<void> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify invoice belongs to user
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found or access denied');
  }

  // Verify item belongs to the invoice
  const { data: existingItem, error: itemError } = await supabase
    .from('invoice_items')
    .select('id')
    .eq('id', itemId)
    .eq('invoice_id', invoiceId)
    .single();

  if (itemError || !existingItem) {
    throw new Error('Invoice item not found');
  }

  const { error } = await supabase
    .from('invoice_items')
    .delete()
    .eq('id', itemId)
    .eq('invoice_id', invoiceId);

  if (error) {
    throw new Error('Failed to delete invoice item');
  }

  revalidatePath(`/invoice-management/${invoiceId}`);
  revalidatePath('/create-invoice');
}