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

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  totalBilled: number;
  lastInvoiceDate: string;
  status: 'active' | 'inactive' | 'pending';
  outstandingBalance: number;
  avatar: string;
  avatarAlt: string;
  billingFrequency: string;
}

interface FilterState {
  status: string;
  billingFrequency: string;
  outstandingBalance: string;
}

interface ClientFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  billingFrequency: string;
  status: string;
}

const ClientManagementInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      const mockClients: Client[] = [
      {
        id: '1',
        companyName: 'TechCorp Solutions',
        contactPerson: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 (555) 123-4567',
        totalBilled: 45230.50,
        lastInvoiceDate: '01/15/2026',
        status: 'active',
        outstandingBalance: 8500.00,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a9e8814c-1763296696290.png",
        avatarAlt: 'Professional woman with brown hair in business attire smiling at camera',
        billingFrequency: 'monthly'
      },
      {
        id: '2',
        companyName: 'Global Marketing Inc',
        contactPerson: 'Michael Chen',
        email: 'michael.chen@globalmarketing.com',
        phone: '+1 (555) 234-5678',
        totalBilled: 67890.25,
        lastInvoiceDate: '01/10/2026',
        status: 'active',
        outstandingBalance: 0,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1bef32e3c-1763294452425.png",
        avatarAlt: 'Asian businessman in navy suit with confident smile in office setting',
        billingFrequency: 'quarterly'
      },
      {
        id: '3',
        companyName: 'Creative Design Studio',
        contactPerson: 'Emily Rodriguez',
        email: 'emily.rodriguez@creativedesign.com',
        phone: '+1 (555) 345-6789',
        totalBilled: 32150.75,
        lastInvoiceDate: '12/28/2025',
        status: 'active',
        outstandingBalance: 5200.00,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c557787b-1763299182093.png",
        avatarAlt: 'Hispanic woman with long dark hair wearing glasses in creative workspace',
        billingFrequency: 'monthly'
      },
      {
        id: '4',
        companyName: 'Financial Advisors LLC',
        contactPerson: 'David Thompson',
        email: 'david.thompson@financialadvisors.com',
        phone: '+1 (555) 456-7890',
        totalBilled: 89450.00,
        lastInvoiceDate: '01/05/2026',
        status: 'active',
        outstandingBalance: 12000.00,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1c39b130a-1763292262638.png",
        avatarAlt: 'Middle-aged man with gray hair in formal business suit at desk',
        billingFrequency: 'annually'
      },
      {
        id: '5',
        companyName: 'Healthcare Partners',
        contactPerson: 'Dr. Lisa Anderson',
        email: 'lisa.anderson@healthcarepartners.com',
        phone: '+1 (555) 567-8901',
        totalBilled: 54320.90,
        lastInvoiceDate: '01/12/2026',
        status: 'active',
        outstandingBalance: 0,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d62bcfbd-1767104198321.png",
        avatarAlt: 'Professional woman doctor with stethoscope in white coat smiling',
        billingFrequency: 'monthly'
      },
      {
        id: '6',
        companyName: 'Construction Builders Co',
        contactPerson: 'James Wilson',
        email: 'james.wilson@constructionbuilders.com',
        phone: '+1 (555) 678-9012',
        totalBilled: 125670.40,
        lastInvoiceDate: '12/20/2025',
        status: 'inactive',
        outstandingBalance: 25000.00,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b0d71d0d-1767199715587.png",
        avatarAlt: 'Man in construction hard hat and safety vest at building site',
        billingFrequency: 'quarterly'
      },
      {
        id: '7',
        companyName: 'Legal Services Group',
        contactPerson: 'Jennifer Martinez',
        email: 'jennifer.martinez@legalservices.com',
        phone: '+1 (555) 789-0123',
        totalBilled: 98760.15,
        lastInvoiceDate: '01/08/2026',
        status: 'active',
        outstandingBalance: 15000.00,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b122faa0-1763299715536.png",
        avatarAlt: 'Professional woman lawyer in black blazer with law books background',
        billingFrequency: 'monthly'
      },
      {
        id: '8',
        companyName: 'E-Commerce Solutions',
        contactPerson: 'Robert Kim',
        email: 'robert.kim@ecommercesolutions.com',
        phone: '+1 (555) 890-1234',
        totalBilled: 43210.60,
        lastInvoiceDate: '01/14/2026',
        status: 'pending',
        outstandingBalance: 3500.00,
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_18f41607b-1763301308071.png",
        avatarAlt: 'Young Asian man in casual business attire with laptop in modern office',
        billingFrequency: 'monthly'
      }];

      setClients(mockClients);
      setFilteredClients(mockClients);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      let result = [...clients];

      if (searchTerm) {
        result = result.filter(
          (client) =>
          client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filters.status !== 'all') {
        result = result.filter((client) => client.status === filters.status);
      }

      if (filters.billingFrequency !== 'all') {
        result = result.filter(
          (client) => client.billingFrequency === filters.billingFrequency
        );
      }

      if (filters.outstandingBalance !== 'all') {
        result = result.filter((client) => {
          switch (filters.outstandingBalance) {
            case 'none':
              return client.outstandingBalance === 0;
            case 'low':
              return client.outstandingBalance > 0 && client.outstandingBalance < 1000;
            case 'medium':
              return client.outstandingBalance >= 1000 && client.outstandingBalance <= 5000;
            case 'high':
              return client.outstandingBalance > 5000;
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
    }
  }, [searchTerm, filters, sortConfig, clients, isHydrated]);

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

  const handleAddClient = (clientData: ClientFormData) => {
    console.log('Add new client:', clientData);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
              Client Management
            </h1>
            <p className="text-muted-foreground">
              Manage your client database and billing relationships
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-md font-medium hover:-translate-y-[1px] hover:shadow-elevation-2 transition-smooth">

            <Icon name="PlusIcon" size={20} />
            <span>Add New Client</span>
          </button>
        </div>

        <ClientSummaryCards />

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
                      onClick={() => handleSort('companyName')}
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
                      onClick={() => handleSort('totalBilled')}
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-smooth">

                      <span>Total Billed</span>
                      <Icon name="ChevronUpDownIcon" size={16} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('lastInvoiceDate')}
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
          onClearSelection={() => setSelectedClients([])} />


        <AddClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddClient} />

      </div>
    </div>);

};

export default ClientManagementInteractive;