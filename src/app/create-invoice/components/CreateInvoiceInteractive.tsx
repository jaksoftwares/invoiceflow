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
import { useInvoiceItems } from '@/lib/hooks/useInvoiceItems';
import { createInvoiceAction } from '@/lib/actions/invoices';
import { createInvoiceItemAction } from '@/lib/actions/invoiceItems';
import type { Client, InvoiceItem } from '@/types/database';

interface CreateInvoiceInteractiveProps {
  initialClients: Client[];
}

interface InvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
}

const CreateInvoiceInteractive = ({ initialClients }: CreateInvoiceInteractiveProps) => {
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
  const [currency, setCurrency] = useState('USD');

  // Use the clients hook for client management
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    createClient,
    refetch: refetchClients,
  } = useClients({ autoFetch: false }); // Don't auto-fetch since we have initial data
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
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    setInvoiceDetails({
      invoiceNumber: `INV-${Date.now().toString().slice(-9)}`,
      issueDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
      paymentTerms: 'net30',
    });

    // Initialize clients state with initial data
    if (initialClients.length > 0) {
      // Note: useClients hook manages its own state, so we don't set it directly
      // The hook will fetch fresh data, but we can use initialClients for immediate display
    }
  }, [initialClients]);

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

  const handleSaveDraft = async () => {
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
        status: 'draft' as const,
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
      };

      const invoice = await createInvoiceAction(invoiceData);

      // Create invoice items
      for (const item of lineItems) {
        await createInvoiceItemAction(invoice.id, {
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        });
      }

      alert('Invoice draft saved successfully!');
      router.push('/invoice-management');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError(error instanceof Error ? error.message : 'Failed to save invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!validateForm()) return;
    alert('PDF generation feature will download the invoice as a PDF file');
  };

  const handleSendInvoice = async () => {
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
        status: 'sent' as const,
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
      };

      const invoice = await createInvoiceAction(invoiceData);

      // Create invoice items
      for (const item of lineItems) {
        await createInvoiceItemAction(invoice.id, {
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        });
      }

      alert(`Invoice sent successfully to ${selectedClient.email || selectedClient.contact_person || selectedClient.company_name}!`);
      router.push('/invoice-management');
    } catch (error) {
      console.error('Error sending invoice:', error);
      setError(error instanceof Error ? error.message : 'Failed to send invoice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated) {
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
              <h1 className="text-3xl font-heading font-bold text-foreground">Create Invoice</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Generate professional invoices for your clients
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
                <LineItemsTable items={lineItems} onItemsChange={setLineItems} currency={currency} />
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
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="DocumentDuplicateIcon" size={18} />
                  <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                </button>
                <button
                  onClick={handleGeneratePDF}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
                >
                  <Icon name="ArrowDownTrayIcon" size={18} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleSendInvoice}
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="PaperAirplaneIcon" size={18} />
                  <span>{isSaving ? 'Sending...' : 'Send Invoice'}</span>
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
              <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
                <InvoicePreview
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

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />
    </>
  );
};

export default CreateInvoiceInteractive;