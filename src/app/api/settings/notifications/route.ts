import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';

export const dynamic = 'force-dynamic';
import { z } from 'zod';

const notificationsSchema = z.object({
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
      .select('email_notifications, push_notifications, reminder_settings')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch notification settings' }, { status: 500 });
    }

    if (!settings) {
      return NextResponse.json({ error: 'Notification settings not found' }, { status: 404 });
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
    const validation = notificationsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
    }

    const updateData = validation.data;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('user_id', user.id)
      .select('email_notifications, push_notifications, reminder_settings')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}