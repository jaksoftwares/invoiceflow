import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { Invoice } from '@/types/database';

// Zod schema for creating an invoice
const createInvoiceSchema = z.object({
  client_id: z.string().uuid(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  issue_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  payment_terms: z.string().min(1, 'Payment terms are required'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  subtotal: z.number().min(0),
  tax_rate: z.number().min(0),
  tax_amount: z.number().min(0),
  discount: z.number().min(0),
  total_amount: z.number().min(0),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  payment_instructions: z.string().optional(),
  template: z.string().min(1, 'Template is required'),
});

// Zod schema for query parameters
const listInvoicesQuerySchema = z.object({
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
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  client_id: z.string().uuid().optional(),
  issue_date_from: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  issue_date_to: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  due_date_from: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  due_date_to: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date'),
  search: z.string().optional(),
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
    const queryValidation = listInvoicesQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: queryValidation.error.issues }, { status: 400 });
    }

    const { page, limit, status, client_id, issue_date_from, issue_date_to, due_date_from, due_date_to, search } = queryValidation.data;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('invoices')
      .select('*, clients(company_name)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    if (issue_date_from) {
      query = query.gte('issue_date', issue_date_from);
    }

    if (issue_date_to) {
      query = query.lte('issue_date', issue_date_to);
    }

    if (due_date_from) {
      query = query.gte('due_date', due_date_from);
    }

    if (due_date_to) {
      query = query.lte('due_date', due_date_to);
    }

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,clients.company_name.ilike.%${search}%`);
    }

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      invoices,
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
    const validationResult = createInvoiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const invoiceData = validationResult.data;

    // Verify client belongs to user
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', invoiceData.client_id)
      .eq('user_id', user.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 });
    }

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}