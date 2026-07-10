import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
 try {
 // If you are using Vercel Cron, you can secure this endpoint by setting a CRON_SECRET environment variable
 const authHeader = req.headers.get('authorization');
 if (
 process.env.CRON_SECRET &&
 authHeader !== `Bearer ${process.env.CRON_SECRET}`
 ) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const supabase = createAdminClient();
 
 // Perform a simple query to keep the database awake
 // This constitutes API activity and will prevent Supabase from pausing
 const { error } = await supabase.from('profiles').select('id').limit(1);

 if (error) {
 console.error('Keep-alive ping failed:', error);
 return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
 }

 return NextResponse.json({ status: 'ok', message: 'Supabase pinged successfully to prevent pausing' });
 } catch (err: any) {
 console.error('Keep-alive ping failed:', err);
 return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
 }
}
