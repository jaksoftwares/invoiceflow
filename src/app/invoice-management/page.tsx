import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import InvoiceManagementInteractive from './components/InvoiceManagementInteractive';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/types/database';

export const metadata: Metadata = {
  title: 'Invoice Management - InvoiceFlow',
  description: 'Track and manage all your business invoices with comprehensive filtering, search, and bulk operations for efficient billing workflows.',
};

async function getInitialInvoices(): Promise<Invoice[]> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return [];
  }

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (
        company_name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50); // Load initial 50 invoices

  if (error) {
    console.error('Failed to fetch initial invoices:', error);
    return [];
  }

  return invoices || [];
}

export default async function InvoiceManagementPage() {
  const initialInvoices = await getInitialInvoices();

  return (
    <NavigationWrapper>
      <InvoiceManagementInteractive initialInvoices={initialInvoices} />
    </NavigationWrapper>
  );
}