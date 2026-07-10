'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminBulkUpdateTemplate, adminDeleteTemplateInvoices } from '@/lib/actions/admin';

interface TemplateStat {
 name: string;
 count: number;
 paid: number;
 draft: number;
 sent: number;
}

interface Props {
 templates: TemplateStat[];
}

const TEMPLATE_COLORS: Record<string, [string, string]> = {
 default: ['#1E3A5F', '#2a4f7c'],
 modern: ['#7C3AED', '#6d28d9'],
 minimal: ['#0891B2', '#0e7490'],
 classic: ['#D47C47', '#b8622d'],
 bold: ['#DC2626', '#b91c1c'],
 elegant: ['#059669', '#047857'],
};

const AVAILABLE_TEMPLATES = ['default', 'modern', 'minimal', 'classic', 'bold', 'elegant'];

// Plan restrictions per template
const TEMPLATE_PLAN: Record<string, string> = {
 default: 'Free',
 modern: 'Pro',
 minimal: 'Pro',
 classic: 'Business',
 bold: 'Business',
 elegant: 'Enterprise',
};

const PLAN_BADGE: Record<string, string> = {
 Free: 'bg-white/10 text-white/50',
 Pro: 'bg-violet-500/15 text-violet-400',
 Business: 'bg-amber-500/15 text-amber-400',
 Enterprise: 'bg-blue-500/15 text-blue-400',
};

export default function AdminTemplatesClient({ templates }: Props) {
 const router = useRouter();
 const [migrateModal, setMigrateModal] = useState<{ from: string } | null>(null);
 const [migrateTo, setMigrateTo] = useState('');
 const [deleteModal, setDeleteModal] = useState<string | null>(null);
 const [pending, startTransition] = useTransition();
 const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

 const showToast = (message: string, type: 'success' | 'error') => {
 setToast({ message, type });
 setTimeout(() => setToast(null), 3000);
 };

 const doMigrate = () => {
 if (!migrateModal || !migrateTo) return;
 startTransition(async () => {
 try {
 await adminBulkUpdateTemplate(migrateModal.from, migrateTo);
 showToast(`Migrated all invoices from "${migrateModal.from}" to "${migrateTo}"`, 'success');
 setMigrateModal(null);
 router.refresh();
 } catch (e: any) {
 showToast(e.message || 'Migration failed', 'error');
 }
 });
 };

 const doDelete = () => {
 if (!deleteModal) return;
 startTransition(async () => {
 try {
 await adminDeleteTemplateInvoices(deleteModal);
 showToast(`Deleted draft invoices using template "${deleteModal}"`, 'success');
 setDeleteModal(null);
 router.refresh();
 } catch (e: any) {
 showToast(e.message || 'Delete failed', 'error');
 }
 });
 };

 // Merge with all known templates (show even if 0 usage)
 const allTemplates = AVAILABLE_TEMPLATES.map(t => {
 const stat = templates.find(s => s.name === t);
 return stat || { name: t, count: 0, paid: 0, draft: 0, sent: 0 };
 });

 // Also include any unknown templates in DB
 const unknownTemplates = templates.filter(t => !AVAILABLE_TEMPLATES.includes(t.name));

 const allRows = [...allTemplates, ...unknownTemplates];
 const totalInvoices = allRows.reduce((s, t) => s + t.count, 0);

 return (
 <div className="space-y-6">
 {/* Toast */}
 {toast && (
 <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-300 border-emerald-700/40' : 'bg-red-900/90 text-red-300 border-red-700/40'}`}>
 {toast.message}
 </div>
 )}

 {/* Migrate Modal */}
 {migrateModal && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
 <h3 className="text-lg font-semibold text-white mb-1">Migrate Template</h3>
 <p className="text-sm text-white/40 mb-4">Move all invoices from <span className="text-amber-400 font-medium capitalize">{migrateModal.from}</span> to:</p>
 <select value={migrateTo} onChange={e => setMigrateTo(e.target.value)}
 className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#4A6B8A] mb-4 capitalize">
 <option value="">Select target template...</option>
 {AVAILABLE_TEMPLATES.filter(t => t !== migrateModal.from).map(t => (
 <option key={t} value={t} className="capitalize">{t}</option>
 ))}
 </select>
 <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4">
 <p className="text-xs text-amber-400/80">This updates the template field on all invoices using <strong>{migrateModal.from}</strong>.</p>
 </div>
 <div className="flex gap-3">
 <button onClick={() => setMigrateModal(null)} className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
 <button onClick={doMigrate} disabled={!migrateTo || pending} className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7c] text-white text-sm font-medium disabled:opacity-50">
 {pending ? 'Migrating...' : 'Migrate'}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Delete Modal */}
 {deleteModal && (
 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
 <h3 className="text-lg font-semibold text-white mb-2">Delete Draft Invoices</h3>
 <p className="text-sm text-white/50 mb-2">Delete all <strong className="text-white">draft</strong> invoices using the <span className="text-amber-400 font-medium capitalize">{deleteModal}</span> template.</p>
 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5">
 <p className="text-xs text-red-400/80">Only draft invoices are deleted. Paid, sent, and overdue invoices are never affected.</p>
 </div>
 <div className="flex gap-3">
 <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
 <button onClick={doDelete} disabled={pending} className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50">
 {pending ? 'Deleting...' : 'Delete Drafts'}
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Header */}
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Invoice Templates</h1>
 <p className="text-sm text-white/40 mt-1">{totalInvoices.toLocaleString()} invoices across {allRows.filter(t => t.count > 0).length} templates</p>
 </div>

 {/* Info banner */}
 <div className="bg-[#1E3A5F]/30 border border-[#1E3A5F]/50 rounded-2xl p-4 flex items-start gap-3">
 <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 <div>
 <p className="text-sm text-white/70">Templates are assigned per-invoice. You can migrate invoices between templates or delete draft invoices for a specific template. Set plan restrictions to control which templates users can access.</p>
 </div>
 </div>

 {/* Template Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {allRows.map(tmpl => {
 const [from, to] = TEMPLATE_COLORS[tmpl.name] || ['#374151', '#4B5563'];
 const plan = TEMPLATE_PLAN[tmpl.name] || 'Pro';
 const paidRate = tmpl.count > 0 ? Math.round((tmpl.paid / tmpl.count) * 100) : 0;
 return (
 <div key={tmpl.name} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 space-y-4">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
 </div>
 <div>
 <p className="text-sm font-semibold text-white capitalize">{tmpl.name}</p>
 <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${PLAN_BADGE[plan]}`}>{plan}+</span>
 </div>
 </div>
 <span className="text-2xl font-bold text-white">{tmpl.count}</span>
 </div>

 {/* Stats bar */}
 {tmpl.count > 0 && (
 <div>
 <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
 {tmpl.paid > 0 && <div className="bg-emerald-500" style={{ width: `${(tmpl.paid / tmpl.count) * 100}%` }} />}
 {tmpl.sent > 0 && <div className="bg-blue-500" style={{ width: `${(tmpl.sent / tmpl.count) * 100}%` }} />}
 {tmpl.draft > 0 && <div className="bg-white/20" style={{ width: `${(tmpl.draft / tmpl.count) * 100}%` }} />}
 </div>
 <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> {tmpl.paid} paid</span>
 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> {tmpl.sent} sent</span>
 <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/20 inline-block" /> {tmpl.draft} draft</span>
 </div>
 <p className="text-xs text-white/30 mt-1">{paidRate}% payment rate</p>
 </div>
 )}
 {tmpl.count === 0 && <p className="text-xs text-white/30">No invoices using this template</p>}

 {/* Actions */}
 <div className="flex gap-2 pt-1 border-t border-white/[0.06]">
 <button onClick={() => { setMigrateModal({ from: tmpl.name }); setMigrateTo(''); }}
 className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] text-xs transition-all">
 Migrate Invoices
 </button>
 {tmpl.draft > 0 && (
 <button onClick={() => setDeleteModal(tmpl.name)}
 className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-all">
 Delete Drafts
 </button>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
