'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { BusinessProfile } from '@/types/database';

export async function getBusinessProfile() {
 const supabase = createClient();
 
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return null;

 // For MVP, we assume user has one business profile or we pick the first one
 const { data, error } = await supabase
 .from('business_profiles')
 .select('*')
 .eq('owner_id', user.id)
 .single();

 if (error) {
 console.error('Error fetching business profile:', error);
 return null;
 }

 return data as BusinessProfile;
}

export async function updateSmtpSettings(settings: NonNullable<BusinessProfile['smtp_settings']>) {
 const supabase = createClient();
 
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error('Unauthorized');

 // Verify business ownership
 const { data: business, error: fetchError } = await supabase
 .from('business_profiles')
 .select('id')
 .eq('owner_id', user.id)
 .single();

 if (fetchError || !business) throw new Error('Business profile not found');

 const { error } = await supabase
 .from('business_profiles')
 .update({ smtp_settings: settings })
 .eq('id', business.id);

 if (error) throw new Error(error.message);

 return { success: true };
}