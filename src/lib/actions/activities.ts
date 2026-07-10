'use server';

import { createClient } from '@/lib/supabase/server';

export interface RecordActivityParams {
 clientId: string;
 activity: string;
 type: 'new' | 'communication' | 'payment' | 'invoice_sent' | 'invoice_overdue' | 'other';
 metadata?: Record<string, any>;
}

export async function recordClientActivity(params: RecordActivityParams) {
 const supabase = createClient();

 // Verify ownership of the client
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data: client } = await supabase
 .from('clients')
 .select('id')
 .eq('id', params.clientId)
 .eq('user_id', user.id)
 .single();

 if (!client) {
 console.warn(`Attempt to record activity for unauthorized client ${params.clientId}`);
 return;
 }

 const { error } = await supabase.from('client_activities').insert({
 client_id: params.clientId,
 activity: params.activity,
 type: params.type,
 metadata: params.metadata || {},
 timestamp: new Date().toISOString(),
 });

 if (error) {
 console.error('Error recording client activity:', error);
 }
}
