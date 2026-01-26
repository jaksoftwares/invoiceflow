import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';

// Zod schema for validating UUID
const uuidSchema = z.string().uuid();

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check if invoice exists and belongs to user
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      console.error('Database error:', fetchError);
      return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
    }

    // Update status to 'sent'
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}