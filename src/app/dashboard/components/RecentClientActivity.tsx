import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface ClientActivity {
  id: string;
  clientName: string;
  clientImage: string;
  clientImageAlt: string;
  activity: string;
  timestamp: string;
  type: 'new' | 'communication' | 'payment';
}

interface RecentClientActivityProps {
  activities: ClientActivity[];
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
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <h2 className="text-xl font-heading font-semibold text-foreground mb-6">Recent Client Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/30 transition-smooth">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                <AppImage
                  src={activity.clientImage}
                  alt={activity.clientImageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card flex items-center justify-center ${getActivityColor(activity.type)}`}>
                <Icon name={getActivityIcon(activity.type) as any} size={14} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">{activity.clientName}</p>
              <p className="text-sm text-muted-foreground mb-2">{activity.activity}</p>
              <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentClientActivity;