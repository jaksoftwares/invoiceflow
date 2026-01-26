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
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="AdjustmentsHorizontalIcon" size={24} className="text-primary" />
        <h2 className="text-xl font-heading font-semibold text-foreground">Report Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-foreground mb-2">
            Date Range
          </label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-foreground mb-2">
            Report Type
          </label>
          <select
            id="reportType"
            value={filters.reportType}
            onChange={(e) => handleFilterChange('reportType', e.target.value)}
            className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            <option value="revenue">Revenue Report</option>
            <option value="aging">Aging Report</option>
            <option value="tax">Tax Summary</option>
            <option value="client-performance">Client Performance</option>
          </select>
        </div>

        <div>
          <label htmlFor="clientFilter" className="block text-sm font-medium text-foreground mb-2">
            Client Filter
          </label>
          <select
            id="clientFilter"
            value={filters.clientFilter}
            onChange={(e) => handleFilterChange('clientFilter', e.target.value)}
            className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            <option value="all">All Clients</option>
            <option value="active">Active Clients</option>
            <option value="inactive">Inactive Clients</option>
            <option value="high-value">High Value Clients</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2 active:scale-[0.97]">
          <Icon name="MagnifyingGlassIcon" size={18} />
          <span>Apply Filters</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-muted text-foreground rounded-md text-sm font-medium transition-smooth hover:bg-muted/80">
          <Icon name="ArrowPathIcon" size={18} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default ReportFilters;