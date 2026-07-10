'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminDeleteInvoice } from '@/lib/actions/admin';

interface InvoiceRow {
 id: string;
 invoice_number: string;
 status: string;
 total_amount: number;
 currency: string;
 template: string;
 issue_date: string;
 due_date: string;
 created_at: string;
 profiles: { id: string; first_name: string | null; last_name: string | null; email: string | null; business_name: string | null } | null;
 clients: { id: string; company_name: string } | null;
}

interface Props {
 invoices: InvoiceRow[];
 total: number;
 page: number;
 pageSize: number;
 initialSearch: string;
 initialStatus: string;
}

const statusStyle: Record<string, string> = {
 paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
 sent: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
 draft: 'bg-white/10 text-white/50 border-white/10',
 overdue: 'bg-red-500/15 text-red-400 border-red-500/20',
 cancelled: 'bg-red-500/10 text-red-300/70 border-red-500/10',
};

const STATUSES = ['', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

export default function AdminInvoicesClient({ invoices, total, page, pageSize, initialSearch, initialStatus }: Props) {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [search, setSearch] = useState(initialSearch);
 const [status, setStatus] = useState(initialStatus);
 const [isPending, startTransition] = useTransition();
 const [deleteId, setDeleteId] = useState<string | null>(null);
 const [deleting, startDeleting] = useTransition();
 const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

 const totalPages = Math.ceil(total / pageSize);

 const showToast = (message: string, type: 'success' | 'error') => {
 setToast({ message, type });
 setTimeout(() => setToast(null), 3000);
 };

 const navigate = useCallback((overrides: Record<string, string>) => {
 startTransition(() => {
 const params = new URLSearchParams(searchParams.toString());
 Object.entries(overrides).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
 router.push(`/admin/invoices?${params.toString()}`);
 });
 }, [router, searchParams]);

 const handleSearch = useCallback((val: string) => {
 setSearch(val);
 navigate({ search: val, page: '1' });
 }, [navigate]);

 const handleStatus = (val: string) => {
 setStatus(val);
 navigate({ status: val, page: '1' });
 };

 const doDelete = () => {
 if (!deleteId) return;
 startDeleting(async () => {
 try {
 await adminDeleteInvoice(deleteId);
 showToast('Invoice deleted', 'success');
 setDeleteId(null);
 router.refresh();
 } catch (e: any) {
 showToast(e.message || 'Delete failed', 'error');
 }
 });
 };

 const fmt = (amount: number, currency: string) =>
 new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);

 return (
 <div className="space-y-6">
 {toast && (
 <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-300 border-emerald-700/40' : 'bg-red-900/90 text-red-300 border-red-700/40'}`}>
 {toast.message}
 </div>
 )}

 {/* Delete Confirm */}
 {deleteId && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
 <h3 className="text-lg font-semibold text-white mb-2">Delete Invoice</h3>
 <p className="text-sm text-white/50 mb-6">This invoice will be permanently deleted. This action cannot be undone.</p>
 <div className="flex gap-3">
 <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
 <button onClick={doDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50">
 {deleting ? 'Deleting...' : 'Delete'}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Invoices</h1>
 <p className="text-sm text-white/40 mt-1">{total.toLocaleString()} total invoices across all users</p>
 </div>
 </div>

 {/* Filters */}
 <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
 <div className="relative flex-1">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input type="text" placeholder="Search invoice number..."
 value={search}
 onChange={e => handleSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#4A6B8A] transition-colors"
 />
 {isPending && <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin" />}
 </div>
 <div className="flex gap-2 flex-wrap">
 {STATUSES.map(s => (
 <button key={s || 'all'} onClick={() => handleStatus(s)}
 className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${status === s ? 'bg-[#1E3A5F] text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}>
 {s || 'All'}
 </button>
 ))}
 </div>
 </div>

 {/* Table */}
 <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-white/[0.06]">
 {['Invoice #', 'Owner', 'Client', 'Amount', 'Status', 'Template', 'Date', 'Actions'].map(h => (
 <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-white/[0.04]">
 {invoices.length === 0 && (
 <tr><td colSpan={8} className="px-4 py-12 text-center text-white/30 text-sm">No invoices found</td></tr>
 )}
 {invoices.map(inv => (
 <tr key={inv.id} className="hover:bg-white/[0.03] transition-colors group">
 <td className="px-4 py-3 font-mono text-amber-400 text-xs font-medium">{inv.invoice_number}</td>
 <td className="px-4 py-3">
 <div className="text-white text-xs font-medium">{[inv.profiles?.first_name, inv.profiles?.last_name].filter(Boolean).join(' ') || '—'}</div>
 <div className="text-white/40 text-xs">{inv.profiles?.email || '—'}</div>
 </td>
 <td className="px-4 py-3 text-white/60 text-xs">{inv.clients?.company_name || '—'}</td>
 <td className="px-4 py-3 text-white font-medium text-xs">{fmt(inv.total_amount, inv.currency)}</td>
 <td className="px-4 py-3">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${statusStyle[inv.status] || 'bg-white/10 text-white/50 border-white/10'}`}>
 {inv.status}
 </span>
 </td>
 <td className="px-4 py-3 text-white/40 text-xs capitalize">{inv.template || 'default'}</td>
 <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
 {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
 </td>
 <td className="px-4 py-3">
 <button onClick={() => setDeleteId(inv.id)}
 className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100">
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
 </svg>
 </button>
 </td>
 </tr>
 ))}
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
 <button disabled={page <= 1} onClick={() => navigate({ page: String(page - 1) })}
 className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
 ← Prev
 </button>
 <button disabled={page >= totalPages} onClick={() => navigate({ page: String(page + 1) })}
 className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
 Next →
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
