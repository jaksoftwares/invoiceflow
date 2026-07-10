


import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import CreateInvoiceInteractive from './components/CreateInvoiceInteractive';
import { createClient } from '@/lib/supabase/server';
import type { Client, Product } from '@/types/database';

export const metadata: Metadata = {
 title: 'Create Invoice - InvoiceFlow',
 description: 'Generate professional invoices with customizable templates, automated calculations, and real-time preview for your business clients.',
};

async function getInitialClients(): Promise<Client[]> {
 const supabase = createClient();

 const { data: { user }, error: authError } = await supabase.auth.getUser();
 if (authError || !user) {
 return [];
 }

 const { data: clients, error } = await supabase
 .from('clients')
 .select('*')
 .eq('user_id', user.id)
 .eq('status', 'active')
 .order('company_name', { ascending: true })
 .limit(50);

 if (error) {
 console.error('Error fetching clients:', error);
 return [];
 }

 return clients || [];
}

async function getInitialProducts(): Promise<Product[]> {
 const supabase = createClient();

 const { data: { user }, error: authError } = await supabase.auth.getUser();
 if (authError || !user) {
 return [];
 }

 const { data: products, error } = await supabase
 .from('products')
 .select('*')
 .eq('user_id', user.id)
 .order('name', { ascending: true });

 if (error) {
 console.error('Error fetching products:', error);
 return [];
 }

 return products || [];
}

interface CreateInvoicePageProps {
 searchParams: { [key: string]: string | string[] | undefined };
}

import { redirect } from 'next/navigation';

export default async function CreateInvoicePage({ searchParams }: CreateInvoicePageProps) {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();

 if (!user) {
 redirect('/auth/login');
 }

 const [initialClients, initialProducts] = await Promise.all([
 getInitialClients(),
 getInitialProducts(),
 ]);
 const editId = typeof searchParams.edit === 'string' ? searchParams.edit : undefined;
 const duplicateId = typeof searchParams.duplicate === 'string' ? searchParams.duplicate : undefined;

 return (
 <NavigationWrapper>
 <CreateInvoiceInteractive 
 initialClients={initialClients} 
 initialProducts={initialProducts}
 editId={editId} 
 duplicateId={duplicateId} 
 />
 </NavigationWrapper>
 );
}