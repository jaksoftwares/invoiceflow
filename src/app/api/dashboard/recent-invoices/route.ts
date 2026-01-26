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

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, clients(company_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch recent invoices' }, { status: 500 });
    }

    return NextResponse.json({ invoices: invoices || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}