import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';

const querySchema = z.object({
  period: z.enum(['monthly', 'yearly']).default('monthly'),
});

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queryValidation = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (!queryValidation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: queryValidation.error.issues }, { status: 400 });
    }

    const { period } = queryValidation.data;

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('issue_date, total_amount')
      .eq('user_id', user.id)
      .eq('status', 'paid');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
    }

    const grouped = (invoices || []).reduce((acc, inv) => {
      const date = new Date(inv.issue_date);
      const key = period === 'monthly'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}`;
      acc[key] = (acc[key] || 0) + inv.total_amount;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(grouped)
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return NextResponse.json({ chartData });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}