'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminBanUser, adminDeleteUser } from '@/lib/actions/admin';

interface UserRow {
 id: string;
 first_name: string | null;
 last_name: string | null;
 email: string | null;
 business_name: string | null;
 created_at: string;
 onboarding_status: string | null;
 user_settings?: Array<{
 subscription_plan: { name: string; status: string } | null;
 usage_stats: { invoicesSent: number; clientsAdded: number } | null;
 }>;
 invoices?: { count: number }[];
 clients?: { count: number }[];
}

interface Props {
 users: UserRow[];
 total: number;
 page: number;
 pageSize: number;
 initialSearch: string;
}

function StatusBadge({ status }: { status: string | null }) {
 const map: Record<string, string> = {
 active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
 pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
 banned: 'bg-red-500/15 text-red-400 border-red-500/20',
 };
 const label = status || 'unknown';
 return (
 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${map[label] || 'bg-white/10 text-white/50 border-white/10'}`}>
 {label}
 </span>
 );
}

function PlanBadge({ plan }: { plan: string | null }) {
 const map: Record<string, string> = {
 Free: 'bg-white/10 text-white/50',
 Pro: 'bg-violet-500/15 text-violet-400',
 Business: 'bg-amber-500/15 text-amber-400',
 Enterprise: 'bg-blue-500/15 text-blue-400',
 };
 const label = plan || 'Free';
 return (
 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${map[label] || 'bg-white/10 text-white/50'}`}>
 {label}
 </span>
 );
}

export default function AdminUsersClient({ users, total, page, pageSize, initialSearch }: Props) {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [search, setSearch] = useState(initialSearch);
 const [isPending, startTransition] = useTransition();
 const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'delete'; userId: string; email: string } | null>(null);
 const [actionPending, setActionPending] = useState(false);
 const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

 const totalPages = Math.ceil(total / pageSize);

 const showToast = (message: string, type: 'success' | 'error') => {
 setToast({ message, type });
 setTimeout(() => setToast(null), 3000);
 };

 const handleSearch = useCallback((value: string) => {
 setSearch(value);
 startTransition(() => {
 const params = new URLSearchParams(searchParams.toString());
 if (value) params.set('search', value);
 else params.delete('search');
 params.set('page', '1');
 router.push(`/admin/users?${params.toString()}`);
 });
 }, [router, searchParams]);

 const goToPage = (p: number) => {
 const params = new URLSearchParams(searchParams.toString());
 params.set('page', String(p));
 router.push(`/admin/users?${params.toString()}`);
 };

 const executeAction = async () => {
 if (!confirmAction) return;
 setActionPending(true);
 try {
 if (confirmAction.type === 'delete') {
 await adminDeleteUser(confirmAction.userId);
 showToast(`User ${confirmAction.email} deleted.`, 'success');
 } else {
 await adminBanUser(confirmAction.userId, true);
 showToast(`User ${confirmAction.email} banned.`, 'success');
 }
 router.refresh();
 } catch (e: any) {
 showToast(e.message || 'Action failed', 'error');
 } finally {
 setActionPending(false);
 setConfirmAction(null);
 }
 };

 return (
 <div className="space-y-6">
 {/* Toast */}
 {toast && (
 <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-300 border-emerald-700/40' : 'bg-red-900/90 text-red-300 border-red-700/40'}`}>
 {toast.message}
 </div>
 )}

 {/* Confirm Modal */}
 {confirmAction && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
 <h3 className="text-lg font-semibold text-white mb-2">
 {confirmAction.type === 'delete' ? 'Delete User' : 'Ban User'}
 </h3>
 <p className="text-sm text-white/50 mb-6">
 Are you sure you want to <strong className="text-white">{confirmAction.type}</strong> <span className="text-amber-400">{confirmAction.email}</span>? This action {confirmAction.type === 'delete' ? 'is irreversible.' : 'can be reversed.'}
 </p>
 <div className="flex gap-3">
 <button
 onClick={() => setConfirmAction(null)}
 className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-sm transition-all"
 >
 Cancel
 </button>
 <button
 onClick={executeAction}
 disabled={actionPending}
 className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${confirmAction.type === 'delete' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
 >
 {actionPending ? 'Processing...' : `Confirm ${confirmAction.type === 'delete' ? 'Delete' : 'Ban'}`}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Users</h1>
 <p className="text-sm text-white/40 mt-1">{total.toLocaleString()} registered accounts</p>
 </div>
 </div>

 {/* Search & filters */}
 <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="text"
 placeholder="Search by name, email or business..."
 value={search}
 onChange={e => handleSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#4A6B8A] transition-colors"
 />
 {isPending && (
 <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin" />
 )}
 </div>
 <div className="text-xs text-white/30 self-center px-2">
 Page {page} of {totalPages}
 </div>
 </div>

 {/* Table */}
 <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-white/[0.06]">
 {['User', 'Business', 'Status', 'Plan', 'Invoices', 'Clients', 'Joined', 'Actions'].map(h => (
 <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.04]">
 {users.length === 0 && (
 <tr>
 <td colSpan={8} className="px-4 py-12 text-center text-white/30 text-sm">
 No users found
 </td>
 </tr>
 )}
 {users.map(user => {
 const settings = user.user_settings?.[0];
 const plan = settings?.subscription_plan?.name || 'Free';
 const invoiceCount = (user.invoices as any)?.[0]?.count ?? 0;
 const clientCount = (user.clients as any)?.[0]?.count ?? 0;
 const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || '—';
 const initials = name !== '—' ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
 return (
 <tr key={user.id} onClick={() => router.push(`/admin/users/${user.id}`)} className="hover:bg-white/[0.05] transition-colors group cursor-pointer">
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#4A6B8A] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
 {initials}
 </div>
 <div>
 <div className="text-white font-medium leading-tight">{name}</div>
 <div className="text-xs text-white/40">{user.email || '—'}</div>
 </div>
 </div>
 </td>
 <td className="px-4 py-3 text-white/60 whitespace-nowrap">{user.business_name || '—'}</td>
 <td className="px-4 py-3"><StatusBadge status={user.onboarding_status} /></td>
 <td className="px-4 py-3"><PlanBadge plan={plan} /></td>
 <td className="px-4 py-3 text-white/60">{invoiceCount}</td>
 <td className="px-4 py-3 text-white/60">{clientCount}</td>
 <td className="px-4 py-3 text-white/40 whitespace-nowrap text-xs">
 {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <button
 onClick={e => { e.stopPropagation(); router.push(`/admin/users/${user.id}`); }}
 title="View user"
 className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
 >
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 </button>
 <button
 onClick={e => { e.stopPropagation(); setConfirmAction({ type: 'ban', userId: user.id, email: user.email || '' }); }}
 title="Ban user"
 className="p-1.5 rounded-lg text-white/30 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
 >
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
 </svg>
 </button>
 <button
 onClick={e => { e.stopPropagation(); setConfirmAction({ type: 'delete', userId: user.id, email: user.email || '' }); }}
 title="Delete user"
 className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
 >
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
 </svg>
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="border-t border-white/[0.06] px-4 py-3 flex items-center justify-between">
 <span className="text-xs text-white/30">
 Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}
 </span>
 <div className="flex items-center gap-2">
 <button
 disabled={page <= 1}
 onClick={() => goToPage(page - 1)}
 className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
 >
 ← Prev
 </button>
 {[...Array(Math.min(5, totalPages))].map((_, i) => {
 const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
 return (
 <button
 key={p}
 onClick={() => goToPage(p)}
 className={`w-7 h-7 rounded-lg text-xs transition-all ${p === page ? 'bg-[#1E3A5F] text-white' : 'text-white/40 hover:bg-white/[0.06] hover:text-white'}`}
 >
 {p}
 </button>
 );
 })}
 <button
 disabled={page >= totalPages}
 onClick={() => goToPage(page + 1)}
 className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
 >
 Next →
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
