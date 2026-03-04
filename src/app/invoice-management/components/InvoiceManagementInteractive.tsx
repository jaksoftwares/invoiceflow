'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import InvoiceFilters from './InvoiceFilters';
import InvoiceSearch from './InvoiceSearch';
import BulkActionToolbar from './BulkActionToolbar';
import InvoiceTableRow from './InvoiceTableRow';
import { toast } from 'sonner';
import ShareInvoiceModal from '@/components/modals/ShareInvoiceModal';
import InvoiceCard from './InvoiceCard';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useClients } from '@/lib/hooks/useClients';
import { checkUsageLimit } from '@/lib/actions/subscription';
import PlanLimitModal from '@/components/modals/PlanLimitModal';
import { sendInvoiceEmail } from '@/lib/actions/email';
import { useInvoicePDF } from '@/lib/hooks/useInvoicePDF';
import { supabase } from '@/lib/supabase/client';
import InvoicePreview from '@/app/create-invoice/components/InvoicePreview';
import MetricCard from '@/app/dashboard/components/MetricCard';
import type { Invoice } from '@/types/database';

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
    email?: string;
    address?: string;
    contact_person?: string;
  };
  business?: {
    id: string;
    name: string;
    logo_url?: string;
    address?: string;
    city?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
}

interface FilterState {
  dateRange: { start: string; end: string };
  paymentStatus: string;
  client: string;
  amountRange: { min: string; max: string };
}

interface InvoiceManagementInteractiveProps {
  initialInvoices: InvoiceWithClient[];
}

const InvoiceManagementInteractive = ({ initialInvoices }: InvoiceManagementInteractiveProps) => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    paymentStatus: 'all',
    client: 'all',
    amountRange: { min: '', max: '' }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const {
    invoices,
    loading,
    error,
    pagination,
    updateInvoice,
    deleteInvoice,
    bulkDeleteInvoices,
    bulkUpdateStatus,
    stats: liveStats,
    refetch,
  } = useInvoices({
    page: currentPage,
    limit: itemsPerPage,
    status: filters.paymentStatus !== 'all' ? filters.paymentStatus as Invoice['status'] : undefined,
    search: searchQuery || undefined,
    issue_date_from: filters.dateRange.start || undefined,
    issue_date_to: filters.dateRange.end || undefined,
    autoFetch: true,
  });

  const { clients: availableClients } = useClients({ limit: 100 });

  const { generatePDFBase64, downloadFromDOM } = useInvoicePDF();

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithClient | null>(null);
  const [previewInvoiceItems, setPreviewInvoiceItems] = useState<any[]>([]);
  const [previewBusinessProfile, setPreviewBusinessProfile] = useState<any>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitActionInfo, setLimitActionInfo] = useState<{ action: string; current: number; limit: number; allowPayg?: boolean } | null>(null);
  const [selectedInvoiceForShare, setSelectedInvoiceForShare] = useState<InvoiceWithClient | null>(null);

  const isFiltering = searchQuery.length > 0 || 
                      filters.paymentStatus !== 'all' || 
                      filters.client !== 'all' || 
                      filters.amountRange.min !== '' || 
                      filters.amountRange.max !== '';

  // Use server invoices if they exist or if we are actively filtering.
  // Fall back to initial invoices only on first load when nothing is happening.
  const displayInvoices = (invoices.length > 0 || isFiltering) ? invoices : (loading ? [] : initialInvoices);

  const filteredInvoices = displayInvoices.filter(invoice => {
    const matchesSearch = searchQuery === '' ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.clients?.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.paymentStatus === 'all' || invoice.status === filters.paymentStatus;

    const matchesClient = filters.client === 'all' || (invoice.clients?.company_name || '').toLowerCase().replace(/\s+/g,'-') === filters.client;

    const matchesAmount =
      (filters.amountRange.min === '' || invoice.total_amount >= parseFloat(filters.amountRange.min)) &&
      (filters.amountRange.max === '' || invoice.total_amount <= parseFloat(filters.amountRange.max));

    return matchesSearch && matchesStatus && matchesClient && matchesAmount;
  });

  // Calculate default stats from initialInvoices if live stats haven't loaded yet
  const defaultStats = {
    totalRevenue: initialInvoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total_amount : 0), 0),
    pendingAmount: initialInvoices.reduce((sum, inv) => sum + (inv.status === 'sent' || inv.status === 'overdue' ? inv.total_amount : 0), 0),
    totalCount: initialInvoices.length,
    overdueCount: initialInvoices.filter(inv => inv.status === 'overdue').length,
  };

  const activeStats = liveStats || defaultStats;

  const currency = filteredInvoices[0]?.currency || 'KES';
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === 'clientName') {
      aValue = a.clients?.company_name || '';
      bValue = b.clients?.company_name || '';
    } else if (sortConfig.key === 'amount') {
      aValue = a.total_amount;
      bValue = b.total_amount;
    } else if (sortConfig.key === 'issueDate') {
      aValue = a.issue_date;
      bValue = b.issue_date;
    } else if (sortConfig.key === 'dueDate') {
      aValue = a.due_date;
      bValue = b.due_date;
    } else if (sortConfig.key === 'invoiceNumber') {
      aValue = a.invoice_number;
      bValue = b.invoice_number;
    } else {
      aValue = (a as any)[sortConfig.key];
      bValue = (b as any)[sortConfig.key];
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  const totalPages = pagination ? pagination.totalPages : Math.ceil(sortedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = sortedInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices(current =>
      current.includes(id)
        ? current.filter(invoiceId => invoiceId !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === paginatedInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(paginatedInvoices.map(inv => inv.id));
    }
  };

  const handleMarkPaid = async () => {
    if (selectedInvoices.length === 0) return;
    const result = await bulkUpdateStatus(selectedInvoices, 'paid');
    if (result) {
      setSelectedInvoices([]);
    }
  };

  const handleSendReminders = () => {
    console.log('Send reminders:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const handleExportPDF = () => {
    console.log('Export PDF:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0) return;
    const result = await bulkDeleteInvoices(selectedInvoices);
    if (result) {
      setSelectedInvoices([]);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/create-invoice?edit=${id}`);
  };

  const handleDuplicate = (id: string) => {
    router.push(`/create-invoice?duplicate=${id}`);
  };

  const handlePreview = async (id: string) => {
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*, client:clients(*), business:business_profiles(*)')
      .eq('id', id)
      .single();
    
    if (invoiceData) {
      setPreviewInvoice(invoiceData);
      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id);
      setPreviewInvoiceItems(items || []);
      setPreviewBusinessProfile(invoiceData.business);
      setPreviewModalOpen(true);
    }
  };

  const handleDownload = async (id: string) => {
    const invoice = displayInvoices.find((inv: InvoiceWithClient) => inv.id === id);
    if (!invoice) return;

    // Check limit
    const limitCheck = await checkUsageLimit('pdf_downloads');
    if (!limitCheck.allowed) {
      setLimitActionInfo({
        action: 'pdf_downloads',
        limit: limitCheck.limit ?? 0,
        current: limitCheck.current ?? 0,
        allowPayg: limitCheck.allowPayg ?? false
      });
      setLimitModalOpen(true);
      return;
    }
    
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*, client:clients(*), business:business_profiles(*)')
      .eq('id', id)
      .single();
    
    const { data: itemsData } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);
    
    if (invoiceData) {
      setPreviewInvoice(invoiceData);
      setPreviewInvoiceItems(itemsData || []);
      setPreviewBusinessProfile(invoiceData.business);
      setPreviewModalOpen(true);
      
      setTimeout(() => {
        const invoiceNum = (invoiceData.invoice_number || 'draft').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const clientName = invoiceData.client?.company_name 
          ? invoiceData.client.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
          : 'no-client';
        const fileName = `Invoice-${invoiceNum}-${clientName}.pdf`;
        downloadFromDOM(fileName);
      }, 500);
    }
  };

  const handleSend = async (id: string) => {
    const invoice = displayInvoices.find((inv: InvoiceWithClient) => inv.id === id);
    if (invoice) {
      // Check limit
      const limitCheck = await checkUsageLimit('emails_sent');
      if (!limitCheck.allowed) {
        setLimitActionInfo({
          action: 'emails_sent',
          limit: limitCheck.limit ?? 0,
          current: limitCheck.current ?? 0,
          allowPayg: limitCheck.allowPayg ?? false
        });
        setLimitModalOpen(true);
        return;
      }

      setSelectedInvoiceForShare(invoice);
      setShareModalOpen(true);
    }
  };

  const handleSendEmail = async (data: { to: string; subject: string; message: string; copyMe: boolean }) => {
    if (!selectedInvoiceForShare) return;
    const toastId = toast.loading('Sending email...');
    try {
      const pdfBase64 = await generatePDFBase64(selectedInvoiceForShare.id);
      await sendInvoiceEmail(selectedInvoiceForShare.id, pdfBase64, data);
      toast.success('Email sent successfully!', { id: toastId });
      setShareModalOpen(false);
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email.', { id: toastId });
    }
  };

  const handleCopyLink = async () => {
    if (selectedInvoiceForShare) {
       const link = `${window.location.origin}/invoice/view/${selectedInvoiceForShare.slug || selectedInvoiceForShare.id}`;
       await navigator.clipboard.writeText(link);
       toast.success('Link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = () => {
    if (selectedInvoiceForShare) {
      const link = `${window.location.origin}/invoice/view/${selectedInvoiceForShare.slug || selectedInvoiceForShare.id}`;
      const text = `Hi, please find your invoice here: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      setShareModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteInvoice(id);
  };

  const handleMarkAsPaid = async (id: string) => {
    await updateInvoice(id, { status: 'paid' });
    refetch(); // Refresh to update stats and list
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex-1">
            <h1 className="text-4xl font-heading font-black text-foreground tracking-tight sm:text-5xl">
              Invoice Management
            </h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl font-medium">
              View and manage all your invoices in one place.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
             <button 
               onClick={() => router.push('/create-invoice')}
               className="w-full sm:w-auto bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-black text-sm shadow-elevation-2 hover:shadow-elevation-4 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 group"
             >
               <Icon name="PlusCircleIcon" size={20} className="group-hover:rotate-90 transition-transform duration-500" />
               <span>New Invoice</span>
             </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Total Collected"
            value={formatCurrency(activeStats.totalRevenue)}
            icon="BanknotesIcon" 
            trend="up"
          />
          <MetricCard
            title="Pending Dues"
            value={formatCurrency(activeStats.pendingAmount)}
            icon="ClockIcon" 
          />
          <MetricCard
            title="Total Documents"
            value={activeStats.totalCount.toString()}
            icon="DocumentTextIcon" 
          />
          <MetricCard
            title="Overdue Alerts"
            value={activeStats.overdueCount.toString()}
            icon="ExclamationCircleIcon" 
            trend={activeStats.overdueCount > 0 ? 'down' : undefined}
          />
        </div>

        <div className="flex flex-col gap-6 mb-10">
          <div className="w-full">
            <InvoiceSearch onSearch={setSearchQuery} />
          </div>
          <div className="w-full">
            <InvoiceFilters 
              onFilterChange={setFilters} 
              totalResults={filteredInvoices.length} 
              availableClients={availableClients.map(c => ({ id: c.id, name: c.company_name }))}
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="hidden lg:block bg-card rounded-lg shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border text-left">
                <tr>
                  <th className="px-5 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-4 text-sm font-bold text-foreground">Invoice #</th>
                  <th className="px-5 py-4 text-sm font-bold text-foreground">Client</th>
                  <th className="px-5 py-4 text-sm font-bold text-foreground">Amount</th>
                  <th className="px-5 py-4 text-sm font-bold text-foreground">Date</th>
                  <th className="px-5 py-4 text-sm font-bold text-foreground">Due Date</th>
                  <th className="px-5 py-4 text-sm font-bold text-foreground">Status</th>
                  <th className="px-5 py-4 text-sm font-bold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map(invoice => (
                  <InvoiceTableRow
                    key={invoice.id}
                    invoice={invoice}
                    isSelected={selectedInvoices.includes(invoice.id)}
                    onSelect={handleSelectInvoice}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                    onSend={handleSend}
                    onMarkAsPaid={handleMarkAsPaid}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paginatedInvoices.map(invoice => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              isSelected={selectedInvoices.includes(invoice.id)}
              onSelect={handleSelectInvoice}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDownload={handleDownload}
              onPreview={handlePreview}
              onSend={handleSend}
              onMarkAsPaid={handleMarkAsPaid}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {paginatedInvoices.length === 0 && !loading && (
          <div className="bg-card rounded-2xl border border-divider p-12 text-center">
            <Icon name="DocumentTextIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-black text-foreground mb-2">No Invoices Found</h3>
            <p className="text-muted-foreground mb-6">No invoices match your search.</p>
          </div>
        )}

        <BulkActionToolbar
          selectedCount={selectedInvoices.length}
          onMarkPaid={handleMarkPaid}
          onSendReminders={handleSendReminders}
          onExportPDF={handleExportPDF}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedInvoices([])}
        />

        {selectedInvoiceForShare && (
          <ShareInvoiceModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            invoiceId={selectedInvoiceForShare.id}
            clientEmail={selectedInvoiceForShare.clients?.email || ''} 
            invoiceNumber={selectedInvoiceForShare.invoice_number}
            slug={selectedInvoiceForShare.slug}
            onSendEmail={handleSendEmail}
            onCopyLink={handleCopyLink}
            onWhatsAppShare={handleWhatsAppShare}
          />
        )}

        {previewModalOpen && previewInvoice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => {
            setPreviewModalOpen(false);
            setPreviewInvoice(null);
          }}>
            <div className="bg-card rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-divider">
                <h3 className="text-xl font-black uppercase tracking-tight">Preview</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const invoiceNum = (previewInvoice.invoice_number || 'draft').toLowerCase().replace(/[^a-z0-9]/g, '-');
                      const clientName = (previewInvoice as any).client?.company_name 
                        ? (previewInvoice as any).client.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
                        : 'no-client';
                      const fileName = `Invoice-${invoiceNum}-${clientName}.pdf`;
                      downloadFromDOM(fileName);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all"
                  >
                    <Icon name="ArrowDownTrayIcon" size={18} />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setPreviewModalOpen(false);
                      setPreviewInvoice(null);
                    }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-xl transition-colors"
                  >
                    <Icon name="XMarkIcon" size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-muted/30">
                <div id="invoice-preview-container" className="flex justify-center">
                  <InvoicePreview
                    businessProfile={previewBusinessProfile}
                    client={(previewInvoice as any).client}
                    details={{
                      invoiceNumber: previewInvoice.invoice_number,
                      issueDate: previewInvoice.issue_date,
                      dueDate: previewInvoice.due_date,
                      paymentTerms: previewInvoice.payment_terms,
                    }}
                    items={previewInvoiceItems}
                    taxRate={previewInvoice.tax_rate}
                    discount={previewInvoice.discount}
                    currency={previewInvoice.currency}
                    notes={previewInvoice.notes || ''}
                    terms={previewInvoice.terms || ''}
                    selectedTemplate={previewInvoice.template}
                    fullSize={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden container for PDF generation */}
        <div className="fixed" style={{ left: '-9999px', top: '0', width: '210mm', height: '297mm' }}>
          <div id="invoice-pdf-container" className="w-[210mm] min-h-[297mm] bg-white">
            {previewInvoice && previewBusinessProfile && (
              <InvoicePreview
                businessProfile={previewBusinessProfile}
                client={(previewInvoice as any).client}
                details={{
                  invoiceNumber: previewInvoice.invoice_number,
                  issueDate: previewInvoice.issue_date,
                  dueDate: previewInvoice.due_date,
                  paymentTerms: previewInvoice.payment_terms,
                }}
                items={previewInvoiceItems}
                taxRate={previewInvoice.tax_rate}
                discount={previewInvoice.discount}
                currency={previewInvoice.currency}
                notes={previewInvoice.notes || ''}
                terms={previewInvoice.terms || ''}
                selectedTemplate={previewInvoice.template}
                fullSize={true}
              />
            )}
          </div>
        </div>
      </div>
      <PlanLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        action={limitActionInfo?.action || 'emails_sent'}
        current={limitActionInfo?.current || 0}
        limit={limitActionInfo?.limit || 0}
        allowPayg={limitActionInfo?.allowPayg}
      />
    </div>
  );
};

export default InvoiceManagementInteractive;