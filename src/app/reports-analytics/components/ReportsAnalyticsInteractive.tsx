'use client';

import { useState, useEffect } from 'react';
import { useReports } from '@/lib/hooks';
import RevenueChart from './RevenueChart';
import PaymentStatusChart from './PaymentStatusChart';
import ClientPerformanceChart from './ClientPerformanceChart';
import KPICard from './KPICard';
import ReportFilters from './ReportFilters';
import ReportsTable from './ReportsTable';
import Icon from '@/components/ui/AppIcon';
import { useReportPDF } from '@/lib/hooks';
import { checkUsageLimit, trackActionAction } from '@/lib/actions/subscription';
import PlanLimitModal from '@/components/modals/PlanLimitModal';
import { toast } from 'sonner';

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
  change?: number;
  icon: string;
  trend?: 'up' | 'down';
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
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitActionInfo, setLimitActionInfo] = useState<{ action: string; current: number; limit: number; allowPayg?: boolean } | null>(null);
  const { generateReportPDF } = useReportPDF();

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
  const currency = data?.currency || 'KES';
  const businessProfile = data?.businessProfile;

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Refetch will be triggered by the useEffect in useReports when dateRange changes
  };

  const handleExportClients = async () => {
    if (!data?.allClients) return;
    
    // Check limit
    const limitCheck = await checkUsageLimit('report_exports');
    if (!limitCheck.allowed) {
      setLimitActionInfo({
        action: 'report_exports',
        limit: limitCheck.limit ?? 0,
        current: limitCheck.current ?? 0,
        allowPayg: limitCheck.allowPayg ?? false
      });
      setLimitModalOpen(true);
      return;
    }

    generateReportPDF({
      title: 'Full Clients Report',
      subtitle: `As of ${new Date().toLocaleDateString()}`,
      data: data.allClients,
      columns: [
        { header: 'Company', dataKey: 'company_name' },
        { header: 'Contact', dataKey: 'contact_person' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Billed', dataKey: 'total_billed', format: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val) },
        { header: 'Balance', dataKey: 'outstanding_balance', format: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val) },
      ],
      businessProfile,
      fileName: 'Client_Database_Report.pdf'
    });
    
    await trackActionAction('report_exports', undefined, { report: 'clients_report' });
    setIsExportMenuOpen(false);
  };

  const handleExportProducts = async () => {
    if (!data?.allProducts) return;

    // Check limit
    const limitCheck = await checkUsageLimit('report_exports');
    if (!limitCheck.allowed) {
      setLimitActionInfo({
        action: 'report_exports',
        limit: limitCheck.limit ?? 0,
        current: limitCheck.current ?? 0,
        allowPayg: limitCheck.allowPayg ?? false
      });
      setLimitModalOpen(true);
      return;
    }

    generateReportPDF({
      title: 'Products & Services Catalog',
      subtitle: `Price List - Generated ${new Date().toLocaleDateString()}`,
      data: data.allProducts,
      columns: [
        { header: 'Item Name', dataKey: 'name' },
        { header: 'Description', dataKey: 'description' },
        { header: 'Rate', dataKey: 'price', format: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val) },
        { header: 'Unit', dataKey: 'unit' },
      ],
      businessProfile,
      fileName: 'Products_Catalog_Report.pdf'
    });
    
    await trackActionAction('report_exports', undefined, { report: 'products_report' });
    setIsExportMenuOpen(false);
  };

  const handleExportPerformance = async () => {
    if (!reportsTableData) return;

    // Check limit
    const limitCheck = await checkUsageLimit('report_exports');
    if (!limitCheck.allowed) {
      setLimitActionInfo({
        action: 'report_exports',
        limit: limitCheck.limit ?? 0,
        current: limitCheck.current ?? 0,
        allowPayg: limitCheck.allowPayg ?? false
      });
      setLimitModalOpen(true);
      return;
    }

    generateReportPDF({
      title: 'Business Performance Summary',
      subtitle: 'Client-wise revenue and collection analysis',
      data: reportsTableData,
      columns: [
        { header: 'Entity', dataKey: 'client' },
        { header: 'Volume', dataKey: 'invoiceCount' },
        { header: 'Gross', dataKey: 'totalRevenue', format: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val) },
        { header: 'Collection %', dataKey: 'paymentRate', format: (val) => `${val.toFixed(0)}%` },
        { header: 'Outstanding', dataKey: 'outstanding', format: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val) },
      ],
      businessProfile,
      fileName: 'Business_Performance_Report.pdf'
    });
    
    await trackActionAction('report_exports', undefined, { report: 'performance_report' });
    setIsExportMenuOpen(false);
  };

  const handleExportInvoices = async () => {
    if (!data?.allInvoices) return;

    // Check limit
    const limitCheck = await checkUsageLimit('report_exports');
    if (!limitCheck.allowed) {
      setLimitActionInfo({
        action: 'report_exports',
        limit: limitCheck.limit ?? 0,
        current: limitCheck.current ?? 0,
        allowPayg: limitCheck.allowPayg ?? false
      });
      setLimitModalOpen(true);
      return;
    }

    generateReportPDF({
      title: 'Detailed Invoice Records',
      subtitle: `Full Transaction History - ${new Date().toLocaleDateString()}`,
      data: data.allInvoices,
      columns: [
        { header: 'Number', dataKey: 'invoice_number' },
        { header: 'Client', dataKey: 'client_name', format: (_, item) => item?.clients?.company_name || 'N/A' },
        { header: 'Issue Date', dataKey: 'issue_date', format: (val) => new Date(val).toLocaleDateString() },
        { header: 'Due Date', dataKey: 'due_date', format: (val) => new Date(val).toLocaleDateString() },
        { header: 'Status', dataKey: 'status', format: (val) => val.toUpperCase() },
        { header: 'Total', dataKey: 'total_amount', format: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val) },
      ],
      businessProfile,
      fileName: 'Detailed_Invoice_Ledger.pdf'
    });
    
    await trackActionAction('report_exports', undefined, { report: 'invoices_report' });
    setIsExportMenuOpen(false);
  };
   // ... rest of the code ...

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted rounded-xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-2xl" />
              ))}
            </div>
            <div className="h-[500px] bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20">
            <h1 className="text-4xl font-heading font-black text-foreground tracking-tight sm:text-5xl mb-6">
              Reports & Analytics
            </h1>
            <p className="text-destructive mb-8 text-lg font-medium">Error loading reports data: {error}</p>
            <button
              onClick={() => refetch()}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-elevation-4 transition-all active:scale-[0.95]"
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-heading font-black text-foreground tracking-tight sm:text-5xl">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-3 text-lg font-medium">
              Track and analyze your business performance.
            </p>
          </div>
          <div className="flex items-center gap-3 relative">
             <button 
               onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
               className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm shadow-elevation-2 hover:shadow-elevation-3 transition-smooth flex items-center gap-2"
             >
               <Icon name="ArrowDownTrayIcon" size={18} />
               <span>Export Insights</span>
               <Icon name="ChevronDownIcon" size={14} className={`transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             {isExportMenuOpen && (
               <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border/50 rounded-2xl shadow-elevation-4 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                 <div className="p-2">
                   <button
                     onClick={handleExportPerformance}
                     className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 rounded-xl transition-smooth group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white">
                       <Icon name="PresentationChartBarIcon" size={18} />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-foreground">Performance Summary</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Revenue & Collection</p>
                     </div>
                   </button>
                   
                   <button
                     onClick={handleExportClients}
                     className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 rounded-xl transition-smooth group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white">
                       <Icon name="UserGroupIcon" size={18} />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-foreground">Client Directory</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Full Database List</p>
                     </div>
                   </button>

                   <button
                     onClick={handleExportProducts}
                     className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 rounded-xl transition-smooth group"
                   >
                     <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white">
                       <Icon name="ShoppingBagIcon" size={18} />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-foreground">Product Catalog</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Services & Pricing</p>
                     </div>
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-10">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        <div className="mb-10 bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
          <ReportFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-heading font-black text-foreground tracking-tight">
                Revenue Growth
              </h3>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <Icon name="ArrowTrendingUpIcon" size={20} />
              </div>
            </div>
            <RevenueChart data={revenueData} currency={currency} />
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-heading font-black text-foreground tracking-tight">
                Invoice Status
              </h3>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <Icon name="ChartPieIcon" size={20} />
              </div>
            </div>
            <PaymentStatusChart data={paymentStatusData} currency={currency} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-10">
          <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-heading font-black text-foreground tracking-tight">
                Client Acquisition & Activity
              </h3>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Icon name="UserGroupIcon" size={20} />
              </div>
            </div>
            <ClientPerformanceChart data={clientPerformanceData} />
          </div>
        </div>

        <div className="mb-10">
          <ReportsTable data={reportsTableData} currency={currency} />
        </div>
      </div>
      <PlanLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        action={limitActionInfo?.action || 'report_exports'}
        current={limitActionInfo?.current || 0}
        limit={limitActionInfo?.limit || 0}
        allowPayg={limitActionInfo?.allowPayg}
      />
    </div>
  );
};

export default ReportsAnalyticsInteractive;