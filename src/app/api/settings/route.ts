import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import type { UserSettings } from '@/types/database';

const userSettingsSchema = z.object({
  company_logo_url: z.string().url().optional(),
  default_template: z.string().min(1),
  default_payment_terms: z.string().min(1),
  default_tax_rate: z.number().min(0).max(100),
  tax_label: z.string().min(1),
  invoice_prefix: z.string().min(1),
  invoice_footer: z.string().optional(),
  email_notifications: z.object({
    paymentReceived: z.boolean(),
    invoiceOverdue: z.boolean(),
    paymentReminder: z.boolean(),
    newClient: z.boolean(),
    weeklyReport: z.boolean(),
    monthlyReport: z.boolean(),
  }),
  push_notifications: z.object({
    paymentReceived: z.boolean(),
    invoiceOverdue: z.boolean(),
    systemUpdates: z.boolean(),
  }),
  reminder_settings: z.object({
    daysBeforeDue: z.string().min(1),
    overdueFrequency: z.string().min(1),
  }),
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
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch user settings' }, { status: 500 });
    }

    if (!settings) {
      return NextResponse.json({ error: 'User settings not found' }, { status: 404 });
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
    const validation = userSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
    }

    const updateData = validation.data;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update user settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}