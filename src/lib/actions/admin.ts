'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Auth Guard ────────────────────────────────────────────────────────────────
async function requireAdmin() {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error('Unauthorized');

 const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
 if (!adminEmails.includes(user.email?.toLowerCase() ?? '')) {
 throw new Error('Forbidden: Admin access required');
 }
 return user;
}

// ─── Platform Overview Stats ───────────────────────────────────────────────────
export async function getAdminOverviewStats() {
 await requireAdmin();
 const admin = createAdminClient();

 const now = new Date();
 const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
 const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
 const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

 const [
 { count: totalUsers },
 { count: newUsersThisMonth },
 { count: totalInvoices },
 { count: invoicesThisMonth },
 { count: totalClients },
 { data: revenueData },
 { data: revenueLastMonth },
 { count: activeSubscriptions },
 ] = await Promise.all([
 admin.from('profiles').select('*', { count: 'exact', head: true }),
 admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
 admin.from('invoices').select('*', { count: 'exact', head: true }),
 admin.from('invoices').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
 admin.from('clients').select('*', { count: 'exact', head: true }),
 admin.from('invoices').select('total_amount').eq('status', 'paid').gte('created_at', startOfMonth),
 admin.from('invoices').select('total_amount').eq('status', 'paid').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
 admin.from('user_settings').select('*', { count: 'exact', head: true }).neq('subscription_plan->name', 'Free'),
 ]);

 const revenueThisMonth = (revenueData || []).reduce((s, r) => s + (r.total_amount || 0), 0);
 const revenueLastMonthTotal = (revenueLastMonth || []).reduce((s, r) => s + (r.total_amount || 0), 0);
 const revenueGrowth = revenueLastMonthTotal > 0
 ? ((revenueThisMonth - revenueLastMonthTotal) / revenueLastMonthTotal) * 100
 : 0;

 return {
 totalUsers: totalUsers || 0,
 newUsersThisMonth: newUsersThisMonth || 0,
 totalInvoices: totalInvoices || 0,
 invoicesThisMonth: invoicesThisMonth || 0,
 totalClients: totalClients || 0,
 revenueThisMonth,
 revenueGrowth: Math.round(revenueGrowth * 10) / 10,
 activeSubscriptions: activeSubscriptions || 0,
 };
}

// ─── Revenue Chart (last 12 months) ───────────────────────────────────────────
export async function getAdminRevenueChart() {
 await requireAdmin();
 const admin = createAdminClient();

 const { data } = await admin
 .from('invoices')
 .select('issue_date, total_amount, currency')
 .eq('status', 'paid')
 .order('issue_date', { ascending: true });

 const grouped: Record<string, number> = {};
 (data || []).forEach(inv => {
 const d = new Date(inv.issue_date);
 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 grouped[key] = (grouped[key] || 0) + (inv.total_amount || 0);
 });

 // Last 12 months only
 const months: { period: string; revenue: number; label: string }[] = [];
 for (let i = 11; i >= 0; i--) {
 const d = new Date();
 d.setMonth(d.getMonth() - i);
 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 months.push({
 period: key,
 revenue: grouped[key] || 0,
 label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
 });
 }
 return months;
}

// ─── All Users ────────────────────────────────────────────────────────────────
export async function getAdminUsers(page = 1, pageSize = 20, search = '') {
 await requireAdmin();
 const admin = createAdminClient();

 let query = admin
 .from('profiles')
 .select(`
 id, first_name, last_name, email, business_name, created_at, onboarding_status,
 user_settings(subscription_plan, usage_stats),
 invoices(count),
 clients(count)
 `, { count: 'exact' })
 .order('created_at', { ascending: false })
 .range((page - 1) * pageSize, page * pageSize - 1);

 if (search) {
 query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`);
 }

 const { data, count, error } = await query;
 if (error) throw error;

 return { users: data || [], total: count || 0, page, pageSize };
}

// ─── Single User Detail ────────────────────────────────────────────────────────
export async function getAdminUserDetail(userId: string) {
 await requireAdmin();
 const admin = createAdminClient();

 const [{ data: profile }, { data: invoices }, { data: clients }] = await Promise.all([
 admin.from('profiles').select('*, user_settings(*)').eq('id', userId).single(),
 admin.from('invoices').select('id, invoice_number, status, total_amount, currency, created_at, due_date').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
 admin.from('clients').select('id, company_name, status, total_billed, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
 ]);

 return { profile, invoices: invoices || [], clients: clients || [] };
}

// ─── Usage Breakdown ──────────────────────────────────────────────────────────
export async function getAdminUsageStats() {
 await requireAdmin();
 const admin = createAdminClient();

 const { data: invoicesByStatus } = await admin
 .from('invoices')
 .select('status');

 const statusCounts: Record<string, number> = {};
 (invoicesByStatus || []).forEach(inv => {
 statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
 });

 const { data: planData } = await admin
 .from('user_settings')
 .select('subscription_plan');

 const planCounts: Record<string, number> = {};
 (planData || []).forEach(s => {
 const name = s.subscription_plan?.name || 'Free';
 planCounts[name] = (planCounts[name] || 0) + 1;
 });

 const { data: signupTrend } = await admin
 .from('profiles')
 .select('created_at')
 .order('created_at', { ascending: true });

 // Group signups by month (last 12)
 const signupGrouped: Record<string, number> = {};
 (signupTrend || []).forEach(p => {
 const d = new Date(p.created_at);
 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 signupGrouped[key] = (signupGrouped[key] || 0) + 1;
 });

 const signupChart: { period: string; count: number; label: string }[] = [];
 for (let i = 11; i >= 0; i--) {
 const d = new Date();
 d.setMonth(d.getMonth() - i);
 const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
 signupChart.push({
 period: key,
 count: signupGrouped[key] || 0,
 label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
 });
 }

 return { invoicesByStatus: statusCounts, planCounts, signupChart };
}

// ─── Recent Activity Log ───────────────────────────────────────────────────────
export async function getAdminActivityLog(limit = 30) {
 await requireAdmin();
 const admin = createAdminClient();

 const { data } = await admin
 .from('client_activities')
 .select('*, clients(company_name, profiles(first_name, last_name, email))')
 .order('timestamp', { ascending: false })
 .limit(limit);

 return data || [];
}

// ─── Toggle User Status ────────────────────────────────────────────────────────
export async function adminBanUser(userId: string, banned: boolean) {
 await requireAdmin();
 const admin = createAdminClient();
 const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: banned ? '87600h' : 'none' });
 if (error) throw error;
 return { success: true };
}

// ─── Delete User ───────────────────────────────────────────────────────────────
export async function adminDeleteUser(userId: string) {
 await requireAdmin();
 const admin = createAdminClient();
 const { error } = await admin.auth.admin.deleteUser(userId);
 if (error) throw error;
 return { success: true };
}

// ─── Plans Management ─────────────────────────────────────────────────────────
export async function getAdminPlans() {
 await requireAdmin();
 const admin = createAdminClient();

 const { data, error } = await admin
 .from('plans')
 .select('*')
 .order('price_monthly', { ascending: true });

 if (error) throw error;
 return data || [];
}

export async function adminUpdatePlan(planId: string, updates: Record<string, any>) {
 await requireAdmin();
 const admin = createAdminClient();

 const { error } = await admin
 .from('plans')
 .update({ ...updates, updated_at: new Date().toISOString() })
 .eq('id', planId);

 if (error) throw error;
 revalidatePath('/admin/plans');
 return { success: true };
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getAdminSubscriptions(page = 1, pageSize = 20, search = '') {
 await requireAdmin();
 const admin = createAdminClient();

 let query = admin
 .from('subscriptions')
 .select(`
 *,
 plans(id, name, price_monthly, price_yearly),
 profiles!subscriptions_user_id_fkey(id, first_name, last_name, email, business_name)
 `, { count: 'exact' })
 .order('created_at', { ascending: false })
 .range((page - 1) * pageSize, page * pageSize - 1);

 const { data, count, error } = await query;
 if (error) throw error;
 return { subscriptions: data || [], total: count || 0, page, pageSize };
}

export async function adminChangeUserPlan(userId: string, planId: string) {
 await requireAdmin();
 const admin = createAdminClient();

 const { data: plan } = await admin.from('plans').select('*').eq('id', planId).single();
 if (!plan) throw new Error('Plan not found');

 const { error } = await admin
 .from('subscriptions')
 .upsert({
 user_id: userId,
 plan_id: planId,
 status: 'active',
 billing_cycle: plan.price_monthly === 0 ? 'free' : 'monthly',
 start_date: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 }, { onConflict: 'user_id' });

 if (error) throw error;
 revalidatePath('/admin/subscriptions');
 revalidatePath('/admin/users');
 return { success: true };
}

export async function adminCancelSubscription(subscriptionId: string) {
 await requireAdmin();
 const admin = createAdminClient();

 const { error } = await admin
 .from('subscriptions')
 .update({ status: 'cancelled', updated_at: new Date().toISOString() })
 .eq('id', subscriptionId);

 if (error) throw error;
 revalidatePath('/admin/subscriptions');
 return { success: true };
}

// ─── Platform Invoices ────────────────────────────────────────────────────────
export async function getAdminInvoices(page = 1, pageSize = 25, search = '', status = '') {
 await requireAdmin();
 const admin = createAdminClient();

 let query = admin
 .from('invoices')
 .select(`
 id, invoice_number, status, total_amount, currency, template,
 issue_date, due_date, created_at,
 profiles!invoices_user_id_fkey(id, first_name, last_name, email, business_name),
 clients!invoices_client_id_fkey(id, company_name)
 `, { count: 'exact' })
 .order('created_at', { ascending: false })
 .range((page - 1) * pageSize, page * pageSize - 1);

 if (status) query = query.eq('status', status);
 if (search) query = query.or(`invoice_number.ilike.%${search}%`);

 const { data, count, error } = await query;
 if (error) throw error;
 return { invoices: data || [], total: count || 0, page, pageSize };
}

export async function adminDeleteInvoice(invoiceId: string) {
 await requireAdmin();
 const admin = createAdminClient();

 const { error } = await admin.from('invoices').delete().eq('id', invoiceId);
 if (error) throw error;
 revalidatePath('/admin/invoices');
 return { success: true };
}

// ─── Template Usage & Management ─────────────────────────────────────────────
export async function getAdminTemplateStats() {
 await requireAdmin();
 const admin = createAdminClient();

 const { data, error } = await admin
 .from('invoices')
 .select('template, status');

 if (error) throw error;

 const stats: Record<string, { count: number; paid: number; draft: number; sent: number }> = {};
 (data || []).forEach(inv => {
 const t = inv.template || 'default';
 if (!stats[t]) stats[t] = { count: 0, paid: 0, draft: 0, sent: 0 };
 stats[t].count++;
 if (inv.status === 'paid') stats[t].paid++;
 else if (inv.status === 'draft') stats[t].draft++;
 else if (inv.status === 'sent') stats[t].sent++;
 });

 return Object.entries(stats).map(([name, s]) => ({ name, ...s }));
}

export async function adminBulkUpdateTemplate(oldTemplate: string, newTemplate: string) {
 await requireAdmin();
 const admin = createAdminClient();

 const { error } = await admin
 .from('invoices')
 .update({ template: newTemplate })
 .eq('template', oldTemplate);

 if (error) throw error;
 revalidatePath('/admin/templates');
 return { success: true };
}

export async function adminDeleteTemplateInvoices(templateName: string) {
 await requireAdmin();
 const admin = createAdminClient();

 // Only delete drafts for safety — never delete paid/sent
 const { error } = await admin
 .from('invoices')
 .delete()
 .eq('template', templateName)
 .eq('status', 'draft');

 if (error) throw error;
 revalidatePath('/admin/templates');
 return { success: true };
}

// ─── Deep User Detail ─────────────────────────────────────────────────────────
export async function getAdminUserFullDetail(userId: string) {
 await requireAdmin();
 const admin = createAdminClient();

 const [
 { data: profile },
 { data: invoices },
 { data: clients },
 { data: products },
 { data: subscription },
 { data: activityLogs },
 { data: payments },
 ] = await Promise.all([
 admin.from('profiles').select('*, user_settings(*)').eq('id', userId).single(),
 admin.from('invoices')
 .select('id, invoice_number, status, total_amount, currency, template, issue_date, due_date, created_at, clients!invoices_client_id_fkey(company_name)')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })
 .limit(50),
 admin.from('clients')
 .select('id, company_name, email, status, total_billed, outstanding_balance, created_at')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })
 .limit(50),
 admin.from('products')
 .select('id, name, price, unit, category, created_at')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })
 .limit(50),
 admin.from('subscriptions')
 .select('*, plans(name, price_monthly)')
 .eq('user_id', userId)
 .maybeSingle(),
 admin.from('activity_logs')
 .select('*')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })
 .limit(100),
 admin.from('subscription_payments')
 .select('*')
 .eq('user_id', userId)
 .order('created_at', { ascending: false })
 .limit(20),
 ]);

 return {
 profile,
 invoices: invoices || [],
 clients: clients || [],
 products: products || [],
 subscription,
 activityLogs: activityLogs || [],
 payments: payments || [],
 };
}
