import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const profileSchema = z.object({
 first_name: z.string().optional().nullable(),
 last_name: z.string().optional().nullable(),
 phone: z.string().optional().nullable(),
 avatar_url: z.string().optional().nullable(),
 // Business fields (mapped to business_profiles)
 business_name: z.string().optional().nullable(),
 business_address: z.string().optional().nullable(),
 city: z.string().optional().nullable(),
 state: z.string().optional().nullable(),
 zip_code: z.string().optional().nullable(),
 country: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
 try {
 const { supabase } = createClient(request);

 const { data: { user }, error: authError } = await supabase.auth.getUser();
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 // specific column selection to avoid fetching everything if not needed, but * is fine for now
 const { data: profile, error } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', user.id)
 .single();

 if (error && error.code !== 'PGRST116') {
 console.error('Database error:', error);
 return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
 }

 // Default profile creation if missing
 if (!profile) {
 const { data: newProfile, error: insertError } = await supabase
 .from('profiles')
 .insert({ id: user.id })
 .select()
 .single();
 
 if (insertError) return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
 // Return new profile with email from auth
 return NextResponse.json({
 ...newProfile,
 email: user.email
 });
 }

 // Fetch Business Profile
 const { data: business } = await supabase
 .from('business_profiles')
 .select('*')
 .eq('owner_id', user.id)
 .single();

 // Merge data for backward compatibility
 const responseData = {
 ...profile,
 // Include email from auth user
 email: user.email,
 business_name: business?.name || profile.business_name,
 business_address: business?.address || profile.business_address,
 city: business?.city || profile.city,
 state: business?.state || profile.state,
 zip_code: business?.zip_code || profile.zip_code,
 country: business?.country || profile.country,
 // Include business_profile object for new clients
 business_profile: business
 };

 return NextResponse.json(responseData);
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
 console.log('Profile PUT Body:', JSON.stringify(body, null, 2));
 const validation = profileSchema.safeParse(body);

 if (!validation.success) {
 return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
 }

 const { 
 business_name, business_address, city, state, zip_code, country, 
 ...profileData 
 } = validation.data;

 // 1. Update Profile
 console.log('Updating profile with:', profileData);
 console.log('avatar_url in profileData:', profileData.avatar_url);

 // Only include avatar_url in update if it has a value
 const profileUpdateData: Record<string, any> = { ...profileData };
 if (profileUpdateData.avatar_url === undefined || profileUpdateData.avatar_url === '') {
 console.log('Deleting avatar_url from update (empty/undefined)');
 delete profileUpdateData.avatar_url;
 } else {
 console.log('avatar_url will be updated to:', profileUpdateData.avatar_url);
 }

 const { data: updatedProfile, error: profileError } = await supabase
 .from('profiles')
 .update(profileUpdateData)
 .eq('id', user.id)
 .select()
 .single();

 if (profileError) {
 console.error('Profile update error:', profileError);
 return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
 }

 // 2. Update/Create Business Profile if business data is present
 // We check if any business field is being updated.
 const hasBusinessData = [business_name, business_address, city, state, zip_code, country].some(v => v !== undefined);

 let updatedBusiness = null;

 if (hasBusinessData) {
 // Check if exists
 const { data: existingBusiness } = await supabase
 .from('business_profiles')
 .select('id')
 .eq('owner_id', user.id)
 .single();
 
 const businessPayload: any = {};
 if (business_name !== undefined) businessPayload.name = business_name;
 if (business_address !== undefined) businessPayload.address = business_address;
 if (city !== undefined) businessPayload.city = city;
 if (state !== undefined) businessPayload.state = state;
 if (zip_code !== undefined) businessPayload.zip_code = zip_code;
 if (country !== undefined) businessPayload.country = country;

 if (existingBusiness) {
 const { data, error } = await supabase
 .from('business_profiles')
 .update(businessPayload)
 .eq('id', existingBusiness.id)
 .select()
 .single();
 if (error) throw error;
 updatedBusiness = data;
 } else if (business_name) {
 // Create new if name is present
 const { data, error } = await supabase
 .from('business_profiles')
 .insert({
 owner_id: user.id,
 status: 'active',
 ...businessPayload
 })
 .select()
 .single();
 if (error) throw error;
 updatedBusiness = data;
 }
 }

 // Merge response
 const responseData = {
 ...updatedProfile,
 business_name: updatedBusiness?.name || updatedProfile.business_name,
 business_address: updatedBusiness?.address || updatedProfile.business_address,
 city: updatedBusiness?.city || updatedProfile.city,
 state: updatedBusiness?.state || updatedProfile.state,
 zip_code: updatedBusiness?.zip_code || updatedProfile.zip_code,
 country: updatedBusiness?.country || updatedProfile.country,
 };

 return NextResponse.json(responseData);
 } catch (error) {
 console.error('Unexpected error:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}