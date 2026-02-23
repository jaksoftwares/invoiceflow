import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import InvoicePreview from '@/app/create-invoice/components/InvoicePreview';
import type { BusinessProfile, Client } from '@/types/database';

interface PublicInvoicePageProps {
  params: {
    slug: string;
  };
}

export default async function PublicInvoicePage({ params }: PublicInvoicePageProps) {
  const supabase = createClient();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, invoice_items(*), clients(*), business_profiles(*)')
    .eq('slug', params.slug)
    .single();

  if (error || !invoice) {
    console.error('Invoice fetch error:', error);
    notFound();
  }

  // Map database results to our common types
  const businessProfile: BusinessProfile = {
    ...invoice.business_profiles,
    email: invoice.business_profiles?.email || '',
    phone: invoice.business_profiles?.phone || '',
    website: invoice.business_profiles?.website || '',
  };
  
  const client: Client = invoice.clients;
  const items = invoice.invoice_items;

  const invoiceDetails = {
    invoiceNumber: invoice.invoice_number,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paymentTerms: invoice.payment_terms,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Invoice Preview</h2>
                    <p className="text-xs text-slate-500">Public View</p>
                </div>
            </div>
            <div className="flex gap-4">
                 <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Pay Now
                 </button>
            </div>
        </div>

        <div id="invoice-preview-container">
           <InvoicePreview
            businessProfile={businessProfile}
            client={client}
            details={invoiceDetails}
            items={items}
            taxRate={invoice.tax_rate}
            discount={invoice.discount}
            currency={invoice.currency}
            notes={invoice.notes}
            terms={invoice.terms}
            selectedTemplate={invoice.template}
           />
        </div>
        
        <div className="text-center pb-12">
            <p className="text-xs text-slate-400">
                This invoice was generated via <span className="font-bold text-slate-600">InvoiceFlow</span>.
            </p>
        </div>
      </div>
    </div>
  );
}
