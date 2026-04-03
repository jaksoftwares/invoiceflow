'use client';

interface SignupItem {
  period: string;
  count: number;
  label: string;
}

interface Props {
  data: {
    invoicesByStatus: Record<string, number>;
    planCounts: Record<string, number>;
    signupChart: SignupItem[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#059669',
  sent: '#3B82F6',
  draft: '#6B7280',
  overdue: '#EF4444',
  cancelled: '#8B5CF6',
};

const PLAN_COLORS: Record<string, string> = {
  Free: '#4A5568',
  Pro: '#7C3AED',
  Business: '#D47C47',
  Enterprise: '#0891B2',
};

function DonutChart({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) return <div className="text-center text-white/30 text-sm py-8">No data</div>;

  let cumulativePercent = 0;
  const slices = Object.entries(data).map(([key, val]) => {
    const pct = (val / total) * 100;
    const slice = { key, val, pct, startAngle: cumulativePercent * 3.6 };
    cumulativePercent += pct;
    return slice;
  });

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angle = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-32 h-32 flex-shrink-0">
        {slices.map((s, i) => {
          if (s.pct === 0) return null;
          const endAngle = s.startAngle + s.pct * 3.6;
          const color = colors[s.key] || '#374151';
          return (
            <path
              key={s.key}
              d={describeArc(60, 60, 50, s.startAngle, endAngle)}
              fill="none"
              stroke={color}
              strokeWidth="18"
              strokeLinecap="butt"
            />
          );
        })}
        <circle cx="60" cy="60" r="38" fill="#0A0F1E" />
        <text x="60" y="56" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{total.toLocaleString()}</text>
        <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">total</text>
      </svg>
      <div className="grid grid-cols-1 gap-2 w-full">
        {slices.map(s => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: colors[s.key] || '#374151' }} />
            <span className="text-xs text-white/60 capitalize flex-1">{s.key}</span>
            <span className="text-xs text-white font-medium">{s.val.toLocaleString()}</span>
            <span className="text-xs text-white/30 w-10 text-right">{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ items, maxVal, color }: { items: SignupItem[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-1 h-32">
      {items.map((item, i) => {
        const height = maxVal > 0 ? (item.count / maxVal) * 100 : 0;
        const isLast = i === items.length - 1;
        return (
          <div key={item.period} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className={`w-full rounded-t-sm transition-all duration-500 ${isLast ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
              style={{
                height: `${Math.max(height, 2)}%`,
                background: isLast ? `linear-gradient(to top, ${color}, ${color}cc)` : `linear-gradient(to top, ${color}60, ${color}30)`,
              }}
            />
            <span className="text-[9px] text-white/20 hidden md:block">{item.label}</span>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#0D1526] border border-white/10 rounded px-1.5 py-0.5 text-xs text-white whitespace-nowrap pointer-events-none z-10">
              {item.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalyticsClient({ data }: Props) {
  const maxSignups = Math.max(...data.signupChart.map(s => s.count), 1);
  const totalSignups = data.signupChart.reduce((s, i) => s + i.count, 0);
  const totalInvoices = Object.values(data.invoicesByStatus).reduce((s, v) => s + v, 0);
  const totalPlanUsers = Object.values(data.planCounts).reduce((s, v) => s + v, 0);
  const paidUsers = totalPlanUsers - (data.planCounts['Free'] || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Usage & Analytics</h1>
        <p className="text-sm text-white/40 mt-1">Platform-wide usage, invoice stats, and subscription breakdown</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: totalInvoices.toLocaleString(), sub: 'all time', color: '#3B82F6' },
          { label: 'Paid Invoices', value: (data.invoicesByStatus['paid'] || 0).toLocaleString(), sub: `${totalInvoices > 0 ? ((data.invoicesByStatus['paid'] || 0) / totalInvoices * 100).toFixed(1) : 0}% of total`, color: '#059669' },
          { label: 'Paid Plan Users', value: paidUsers.toLocaleString(), sub: `${totalPlanUsers > 0 ? (paidUsers / totalPlanUsers * 100).toFixed(1) : 0}% conversion`, color: '#7C3AED' },
          { label: 'New Users (12mo)', value: totalSignups.toLocaleString(), sub: 'registered accounts', color: '#D47C47' },
        ].map(card => (
          <div key={card.label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-xs text-white/40 mt-1">{card.label}</div>
            <div className="text-xs mt-2" style={{ color: card.color + 'aa' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice status */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Invoice Status Distribution</h2>
          <DonutChart data={data.invoicesByStatus} colors={STATUS_COLORS} />
        </div>

        {/* Plan distribution */}
        <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Subscription Plan Distribution</h2>
          <DonutChart data={data.planCounts} colors={PLAN_COLORS} />
        </div>
      </div>

      {/* Signup trend */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">User Signup Trend</h2>
            <p className="text-xs text-white/40 mt-0.5">New registrations per month (last 12 months)</p>
          </div>
          <span className="text-2xl font-bold text-white">{totalSignups.toLocaleString()}</span>
        </div>
        <BarChart items={data.signupChart} maxVal={maxSignups} color="#1E3A5F" />
        <div className="mt-3 flex justify-between text-[10px] text-white/20 border-t border-white/[0.05] pt-3">
          <span>0</span>
          <span>{Math.round(maxSignups / 2)}</span>
          <span>{maxSignups}</span>
        </div>
      </div>

      {/* Overdue rate callout */}
      {data.invoicesByStatus['overdue'] > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-400">Overdue Invoice Alert</p>
            <p className="text-xs text-red-400/70 mt-1">
              {data.invoicesByStatus['overdue'].toLocaleString()} invoices are currently overdue across the platform.
              Consider sending automated reminders or reaching out to affected users.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
