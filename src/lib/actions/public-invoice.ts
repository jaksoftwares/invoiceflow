'use server';

import { createClient } from '@/lib/supabase/server';
import type { Invoice, InvoiceItem, BusinessProfile, Client } from '@/types/database';

export interface PublicInvoiceData {
 invoice: Invoice;
 items: InvoiceItem[];
 business: Partial<BusinessProfile>;
 client: Partial<Client>;
}

export async function getPublicInvoice(slugOrId: string): Promise<PublicInvoiceData | null> {
 const supabase = createClient();

 // Use the secure RPC function to fetch public invoice data
 const { data, error } = await supabase.rpc('get_public_invoice', {
 p_identifier: slugOrId
 });

 if (error) {
 console.error('Error fetching public invoice:', error);
 return null;
 }

 if (!data) {
 return null;
 }

 // Cast the JSON result to our types
 // The RPC returns { invoice: ..., items: [...], business: {...}, client: {...} }
 return data as PublicInvoiceData;
}
