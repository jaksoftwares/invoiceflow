import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import type { ClientActivity } from '@/types/database';

interface ActivityWithClient extends ClientActivity {
  clients?: {
    company_name: string;
    avatar_url?: string;
  };
}

interface RecentClientActivityProps {
  activities: ActivityWithClient[];
}

const RecentClientActivity = ({ activities }: RecentClientActivityProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new':
        return 'UserPlusIcon';
      case 'communication':
        return 'ChatBubbleLeftRightIcon';
      case 'payment':
        return 'BanknotesIcon';
      default:
        return 'BellIcon';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'new':
        return 'text-success';
      case 'communication':
        return 'text-primary';
      case 'payment':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-heading font-black text-foreground tracking-tight">Recent Client Activity</h2>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
           <Icon name="InformationCircleIcon" size={18} />
        </div>
      </div>
      <div className="space-y-6">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 group cursor-default">
              <div className="relative pt-1">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border-2 border-background ring-2 ring-muted/20">
                  <AppImage
                    src={activity.clients?.avatar_url || '/assets/images/no_image.png'}
                    alt={activity.clients?.company_name || 'Client'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center ${getActivityColor(activity.type)} shadow-sm`}>
                  <Icon name={getActivityIcon(activity.type) as any} size={10} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-smooth">
                  {activity.clients?.company_name || 'Unknown Client'}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{activity.activity}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Icon name="ClockIcon" size={10} />
                  {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground mb-4 border border-dashed border-border">
               <Icon name="BellIcon" size={28} />
            </div>
            <p className="text-sm font-bold text-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">When your clients interact with your documents, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentClientActivity;