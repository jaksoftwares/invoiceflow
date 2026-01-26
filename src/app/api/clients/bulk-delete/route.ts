import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';

// Zod schema for bulk delete
const bulkDeleteSchema = z.object({
  clientIds: z.array(z.string().uuid()).min(1, 'At least one client ID is required').max(50, 'Maximum 50 clients can be deleted at once'),
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
    const validationResult = bulkDeleteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { clientIds } = validationResult.data;

    // Delete clients (RLS will ensure ownership)
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .in('id', clientIds)
      .eq('user_id', user.id)
      .select('id');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete clients' }, { status: 500 });
    }

    const deletedCount = data?.length || 0;

    return NextResponse.json({
      message: 'Clients deleted successfully',
      deletedCount,
      deletedIds: data?.map(client => client.id) || [],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}