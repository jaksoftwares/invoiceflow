'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminBanUser, adminDeleteUser, adminChangeUserPlan } from '@/lib/actions/admin';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  business_name: string | null;
  onboarding_status: string | null;
  created_at: string;
  user_settings?: any[];
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  currency: string;
  template: string;
  issue_date: string;
  due_date: string;
  created_at: string;
  clients?: { company_name: string } | null;
}

interface Client {
  id: string;
  company_name: string;
  email: string | null;
  status: string;
  total_billed: number;
  outstanding_balance: number;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  status: string;
  billing_cycle: string;
  start_date: string;
  plans: { name: string; price_monthly: number } | null;
}

interface ActivityLog {
  id: string;
  action_type: string;
  resource_id: string | null;
  metadata: any;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
}

interface Props {
  profile: Profile;
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  subscription: Subscription | null;
  activityLogs: ActivityLog[];
  payments: Payment[];
  plans: Plan[];
}

type Tab = 'overview' | 'invoices' | 'clients' | 'products' | 'activity' | 'payments';

const statusColor: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  sent: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  draft: 'bg-white/10 text-white/50 border-white/10',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/20',
  cancelled: 'bg-red-500/10 text-red-300/70 border-red-500/10',
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  inactive: 'bg-white/10 text-white/40 border-white/10',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
};

const PLAN_COLORS: Record<string, string> = {
  Free: '#6B7280', Pro: '#7C3AED', Business: '#D47C47', Enterprise: '#0891B2',
};

const activityIcon: Record<string, string> = {
  invoice_created: '📄',
  invoice_sent: '📨',
  client_created: '👤',
  payment_received: '💰',
  template_used: '🎨',
  product_created: '📦',
  report_exports: '📊',
};

export default function AdminUserDetailClient({ profile, invoices, clients, products, subscription, activityLogs, payments, plans }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [confirmAction, setConfirmAction] = useState<'ban' | 'delete' | null>(null);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unknown User';
  const initials = name !== 'Unknown User' ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const planName = subscription?.plans?.name || 'Free';
  const planColor = PLAN_COLORS[planName] || '#6B7280';

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total_amount, 0);
  const fmt = (n: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  const doChangePlan = () => {
    if (!selectedPlan) return;
    startTransition(async () => {
      try {
        await adminChangeUserPlan(profile.id, selectedPlan);
        showToast('Plan updated successfully', 'success');
        setChangePlanOpen(false);
        router.refresh();
      } catch (e: any) {
        showToast(e.message || 'Failed', 'error');
      }
    });
  };

  const doAction = () => {
    if (!confirmAction) return;
    startTransition(async () => {
      try {
        if (confirmAction === 'ban') {
          await adminBanUser(profile.id, true);
          showToast('User banned', 'success');
        } else {
          await adminDeleteUser(profile.id);
          showToast('User deleted', 'success');
          router.push('/admin/users');
          return;
        }
        setConfirmAction(null);
        router.refresh();
      } catch (e: any) {
        showToast(e.message || 'Action failed', 'error');
      }
    });
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'invoices', label: 'Invoices', count: invoices.length },
    { key: 'clients', label: 'Clients', count: clients.length },
    { key: 'products', label: 'Products', count: products.length },
    { key: 'activity', label: 'Activity', count: activityLogs.length },
    { key: 'payments', label: 'Payments', count: payments.length },
  ];

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
            <h3 className="text-lg font-semibold text-white mb-2">{confirmAction === 'ban' ? 'Ban User' : 'Delete User'}</h3>
            <p className="text-sm text-white/50 mb-6">
              Are you sure you want to <strong className="text-white">{confirmAction}</strong> <span className="text-amber-400">{profile.email}</span>?
              {confirmAction === 'delete' ? ' This action is irreversible.' : ' This can be reversed.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
              <button onClick={doAction} disabled={pending} className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 ${confirmAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                {pending ? 'Processing...' : `Confirm ${confirmAction === 'ban' ? 'Ban' : 'Delete'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {changePlanOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-1">Change Plan</h3>
            <p className="text-sm text-white/40 mb-4">Current: <span style={{ color: planColor }} className="font-medium">{planName}</span></p>
            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#4A6B8A] mb-4">
              <option value="">Select plan...</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price_monthly}/mo)</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setChangePlanOpen(false)} className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
              <button onClick={doChangePlan} disabled={!selectedPlan || pending} className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7c] text-white text-sm font-medium disabled:opacity-50">
                {pending ? 'Saving...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back + Header */}
      <div>
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to Users
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#4A6B8A] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{name}</h1>
            <p className="text-sm text-white/40">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: `${planColor}20`, color: planColor }}>{planName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${statusColor[profile.onboarding_status || ''] || 'bg-white/10 text-white/40 border-white/10'}`}>
                {profile.onboarding_status || 'unknown'}
              </span>
              {profile.business_name && <span className="text-xs text-white/40">· {profile.business_name}</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => { setChangePlanOpen(true); setSelectedPlan(''); }}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.1] text-xs transition-all">
              Change Plan
            </button>
            <button onClick={() => setConfirmAction('ban')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs transition-all">
              Ban
            </button>
            <button onClick={() => setConfirmAction('delete')}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(totalRevenue) },
          { label: 'Invoices', value: invoices.length },
          { label: 'Clients', value: clients.length },
          { label: 'Products', value: products.length },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
            <p className="text-xs text-white/40">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.key ? 'bg-[#1E3A5F] text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}>
            {t.label}
            {t.count !== undefined && <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === t.key ? 'bg-white/20' : 'bg-white/[0.06]'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white">Account Details</h2>
            {[
              { label: 'User ID', value: profile.id },
              { label: 'Email', value: profile.email || '—' },
              { label: 'Business', value: profile.business_name || '—' },
              { label: 'Joined', value: new Date(profile.created_at).toLocaleString() },
              { label: 'Current Plan', value: planName },
              { label: 'Billing Cycle', value: subscription?.billing_cycle || '—' },
              { label: 'Sub Status', value: subscription?.status || '—' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-white/40">{item.label}</span>
                <span className="text-white font-medium text-right max-w-xs truncate">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Recent Invoices preview */}
          {invoices.length > 0 && (
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Recent Invoices</h2>
                <button onClick={() => setActiveTab('invoices')} className="text-xs text-white/40 hover:text-white">View all →</button>
              </div>
              <div className="space-y-2">
                {invoices.slice(0, 5).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-amber-400">{inv.invoice_number}</span>
                    <span className="text-white/50 text-xs">{inv.clients?.company_name || '—'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${statusColor[inv.status] || ''}`}>{inv.status}</span>
                    <span className="text-white font-medium text-xs">{fmt(inv.total_amount, inv.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Invoice #', 'Client', 'Amount', 'Status', 'Template', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invoices.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-white/30 text-sm">No invoices</td></tr>}
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-mono text-amber-400 text-xs">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{inv.clients?.company_name || '—'}</td>
                    <td className="px-4 py-3 text-white font-medium text-xs">{fmt(inv.total_amount, inv.currency)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${statusColor[inv.status] || ''}`}>{inv.status}</span></td>
                    <td className="px-4 py-3 text-white/40 text-xs capitalize">{inv.template}</td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Client', 'Email', 'Status', 'Total Billed', 'Outstanding', 'Added'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {clients.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-white/30 text-sm">No clients</td></tr>}
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 text-white font-medium text-sm">{c.company_name}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{c.email || '—'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${statusColor[c.status] || ''}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-white font-medium text-xs">{fmt(c.total_billed)}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={c.outstanding_balance > 0 ? 'text-red-400' : 'text-white/40'}>{fmt(c.outstanding_balance)}</span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Product', 'Price', 'Unit', 'Category', 'Created'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {products.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-white/30 text-sm">No products</td></tr>}
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 text-white font-medium text-sm">{p.name}</td>
                    <td className="px-4 py-3 text-white font-medium text-xs">{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{p.unit}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{p.category || '—'}</td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-2">
          {activityLogs.length === 0 && (
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-10 text-center text-white/30 text-sm">No activity logs</div>
          )}
          {activityLogs.map(log => (
            <div key={log.id} className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">{activityIcon[log.action_type] || '📝'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium capitalize">{log.action_type.replace(/_/g, ' ')}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <p className="text-xs text-white/40 mt-0.5 truncate">{JSON.stringify(log.metadata)}</p>
                )}
              </div>
              <span className="text-xs text-white/30 whitespace-nowrap flex-shrink-0">
                {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Payment ID', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {payments.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-white/30 text-sm">No payments found</td></tr>}
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-mono text-xs text-white/40">{p.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-white font-medium text-xs">{fmt(p.amount)}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${statusColor[p.status] || 'bg-white/10 text-white/50 border-white/10'}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
