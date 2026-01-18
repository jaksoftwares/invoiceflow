interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  chartData: number[];
}

const MetricCard = ({ title, value, change, trend, icon, chartData }: MetricCardProps) => {
  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2 transition-smooth hover:shadow-elevation-3">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-heading font-semibold text-foreground">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          trend === 'up' ? 'bg-success/10' : 'bg-error/10'
        }`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-success' : 'text-error'
        }`}>
          {change}
        </span>
        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>

      <div className="h-12 flex items-end gap-1">
        {chartData.map((value, index) => {
          const height = ((value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className={`flex-1 rounded-t transition-smooth ${
                trend === 'up' ? 'bg-success/20' : 'bg-error/20'
              }`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MetricCard;