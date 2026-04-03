'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminUpdatePlan, adminChangeUserPlan, adminCancelSubscription } from '@/lib/actions/admin';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  price_lifetime?: number;
  max_invoices_per_month: number;
  max_clients: number;
  max_products: number;
  max_email_sends: number;
  max_templates_access: number;
  allow_csv_export: boolean;
  allow_branding: boolean;
  allow_payg_after_limit: boolean;
  watermark_enabled: boolean;
  allow_priority_email: boolean;
}

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  billing_cycle: string;
  start_date: string;
  created_at: string;
  plans: { id: string; name: string; price_monthly: number } | null;
  profiles: { id: string; first_name: string | null; last_name: string | null; email: string | null; business_name: string | null } | null;
}

interface Props {
  plans: Plan[];
  subscriptions: Subscription[];
  subTotal: number;
}

const PLAN_COLORS: Record<string, string> = {
  Free: '#6B7280',
  Pro: '#7C3AED',
  Business: '#D47C47',
  Enterprise: '#0891B2',
};

const statusColor: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  grace_period: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  free: 'bg-white/10 text-white/50 border-white/10',
};

export default function AdminPlansClient({ plans, subscriptions, subTotal }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editValues, setEditValues] = useState<Partial<Plan>>({});
  const [saving, startSaving] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [changePlanModal, setChangePlanModal] = useState<{ userId: string; email: string } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setEditValues({
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      max_invoices_per_month: plan.max_invoices_per_month,
      max_clients: plan.max_clients,
      max_products: plan.max_products,
      max_email_sends: plan.max_email_sends,
      max_templates_access: plan.max_templates_access,
      allow_csv_export: plan.allow_csv_export,
      allow_branding: plan.allow_branding,
      allow_payg_after_limit: plan.allow_payg_after_limit,
      watermark_enabled: plan.watermark_enabled,
      allow_priority_email: plan.allow_priority_email,
    });
  };

  const savePlan = () => {
    if (!editingPlan) return;
    startSaving(async () => {
      try {
        await adminUpdatePlan(editingPlan.id, editValues);
        showToast('Plan updated successfully', 'success');
        setEditingPlan(null);
        router.refresh();
      } catch (e: any) {
        showToast(e.message || 'Failed to update plan', 'error');
      }
    });
  };

  const changePlan = () => {
    if (!changePlanModal || !selectedPlanId) return;
    startSaving(async () => {
      try {
        await adminChangeUserPlan(changePlanModal.userId, selectedPlanId);
        showToast('User plan updated', 'success');
        setChangePlanModal(null);
        router.refresh();
      } catch (e: any) {
        showToast(e.message || 'Failed to change plan', 'error');
      }
    });
  };

  const cancelSub = (subId: string) => {
    startSaving(async () => {
      try {
        await adminCancelSubscription(subId);
        showToast('Subscription cancelled', 'success');
        router.refresh();
      } catch (e: any) {
        showToast(e.message || 'Failed to cancel', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-300 border-emerald-700/40' : 'bg-red-900/90 text-red-300 border-red-700/40'}`}>
          {toast.message}
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Edit {editingPlan.name} Plan</h3>
              <button onClick={() => setEditingPlan(null)} className="text-white/40 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider">Monthly Price ($)</label>
                  <input type="number" value={editValues.price_monthly ?? ''} onChange={e => setEditValues(v => ({ ...v, price_monthly: parseFloat(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#4A6B8A]" />
                </div>
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider">Yearly Price ($)</label>
                  <input type="number" value={editValues.price_yearly ?? ''} onChange={e => setEditValues(v => ({ ...v, price_yearly: parseFloat(e.target.value) }))}
                    className="mt-1 w-full px-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#4A6B8A]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'max_invoices_per_month', label: 'Max Invoices/Mo' },
                  { key: 'max_clients', label: 'Max Clients' },
                  { key: 'max_products', label: 'Max Products' },
                  { key: 'max_email_sends', label: 'Max Emails/Mo' },
                  { key: 'max_templates_access', label: 'Template Access' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-white/50 uppercase tracking-wider">{f.label}</label>
                    <input type="number"
                      value={(editValues as any)[f.key] ?? ''}
                      onChange={e => setEditValues(v => ({ ...v, [f.key]: parseInt(e.target.value) }))}
                      className="mt-1 w-full px-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#4A6B8A]" />
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-3">
                <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Feature Toggles</p>
                {[
                  { key: 'allow_csv_export', label: 'CSV Export' },
                  { key: 'allow_branding', label: 'Custom Branding' },
                  { key: 'allow_payg_after_limit', label: 'Pay-as-you-go After Limit' },
                  { key: 'watermark_enabled', label: 'Watermark on Invoices' },
                  { key: 'allow_priority_email', label: 'Priority Email Support' },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between px-3 py-2 bg-white/[0.04] rounded-xl">
                    <span className="text-sm text-white/70">{f.label}</span>
                    <button
                      onClick={() => setEditValues(v => ({ ...v, [f.key]: !(v as any)[f.key] }))}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${(editValues as any)[f.key] ? 'bg-[#1E3A5F]' : 'bg-white/10'}`}
                    >
                      <span className={`inline-block w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${(editValues as any)[f.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingPlan(null)} className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/[0.1] text-sm">Cancel</button>
              <button onClick={savePlan} disabled={saving} className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7c] text-white text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {changePlanModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-1">Change Plan</h3>
            <p className="text-sm text-white/40 mb-5">{changePlanModal.email}</p>
            <select
              value={selectedPlanId}
              onChange={e => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#4A6B8A] mb-4"
            >
              <option value="">Select a plan...</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} (${p.price_monthly}/mo)</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setChangePlanModal(null)} className="flex-1 px-4 py-2 rounded-xl bg-white/[0.06] text-white/70 text-sm">Cancel</button>
              <button onClick={changePlan} disabled={!selectedPlanId || saving} className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7c] text-white text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Apply Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Plans & Subscriptions</h1>
        <p className="text-sm text-white/40 mt-1">{subTotal.toLocaleString()} active subscriptions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['plans', 'subscriptions'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-[#1E3A5F] text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="relative bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: PLAN_COLORS[plan.name] || '#6B7280' }} />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-base font-semibold text-white">{plan.name}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-white">${plan.price_monthly}</span>
                    <span className="text-xs text-white/30">/mo</span>
                    {plan.price_yearly > 0 && <span className="text-xs text-white/30 ml-2">${plan.price_yearly}/yr</span>}
                  </div>
                </div>
                <button onClick={() => openEdit(plan)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.1] text-xs transition-all flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Invoices/mo', value: plan.max_invoices_per_month >= 99999 ? '∞' : plan.max_invoices_per_month },
                  { label: 'Clients', value: plan.max_clients >= 99999 ? '∞' : plan.max_clients },
                  { label: 'Products', value: plan.max_products >= 99999 ? '∞' : plan.max_products },
                  { label: 'Emails/mo', value: plan.max_email_sends >= 99999 ? '∞' : plan.max_email_sends },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center px-2 py-1.5 bg-white/[0.03] rounded-lg">
                    <span className="text-white/40">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {plan.allow_csv_export && <span className="px-2 py-0.5 text-xs rounded-md bg-emerald-500/10 text-emerald-400">CSV Export</span>}
                {plan.allow_branding && <span className="px-2 py-0.5 text-xs rounded-md bg-blue-500/10 text-blue-400">Custom Branding</span>}
                {plan.allow_priority_email && <span className="px-2 py-0.5 text-xs rounded-md bg-violet-500/10 text-violet-400">Priority Support</span>}
                {plan.watermark_enabled && <span className="px-2 py-0.5 text-xs rounded-md bg-white/10 text-white/40">Watermark</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['User', 'Plan', 'Status', 'Billing', 'Started', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {subscriptions.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">No subscriptions found</td></tr>
                )}
                {subscriptions.map(sub => {
                  const profile = sub.profiles;
                  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—';
                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium text-sm">{name}</div>
                        <div className="text-xs text-white/40">{profile?.email || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium" style={{ color: PLAN_COLORS[sub.plans?.name || 'Free'] || '#fff' }}>
                          {sub.plans?.name || 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${statusColor[sub.status] || 'bg-white/10 text-white/50 border-white/10'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs capitalize">{sub.billing_cycle}</td>
                      <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                        {new Date(sub.start_date || sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setChangePlanModal({ userId: sub.user_id, email: profile?.email || '' }); setSelectedPlanId(''); }}
                            className="px-2 py-1 rounded-lg text-xs text-white/40 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          >Change Plan</button>
                          {sub.status === 'active' && (
                            <button onClick={() => cancelSub(sub.id)}
                              className="px-2 py-1 rounded-lg text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
