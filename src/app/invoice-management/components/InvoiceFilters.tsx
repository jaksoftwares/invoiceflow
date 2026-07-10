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
 <div className="w-full bg-card rounded-3xl border border-divider shadow-elevation-2 p-6">
 <div className="flex flex-col lg:flex-row items-end gap-6">
 {/* Status Filter */}
 <div className="w-full lg:w-56 shrink-0">
 <label className="block text-xs font-bold text-muted-foreground font-medium mb-3 ml-1">
 Payment Status
 </label>
 <div className="relative group">
 <select
 value={filters.paymentStatus}
 onChange={(e) => handleFilterUpdate('paymentStatus', e.target.value)}
 className="w-full h-14 pl-5 pr-12 bg-muted/50 border border-transparent rounded-2xl text-sm font-bold text-foreground focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
 >
 {paymentStatuses.map((status) => (
 <option key={status.value} value={status.value}>
 {status.label}
 </option>
 ))}
 </select>
 <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
 <Icon name="ChevronDownIcon" size={18} />
 </div>
 </div>
 </div>

 {/* Client Filter */}
 <div className="w-full lg:w-72 shrink-0">
 <label className="block text-xs font-bold text-muted-foreground font-medium mb-3 ml-1">
 Client Entity
 </label>
 <div className="relative group">
 <select
 value={filters.client}
 onChange={(e) => handleFilterUpdate('client', e.target.value)}
 className="w-full h-14 pl-5 pr-12 bg-muted/50 border border-transparent rounded-2xl text-sm font-bold text-foreground focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
 >
 <option value="all">All Clients</option>
 {availableClients.map((client) => (
 <option key={client.id} value={client.name.toLowerCase().replace(/\s+/g,'-')}>
 {client.name}
 </option>
 ))}
 </select>
 <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
 <Icon name="ChevronDownIcon" size={18} />
 </div>
 </div>
 </div>

 {/* Amount Range */}
 <div className="w-full flex-1">
 <label className="block text-xs font-bold text-muted-foreground font-medium mb-3 ml-1">
 Value Range
 </label>
 <div className="flex items-center gap-3">
 <div className="relative flex-1 group">
 <input
 type="number"
 value={filters.amountRange.min}
 onChange={(e) => handleFilterUpdate('amountRange', { ...filters.amountRange, min: e.target.value })}
 className="w-full h-14 px-5 bg-muted/50 border border-transparent rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/30 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all pr-12"
 placeholder="Min"
 />
 </div>
 <div className="text-muted-foreground font-bold text-[10px] font-medium opacity-30">To</div>
 <div className="relative flex-1 group">
 <input
 type="number"
 value={filters.amountRange.max}
 onChange={(e) => handleFilterUpdate('amountRange', { ...filters.amountRange, max: e.target.value })}
 className="w-full h-14 px-5 bg-muted/50 border border-transparent rounded-2xl text-sm font-bold text-foreground placeholder:text-muted-foreground/30 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all pr-12"
 placeholder="Max"
 />
 </div>
 </div>
 </div>

 {/* Results Count & Reset */}
 <div className="w-full lg:w-auto flex items-center justify-between gap-6">
 <div className="flex flex-col items-center justify-center p-2 bg-primary/5 rounded-2xl border border-primary/10 min-w-[120px]">
 <span className="text-[9px] font-bold text-primary font-medium mb-0.5">Discovered</span>
 <span className="text-lg font-bold text-primary">{totalResults}</span>
 </div>
 <button
 onClick={handleReset}
 className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 h-14 bg-slate-900 border border-transparent text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 group shrink-0"
 title="Clear all filters"
 >
 <Icon name="ArrowPathIcon" size={20} className="group-hover:rotate-180 transition-transform duration-700" />
 <span>Reset</span>
 </button>
 </div>
 </div>
 </div>
 );
};

export default InvoiceFilters;