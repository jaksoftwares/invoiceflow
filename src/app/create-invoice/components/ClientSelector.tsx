'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface ClientSelectorProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client | null) => void;
  onAddNewClient: () => void;
}

const ClientSelector = ({ selectedClient, onClientSelect, onAddNewClient }: ClientSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockClients: Client[] = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@techcorp.com', company: 'TechCorp Solutions' },
    { id: '2', name: 'Michael Chen', email: 'michael.chen@designstudio.com', company: 'Design Studio Pro' },
    { id: '3', name: 'Emily Rodriguez', email: 'emily.r@marketingplus.com', company: 'Marketing Plus Agency' },
    { id: '4', name: 'David Thompson', email: 'david.t@consulting.com', company: 'Thompson Consulting' },
    { id: '5', name: 'Lisa Anderson', email: 'lisa.anderson@retailco.com', company: 'RetailCo International' },
  ];

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientSelect = (client: Client) => {
    onClientSelect(client);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-foreground mb-2">
        Client <span className="text-error">*</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-md text-left transition-smooth hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {selectedClient ? (
          <div>
            <p className="text-sm font-medium text-foreground">{selectedClient.name}</p>
            <p className="text-xs text-muted-foreground">{selectedClient.company}</p>
          </div>
        ) : (
          <span className="text-muted-foreground">Select a client</span>
        )}
        <Icon name="ChevronDownIcon" size={20} className={`transition-smooth ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-elevation-3 z-[101] max-h-80 overflow-hidden">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-60">
              <button
                type="button"
                onClick={() => {
                  onAddNewClient();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-smooth border-b border-border"
              >
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Icon name="PlusIcon" size={18} className="text-accent-foreground" />
                </div>
                <span className="text-sm font-medium text-accent">Add New Client</span>
              </button>

              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-smooth"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Icon name="UserGroupIcon" size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No clients found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientSelector;