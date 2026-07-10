import { getAdminInvoices } from '@/lib/actions/admin';
import AdminInvoicesClient from '../components/AdminInvoicesClient';

export const metadata = { title: 'Invoices | Admin Panel' };

export default async function AdminInvoicesPage({
 searchParams,
}: {
 searchParams: { page?: string; search?: string; status?: string };
}) {
 const page = parseInt(searchParams.page || '1', 10);
 const search = searchParams.search || '';
 const status = searchParams.status || '';

 const { invoices, total, pageSize } = await getAdminInvoices(page, 25, search, status);

 return (
 <AdminInvoicesClient
 invoices={invoices as any}
 total={total}
 page={page}
 pageSize={pageSize}
 initialSearch={search}
 initialStatus={status}
 />
 );
}
