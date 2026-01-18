'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterState {
  dateRange: { start: string; end: string };
  paymentStatus: string;
  client: string;
  amountRange: { min: string; max: string };
}

interface InvoiceFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

const InvoiceFilters = ({ onFilterChange, totalResults }: InvoiceFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    paymentStatus: 'all',
    client: 'all',
    amountRange: { min: '', max: '' }
  });

  const paymentStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const clients = [
    { value: 'all', label: 'All Clients' },
    { value: 'acme-corp', label: 'Acme Corporation' },
    { value: 'tech-solutions', label: 'Tech Solutions Inc' },
    { value: 'global-retail', label: 'Global Retail Group' },
    { value: 'creative-agency', label: 'Creative Agency LLC' }
  ];

  const handleFilterUpdate = (key: keyof FilterState, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      dateRange: { start: '', end: '' },
      paymentStatus: 'all',
      client: 'all',
      amountRange: { min: '', max: '' }
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-1 mb-6">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-0">
          <div className="flex items-center gap-3">
            <Icon name="FunnelIcon" size={24} className="text-primary" />
            <h2 className="text-lg font-heading font-semibold text-foreground">Filters</h2>
            <span className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full caption">
              {totalResults} results
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden p-2 hover:bg-muted rounded-md transition-smooth"
            aria-label="Toggle filters"
          >
            <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={20} />
          </button>
        </div>

        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block mt-4 lg:mt-6`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterUpdate('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterUpdate('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="End date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterUpdate('paymentStatus', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              >
                {paymentStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Client
              </label>
              <select
                value={filters.client}
                onChange={(e) => handleFilterUpdate('client', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              >
                {clients.map((client) => (
                  <option key={client.value} value={client.value}>
                    {client.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount Range
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  value={filters.amountRange.min}
                  onChange={(e) => handleFilterUpdate('amountRange', { ...filters.amountRange, min: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="Min amount"
                />
                <input
                  type="number"
                  value={filters.amountRange.max}
                  onChange={(e) => handleFilterUpdate('amountRange', { ...filters.amountRange, max: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                  placeholder="Max amount"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md text-sm font-medium transition-smooth hover:bg-opacity-80"
            >
              <Icon name="ArrowPathIcon" size={18} />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;