import React from 'react';
import NavigationWrapper from '../../components/common/NavigationWrapper';
import DashboardInteractive from './components/DashboardInteractive';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();

  // Fetch initial dashboard data on server
  const { data: { user } } = await supabase.auth.getUser();

  let initialData = null;
  if (user) {
    // Fetch metrics
    const { count: totalInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: paidInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'paid');

    const { count: pendingInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['sent', 'overdue']);

    const { data: paidAmounts } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('user_id', user.id)
      .eq('status', 'paid');

    const totalRevenue = paidAmounts?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    // Fetch recent invoices
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select('*, clients(company_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent activities
    const { data: recentActivities } = await supabase
      .from('client_activities')
      .select('*, clients!inner(company_name, avatar_url)')
      .eq('clients.user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Fetch revenue chart data
    const { data: paidInvoicesForChart } = await supabase
      .from('invoices')
      .select('issue_date, total_amount')
      .eq('user_id', user.id)
      .eq('status', 'paid');

    const grouped = (paidInvoicesForChart || []).reduce((acc, inv) => {
      const date = new Date(inv.issue_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + inv.total_amount;
      return acc;
    }, {} as Record<string, number>);

    const revenueChart = Object.entries(grouped)
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period));

    initialData = {
      metrics: {
        totalInvoices: totalInvoices || 0,
        paidInvoices: paidInvoices || 0,
        pendingInvoices: pendingInvoices || 0,
        totalRevenue,
      },
      recentInvoices: recentInvoices || [],
      recentActivities: recentActivities || [],
      revenueChart,
    };
  }

  return (
    <NavigationWrapper>
      <div className="min-h-screen bg-background">
        <DashboardInteractive initialData={initialData} />
      </div>
    </NavigationWrapper>
  );
}