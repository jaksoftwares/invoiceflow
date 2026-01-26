import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';

// Zod schema for bulk actions
const bulkActionSchema = z.object({
  action: z.enum(['delete', 'update_status']),
  ids: z.array(z.string().uuid()).min(1, 'At least one invoice ID is required'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
}).refine((data) => {
  if (data.action === 'update_status' && !data.status) {
    return false;
  }
  return true;
}, {
  message: 'Status is required when action is update_status',
  path: ['status'],
});

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
    const validationResult = bulkActionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { action, ids, status } = validationResult.data;

    let query;
    if (action === 'delete') {
      query = supabase
        .from('invoices')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);
    } else if (action === 'update_status') {
      query = supabase
        .from('invoices')
        .update({ status })
        .in('id', ids)
        .eq('user_id', user.id);
    }

    const { error, count } = await query!;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: `Failed to ${action} invoices` }, { status: 500 });
    }

    return NextResponse.json({
      message: `${action === 'delete' ? 'Deleted' : 'Updated'} ${count} invoice(s) successfully`,
      affected: count,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}