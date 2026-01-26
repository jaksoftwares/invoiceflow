import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';

const businessSchema = z.object({
  company_logo_url: z.string().url().optional(),
  default_template: z.string().min(1),
  default_payment_terms: z.string().min(1),
  default_tax_rate: z.number().min(0).max(100),
  tax_label: z.string().min(1),
  invoice_prefix: z.string().min(1),
  invoice_footer: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('company_logo_url, default_template, default_payment_terms, default_tax_rate, tax_label, invoice_prefix, invoice_footer')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch business settings' }, { status: 500 });
    }

    if (!settings) {
      return NextResponse.json({ error: 'Business settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase } = createClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = businessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
    }

    const updateData = validation.data;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select('company_logo_url, default_template, default_payment_terms, default_tax_rate, tax_label, invoice_prefix, invoice_footer')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update business settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}