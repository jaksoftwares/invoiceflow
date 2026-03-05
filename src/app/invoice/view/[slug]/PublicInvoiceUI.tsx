'use client';

import { useInvoicePDF } from '@/lib/hooks/useInvoicePDF';
import InvoicePreview from '@/app/create-invoice/components/InvoicePreview';
import type { BusinessProfile, Client, InvoiceItem } from '@/types/database';
import Icon from '@/components/ui/AppIcon';

interface PublicInvoiceUIProps {
  invoice: any;
  businessProfile: BusinessProfile;
  client: Client;
  items: InvoiceItem[];
}

export default function PublicInvoiceUI({ 
  invoice, 
  businessProfile, 
  client, 
  items 
}: PublicInvoiceUIProps) {
  const { generatePDF } = useInvoicePDF();

  const handleDownload = () => {
    generatePDF({
      fileName: `Invoice-${invoice.invoice_number || 'download'}.pdf`,
      watermarkEnabled: true
    });
  };

  const invoiceDetails = {
    invoiceNumber: invoice.invoice_number,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    paymentTerms: invoice.payment_terms,
  };

  const showPublicStatus = invoice.status && !['draft', 'archived', 'deleted'].includes(invoice.status.toLowerCase());
  const displayStatus = invoice.status === 'unpaid' ? 'Pending' : invoice.status;

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1000px] mx-auto space-y-6">
        {/* Professional Header */}
        <div className="bg-white px-6 py-4 rounded-[2rem] shadow-elevation-2 border border-slate-200/50 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-50 backdrop-blur-md bg-white/90">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary overflow-hidden border border-primary/10">
                    {businessProfile.logo_url ? (
                      <img src={businessProfile.logo_url} alt={businessProfile.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="font-black text-2xl uppercase tracking-tighter">{businessProfile.name?.charAt(0)}</div>
                    )}
                </div>
                <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-tighter leading-tight">{businessProfile.name || 'Official Invoice'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] opacity-70">Secured Portal</p>
                      {showPublicStatus && (
                        <>
                          <span className="text-[10px] text-slate-300">•</span>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${invoice.status?.toLowerCase() === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {displayStatus}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
                 <button 
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95 border border-slate-200/50"
                 >
                    <Icon name="ArrowDownTrayIcon" size={16} />
                    <span>Download</span>
                 </button>
                 <button className="flex-1 sm:flex-none px-10 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-elevation-3 active:scale-95">
                    Pay KES {invoice.total_amount?.toLocaleString()}
                 </button>
            </div>
        </div>

        {/* Invoice Body */}
        <div id="invoice-preview-container" className="overflow-x-auto sm:overflow-visible pb-4">
           <div className="min-w-[700px] sm:min-w-0 bg-white rounded-3xl overflow-hidden shadow-elevation-1 border border-slate-200/50">
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
              fullSize={true}
             />
           </div>
        </div>
        
        {/* Security / Footer */}
        <div className="flex flex-col items-center gap-6 py-10 border-t border-slate-200/40">
            {showPublicStatus && (
              <div className="flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-2xl">
                  <div className={`w-2.5 h-2.5 rounded-full ${invoice.status?.toLowerCase() === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Document Status: {displayStatus}
                  </span>
              </div>
            )}
            
            <div className="text-center space-y-2">
              <p className="text-[11px] text-slate-400 font-medium">
                  Official Statement Secured by <span className="font-black text-slate-900 tracking-tighter">InvoiceFlow.</span>
              </p>
              <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <span>End-to-end Encrypted</span>
                <span>•</span>
                <span>Verified Issuer</span>
                <span>•</span>
                <span>Professional Standard</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
