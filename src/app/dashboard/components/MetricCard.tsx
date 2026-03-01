'use client';

import Icon from '@/components/ui/AppIcon';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: string;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-elevation-4 group flex items-center justify-between pointer-events-none sm:pointer-events-auto">
      <div>
        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 group-hover:text-primary transition-colors duration-300">
          {title}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-slate-900 tracking-tighter">
            {value}
          </span>
          {change && (
            <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
              trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 
              trend === 'down' ? 'text-rose-600 bg-rose-50' : 
              'text-slate-500 bg-slate-100'
            }`}>
              {change}
            </div>
          )}
        </div>
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
        <Icon name={icon} size={24} />
      </div>
    </div>
  );
};

export default MetricCard;