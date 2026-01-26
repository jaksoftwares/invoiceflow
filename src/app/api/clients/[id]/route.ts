import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { Client } from '@/types/database';

// Zod schema for updating a client
const updateClientSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').optional(),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')).nullable(),
  billing_frequency: z.enum(['monthly', 'quarterly', 'annually', 'one-time']).optional(),
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

    // Validate client ID
    const { data: clientId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Fetch client
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
    }

    return NextResponse.json(client);
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

    // Validate client ID
    const { data: clientId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateClientSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const updateData = validationResult.data;

    // Check if client exists and belongs to user
    const { data: existingClient, error: fetchError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      console.error('Database error:', fetchError);
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }

    // Update client
    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }

    return NextResponse.json(client);
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

    // Validate client ID
    const { data: clientId, error: idError } = uuidSchema.safeParse(params.id);
    if (idError) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    // Delete client (RLS will ensure ownership)
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}