import Icon from '@/components/ui/AppIcon';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
  trend: 'up' | 'down';
}

const KPICard = ({ title, value, change, icon, trend }: KPICardProps) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2 transition-smooth hover:shadow-elevation-3">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-heading font-semibold text-foreground">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name={icon as any} size={24} className="text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
          isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        }`}>
          <Icon 
            name={isPositive ? 'ArrowUpIcon' : 'ArrowDownIcon'} 
            size={16} 
          />
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
};

export default KPICard;