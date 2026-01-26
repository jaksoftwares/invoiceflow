import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date range from query params (default to last 6 months)
    const url = new URL(request.url);
    const dateRange = url.searchParams.get('dateRange') || 'last-6-months';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'last-30-days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last-3-months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last-6-months':
      default:
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'last-year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Revenue data (monthly aggregation)
    const { data: revenueData } = await supabase
      .from('invoices')
      .select('total_amount, created_at, status')
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    // Group by month
    const monthlyRevenue: { [key: string]: number } = {};
    revenueData?.forEach(invoice => {
      const date = new Date(invoice.created_at);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + invoice.total_amount;
    });

    const revenueChart = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
      expenses: revenue * 0.65 // Mock expenses as 65% of revenue
    }));

    // Payment status distribution
    const { data: paymentStatusData } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('user_id', user.id);

    const paymentStatus: { [key: string]: number } = {};
    paymentStatusData?.forEach(invoice => {
      paymentStatus[invoice.status] = (paymentStatus[invoice.status] || 0) + invoice.total_amount;
    });

    const paymentStatusChart = [
      { name: 'Paid', value: paymentStatus.paid || 0, color: 'var(--color-success)' },
      { name: 'Pending', value: (paymentStatus.sent || 0) + (paymentStatus.overdue || 0), color: 'var(--color-warning)' },
      { name: 'Overdue', value: paymentStatus.overdue || 0, color: 'var(--color-error)' }
    ];

    // Client performance data
    const { data: clientData } = await supabase
      .from('clients')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('client_id, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    const monthlyClients: { [key: string]: { new: number; active: number } } = {};
    const activeClients = new Set();

    // New clients per month
    clientData?.forEach(client => {
      const date = new Date(client.created_at);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyClients[monthKey]) {
        monthlyClients[monthKey] = { new: 0, active: 0 };
      }
      monthlyClients[monthKey].new++;
    });

    // Active clients (those with invoices)
    invoiceData?.forEach(invoice => {
      activeClients.add(invoice.client_id);
    });

    // Calculate cumulative active clients
    const sortedMonths = Object.keys(monthlyClients).sort();
    let cumulativeActive = 0;
    sortedMonths.forEach(month => {
      cumulativeActive += monthlyClients[month].new;
      monthlyClients[month].active = cumulativeActive;
    });

    const clientPerformanceChart = Object.entries(monthlyClients).map(([month, data]) => ({
      month,
      newClients: data.new,
      activeClients: data.active
    }));

    // KPIs calculation
    const totalRevenue = revenueData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const totalInvoices = paymentStatusData?.length || 0;
    const paidInvoices = paymentStatusData?.filter(inv => inv.status === 'paid').length || 0;
    const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
    const outstandingAmount = paymentStatus.pending || 0;

    const kpis = [
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: 18.5, // This would need historical comparison
        icon: 'CurrencyDollarIcon',
        trend: 'up' as const
      },
      {
        title: 'Average Invoice Value',
        value: `$${avgInvoiceValue.toFixed(0)}`,
        change: 5.2,
        icon: 'DocumentTextIcon',
        trend: 'up' as const
      },
      {
        title: 'Collection Rate',
        value: `${collectionRate.toFixed(1)}%`,
        change: 3.8,
        icon: 'CheckCircleIcon',
        trend: 'up' as const
      },
      {
        title: 'Outstanding Amount',
        value: `$${outstandingAmount.toLocaleString()}`,
        change: 12.3,
        icon: 'ExclamationCircleIcon',
        trend: 'down' as const
      }
    ];

    // Reports table data
    const { data: reportsData } = await supabase
      .from('invoices')
      .select(`
        id,
        clients(company_name),
        total_amount,
        status,
        created_at
      `)
      .eq('user_id', user.id);

    // Group by client
    const clientReports: { [key: string]: any } = {};
    reportsData?.forEach(invoice => {
      const clientName = (invoice.clients as any)?.company_name || 'Unknown';
      if (!clientReports[clientName]) {
        clientReports[clientName] = {
          client: clientName,
          invoiceCount: 0,
          totalRevenue: 0,
          paidAmount: 0,
          outstanding: 0
        };
      }
      clientReports[clientName].invoiceCount++;
      clientReports[clientName].totalRevenue += invoice.total_amount;
      if (invoice.status === 'paid') {
        clientReports[clientName].paidAmount += invoice.total_amount;
      } else {
        clientReports[clientName].outstanding += invoice.total_amount;
      }
    });

    const reportsTable = Object.values(clientReports).map((report: any, index) => ({
      id: index + 1,
      client: report.client,
      invoiceCount: report.invoiceCount,
      totalRevenue: report.totalRevenue,
      avgInvoiceValue: report.invoiceCount > 0 ? report.totalRevenue / report.invoiceCount : 0,
      paymentRate: report.totalRevenue > 0 ? (report.paidAmount / report.totalRevenue) * 100 : 0,
      outstanding: report.outstanding
    }));

    return NextResponse.json({
      revenueChart,
      paymentStatusChart,
      clientPerformanceChart,
      kpis,
      reportsTable
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}