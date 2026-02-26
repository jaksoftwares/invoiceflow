'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FilterState {
  dateRange: string;
  reportType: string;
  clientFilter: string;
}

interface ReportFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const ReportFilters = ({ filters, onFilterChange }: ReportFiltersProps) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Period</label>
          <div className="relative group">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-muted/20 border border-border/50 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-smooth group-hover:bg-muted/30"
            >
              <option value="last-30-days">Past 30 Days</option>
              <option value="last-3-months">Quarterly View</option>
              <option value="last-6-months" selected>Half Year Analysis</option>
              <option value="last-year">Full Annual View</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <Icon name="ChevronDownIcon" size={16} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Report Category</label>
          <div className="relative group">
            <select
              value={filters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-muted/20 border border-border/50 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-smooth group-hover:bg-muted/30"
            >
              <option value="revenue">Financial Revenue</option>
              <option value="client-performance">Client Impact</option>
              <option value="payment-aging">Invoice Aging</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <Icon name="ChevronDownIcon" size={16} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Client Group</label>
          <div className="relative group">
            <select
              value={filters.clientFilter}
              onChange={(e) => handleFilterChange('clientFilter', e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-muted/20 border border-border/50 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-smooth group-hover:bg-muted/30"
            >
              <option value="all">Consolidated (All)</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Dormant Accounts</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <Icon name="ChevronDownIcon" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-end h-full">
         <button className="h-[46px] px-8 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-elevation-2 hover:shadow-elevation-3 transition-smooth flex items-center gap-2">
           <Icon name="SparklesIcon" size={18} />
           <span>Refresh Analysis</span>
         </button>
      </div>
    </div>
  );
};

export default ReportFilters;