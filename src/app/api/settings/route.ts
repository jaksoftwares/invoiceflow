import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';

export const dynamic = 'force-dynamic';
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

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    if (!settings) {
      // Create default settings if they don't exist
      const defaultSettings = {
        user_id: user.id,
        company_logo_url: null,
        default_template: 'professional',
        default_payment_terms: 'net30',
        default_tax_rate: 0,
        tax_label: 'Tax',
        invoice_prefix: 'INV-',
        invoice_footer: null,
        email_notifications: {
          paymentReceived: true,
          invoiceOverdue: true,
          paymentReminder: true,
          newClient: true,
          weeklyReport: true,
          monthlyReport: true,
        },
        push_notifications: {
          paymentReceived: true,
          invoiceOverdue: true,
          systemUpdates: true,
        },
        reminder_settings: {
          daysBeforeDue: '7',
          overdueFrequency: 'daily',
        },
        security_settings: {
          twoFactorEnabled: false,
          passwordLastChanged: null,
          loginNotifications: true,
        },
        subscription_plan: {
          name: 'Free',
          price: '0',
          billingCycle: 'monthly',
          features: ['Up to 50 invoices', 'Basic templates', 'Email support'],
          current: true,
          status: 'active',
          nextBillingDate: null,
        },
        usage_stats: {
          invoicesSent: 0,
          invoicesLimit: 50,
          clientsAdded: 0,
          clientsLimit: 100,
          storageUsed: 0,
          storageLimit: 100,
        },
      };

      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create default settings:', insertError);
        return NextResponse.json({ error: 'Failed to create default settings' }, { status: 500 });
      }

      return NextResponse.json(newSettings);
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