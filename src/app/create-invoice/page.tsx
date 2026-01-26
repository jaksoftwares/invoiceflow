import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import CreateInvoiceInteractive from './components/CreateInvoiceInteractive';
import { createClient } from '@/lib/supabase/server';
import type { Client } from '@/types/database';

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

export default async function CreateInvoicePage() {
  const initialClients = await getInitialClients();

  return (
    <NavigationWrapper>
      <CreateInvoiceInteractive initialClients={initialClients} />
    </NavigationWrapper>
  );
}