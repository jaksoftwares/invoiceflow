import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { Payment } from '@/types/database';

// Zod schema for creating a payment
const createPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  payment_method: z.enum(['bank_transfer', 'credit_card', 'paypal', 'check', 'cash', 'other']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

// Zod schema for query parameters
const listPaymentsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => {
    const num = Number(val);
    if (isNaN(num) || num <= 0) return 1;
    return num;
  }),
  limit: z.string().optional().default('10').transform(val => {
    const num = Number(val);
    if (isNaN(num) || num <= 0 || num > 100) return 10;
    return num;
  }),
  invoice_id: z.string().uuid().optional(),
  payment_date_from: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  payment_date_to: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  payment_method: z.enum(['bank_transfer', 'credit_card', 'paypal', 'check', 'cash', 'other']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const queryValidation = listPaymentsQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: queryValidation.error.issues }, { status: 400 });
    }

    const { page, limit, invoice_id, payment_date_from, payment_date_to, payment_method } = queryValidation.data;
    const offset = (page - 1) * limit;

    // Build query - join with invoices to ensure user access
    let query = supabase
      .from('payments')
      .select('*, invoices!inner(user_id)', { count: 'exact' })
      .eq('invoices.user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (invoice_id) {
      query = query.eq('invoice_id', invoice_id);
    }

    if (payment_date_from) {
      query = query.gte('payment_date', payment_date_from);
    }

    if (payment_date_to) {
      query = query.lte('payment_date', payment_date_to);
    }

    if (payment_method) {
      query = query.eq('payment_method', payment_method);
    }

    const { data: payments, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createClient(request);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const paymentData = validationResult.data;

    // Verify invoice belongs to user
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', paymentData.invoice_id)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 404 });
    }

    // Create payment
    const { data: payment, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}