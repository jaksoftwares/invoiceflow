import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';

/**
 * Consolidates multiple settings/profile/business calls into one
 * to streamline application bootstrap and reduce redundant network requests.
 */
export async function GET(request: NextRequest) {
 try {
 const { supabase } = createClient(request);

 const { data: { user }, error: authError } = await supabase.auth.getUser();
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 // Fetch everything in parallel
 const [profileRes, settingsRes, businessRes] = await Promise.all([
 supabase.from('profiles').select('*').eq('id', user.id).single(),
 supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
 supabase.from('business_profiles').select('*').eq('owner_id', user.id).single()
 ]);

 // Handle profile specifically since it might need email enrichment
 let profile = profileRes.data;
 if (profile) {
 profile.email = user.email;
 }

 return NextResponse.json({
 profile: profile || null,
 settings: settingsRes.data || null,
 business: businessRes.data || null,
 user: {
 id: user.id,
 email: user.email,
 metadata: user.user_metadata
 }
 });

 } catch (error) {
 console.error('Bootstrap error:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
