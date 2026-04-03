import { getAdminUsers } from '@/lib/actions/admin';
import AdminUsersClient from '../components/AdminUsersClient';

export const metadata = {
  title: 'Users | Admin Panel',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';
  const { users, total, pageSize } = await getAdminUsers(page, 20, search);

  return <AdminUsersClient users={users} total={total} page={page} pageSize={pageSize} initialSearch={search} />;
}

