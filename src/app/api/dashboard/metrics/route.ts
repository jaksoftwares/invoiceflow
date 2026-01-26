import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total invoices
    const { count: totalInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Paid invoices
    const { count: paidInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'paid');

    // Pending invoices (sent or overdue)
    const { count: pendingInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['sent', 'overdue']);

    // Total revenue (sum of total_amount for paid invoices)
    const { data: paidAmounts } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('user_id', user.id)
      .eq('status', 'paid');

    const totalRevenue = paidAmounts?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    return NextResponse.json({
      totalInvoices: totalInvoices || 0,
      paidInvoices: paidInvoices || 0,
      pendingInvoices: pendingInvoices || 0,
      totalRevenue,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}