import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const businessProfileSchema = z.object({
 name: z.string().optional().nullable(),
 email: z.string().optional().nullable(),
 phone: z.string().optional().nullable(),
 address: z.string().optional().nullable(),
 city: z.string().optional().nullable(),
 state: z.string().optional().nullable(),
 zip_code: z.string().optional().nullable(),
 country: z.string().optional().nullable(),
 website: z.string().optional().nullable(),
 logo_url: z.string().optional().nullable(),
 registration_number: z.string().optional().nullable(),
 tax_id: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
 try {
 const { supabase } = createClient(request);

 const { data: { user }, error: authError } = await supabase.auth.getUser();
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { data: business, error } = await supabase
 .from('business_profiles')
 .select('*')
 .eq('owner_id', user.id)
 .single();

 if (error && error.code !== 'PGRST116') {
 console.error('Database error:', error);
 return NextResponse.json({ error: 'Failed to fetch business profile' }, { status: 500 });
 }

 if (!business) {
 // Fetch some initial data from profile if business profile doesn't exist
 const { data: profile } = await supabase
 .from('profiles')
 .select('business_name, business_address, city, state, zip_code, country')
 .eq('id', user.id)
 .single();

 // Create a default business profile if it doesn't exist
 const { data: newBusiness, error: insertError } = await supabase
 .from('business_profiles')
 .insert({
 owner_id: user.id,
 name: profile?.business_name || 'My Business',
 address: profile?.business_address,
 city: profile?.city,
 state: profile?.state,
 zip_code: profile?.zip_code,
 country: profile?.country,
 status: 'active'
 })
 .select()
 .single();

 if (insertError) {
 console.error('Failed to create default business profile:', insertError);
 return NextResponse.json({ error: 'Failed to create business profile' }, { status: 500 });
 }

 return NextResponse.json(newBusiness);
 }

 return NextResponse.json(business);
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
 const validation = businessProfileSchema.safeParse(body);

 if (!validation.success) {
 return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
 }

 const updateData = validation.data;

 const { data: business, error } = await supabase
 .from('business_profiles')
 .update(updateData)
 .eq('owner_id', user.id)
 .select()
 .single();

 if (error) {
 console.error('Database error:', error);
 return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 });
 }

 return NextResponse.json(business);
 } catch (error) {
 console.error('Unexpected error:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
