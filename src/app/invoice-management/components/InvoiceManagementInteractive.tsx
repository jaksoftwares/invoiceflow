'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import InvoiceFilters from './InvoiceFilters';
import InvoiceSearch from './InvoiceSearch';
import BulkActionToolbar from './BulkActionToolbar';
import InvoiceTableRow from './InvoiceTableRow';
import InvoiceCard from './InvoiceCard';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface FilterState {
  dateRange: { start: string; end: string };
  paymentStatus: string;
  client: string;
  amountRange: { min: string; max: string };
}

const InvoiceManagementInteractive = () => {
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Invoice; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2026-001',
      clientName: 'Acme Corporation',
      amount: 5250.00,
      issueDate: '01/05/2026',
      dueDate: '01/20/2026',
      status: 'paid'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2026-002',
      clientName: 'Tech Solutions Inc',
      amount: 3800.00,
      issueDate: '01/08/2026',
      dueDate: '01/23/2026',
      status: 'pending'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2026-003',
      clientName: 'Global Retail Group',
      amount: 7500.00,
      issueDate: '01/10/2026',
      dueDate: '01/15/2026',
      status: 'overdue'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2026-004',
      clientName: 'Creative Agency LLC',
      amount: 4200.00,
      issueDate: '01/12/2026',
      dueDate: '01/27/2026',
      status: 'pending'
    },
    {
      id: '5',
      invoiceNumber: 'INV-2026-005',
      clientName: 'Acme Corporation',
      amount: 6800.00,
      issueDate: '01/14/2026',
      dueDate: '01/29/2026',
      status: 'paid'
    },
    {
      id: '6',
      invoiceNumber: 'INV-2026-006',
      clientName: 'Tech Solutions Inc',
      amount: 2950.00,
      issueDate: '01/15/2026',
      dueDate: '01/30/2026',
      status: 'pending'
    },
    {
      id: '7',
      invoiceNumber: 'INV-2026-007',
      clientName: 'Global Retail Group',
      amount: 8900.00,
      issueDate: '01/16/2026',
      dueDate: '01/31/2026',
      status: 'paid'
    },
    {
      id: '8',
      invoiceNumber: 'INV-2026-008',
      clientName: 'Creative Agency LLC',
      amount: 5600.00,
      issueDate: '01/17/2026',
      dueDate: '02/01/2026',
      status: 'pending'
    }
  ];

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = searchQuery === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filters.paymentStatus === 'all' || invoice.status === filters.paymentStatus;

    const matchesClient = filters.client === 'all'|| invoice.clientName.toLowerCase().replace(/\s+/g,'-') === filters.client;

    const matchesAmount = 
      (filters.amountRange.min === '' || invoice.amount >= parseFloat(filters.amountRange.min)) &&
      (filters.amountRange.max === '' || invoice.amount <= parseFloat(filters.amountRange.max));

    return matchesSearch && matchesStatus && matchesClient && matchesAmount;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

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

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = sortedInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: keyof Invoice) => {
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

  const handleMarkPaid = () => {
    console.log('Mark paid:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const handleSendReminders = () => {
    console.log('Send reminders:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const handleExportPDF = () => {
    console.log('Export PDF:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const handleBulkDelete = () => {
    console.log('Delete invoices:', selectedInvoices);
    setSelectedInvoices([]);
  };

  const handleEdit = (id: string) => {
    router.push(`/create-invoice?edit=${id}`);
  };

  const handleDuplicate = (id: string) => {
    console.log('Duplicate invoice:', id);
  };

  const handleDownload = (id: string) => {
    console.log('Download invoice:', id);
  };

  const handleSend = (id: string) => {
    console.log('Send invoice:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete invoice:', id);
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
          <InvoiceFilters onFilterChange={() => {}} totalResults={mockInvoices.length} />

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
                  {mockInvoices.slice(0, 5).map(invoice => (
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