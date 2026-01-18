import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import ClientManagementInteractive from './components/ClientManagementInteractive';

export const metadata: Metadata = {
  title: 'Client Management - InvoiceFlow',
  description: 'Manage your client database with comprehensive contact details, billing history, and relationship tracking for streamlined business operations.',
};

export default function ClientManagementPage() {
  return (
    <NavigationWrapper>
      <ClientManagementInteractive />
    </NavigationWrapper>
  );
}