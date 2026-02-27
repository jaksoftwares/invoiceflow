'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Invoice, InvoiceItem } from '@/types/database';
import { recordClientActivity } from './activities';
import { checkUsageLimit, incrementUsage, logActivity } from './subscription';

interface CreateInvoiceParams extends Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
}

export async function createInvoiceAction(invoiceData: CreateInvoiceParams): Promise<Invoice> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Verify client belongs to user
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('id', invoiceData.client_id)
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    throw new Error('Client not found or access denied');
  }

  // Check subscription limits
  const usageCheck = await checkUsageLimit('invoices_created');
  if (!usageCheck.allowed) {
    throw new Error(`Limit reached: ${usageCheck.reason}`);
  }

  // Generate slug
  const slug = generateInvoiceSlug(client.company_name, invoiceData.invoice_number);

  const { items, ...invoiceFields } = invoiceData;

  // Call the RPC function
  const { data: invoiceId, error } = await supabase.rpc('create_invoice_full', {
    p_invoice_data: { ...invoiceFields, slug },
    p_items_data: items,
  });

  if (error) {
    console.error('RPC Error:', error);
    throw new Error('Failed to create invoice');
  }
  
  // Since RPC returns {id: UUID}, we can construct the object or fetch it.
  // Fetching is safer to return the full object as expected by the caller (if it expects full object)
  // But for performance, we can just return what we have if the caller allows.
  // However, the return type is Promise<Invoice>. We should better fetch it or just cast it if we trust the input.
  // Let's fetch it to be sure.
  const { data: createdInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', (invoiceId as any).id)
    .single();
    
  if (fetchError || !createdInvoice) {
      throw new Error('Invoice created but failed to fetch');
  }

  revalidatePath('/invoice-management');
  revalidatePath('/dashboard');
  revalidatePath(`/client-management/${invoiceData.client_id}`);

  // Record activity
  await recordClientActivity({
    clientId: invoiceData.client_id,
    activity: `Invoice #${invoiceData.invoice_number} created for ${formatCurrency(invoiceData.total_amount, invoiceData.currency)}`,
    type: 'invoice_sent',
    metadata: { invoiceId: createdInvoice.id }
  });

  // Increment usage
  await incrementUsage('invoices_created');
  
  // Log activity
  await logActivity('invoice_created', createdInvoice.id, { 
    invoice_number: invoiceData.invoice_number,
    total_amount: invoiceData.total_amount 
  });

  return createdInvoice;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

interface UpdateInvoiceParams extends Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
  items?: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
}

export async function updateInvoiceAction(id: string, invoiceData: UpdateInvoiceParams): Promise<Invoice> {
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

  const { items, ...invoiceFields } = invoiceData;

  // Use RPC for atomic update
  const { error } = await supabase.rpc('update_invoice_full', {
    p_invoice_id: id,
    p_invoice_data: invoiceFields,
    p_items_data: items, // Can be undefined, RPC handles it
  });

  if (error) {
    console.error('RPC Error:', error);
    throw new Error('Failed to update invoice');
  }

  revalidatePath('/invoice-management');
  revalidatePath('/dashboard');
  revalidatePath(`/invoice-management/${id}`);

  // Fetch updated invoice
  const { data: updatedInvoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !updatedInvoice) {
    throw new Error('Invoice updated but failed to fetch');
  }

  // Record activity if status changed
  if (invoiceData.status) {
    await recordClientActivity({
      clientId: updatedInvoice.client_id,
      activity: `Invoice #${updatedInvoice.invoice_number} status updated to ${invoiceData.status}`,
      type: invoiceData.status === 'paid' ? 'payment' : 'other',
      metadata: { invoiceId: updatedInvoice.id }
    });
  }

  return updatedInvoice;
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

function generateInvoiceSlug(clientName: string, invoiceNumber: string): string {
  const sanitizedClient = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const sanitizedNumber = invoiceNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Add random suffix (6 chars)
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${sanitizedClient}-${sanitizedNumber}-${randomSuffix}`;
}