import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import CreateInvoiceInteractive from './components/CreateInvoiceInteractive';

export const metadata: Metadata = {
  title: 'Create Invoice - InvoiceFlow',
  description: 'Generate professional invoices with customizable templates, automated calculations, and real-time preview for your business clients.',
};

export default function CreateInvoicePage() {
  return (
    <NavigationWrapper>
      <CreateInvoiceInteractive />
    </NavigationWrapper>
  );
}