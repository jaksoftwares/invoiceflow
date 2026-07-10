import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { z } from 'zod';
import * as subService from '@/lib/services/subscription-service';

const productSchema = z.object({
 name: z.string().min(1, 'Product name is required'),
 description: z.string().optional(),
 price: z.number().min(0, 'Price must be positive'),
 unit: z.string().default('item'),
 category: z.string().optional(),
});

export async function GET(request: NextRequest) {
 try {
 const { supabase } = createClient(request);
 const { data: { user }, error: authError } = await supabase.auth.getUser();
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { data: products, error } = await supabase
 .from('products')
 .select('*')
 .eq('user_id', user.id)
 .order('name', { ascending: true });

 if (error) {
 console.error('Database error:', error);
 return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
 }

 return NextResponse.json({ products });
 } catch (error) {
 console.error('Unexpected error:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}

export async function POST(request: NextRequest) {
 try {
 const { supabase } = createClient(request);
 const { data: { user }, error: authError } = await supabase.auth.getUser();
 
 if (authError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 // Check usage limit
 const usageCheck = await subService.checkUsageLimit(supabase, user.id, 'products_created');
 if (!usageCheck.allowed) {
 return NextResponse.json({ error: 'Product limit reached', details: usageCheck.reason }, { status: 403 });
 }

 const body = await request.json();
 const validationResult = productSchema.safeParse(body);

 if (!validationResult.success) {
 return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
 }

 const productData = {
 ...validationResult.data,
 user_id: user.id
 };

 const { data: product, error } = await supabase
 .from('products')
 .insert(productData)
 .select()
 .single();

 if (error) {
 console.error('Database error:', error);
 return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
 }

 // Increment usage
 await subService.incrementUsage(supabase, user.id, 'products_created');
 await subService.logActivity(supabase, user.id, 'product_created', product.id, { name: product.name });

 return NextResponse.json(product, { status: 201 });
 } catch (error) {
 console.error('Unexpected error:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
