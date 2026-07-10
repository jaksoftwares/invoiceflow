import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

cloudinary.config({
 cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
 secure: true,
});

export async function POST(request: Request) {
 const supabase = createClient();
 const { data: { user }, error } = await supabase.auth.getUser();

 if (error || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 try {
 const { folder = 'invoiceflow_uploads' } = await request.json();
 
 // Generate signature
 const timestamp = Math.round(new Date().getTime() / 1000);
 const signature = cloudinary.utils.api_sign_request(
 {
 timestamp,
 folder,
 // Eager transformations or other params can be added here
 },
 process.env.CLOUDINARY_API_SECRET!
 );

 return NextResponse.json({
 signature,
 timestamp,
 cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
 apiKey: process.env.CLOUDINARY_API_KEY,
 folder
 });
 } catch (err) {
 console.error('Cloudinary signing error:', err);
 return NextResponse.json({ error: 'Signing failed' }, { status: 500 });
 }
}
