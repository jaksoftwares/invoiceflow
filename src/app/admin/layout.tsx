import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminShell from './components/AdminShell';

export const metadata = {
 title: 'Admin Panel | Invoice Flow',
 description: 'Manage users, usage, and platform settings.',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();

 if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    redirect('/dashboard');
  }

 return <AdminShell user={{ email: user.email!, id: user.id }}>{children}</AdminShell>;
}
