import { getAdminUsageStats } from '@/lib/actions/admin';
import AdminAnalyticsClient from '../components/AdminAnalyticsClient';

export const metadata = { title: 'Analytics | Admin Panel' };

export default async function AdminAnalyticsPage() {
 const data = await getAdminUsageStats();
 return <AdminAnalyticsClient data={data} />;
}
