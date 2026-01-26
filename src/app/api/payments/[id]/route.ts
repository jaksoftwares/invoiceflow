import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { Payment } from '@/types/database';

// Zod schema for updating a payment
const updatePaymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0').optional(),
  payment_date: z.string().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date').optional(),
  payment_method: z.enum(['bank_transfer', 'credit_card', 'paypal', 'check', 'cash', 'other']).optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
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

    // Validate payment ID
    const { data: paymentId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }

    // Fetch payment with invoice check
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, invoices!inner(user_id)')
      .eq('id', paymentId)
      .eq('invoices.user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
    }

    return NextResponse.json(payment);
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

    // Validate payment ID
    const { data: paymentId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const updateData = validationResult.data;

    // Check if payment exists and belongs to user (via invoice)
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('id, invoices!inner(user_id)')
      .eq('id', paymentId)
      .eq('invoices.user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      console.error('Database error:', fetchError);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    // Update payment
    const { data: payment, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select('*, invoices!inner(user_id)')
      .eq('invoices.user_id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    return NextResponse.json(payment);
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

    // Validate payment ID
    const { data: paymentId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }

    // Check if payment exists and belongs to user before deleting
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('id, invoices!inner(user_id)')
      .eq('id', paymentId)
      .eq('invoices.user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      console.error('Database error:', fetchError);
      return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
    }

    // Delete payment
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}