'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import InvoiceFilters from './InvoiceFilters';
import InvoiceSearch from './InvoiceSearch';
import BulkActionToolbar from './BulkActionToolbar';
import InvoiceTableRow from './InvoiceTableRow';
import InvoiceCard from './InvoiceCard';
import { useInvoices } from '@/lib/hooks/useInvoices';
import type { Invoice } from '@/types/database';

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
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
    refetch,
    updateInvoice,
    deleteInvoice,
    bulkDeleteInvoices,
    bulkUpdateStatus,
  } = useInvoices({
    page: currentPage,
    limit: itemsPerPage,
    status: filters.paymentStatus !== 'all' ? filters.paymentStatus as Invoice['status'] : undefined,
    search: searchQuery || undefined,
    issue_date_from: filters.dateRange.start || undefined,
    issue_date_to: filters.dateRange.end || undefined,
    autoFetch: false, // We'll manage fetching manually
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use invoices from hook, fallback to initial data if not loaded yet
  const displayInvoices = invoices.length > 0 ? invoices : initialInvoices;

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
    // TODO: Implement send reminders functionality
    console.log('Send reminders:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const handleExportPDF = () => {
    // TODO: Implement export PDF functionality
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
    // TODO: Implement duplicate functionality
    console.log('Duplicate invoice:', id);
  };

  const handleDownload = (id: string) => {
    // TODO: Implement download functionality
    console.log('Download invoice:', id);
  };

  const handleSend = (id: string) => {
    // TODO: Implement send functionality
    console.log('Send invoice:', id);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteInvoice(id);
    if (success) {
      // Invoice removed from list via optimistic update
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Invoice Management</h1>
              <p className="text-muted-foreground mt-2">Track and manage all your business invoices</p>
            </div>
          </div>

          <InvoiceSearch onSearch={() => {}} />
          <InvoiceFilters onFilterChange={() => {}} totalResults={displayInvoices.length} />

          <div className="bg-card rounded-lg shadow-elevation-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-4 text-left">
                      <input type="checkbox" className="w-4 h-4 rounded border-input" disabled />
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Invoice #</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Client</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Amount</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Issue Date</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Due Date</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialInvoices.slice(0, 5).map(invoice => (
                    <InvoiceTableRow
                      key={invoice.id}
                      invoice={invoice}
                      isSelected={false}
                      onSelect={() => {}}
                      onEdit={() => {}}
                      onDuplicate={() => {}}
                      onDownload={() => {}}
                      onSend={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Invoice Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage all your business invoices</p>
          </div>
          <button
            onClick={() => router.push('/create-invoice')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 active:scale-[0.97]"
          >
            <Icon name="PlusIcon" size={20} />
            <span>Create Invoice</span>
          </button>
        </div>

        <InvoiceSearch onSearch={setSearchQuery} />
        <InvoiceFilters onFilterChange={setFilters} totalResults={filteredInvoices.length} />

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading invoices...</span>
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
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('invoiceNumber')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      <span>Invoice #</span>
                      <Icon
                        name={sortConfig?.key === 'invoiceNumber' && sortConfig.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                        size={16}
                        className={sortConfig?.key === 'invoiceNumber' ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('clientName')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      <span>Client</span>
                      <Icon
                        name={sortConfig?.key === 'clientName' && sortConfig.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                        size={16}
                        className={sortConfig?.key === 'clientName' ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      <span>Amount</span>
                      <Icon
                        name={sortConfig?.key === 'amount' && sortConfig.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                        size={16}
                        className={sortConfig?.key === 'amount' ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('issueDate')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      <span>Issue Date</span>
                      <Icon
                        name={sortConfig?.key === 'issueDate' && sortConfig.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                        size={16}
                        className={sortConfig?.key === 'issueDate' ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('dueDate')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      <span>Due Date</span>
                      <Icon
                        name={sortConfig?.key === 'dueDate' && sortConfig.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                        size={16}
                        className={sortConfig?.key === 'dueDate' ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      <span>Status</span>
                      <Icon
                        name={sortConfig?.key === 'status' && sortConfig.direction === 'desc' ? 'ChevronDownIcon' : 'ChevronUpIcon'}
                        size={16}
                        className={sortConfig?.key === 'status' ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-foreground">Actions</th>
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
                    onSend={handleSend}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedInvoices.length)} of {sortedInvoices.length}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-muted rounded-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronLeftIcon" size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-muted rounded-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="ChevronRightIcon" size={20} />
              </button>
            </div>
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
              onSend={handleSend}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {paginatedInvoices.length === 0 && (
          <div className="bg-card rounded-lg shadow-elevation-1 p-12 text-center">
            <Icon name="DocumentTextIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">No invoices found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => router.push('/create-invoice')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
            >
              <Icon name="PlusIcon" size={20} />
              <span>Create Your First Invoice</span>
            </button>
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
      </div>
    </div>
  );
};

export default InvoiceManagementInteractive;