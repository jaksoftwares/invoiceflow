import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { Invoice } from '@/types/database';

// Zod schema for updating an invoice
const updateInvoiceSchema = z.object({
  client_id: z.string().uuid().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required').optional(),
  issue_date: z.string().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date').optional(),
  due_date: z.string().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date').optional(),
  payment_terms: z.string().min(1, 'Payment terms are required').optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  subtotal: z.number().min(0).optional(),
  tax_rate: z.number().min(0).optional(),
  tax_amount: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total_amount: z.number().min(0).optional(),
  currency: z.string().min(1, 'Currency is required').optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  payment_instructions: z.string().optional(),
  template: z.string().min(1, 'Template is required').optional(),
});

// Zod schema for validating UUID
const uuidSchema = z.string().uuid();

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { supabase } = createClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate invoice ID
    const { data: invoiceId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Fetch invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { supabase } = createClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate invoice ID
    const { data: invoiceId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateInvoiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const updateData = validationResult.data;

    // If client_id is being updated, verify it belongs to user
    if (updateData.client_id) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', updateData.client_id)
        .eq('user_id', user.id)
        .single();

      if (clientError || !client) {
        return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
      }
    }

    // Check if invoice exists and belongs to user
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      console.error('Database error:', fetchError);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    // Update invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { supabase } = createClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate invoice ID
    const { data: invoiceId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Delete invoice (RLS will ensure ownership)
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}