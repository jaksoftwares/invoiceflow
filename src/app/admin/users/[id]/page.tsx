import { notFound } from 'next/navigation';
import { getAdminUserFullDetail, getAdminPlans } from '@/lib/actions/admin';
import AdminUserDetailClient from '../../components/AdminUserDetailClient';

export const metadata = { title: 'User Detail | Admin Panel' };

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [detail, plans] = await Promise.all([
    getAdminUserFullDetail(params.id),
    getAdminPlans(),
  ]);

  if (!detail.profile) notFound();

  return (
    <AdminUserDetailClient
      profile={detail.profile as any}
      invoices={detail.invoices as any}
      clients={detail.clients as any}
      products={detail.products as any}
      subscription={detail.subscription as any}
      activityLogs={detail.activityLogs as any}
      payments={detail.payments as any}
      plans={plans as any}
    />
  );
}
