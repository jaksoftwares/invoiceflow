import { Suspense } from 'react';
import { getAdminOverviewStats, getAdminRevenueChart } from '@/lib/actions/admin';
import AdminOverviewClient from './components/AdminOverviewClient';

export default async function AdminOverviewPage() {
  const [stats, revenueChart] = await Promise.all([
    getAdminOverviewStats(),
    getAdminRevenueChart(),
  ]);

  return (
    <Suspense fallback={<div className="text-white/40 text-sm">Loading...</div>}>
      <AdminOverviewClient stats={stats} revenueChart={revenueChart} />
    </Suspense>
  );
}
