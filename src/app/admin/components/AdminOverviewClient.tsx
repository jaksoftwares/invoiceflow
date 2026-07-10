'use client';

interface Stat {
 label: string;
 value: string | number;
 sub?: string;
 trend?: number;
 icon: React.ReactNode;
 color: string;
}

interface RevenueItem {
 period: string;
 revenue: number;
 label: string;
}

interface Props {
 stats: {
 totalUsers: number;
 newUsersThisMonth: number;
 totalInvoices: number;
 invoicesThisMonth: number;
 totalClients: number;
 revenueThisMonth: number;
 revenueGrowth: number;
 activeSubscriptions: number;
 };
 revenueChart: RevenueItem[];
}

function formatCurrency(val: number) {
 return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
}

function TrendBadge({ val }: { val: number }) {
 const positive = val >= 0;
 return (
 <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
 {positive ? '↑' : '↓'} {Math.abs(val)}%
 </span>
 );
}

export default function AdminOverviewClient({ stats, revenueChart }: Props) {
 const maxRevenue = Math.max(...revenueChart.map(r => r.revenue), 1);

 const statCards: Stat[] = [
 {
 label: 'Total Users',
 value: stats.totalUsers.toLocaleString(),
 sub: `+${stats.newUsersThisMonth} this month`,
 icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
 color: 'from-[#1E3A5F] to-[#2a4f7c]',
 },
 {
 label: 'Total Invoices',
 value: stats.totalInvoices.toLocaleString(),
 sub: `+${stats.invoicesThisMonth} this month`,
 icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
 color: 'from-[#7C3AED] to-[#5B21B6]',
 },
 {
 label: 'Revenue (MTD)',
 value: formatCurrency(stats.revenueThisMonth),
 trend: stats.revenueGrowth,
 sub: 'vs last month',
 icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
 color: 'from-[#D47C47] to-[#b8622d]',
 },
 {
 label: 'Total Clients',
 value: stats.totalClients.toLocaleString(),
 sub: 'across all users',
 icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
 color: 'from-[#059669] to-[#047857]',
 },
 {
 label: 'Paid Plans',
 value: stats.activeSubscriptions.toLocaleString(),
 sub: 'active subscriptions',
 icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
 color: 'from-[#0891B2] to-[#0E7490]',
 },
 ];

 return (
 <div className="space-y-8">
 {/* Header */}
 <div>
 <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
 <p className="text-sm text-white/40 mt-1">Real-time metrics across all users and activity</p>
 </div>

 {/* Stat Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
 {statCards.map(card => (
 <div
 key={card.label}
 className="relative bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 overflow-hidden hover:bg-white/[0.06] transition-all duration-200 group"
 >
 <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
 <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${card.color} mb-3`}>
 <span className="text-white">{card.icon}</span>
 </div>
 <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
 <div className="text-xs text-white/40 mt-1 font-medium">{card.label}</div>
 {card.trend !== undefined ? (
 <div className="flex items-center gap-2 mt-2">
 <TrendBadge val={card.trend} />
 <span className="text-xs text-white/30">{card.sub}</span>
 </div>
 ) : (
 <div className="text-xs text-white/30 mt-2">{card.sub}</div>
 )}
 </div>
 ))}
 </div>

 {/* Revenue Chart */}
 <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-lg font-semibold text-white">Revenue Trend</h2>
 <p className="text-xs text-white/40 mt-0.5">Platform-wide paid invoices (last 12 months)</p>
 </div>
 <span className="text-xs px-3 py-1 bg-white/[0.06] rounded-full text-white/50">Monthly</span>
 </div>

 {/* Bar chart */}
 <div className="flex items-end gap-1.5 h-40 mt-2">
 {revenueChart.map((item, i) => {
 const height = (item.revenue / maxRevenue) * 100;
 const isLast = i === revenueChart.length - 1;
 return (
 <div key={item.period} className="flex-1 flex flex-col items-center gap-1 group">
 <div
 className="w-full relative overflow-hidden rounded-t-md transition-all duration-500"
 style={{ height: `${Math.max(height, 2)}%` }}
 >
 <div
 className={`absolute inset-0 ${isLast ? 'bg-gradient-to-t from-[#D47C47] to-[#EFA06A]' : 'bg-gradient-to-t from-[#1E3A5F]/80 to-[#3a6499]/80'} group-hover:opacity-90 transition-opacity`}
 />
 </div>
 <span className={`text-[9px] text-white/30 hidden md:block ${isLast ? 'text-amber-400/60' : ''}`}>
 {item.label}
 </span>
 {/* Tooltip */}
 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0D1526] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap pointer-events-none z-10">
 {formatCurrency(item.revenue)}
 </div>
 </div>
 );
 })}
 </div>

 {/* Y-axis labels */}
 <div className="mt-3 flex justify-between text-[10px] text-white/20 border-t border-white/[0.05] pt-3">
 <span>{formatCurrency(0)}</span>
 <span>{formatCurrency(maxRevenue / 2)}</span>
 <span>{formatCurrency(maxRevenue)}</span>
 </div>
 </div>

 {/* Quick links */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 {[
 { label: 'Manage Users', desc: 'View, search and manage all user accounts', href: '/admin/users', color: 'from-[#1E3A5F] to-[#2a4f7c]' },
 { label: 'Usage Analytics', desc: 'Invoice stats, plan distribution, signups', href: '/admin/analytics', color: 'from-[#7C3AED] to-[#5B21B6]' },
 { label: 'System Settings', desc: 'Configure admin emails, plans & announcements', href: '/admin/settings', color: 'from-[#D47C47] to-[#b8622d]' },
 ].map(link => (
 <a
 key={link.href}
 href={link.href}
 className="group relative bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 overflow-hidden hover:border-white/[0.15] transition-all duration-200"
 >
 <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
 <div className="font-semibold text-white text-sm mb-1">{link.label}</div>
 <div className="text-xs text-white/40">{link.desc}</div>
 <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 mt-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
 </svg>
 </a>
 ))}
 </div>
 </div>
 );
}
