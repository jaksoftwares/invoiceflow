import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { InvoiceItem } from '@/types/database';

// Zod schema for updating an invoice item (same as create)
const updateInvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be non-negative'),
  amount: z.number().min(0, 'Amount must be non-negative'),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const { supabase } = createClient(request);
    const { id, itemId } = params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify invoice belongs to user
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 });
    }

    // Verify item belongs to the invoice
    const { data: existingItem, error: itemError } = await supabase
      .from('invoice_items')
      .select('id')
      .eq('id', itemId)
      .eq('invoice_id', id)
      .single();

    if (itemError || !existingItem) {
      return NextResponse.json({ error: 'Invoice item not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateInvoiceItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const itemData = validationResult.data;

    // Update invoice item
    const { data: item, error } = await supabase
      .from('invoice_items')
      .update(itemData)
      .eq('id', itemId)
      .eq('invoice_id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update invoice item' }, { status: 500 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; itemId: string } }) {
  try {
    const { supabase } = createClient(request);
    const { id, itemId } = params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify invoice belongs to user
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 });
    }

    // Verify item belongs to the invoice
    const { data: existingItem, error: itemError } = await supabase
      .from('invoice_items')
      .select('id')
      .eq('id', itemId)
      .eq('invoice_id', id)
      .single();

    if (itemError || !existingItem) {
      return NextResponse.json({ error: 'Invoice item not found' }, { status: 404 });
    }

    // Delete invoice item
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', itemId)
      .eq('invoice_id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete invoice item' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invoice item deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}