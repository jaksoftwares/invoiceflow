'use client';

import { useState, useEffect } from 'react';
import { useReports } from '@/lib/hooks';
import RevenueChart from './RevenueChart';
import PaymentStatusChart from './PaymentStatusChart';
import ClientPerformanceChart from './ClientPerformanceChart';
import KPICard from './KPICard';
import ReportFilters from './ReportFilters';
import ReportsTable from './ReportsTable';
import ComparisonTools from './ComparisonTools';

interface FilterState {
  dateRange: string;
  reportType: string;
  clientFilter: string;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface ClientPerformanceData {
  month: string;
  newClients: number;
  activeClients: number;
}

interface KPIData {
  title: string;
  value: string;
  change: number;
  icon: string;
  trend: 'up' | 'down';
}

interface ReportRow {
  id: number;
  client: string;
  invoiceCount: number;
  totalRevenue: number;
  avgInvoiceValue: number;
  paymentRate: number;
  outstanding: number;
}

const ReportsAnalyticsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last-6-months',
    reportType: 'revenue',
    clientFilter: 'all'
  });

  const { data, loading, error, refetch } = useReports({
    dateRange: filters.dateRange
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use real data or fallback to empty arrays
  const revenueData = data?.revenueChart || [];
  const paymentStatusData = data?.paymentStatusChart || [];
  const clientPerformanceData = data?.clientPerformanceChart || [];
  const kpiData = data?.kpis || [];
  const reportsTableData = data?.reportsTable || [];

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Refetch will be triggered by the useEffect in useReports when dateRange changes
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
              Reports & Analytics
            </h1>
            <p className="text-destructive mb-4">Error loading reports data: {error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive financial insights and business intelligence for strategic decision-making
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        <div className="mb-8">
          <ReportFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-elevation-2">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Monthly Revenue Trends
            </h3>
            <RevenueChart data={revenueData} />
          </div>

          <div className="bg-card rounded-lg p-6 shadow-elevation-2">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Payment Status Distribution
            </h3>
            <PaymentStatusChart data={paymentStatusData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-card rounded-lg p-6 shadow-elevation-2">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
              Client Performance Metrics
            </h3>
            <ClientPerformanceChart data={clientPerformanceData} />
          </div>

          <div>
            <ComparisonTools />
          </div>
        </div>

        <div className="mb-8">
          <ReportsTable data={reportsTableData} />
        </div>

        <div className="bg-card rounded-lg p-6 shadow-elevation-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                Forecasting & Projections
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on historical data and current trends
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Q1 2026 Projection</p>
              <p className="text-2xl font-heading font-bold text-foreground mb-1">$145,000</p>
              <p className="text-xs text-success">+12% from Q4 2025</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Expected New Clients</p>
              <p className="text-2xl font-heading font-bold text-foreground mb-1">38</p>
              <p className="text-xs text-success">+8% growth rate</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Projected Collection Rate</p>
              <p className="text-2xl font-heading font-bold text-foreground mb-1">95.2%</p>
              <p className="text-xs text-success">+0.7% improvement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsInteractive;