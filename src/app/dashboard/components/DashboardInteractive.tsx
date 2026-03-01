'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/hooks/useDashboard';
import type { Invoice, ClientActivity } from '@/types/database';
import MetricCard from './MetricCard';
import RecentInvoicesTable from './RecentInvoicesTable';
import RevenueChart from './RevenueChart';
import RecentClientActivity from './RecentClientActivity';
import Icon from '@/components/ui/AppIcon';
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
  currency?: string;
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  subscription?: any;
  usage?: any;
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

  const metrics = initialData?.metrics || hookMetrics;
  const recentInvoices = initialData?.recentInvoices || hookInvoices;
  const recentActivities = initialData?.recentActivities || hookActivities;
  const revenueChart = initialData?.revenueChart || hookChart;
  const currency = initialData?.currency || 'KES';

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(amount);
  };

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
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
          <div className="space-y-8">
            <div className="h-12 bg-slate-200 rounded-2xl w-64 animate-pulse"></div>
            <CardSkeleton count={4} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <ChartSkeleton />
              </div>
              <div className="lg:col-span-2">
                <TableSkeleton rows={5} columns={2} />
              </div>
            </div>
            <TableSkeleton rows={5} columns={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {hasErrors && (
          <div className="mb-10 p-5 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-center gap-4 text-amber-800 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-200/50 flex items-center justify-center">
              <Icon name="ExclamationTriangleIcon" size={20} />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest">Connection Note</p>
              <p className="text-sm font-medium opacity-80">Using cached data to ensure stability. Your dashboard is fully functional.</p>
            </div>
          </div>
        )}

        {(initialData?.usage?.invoices_created / initialData?.subscription?.plans?.max_invoices_per_month) >= 0.8 && (
          <div className="mb-10 p-6 bg-gradient-to-r from-rose-500 to-orange-500 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-2xl animate-pulse">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Icon name="BoltIcon" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Usage Limit Alert</h3>
                <p className="font-medium opacity-90">You have used {initialData?.usage?.invoices_created} of your {initialData?.subscription?.plans?.max_invoices_per_month} monthly invoices. Upgrade now to avoid service interruption.</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/dashboard/subscription')}
              className="bg-white text-rose-500 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 whitespace-nowrap"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div>
            {/* <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-1.5 bg-primary rounded-full"></span>
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em]">Executive Dashboard</span>
            </div> */}
            <h1 className="text-6xl font-heading font-black text-slate-900 tracking-tighter leading-none mb-4">
              Welcome back, <span className="text-primary italic">{initialData?.profile?.first_name || 'User'}</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">
              Here is an overview of your business performance and recent activities.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleCreateInvoice}
               className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-2xl hover:bg-primary transition-all hover:-translate-y-1.5 flex items-center gap-3 group active:scale-95"
             >
               <Icon name="PlusIcon" size={20} className="group-hover:rotate-180 transition-smooth" />
               <span className="uppercase tracking-widest">New Invoice</span>
             </button>
             <button 
               onClick={() => router.push('/dashboard/subscription')}
               className="bg-white border-2 border-primary/20 text-primary px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl hover:bg-primary/5 transition-all hover:-translate-y-1.5 flex flex-col items-center justify-center group active:scale-95"
             >
               <div className="flex items-center gap-2 mb-1">
                 <Icon name="CreditCardIcon" size={16} />
                 <span className="uppercase tracking-widest leading-none">{initialData?.subscription?.plans?.name || 'Free'} Plan</span>
               </div>
               <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden min-w-[120px]">
                 <div 
                   className="h-full bg-primary" 
                   style={{ width: `${Math.min(((initialData?.usage?.invoices_created || 0) / (initialData?.subscription?.plans?.max_invoices_per_month || 5)) * 100, 100)}%` }}
                 />
               </div>
             </button>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <MetricCard
            title="Total Revenue"
            value={metrics ? formatCurrency(metrics.totalRevenue, currency) : formatCurrency(0, currency)}
            icon="BanknotesIcon" 
            trend="up"
          />

          <MetricCard
            title="Pending Invoices"
            value={metrics ? metrics.pendingInvoices.toString() : '0'}
            icon="ClockIcon" 
            trend="down"
          />

          <MetricCard
            title="Total Invoices"
            value={metrics ? metrics.totalInvoices.toString() : '0'}
            icon="DocumentCheckIcon" 
          />

          <MetricCard
            title="Average Value"
            value={metrics?.totalInvoices ? formatCurrency(metrics.totalRevenue / metrics.totalInvoices, currency) : formatCurrency(0, currency)}
            icon="ChartBarSquareIcon" 
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-elevation-4 transition-all cursor-pointer group flex flex-col items-center text-center" onClick={handleCreateInvoice}>
              <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <Icon name="DocumentPlusIcon" size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Create Invoice</h3>
           </div>
           
           <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-elevation-4 transition-all cursor-pointer group flex flex-col items-center text-center" onClick={handleAddClient}>
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Icon name="UserGroupIcon" size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Manage Clients</h3>
           </div>

           <div className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-elevation-4 transition-all cursor-pointer group flex flex-col items-center text-center" onClick={handleGenerateReport}>
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Icon name="PresentationChartLineIcon" size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Analytics</h3>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16 items-stretch">
          <div className="lg:col-span-3">
            <div className="h-full">
               <RevenueChart data={revenueChart} currency={currency} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-full">
               <RecentClientActivity activities={recentActivities} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden mb-10">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Recent Invoices</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Latest Invoices</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/invoice-management')}
              className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-900 hover:text-white transition-all flex items-center gap-3 shadow-sm"
            >
              <span className="uppercase tracking-widest">All Records</span>
              <Icon name="ArrowRightIcon" size={16} />
            </button>
          </div>
          <div className="px-4 pb-4">
             <RecentInvoicesTable invoices={recentInvoices} onViewInvoice={handleViewInvoice} />
          </div>
        </div>

        <footer className="mt-20 py-10 border-t border-slate-200 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[1em]">InvoiceFlow • Professional Billing</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardInteractive;