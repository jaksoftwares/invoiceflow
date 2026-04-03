import { getAdminPlans, getAdminSubscriptions } from '@/lib/actions/admin';
import AdminPlansClient from '../components/AdminPlansClient';

export const metadata = { title: 'Plans & Subscriptions | Admin Panel' };

export default async function AdminPlansPage() {
  const [plans, { subscriptions, total }] = await Promise.all([
    getAdminPlans(),
    getAdminSubscriptions(1, 50),
  ]);

  return <AdminPlansClient plans={plans} subscriptions={subscriptions as any} subTotal={total} />;
}
