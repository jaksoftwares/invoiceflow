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
  availableClients?: { id: string; name: string }[];
}

const InvoiceFilters = ({ onFilterChange, totalResults, availableClients = [] }: InvoiceFiltersProps) => {
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
    <div className="bg-card rounded-2xl border border-divider shadow-sm overflow-hidden h-fit">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-smooth group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <Icon name="FunnelIcon" size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Filter Invoices</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                {totalResults} results discovered
              </p>
            </div>
          </div>
          <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={20} className={`transition-transform duration-300 ml-4 ${!isExpanded ? 'lg:rotate-180' : ''}`} />
        </button>

        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block px-5 pb-5 border-t border-divider pt-5`}>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                Calendar Period
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterUpdate('dateRange', { ...filters.dateRange, start: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-xl text-xs font-bold text-foreground focus:bg-background focus:border-primary transition-all"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterUpdate('dateRange', { ...filters.dateRange, end: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-xl text-xs font-bold text-foreground focus:bg-background focus:border-primary transition-all"
                  placeholder="To"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterUpdate('paymentStatus', e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-xl text-xs font-bold text-foreground focus:bg-background focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {paymentStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                  Quick Search (Client)
                </label>
                <select
                  value={filters.client}
                  onChange={(e) => handleFilterUpdate('client', e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-xl text-xs font-bold text-foreground focus:bg-background focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Clients</option>
                  {availableClients.map((client) => (
                    <option key={client.id} value={client.name.toLowerCase().replace(/\s+/g,'-')}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
                Value range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={filters.amountRange.min}
                  onChange={(e) => handleFilterUpdate('amountRange', { ...filters.amountRange, min: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-xl text-xs font-bold text-foreground focus:bg-background focus:border-primary transition-all"
                  placeholder="Min Value"
                />
                <input
                  type="number"
                  value={filters.amountRange.max}
                  onChange={(e) => handleFilterUpdate('amountRange', { ...filters.amountRange, max: e.target.value })}
                  className="w-full px-4 py-3 bg-muted/50 border border-transparent rounded-xl text-xs font-bold text-foreground focus:bg-background focus:border-primary transition-all"
                  placeholder="Max Value"
                />
              </div>
            </div>

            <div className="flex pt-2">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-muted text-foreground rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-foreground hover:text-white"
              >
                <Icon name="ArrowPathIcon" size={16} />
                <span>Reset Parameters</span>
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default InvoiceFilters;