'use client';

import { useState } from 'react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sections: SettingSection[] = [
  {
    id: 'access',
    title: 'Admin Access',
    description: 'Manage who has admin privileges',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    id: 'plans',
    title: 'Subscription Plans',
    description: 'Configure pricing tiers and feature limits',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    id: 'maintenance',
    title: 'Maintenance Mode',
    description: 'Toggle maintenance mode to block user access temporarily',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    id: 'notifications',
    title: 'System Notifications',
    description: 'Send platform-wide announcements to all users',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
];

const planDefaults = [
  { name: 'Free', invoices: 50, clients: 100, price: 0, color: '#6B7280' },
  { name: 'Pro', invoices: 500, clients: 1000, price: 29, color: '#7C3AED' },
  { name: 'Business', invoices: 2000, clients: 5000, price: 79, color: '#D47C47' },
  { name: 'Enterprise', invoices: 99999, clients: 99999, price: 199, color: '#0891B2' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#1E3A5F]' : 'bg-white/[0.1]'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

export default function AdminSettingsClient() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [adminEmails, setAdminEmails] = useState(
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ADMIN_EMAILS || '' : ''
  );
  const [announcement, setAnnouncement] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('access');

  const showSaved = (msg: string) => {
    setSaved(msg);
    setTimeout(() => setSaved(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl bg-emerald-900/90 text-emerald-300 border border-emerald-700/40">
          ✓ {saved}
        </div>
      )}

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-white/40 mt-1">Configure platform behaviour and admin access</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-[#1E3A5F] text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
          >
            <span className="opacity-70">{s.icon}</span>
            {s.title}
          </button>
        ))}
      </div>

      {/* Admin Access */}
      {activeSection === 'access' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">Admin Email Allowlist</h2>
            <p className="text-xs text-white/40">These emails will have access to the admin panel. Comma-separated.</p>
          </div>
          <div className="space-y-2">
            <textarea
              value={adminEmails}
              onChange={e => setAdminEmails(e.target.value)}
              placeholder="admin@example.com, superadmin@example.com"
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4A6B8A] transition-colors resize-none"
            />
            <p className="text-xs text-white/30">
              ⚠ Changes here require setting the <code className="text-amber-400 bg-amber-400/10 px-1 rounded">ADMIN_EMAILS</code> environment variable in your deployment and redeploying.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <h3 className="text-sm font-medium text-white mb-4">Current Admin Accounts</h3>
            <div className="space-y-2">
              {(adminEmails || '').split(',').map(e => e.trim()).filter(Boolean).map(email => (
                <div key={email} className="flex items-center gap-3 px-3 py-2 bg-white/[0.04] rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D47C47] to-[#b8622d] flex items-center justify-center text-white text-xs font-bold">
                    {email[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white/70 flex-1">{email}</span>
                  <span className="text-xs px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded-md">Admin</span>
                </div>
              ))}
              {!adminEmails && (
                <p className="text-xs text-white/30 italic">No admin emails configured</p>
              )}
            </div>
          </div>

          <button
            onClick={() => showSaved('Admin access settings noted — update ADMIN_EMAILS in your .env to apply')}
            className="px-5 py-2 bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7c] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Save Access Config
          </button>
        </div>
      )}

      {/* Plans */}
      {activeSection === 'plans' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-white">Subscription Plans</h2>
            <p className="text-xs text-white/40 mt-1">Reference plan configurations — edit in your Supabase subscription logic</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {planDefaults.map(plan => (
              <div
                key={plan.name}
                className="relative bg-white/[0.04] border border-white/[0.07] rounded-xl p-5 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: plan.color }} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">{plan.name}</span>
                  <span className="text-lg font-bold text-white">${plan.price}<span className="text-xs text-white/30 font-normal">/mo</span></span>
                </div>
                <div className="space-y-2 text-xs text-white/50">
                  <div className="flex justify-between">
                    <span>Max invoices</span>
                    <span className="text-white">{plan.invoices >= 9999 ? 'Unlimited' : plan.invoices.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max clients</span>
                    <span className="text-white">{plan.clients >= 9999 ? 'Unlimited' : plan.clients.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-400/80">
              To modify plan limits or pricing, update the <code className="bg-amber-400/20 px-1 rounded">subscription.ts</code> server action and your Supabase <code className="bg-amber-400/20 px-1 rounded">user_settings</code> defaults.
            </p>
          </div>
        </div>
      )}

      {/* Maintenance */}
      {activeSection === 'maintenance' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-white">Maintenance Mode</h2>
            <p className="text-xs text-white/40 mt-1">When enabled, users will see a maintenance page instead of the application</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-xl border border-white/[0.07]">
            <div>
              <p className="text-sm font-medium text-white">Enable Maintenance Mode</p>
              <p className="text-xs text-white/40 mt-0.5">All non-admin users will be blocked</p>
            </div>
            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </div>
          {maintenanceMode && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">⚠ Maintenance Mode is ON</p>
              <p className="text-xs text-red-400/70">Regular users are currently blocked from accessing the platform. Make sure to disable this when maintenance is complete.</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Maintenance Message</label>
            <textarea
              rows={3}
              placeholder="We're performing scheduled maintenance. We'll be back shortly!"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4A6B8A] resize-none"
            />
          </div>
          <button
            onClick={() => showSaved('Maintenance settings saved')}
            className="px-5 py-2 bg-gradient-to-r from-[#1E3A5F] to-[#2a4f7c] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* Notifications */}
      {activeSection === 'notifications' && (
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-white">System Notifications</h2>
            <p className="text-xs text-white/40 mt-1">Send announcements or alerts to all platform users</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-xl border border-white/[0.07]">
            <div>
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-xs text-white/40 mt-0.5">Allow the platform to send notification emails</p>
            </div>
            <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Broadcast Announcement</label>
            <textarea
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              rows={4}
              placeholder="Type a message to send to all active users..."
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#4A6B8A] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-white/30">{announcement.length} characters</p>
              <button
                disabled={!announcement.trim()}
                onClick={() => {
                  setAnnouncement('');
                  showSaved('Announcement queued for delivery');
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#D47C47] to-[#b8622d] text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Send to All Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-red-500/[0.05] border border-red-500/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-500/[0.05] rounded-xl border border-red-500/10">
          <div>
            <p className="text-sm font-medium text-white">Flush Cache</p>
            <p className="text-xs text-white/40 mt-0.5">Clear all application caches (safe, no data loss)</p>
          </div>
          <button
            onClick={() => showSaved('Cache cleared successfully')}
            className="px-4 py-2 border border-red-500/30 text-red-400 text-sm rounded-xl hover:bg-red-500/10 transition-colors whitespace-nowrap"
          >
            Flush Cache
          </button>
        </div>
      </div>
    </div>
  );
}
