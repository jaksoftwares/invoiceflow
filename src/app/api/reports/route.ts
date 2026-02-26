import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';

export const dynamic = 'force-dynamic';

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

    // Determine currency
    const { data: currencyData } = await supabase
      .from('invoices')
      .select('currency')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    const currency = currencyData?.currency || 'KES';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

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
      expenses: 0 // Remove mock expenses
    }));

    // Payment status distribution
    const { data: paymentStatusData } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('user_id', user.id);

    const paymentStatus: { [key: string]: number } = {};
    paymentStatusData?.forEach(invoice => {
      // Grouping logic: pending includes sent, draft, etc.
      const statusKey = invoice.status === 'paid' ? 'paid' : 
                        invoice.status === 'overdue' ? 'overdue' : 'pending';
      paymentStatus[statusKey] = (paymentStatus[statusKey] || 0) + invoice.total_amount;
    });

    const paymentStatusChart = [
      { name: 'Paid', value: paymentStatus.paid || 0, color: '#10b981' }, // success
      { name: 'Pending', value: paymentStatus.pending || 0, color: '#f59e0b' }, // warning
      { name: 'Overdue', value: paymentStatus.overdue || 0, color: '#ef4444' } // error
    ].filter(item => item.value > 0);

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

    // Better grouping for client performance
    const months: string[] = [];
    const tempDate = new Date(startDate);
    while (tempDate <= now) {
      months.push(tempDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }));
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    const clientPerformanceChart = months.map(month => {
      const monthNew = clientData?.filter(c => 
        new Date(c.created_at).toLocaleString('en-US', { month: 'short', year: 'numeric' }) === month
      ).length || 0;
      
      const monthActive = new Set(invoiceData?.filter(i => 
        new Date(i.created_at).toLocaleString('en-US', { month: 'short', year: 'numeric' }) === month
      ).map(i => i.client_id)).size;

      return {
        month,
        newClients: monthNew,
        activeClients: monthActive
      };
    });

    // KPIs calculation
    const totalRevenue = revenueData?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const totalInvoices = paymentStatusData?.length || 0;
    const paidInvoices = paymentStatusData?.filter(inv => inv.status === 'paid').length || 0;
    const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
    const outstandingAmount = (paymentStatus.pending || 0) + (paymentStatus.overdue || 0);

    const kpis = [
      {
        title: 'Total Revenue',
        value: formatter.format(totalRevenue),
        icon: 'BanknotesIcon',
      },
      {
        title: 'Average Deal',
        value: formatter.format(avgInvoiceValue),
        icon: 'PresentationChartLineIcon',
      },
      {
        title: 'Collection Rate',
        value: `${collectionRate.toFixed(1)}%`,
        icon: 'CheckCircleIcon',
      },
      {
        title: 'Outstanding',
        value: formatter.format(outstandingAmount),
        icon: 'ClockIcon',
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

    // Fetch Business Profile for branding
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    // Fetch all clients for the "Clients Report"
    const { data: allClients } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);

    // Fetch all products for the "Products Report"
    const { data: allProducts } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id);

    // Fetch all invoices for detailed report
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('*, clients(company_name)')
      .eq('user_id', user.id)
      .order('issue_date', { ascending: false });

    return NextResponse.json({
      revenueChart,
      paymentStatusChart,
      clientPerformanceChart,
      kpis,
      reportsTable,
      currency,
      businessProfile,
      allClients,
      allProducts,
      allInvoices: allInvoices || []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}