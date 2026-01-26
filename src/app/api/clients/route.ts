import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { Client } from '@/types/database';

// Zod schema for creating a client
const createClientSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  avatar_url: z.string().url().optional().or(z.literal('')),
  billing_frequency: z.enum(['monthly', 'quarterly', 'annually', 'one-time']).default('monthly'),
});

// Zod schema for query parameters
const listClientsQuerySchema = z.object({
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
  status: z.enum(['active', 'inactive', 'pending']).optional(),
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
    const queryValidation = listClientsQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: queryValidation.error.issues }, { status: 400 });
    }

    const { page, limit, status, search } = queryValidation.data;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: clients, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      clients,
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
    const validationResult = createClientSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const clientData = validationResult.data;

    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        ...clientData,
        user_id: user.id,
        email: clientData.email || null,
        avatar_url: clientData.avatar_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}