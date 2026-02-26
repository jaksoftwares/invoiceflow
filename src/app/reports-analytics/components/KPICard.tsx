import Icon from '@/components/ui/AppIcon';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: string;
  trend?: 'up' | 'down';
}

const KPICard = ({ title, value, icon }: KPICardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 group-hover:text-primary transition-smooth">{title}</p>
          <h3 className="text-2xl font-heading font-black text-foreground tracking-tight">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-smooth group-hover:bg-primary group-hover:text-white">
          <Icon name={icon as any} size={24} className="text-primary group-hover:text-white" />
        </div>
      </div>
      <div className="mt-4 h-1 w-full bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full bg-primary/40 w-2/3 rounded-full" />
      </div>
    </div>
  );
};

export default KPICard;