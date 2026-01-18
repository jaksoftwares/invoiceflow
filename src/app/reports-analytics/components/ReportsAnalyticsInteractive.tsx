'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const revenueData: RevenueData[] = [
    { month: 'Jul', revenue: 65000, expenses: 42000 },
    { month: 'Aug', revenue: 72000, expenses: 45000 },
    { month: 'Sep', revenue: 68000, expenses: 43000 },
    { month: 'Oct', revenue: 85000, expenses: 48000 },
    { month: 'Nov', revenue: 92000, expenses: 52000 },
    { month: 'Dec', revenue: 103000, expenses: 55000 }
  ];

  const paymentStatusData: PaymentStatusData[] = [
    { name: 'Paid', value: 325000, color: 'var(--color-success)' },
    { name: 'Pending', value: 85000, color: 'var(--color-warning)' },
    { name: 'Overdue', value: 35000, color: 'var(--color-error)' }
  ];

  const clientPerformanceData: ClientPerformanceData[] = [
    { month: 'Jul', newClients: 8, activeClients: 45 },
    { month: 'Aug', newClients: 12, activeClients: 52 },
    { month: 'Sep', newClients: 6, activeClients: 54 },
    { month: 'Oct', newClients: 15, activeClients: 63 },
    { month: 'Nov', newClients: 10, activeClients: 68 },
    { month: 'Dec', newClients: 14, activeClients: 75 }
  ];

  const kpiData: KPIData[] = [
    { title: 'Total Revenue', value: '$485,000', change: 18.5, icon: 'CurrencyDollarIcon', trend: 'up' },
    { title: 'Average Invoice Value', value: '$1,418', change: 5.2, icon: 'DocumentTextIcon', trend: 'up' },
    { title: 'Collection Rate', value: '94.5%', change: 3.8, icon: 'CheckCircleIcon', trend: 'up' },
    { title: 'Outstanding Amount', value: '$35,000', change: 12.3, icon: 'ExclamationCircleIcon', trend: 'down' }
  ];

  const reportsTableData: ReportRow[] = [
    { id: 1, client: 'Acme Corporation', invoiceCount: 24, totalRevenue: 85000, avgInvoiceValue: 3542, paymentRate: 96, outstanding: 3400 },
    { id: 2, client: 'TechStart Solutions', invoiceCount: 18, totalRevenue: 62000, avgInvoiceValue: 3444, paymentRate: 94, outstanding: 3720 },
    { id: 3, client: 'Global Enterprises', invoiceCount: 32, totalRevenue: 125000, avgInvoiceValue: 3906, paymentRate: 98, outstanding: 2500 },
    { id: 4, client: 'Digital Innovations', invoiceCount: 15, totalRevenue: 48000, avgInvoiceValue: 3200, paymentRate: 92, outstanding: 3840 },
    { id: 5, client: 'Creative Studios', invoiceCount: 21, totalRevenue: 72000, avgInvoiceValue: 3429, paymentRate: 95, outstanding: 3600 },
    { id: 6, client: 'Business Partners LLC', invoiceCount: 28, totalRevenue: 93000, avgInvoiceValue: 3321, paymentRate: 91, outstanding: 8370 }
  ];

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (!isHydrated) {
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
          <ReportFilters onFilterChange={handleFilterChange} />
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