'use client';

import Icon from '@/components/ui/AppIcon';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: string;
  chartData?: number[];
}


const MetricCard = ({ title, value, change, trend, icon, chartData }: MetricCardProps) => {
  const maxValue = chartData ? Math.max(...chartData) : 0;
  const minValue = chartData ? Math.min(...chartData) : 0;
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-primary transition-smooth">{title}</p>
          <h3 className="text-3xl font-heading font-black text-foreground tracking-tight">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-smooth ${
          trend === 'up' ? 'bg-success/10 text-success group-hover:bg-success group-hover:text-white' : 
          trend === 'down' ? 'bg-error/10 text-error group-hover:bg-error group-hover:text-white' :
          'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
        }`}>
          <Icon name={icon} size={24} />
        </div>
      </div>
      
      {change && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
          }`}>
            {change}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Since last period</span>
        </div>
      )}

      {chartData && chartData.length > 0 && (
        <div className="h-10 flex items-end gap-1.5 mt-4">
          {chartData.map((value, index) => {
            const height = ((value - minValue) / range) * 100;
            return (
              <div
                key={index}
                className={`flex-1 rounded-t-sm transition-all duration-500 delay-[${index * 50}ms] ${
                  trend === 'up' ? 'bg-success/30 group-hover:bg-success/60' : 
                  trend === 'down' ? 'bg-error/30 group-hover:bg-error/60' : 
                  'bg-primary/30 group-hover:bg-primary/60'
                }`}
                style={{ height: `${Math.max(height, 8)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MetricCard;