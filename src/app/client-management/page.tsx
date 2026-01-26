import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import ClientManagementInteractive from './components/ClientManagementInteractive';
import { createClient } from '@/lib/supabase/server';
import type { Client } from '@/types/database';

export const metadata: Metadata = {
  title: 'Client Management - InvoiceFlow',
  description: 'Manage your client database with comprehensive contact details, billing history, and relationship tracking for streamlined business operations.',
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
    .order('created_at', { ascending: false })
    .limit(50); // Load initial 50 clients

  if (error) {
    console.error('Failed to fetch initial clients:', error);
    return [];
  }

  return clients || [];
}

export default async function ClientManagementPage() {
  const initialClients = await getInitialClients();

  return (
    <NavigationWrapper>
      <ClientManagementInteractive initialClients={initialClients} />
    </NavigationWrapper>
  );
}