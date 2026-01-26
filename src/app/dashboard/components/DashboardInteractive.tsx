'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/hooks/useDashboard';
import type { Invoice, ClientActivity } from '@/types/database';
import MetricCard from './MetricCard';
import QuickActionButton from './QuickActionButton';
import RecentInvoicesTable from './RecentInvoicesTable';
import RevenueChart from './RevenueChart';
import RecentClientActivity from './RecentClientActivity';
import { CardSkeleton } from '@/components/ui/CardSkeleton';
import { ChartSkeleton } from '@/components/ui/ChartSkeleton';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
  };
}

interface ActivityWithClient extends ClientActivity {
  clients?: {
    company_name: string;
    avatar_url?: string;
  };
}

interface RevenueChartData {
  period: string;
  revenue: number;
}

interface DashboardMetrics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
}

interface InitialData {
  metrics: DashboardMetrics;
  recentInvoices: InvoiceWithClient[];
  recentActivities: ActivityWithClient[];
  revenueChart: RevenueChartData[];
}

interface DashboardInteractiveProps {
  initialData?: InitialData | null;
}


const DashboardInteractive = ({ initialData }: DashboardInteractiveProps) => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    metrics: hookMetrics,
    recentInvoices: hookInvoices,
    recentActivities: hookActivities,
    revenueChart: hookChart,
    loading,
    error,
  } = useDashboard({ autoFetch: !initialData });

  // Use initial data if available, otherwise use hook data
  const metrics = initialData?.metrics || hookMetrics;
  const recentInvoices = initialData?.recentInvoices || hookInvoices;
  const recentActivities = initialData?.recentActivities || hookActivities;
  const revenueChart = initialData?.revenueChart || hookChart;

  useEffect(() => {
    setIsHydrated(true);
  }, []);


  const handleViewInvoice = (id: string) => {
    if (!isHydrated) return;
    router.push('/invoice-management');
  };

  const handleCreateInvoice = () => {
    if (!isHydrated) return;
    router.push('/create-invoice');
  };

  const handleAddClient = () => {
    if (!isHydrated) return;
    router.push('/client-management');
  };

  const handleGenerateReport = () => {
    if (!isHydrated) return;
    router.push('/reports-analytics');
  };

  const isLoading = !isHydrated || (!initialData && (loading.metrics || loading.recentInvoices || loading.recentActivities || loading.revenueChart));
  const hasErrors = error.metrics || error.recentInvoices || error.recentActivities || error.revenueChart;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
            <CardSkeleton count={4} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ChartSkeleton />
              </div>
              <div>
                <TableSkeleton rows={5} columns={3} />
              </div>
            </div>
            <TableSkeleton rows={5} columns={4} />
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasErrors && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <h3 className="text-error font-medium mb-2">Some data could not be loaded:</h3>
            <ul className="text-sm text-error/80 space-y-1">
              {error.metrics && <li>• Dashboard metrics: {error.metrics}</li>}
              {error.recentInvoices && <li>• Recent invoices: {error.recentInvoices}</li>}
              {error.recentActivities && <li>• Recent activities: {error.recentActivities}</li>}
              {error.revenueChart && <li>• Revenue chart: {error.revenueChart}</li>}
            </ul>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={metrics ? `$${metrics.totalRevenue.toLocaleString()}` : '$0'}
            change="+12.5%"
            trend="up"
            icon="💰"
            chartData={[45, 52, 48, 61, 58, 67, 72]} />

          <MetricCard
            title="Outstanding Payments"
            value={metrics ? `$${metrics.pendingInvoices.toString()}` : '0'}
            change="-8.3%"
            trend="down"
            icon="⏳"
            chartData={[35, 32, 28, 30, 26, 25, 24]} />

          <MetricCard
            title="Recent Invoices"
            value={metrics ? metrics.totalInvoices.toString() : '0'}
            change="+15.2%"
            trend="up"
            icon="📄"
            chartData={[32, 35, 38, 41, 43, 45, 47]} />

          <MetricCard
            title="Monthly Growth"
            value="18.7%"
            change="+3.4%"
            trend="up"
            icon="📈"
            chartData={[12, 13, 14, 15, 16, 17, 18]} />

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <QuickActionButton
            label="Create Invoice"
            icon="PlusCircleIcon"
            onClick={handleCreateInvoice}
            variant="accent" />

          <QuickActionButton
            label="Add Client"
            icon="UserPlusIcon"
            onClick={handleAddClient}
            variant="primary" />

          <QuickActionButton
            label="Generate Report"
            icon="DocumentChartBarIcon"
            onClick={handleGenerateReport}
            variant="secondary" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueChart} />
          </div>
          <div>
            <RecentClientActivity activities={recentActivities} />
          </div>
        </div>

        <RecentInvoicesTable invoices={recentInvoices} onViewInvoice={handleViewInvoice} />
      </div>
    </div>);

};

export default DashboardInteractive;