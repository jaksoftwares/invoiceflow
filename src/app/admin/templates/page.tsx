import { getAdminTemplateStats } from '@/lib/actions/admin';
import AdminTemplatesClient from '../components/AdminTemplatesClient';

export const metadata = { title: 'Templates | Admin Panel' };

export default async function AdminTemplatesPage() {
 const templates = await getAdminTemplateStats();

 return <AdminTemplatesClient templates={templates} />;
}
