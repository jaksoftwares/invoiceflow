import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import InvoiceManagementInteractive from './components/InvoiceManagementInteractive';

export const metadata: Metadata = {
  title: 'Invoice Management - InvoiceFlow',
  description: 'Track and manage all your business invoices with comprehensive filtering, search, and bulk operations for efficient billing workflows.',
};

export default function InvoiceManagementPage() {
  return (
    <NavigationWrapper>
      <InvoiceManagementInteractive />
    </NavigationWrapper>
  );
}