'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from './MetricCard';
import QuickActionButton from './QuickActionButton';
import RecentInvoicesTable from './RecentInvoicesTable';
import RevenueChart from './RevenueChart';
import RecentClientActivity from './RecentClientActivity';

interface Invoice {
  id: string;
  clientName: string;
  amount: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface ChartDataPoint {
  month: string;
  revenue: number;
}

interface ClientActivity {
  id: string;
  clientName: string;
  clientImage: string;
  clientImageAlt: string;
  activity: string;
  timestamp: string;
  type: 'new' | 'communication' | 'payment';
}

const DashboardInteractive = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const mockInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    clientName: "Acme Corporation",
    amount: "$12,500.00",
    dueDate: "01/25/2026",
    status: "paid"
  },
  {
    id: "INV-2026-002",
    clientName: "TechStart Solutions",
    amount: "$8,750.00",
    dueDate: "01/28/2026",
    status: "pending"
  },
  {
    id: "INV-2026-003",
    clientName: "Global Enterprises",
    amount: "$15,200.00",
    dueDate: "01/20/2026",
    status: "overdue"
  },
  {
    id: "INV-2026-004",
    clientName: "Innovation Labs",
    amount: "$6,300.00",
    dueDate: "02/05/2026",
    status: "pending"
  },
  {
    id: "INV-2026-005",
    clientName: "Digital Dynamics",
    amount: "$9,800.00",
    dueDate: "01/22/2026",
    status: "paid"
  }];


  const revenueChartData: ChartDataPoint[] = [
  { month: "Jul", revenue: 45000 },
  { month: "Aug", revenue: 52000 },
  { month: "Sep", revenue: 48000 },
  { month: "Oct", revenue: 61000 },
  { month: "Nov", revenue: 58000 },
  { month: "Dec", revenue: 67000 },
  { month: "Jan", revenue: 72000 }];


  const clientActivities: ClientActivity[] = [
  {
    id: "1",
    clientName: "Sarah Mitchell",
    clientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1a9e8814c-1763296696290.png",
    clientImageAlt: "Professional woman with brown hair in business attire smiling at camera",
    activity: "New client added to the system",
    timestamp: "2 hours ago",
    type: "new"
  },
  {
    id: "2",
    clientName: "Marcus Chen",
    clientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_126462a6a-1763296203627.png",
    clientImageAlt: "Asian businessman in navy suit with confident expression",
    activity: "Sent payment confirmation email",
    timestamp: "5 hours ago",
    type: "communication"
  },
  {
    id: "3",
    clientName: "Elena Rodriguez",
    clientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1d11c76b3-1763294269112.png",
    clientImageAlt: "Hispanic professional with dark hair in modern office setting",
    activity: "Payment received for Invoice INV-2026-001",
    timestamp: "1 day ago",
    type: "payment"
  },
  {
    id: "4",
    clientName: "James Thompson",
    clientImage: "https://img.rocket.new/generatedImages/rocket_gen_img_162b998fb-1763294956622.png",
    clientImageAlt: "Caucasian man with glasses in casual business attire",
    activity: "Requested invoice modification",
    timestamp: "2 days ago",
    type: "communication"
  }];


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

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) =>
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
              )}
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value="$72,450"
            change="+12.5%"
            trend="up"
            icon="💰"
            chartData={[45, 52, 48, 61, 58, 67, 72]} />

          <MetricCard
            title="Outstanding Payments"
            value="$24,050"
            change="-8.3%"
            trend="down"
            icon="⏳"
            chartData={[35, 32, 28, 30, 26, 25, 24]} />

          <MetricCard
            title="Recent Invoices"
            value="47"
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
            <RevenueChart data={revenueChartData} />
          </div>
          <div>
            <RecentClientActivity activities={clientActivities} />
          </div>
        </div>

        <RecentInvoicesTable invoices={mockInvoices} onViewInvoice={handleViewInvoice} />
      </div>
    </div>);

};

export default DashboardInteractive;