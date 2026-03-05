'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import ClientSummaryCards from './ClientSummaryCards';
import ClientSearchFilters from './ClientSearchFilters';
import ClientTableRow from './ClientTableRow';
import ClientMobileCard from './ClientMobileCard';
import BulkActionsBar from './BulkActionsBar';
import AddClientModal from './AddClientModal';
import { useClients } from '@/lib/hooks/useClients';
import type { Client } from '@/types/database';
import { checkUsageLimit } from '@/lib/actions/subscription';
import PlanLimitModal from '@/components/modals/PlanLimitModal';

interface ClientManagementInteractiveProps {
  initialClients?: Client[];
}

interface FilterState {
  status: string;
  billingFrequency: string;
  outstandingBalance: string;
}

interface ClientFormData {
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  status: 'active' | 'inactive' | 'pending';
  avatar_url?: string;
}

const ClientManagementInteractive = ({ initialClients = [] }: ClientManagementInteractiveProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    billingFrequency: 'all',
    outstandingBalance: 'all'
  });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Client | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Limit Modal State
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitActionInfo, setLimitActionInfo] = useState<{ action: string; current: number; limit: number; allowPayg?: boolean } | null>(null);

  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    bulkDeleteClients,
  } = useClients({
    search: searchTerm,
    status: filters.status !== 'all' ? filters.status as 'active' | 'inactive' | 'pending' : undefined,
    autoFetch: true,
  });

  // Use initial clients if provided, otherwise use hook data
  const currentClients = initialClients.length > 0 ? initialClients : clients;
  const [filteredClients, setFilteredClients] = useState<Client[]>(currentClients);

  useEffect(() => {
    let result = [...clients]; // Use clients from hook since API handles search and status

    // Local filtering for billing frequency and outstanding balance
    if (filters.billingFrequency !== 'all') {
      result = result.filter(
        (client) => client.billing_frequency === filters.billingFrequency
      );
    }

    if (filters.outstandingBalance !== 'all') {
      result = result.filter((client) => {
        switch (filters.outstandingBalance) {
          case 'none':
            return client.outstanding_balance === 0;
          case 'low':
            return client.outstanding_balance > 0 && client.outstanding_balance < 1000;
          case 'medium':
            return client.outstanding_balance >= 1000 && client.outstanding_balance <= 5000;
          case 'high':
            return client.outstanding_balance > 5000;
          default:
            return true;
        }
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ?
          aValue.localeCompare(bValue) :
          bValue.localeCompare(aValue);
        }

        return 0;
      });
    }

    setFilteredClients(result);
  }, [filters.billingFrequency, filters.outstandingBalance, sortConfig, clients]);

  const handleSort = (key: keyof Client) => {
    setSortConfig({
      key,
      direction:
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClients(filteredClients.map((client) => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClients((prev) =>
    prev.includes(clientId) ?
    prev.filter((id) => id !== clientId) :
    [...prev, clientId]
    );
  };

  const handleEdit = (clientId: string) => {
    console.log('Edit client:', clientId);
  };

  const handleViewHistory = (clientId: string) => {
    console.log('View history for client:', clientId);
  };

  const handleCreateInvoice = (clientId: string) => {
    router.push('/create-invoice');
  };

  const handleViewLogs = (clientId: string) => {
    console.log('View logs for client:', clientId);
  };

  const handleExport = () => {
    console.log('Export selected clients:', selectedClients);
  };

  const handleSendCommunication = () => {
    console.log('Send communication to:', selectedClients);
  };

  const handleUpdateStatus = () => {
    console.log('Update status for:', selectedClients);
  };

  const handleBulkDelete = async () => {
    if (selectedClients.length === 0) return;

    const result = await bulkDeleteClients(selectedClients);
    if (result) {
      setSelectedClients([]);
    }
  };

  // Pending actions state
  const [pendingClientData, setPendingClientData] = useState<ClientFormData | null>(null);

  const handleLimitSuccess = async () => {
    setLimitModalOpen(false);
    if (pendingClientData) {
      const data = pendingClientData;
      setPendingClientData(null);
      // Wait a bit for the DB to sync then retry
      setTimeout(async () => {
        await handleAddClient(data);
      }, 1500);
    }
  };

  const handleAddClient = async (clientData: ClientFormData) => {
    // Check usage limit before attempting to create
    const limitCheck = await checkUsageLimit('clients_created');
    if (!limitCheck.allowed) {
      setPendingClientData(clientData);
      setLimitActionInfo({
        action: 'clients_created',
        limit: limitCheck.limit ?? 0,
        current: limitCheck.current ?? 0,
        allowPayg: limitCheck.allowPayg ?? false
      });
      setLimitModalOpen(true);
      return;
    }

    const result = await createClient(clientData);
    if (result) {
      setIsAddModalOpen(false);
    }
  };

  if (loading && currentClients.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) =>
              <div key={i} className="h-32 bg-muted rounded-lg" />
              )}
            </div>
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <Icon name="ExclamationTriangleIcon" size={48} className="mx-auto text-destructive mb-4" />
            <p className="text-foreground font-medium mb-2">Error loading clients</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-heading font-black text-foreground tracking-tight sm:text-5xl">
              Client Management
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">
              View and manage all your clients.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-elevation-2 hover:shadow-elevation-3 transition-smooth"
          >
            <Icon name="PlusIcon" size={20} />
            <span>New Client</span>
          </button>
        </div>

        <ClientSummaryCards clients={clients} />

        <ClientSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters} />


        <div className="hidden lg:block bg-card rounded-lg shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                      selectedClients.length === filteredClients.length &&
                      filteredClients.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring" />

                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('company_name')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth">

                      <span>Company / Contact</span>
                      <Icon name="ChevronUpDownIcon" size={16} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-sm font-medium text-foreground">Email</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-sm font-medium text-foreground">Phone</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('total_billed')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth">

                      <span>Total Billed</span>
                      <Icon name="ChevronUpDownIcon" size={16} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('last_invoice_date')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth">

                      <span>Last Invoice</span>
                      <Icon name="ChevronUpDownIcon" size={16} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-sm font-medium text-foreground">Status</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="text-sm font-medium text-foreground">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) =>
                <tr key={client.id}>
                    <td className="px-4 py-4">
                      <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelectClient(client.id)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring" />

                    </td>
                    <ClientTableRow
                    client={client}
                    onEdit={handleEdit}
                    onViewHistory={handleViewHistory}
                    onCreateInvoice={handleCreateInvoice}
                    onViewLogs={handleViewLogs} />

                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 &&
          <div className="text-center py-12">
              <Icon name="UsersIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-2">No clients found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          }
        </div>

        <div className="lg:hidden">
          {filteredClients.map((client) =>
          <ClientMobileCard
            key={client.id}
            client={client}
            onEdit={handleEdit}
            onViewHistory={handleViewHistory}
            onCreateInvoice={handleCreateInvoice}
            onViewLogs={handleViewLogs} />

          )}

          {filteredClients.length === 0 &&
          <div className="bg-card rounded-lg shadow-elevation-1 p-12 text-center">
              <Icon name="UsersIcon" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-2">No clients found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          }
        </div>

        <BulkActionsBar
          selectedCount={selectedClients.length}
          onExport={handleExport}
          onSendCommunication={handleSendCommunication}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedClients([])} />


        <AddClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddClient} />

        <PlanLimitModal
          isOpen={limitModalOpen}
          onClose={() => setLimitModalOpen(false)}
          onSuccess={handleLimitSuccess}
          action={limitActionInfo?.action || 'clients_created'}
          current={limitActionInfo?.current || 0}
          limit={limitActionInfo?.limit || 0}
          allowPayg={limitActionInfo?.allowPayg}
        />

      </div>
    </div>);
};


export default ClientManagementInteractive;