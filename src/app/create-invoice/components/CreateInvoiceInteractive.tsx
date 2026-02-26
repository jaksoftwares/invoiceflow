'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import ClientSelector from './ClientSelector';
import InvoiceDetailsForm from './InvoiceDetailsForm';
import LineItemsTable from './LineItemsTable';
import InvoiceCalculations from './InvoiceCalculations';
import InvoicePreview from './InvoicePreview';
import TemplateSelector from './TemplateSelector';
import AdditionalDetailsForm from './AdditionalDetailsForm';
import AddClientModal from './AddClientModal';
import { useClients } from '@/lib/hooks/useClients';
import { createInvoiceAction, updateInvoiceAction } from '@/lib/actions/invoices';
import { supabase } from '@/lib/supabase/client';
import { useInvoicePDF } from '@/lib/hooks/useInvoicePDF';
import { useSettings } from '@/lib/hooks/useSettings';
import type { Client, InvoiceItem, BusinessProfile, Product } from '@/types/database';

interface CreateInvoiceInteractiveProps {
  initialClients: Client[];
  initialProducts: Product[];
  editId?: string;
  duplicateId?: string;
}

interface InvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
}

const CreateInvoiceInteractive = ({ initialClients, initialProducts, editId, duplicateId }: CreateInvoiceInteractiveProps) => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    paymentTerms: '',
  });
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [currency, setCurrency] = useState('KES');

  // Business Profile State
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Use the clients hook for client management
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    createClient,
    refetch: refetchClients,
  } = useClients({ autoFetch: false }); // Don't auto-fetch since we have initial data

  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.default_currency && !editId && !duplicateId) {
      setCurrency(settings.default_currency);
    }
  }, [settings, editId, duplicateId]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showPreview, setShowPreview] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    
    // Only set default values if NOT editing
    if (!editId) {
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setInvoiceDetails({
        invoiceNumber: `INV-${Date.now().toString().slice(-9)}`,
        issueDate: today,
        dueDate: dueDate.toISOString().split('T')[0],
        paymentTerms: 'net30',
      });
    }

    // Initialize clients state with initial data
    if (initialClients.length > 0) {
      // Note: useClients hook manages its own state, so we don't set it directly
    }

    // Fetch Business Profiles
    const fetchBusinessProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('status', 'active');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setBusinessProfiles(data);
          // Only default if not editing or if fetchInvoice hasn't set it yet
          if (!editId) {
            setSelectedBusiness(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching business profiles:', err);
      } finally {
        setLoadingBusiness(false);
      }
    };

    fetchBusinessProfiles();
  }, [initialClients, editId]);

  // Fetch Invoice for Edited or Duplicated data
  useEffect(() => {
    const fetchInvoice = async () => {
      const sourceId = editId || duplicateId;
      if (!sourceId) return;

      setLoadingInvoice(true);
      try {
        const { data: invoice, error } = await supabase
          .from('invoices')
          .select(`
            *,
            items:invoice_items(*),
            client:clients(*)
          `)
          .eq('id', sourceId)
          .single();

        if (error) throw error;
        if (!invoice) throw new Error('Invoice not found');

        // Populate State
        setSelectedClient(invoice.client as unknown as Client); 
        
        // If duplicating, keep new invoice number and dates
        // If editing, use existing invoice number and dates
        if (editId) {
          setInvoiceDetails({
            invoiceNumber: invoice.invoice_number,
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            paymentTerms: invoice.payment_terms,
          });
        }
        // If duplicateId, we already set defaults in previous effect (isHydrated effect)
        // But we might want to carry over payment terms?
        if (duplicateId) {
           setInvoiceDetails(prev => ({
             ...prev,
             paymentTerms: invoice.payment_terms
           }));
        }
        
        // Transform items to match InvoiceItem type
        if (invoice.items) {
          setLineItems(invoice.items.map((item: any) => ({
            ...item,
            id: duplicateId ? `temp-${Math.random().toString(36).substr(2, 9)}` : item.id,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            amount: Number(item.amount),
          })));
        }

        setTaxRate(Number(invoice.tax_rate) || 0);
        setDiscount(Number(invoice.discount) || 0);
        setCurrency(invoice.currency || 'KES');
        setNotes(invoice.notes || '');
        setTerms(invoice.terms || '');
        setPaymentInstructions(invoice.payment_instructions || '');
        setSelectedTemplate(invoice.template || 'professional');

        // Business Profile
        if (invoice.business_id) {
            const { data: business } = await supabase
              .from('business_profiles')
              .select('*')
              .eq('id', invoice.business_id)
              .single();
            if (business) setSelectedBusiness(business);
        }

      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice details.');
      } finally {
        setLoadingInvoice(false);
      }
    };

    fetchInvoice();
  }, [editId, duplicateId]);


  const handleClientAdded = async (clientData: { company_name: string; contact_person?: string; email?: string; phone?: string; address?: string }) => {
    const newClient = await createClient({
      ...clientData,
      status: 'active',
      billing_frequency: 'one-time',
    });
    if (newClient) {
      setSelectedClient(newClient);
      refetchClients(); // Refresh the clients list
    }
  };

  const validateForm = () => {
    if (!selectedClient) {
      alert('Please select a client');
      return false;
    }
    if (!invoiceDetails.invoiceNumber) {
      alert('Please enter an invoice number');
      return false;
    }
    if (!invoiceDetails.issueDate) {
      alert('Please select an issue date');
      return false;
    }
    if (!invoiceDetails.dueDate) {
      alert('Please select a due date');
      return false;
    }
    if (!invoiceDetails.paymentTerms) {
      alert('Please select payment terms');
      return false;
    }
    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return false;
    }
    const hasEmptyDescription = lineItems.some((item) => !item.description.trim());
    if (hasEmptyDescription) {
      alert('Please fill in all line item descriptions');
      return false;
    }
    return true;
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!validateForm()) return;
    if (!selectedClient) return;

    setIsSaving(true);
    setError(null);
    try {
      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount - discount;

      const invoiceData = {
        client_id: selectedClient.id,
        invoice_number: invoiceDetails.invoiceNumber,
        issue_date: invoiceDetails.issueDate,
        due_date: invoiceDetails.dueDate,
        payment_terms: invoiceDetails.paymentTerms,
        status: status,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount,
        total_amount: totalAmount,
        currency,
        notes,
        terms,
        payment_instructions: paymentInstructions,
        template: selectedTemplate,
        business_id: selectedBusiness?.id,
        items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      };

      if (editId) {
        await updateInvoiceAction(editId, invoiceData);
        alert(`Invoice ${status === 'draft' ? 'updated' : 'sent'} successfully!`);
      } else {
        await createInvoiceAction(invoiceData);
        alert(`Invoice ${status === 'draft' ? 'saved' : 'sent'} successfully!`);
      }

      router.push('/invoice-management');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError(error instanceof Error ? error.message : 'Failed to save invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* Hook for PDF Generation */
  const { generatePDF } = useInvoicePDF();

  const handleGeneratePDF = async () => {
    if (!validateForm()) return;

    // Generate PDF from the hidden full-size container
    // Create descriptive filename: Invoice-INV-number-client-name.pdf
    const invoiceNum = invoiceDetails.invoiceNumber || 'draft';
    const clientName = selectedClient?.company_name 
      ? selectedClient.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'no-client';
    const fileName = `Invoice-${invoiceNum}-${clientName}.pdf`.toLowerCase();
    await generatePDF({ fileName });
  };

  if (!isHydrated || loadingInvoice) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-12 bg-muted rounded-md animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted rounded-md animate-pulse" />
              <div className="h-64 bg-muted rounded-md animate-pulse" />
            </div>
            <div className="h-96 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">
                {editId ? 'Edit Invoice' : duplicateId ? 'Duplicate Invoice' : 'Create Invoice'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {editId ? 'Update existing invoice details' : duplicateId ? 'Create a new invoice from existing details' : 'Generate professional invoices for your clients'}
              </p>
            </div>
            <button
              onClick={() => router.push('/invoice-management')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-smooth"
            >
              <Icon name="ArrowLeftIcon" size={18} />
              <span className="hidden sm:inline">Back to Invoices</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-md">
              <div className="flex items-center gap-2">
                <Icon name="ExclamationTriangleIcon" size={20} className="text-error" />
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-md p-6 shadow-elevation-1">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Business Profile</h2>
                {loadingBusiness ? (
                  <div className="h-10 bg-muted rounded animate-pulse" />
                ) : (
                  <div className="space-y-4">
                     {businessProfiles.length > 0 ? (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Select Business Profile</label>
                          <select
                            className="w-full px-4 py-2.5 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                            value={selectedBusiness?.id || ''}
                            onChange={(e) => {
                              const business = businessProfiles.find(b => b.id === e.target.value);
                              setSelectedBusiness(business || null);
                            }}
                          >
                            {businessProfiles.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                     ) : (
                       <p className="text-sm text-yellow-500">No active business profiles found. Please create one in user settings.</p>
                     )}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-md p-6 shadow-elevation-1">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Invoice Details</h2>
                <div className="space-y-6">
                  <ClientSelector
                    clients={clients.length > 0 ? clients : initialClients}
                    selectedClient={selectedClient}
                    onClientSelect={setSelectedClient}
                    onAddNewClient={() => setIsAddClientModalOpen(true)}
                    loading={clientsLoading}
                    error={clientsError}
                  />
                  <InvoiceDetailsForm details={invoiceDetails} onDetailsChange={setInvoiceDetails} />
                </div>
              </div>

              <div className="bg-card border border-border rounded-md p-6 shadow-elevation-1">
                <LineItemsTable 
                  items={lineItems} 
                  onItemsChange={setLineItems} 
                  currency={currency} 
                  products={initialProducts} 
                />
              </div>

              <div className="bg-card border border-border rounded-md p-6 shadow-elevation-1">
                <InvoiceCalculations
                  items={lineItems}
                  taxRate={taxRate}
                  discount={discount}
                  currency={currency}
                  onTaxRateChange={setTaxRate}
                  onDiscountChange={setDiscount}
                  onCurrencyChange={setCurrency}
                />
              </div>

              <div className="bg-card border border-border rounded-md p-6 shadow-elevation-1">
                <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />
              </div>

              <div className="bg-card border border-border rounded-md p-6 shadow-elevation-1">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Additional Information</h2>
                <AdditionalDetailsForm
                  notes={notes}
                  terms={terms}
                  paymentInstructions={paymentInstructions}
                  onNotesChange={setNotes}
                  onTermsChange={setTerms}
                  onPaymentInstructionsChange={setPaymentInstructions}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="DocumentDuplicateIcon" size={18} />
                  <span>{isSaving ? 'Saving...' : (editId ? 'Update Draft' : 'Save Draft')}</span>
                </button>
                <button
                  onClick={handleGeneratePDF}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
                >
                  <Icon name="ArrowDownTrayIcon" size={18} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                     // If it's a new invoice, save it first, then open share modal?
                     // Or just open share modal and save on send?
                     // For better UX, let's open share modal if validation passes.
                     if (validateForm()) {
                        // We need to implement share logic here similar to InvoiceManagement
                        // But since we might be in 'create' mode without an ID, we should probably save first.
                        handleSave('sent');
                     }
                  }}
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="PaperAirplaneIcon" size={18} />
                  <span>{isSaving ? 'Sending...' : (editId ? 'Update & Send' : 'Save & Share')}</span>
                </button>
              </div>
            </div>

            <div className="lg:sticky lg:top-20 lg:self-start">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">Live Preview</h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium transition-smooth"
                >
                  <Icon name={showPreview ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                  <span>{showPreview ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div id="invoice-preview-container" className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
                <InvoicePreview
                  businessProfile={selectedBusiness}
                  client={selectedClient}
                  details={invoiceDetails}
                  items={lineItems}
                  taxRate={taxRate}
                  discount={discount}
                  currency={currency}
                  notes={notes}
                  terms={terms}
                  selectedTemplate={selectedTemplate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size container for PDF generation - positioned off-screen but visible to html2canvas */}
      <div className="fixed" style={{ left: '-9999px', top: '0', width: '210mm', height: '297mm' }}>
        <div id="invoice-pdf-container" className="w-[210mm] min-h-[297mm] bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
          <InvoicePreview
            businessProfile={selectedBusiness}
            client={selectedClient}
            details={invoiceDetails}
            items={lineItems}
            taxRate={taxRate}
            discount={discount}
            currency={currency}
            notes={notes}
            terms={terms}
            selectedTemplate={selectedTemplate}
            fullSize={true}
          />
        </div>
      </div>

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />
    </>
  );
};

export default CreateInvoiceInteractive;