import { notFound } from 'next/navigation';
import { getPublicInvoice } from '@/lib/actions/public-invoice';
import InvoicePreview from '@/app/create-invoice/components/InvoicePreview';
import type { InvoiceItem, BusinessProfile, Client } from '@/types/database';

export default async function InvoiceViewPage({ params }: { params: { slug: string } }) {
  const data = await getPublicInvoice(params.slug);

  if (!data) {
    notFound();
  }

  const { invoice, items, business, client } = data;

  // Enhance business profile with default values if partial
  const businessProfile: BusinessProfile = {
    id: invoice.business_id || '',
    owner_id: business.owner_id || '',
    name: business.name || '',
    address: business.address,
    city: business.city,
    state: business.state,
    zip_code: business.zip_code,
    country: business.country,
    tax_id: business.tax_id,
    logo_url: business.logo_url,
    status: 'active', // Default
    created_at: '',
    updated_at: '',
  };

  // Enhance client profile
  const clientProfile: Client = {
    id: invoice.client_id,
    user_id: '', // Not needed for display
    company_name: client.company_name || 'Client',
    contact_person: client.contact_person,
    email: client.email,
    address: client.address,
    total_billed: 0,
    outstanding_balance: 0,
    status: 'active',
    billing_frequency: 'one-time',
    created_at: '',
    updated_at: '',
  };

  const invoiceDetails = {
    invoiceNumber: invoice.invoice_number,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paymentTerms: invoice.payment_terms,
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          <InvoicePreview
            businessProfile={businessProfile}
            client={clientProfile}
            details={invoiceDetails}
            items={items}
            taxRate={invoice.tax_rate}
            discount={invoice.discount}
            currency={invoice.currency}
            notes={invoice.notes || ''}
            terms={invoice.terms || ''}
            selectedTemplate={invoice.template}
          />
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by InvoiceFlow</p>
        </div>
      </div>
    </div>
  );
}
