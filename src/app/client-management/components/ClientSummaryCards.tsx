import Icon from '@/components/ui/AppIcon';

interface SummaryCard {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: string;
  bgColor: string;
}

const ClientSummaryCards = () => {
  const summaryData: SummaryCard[] = [
    {
      title: 'Total Clients',
      value: '248',
      trend: 12,
      trendLabel: 'vs last month',
      icon: 'UsersIcon',
      bgColor: 'bg-primary',
    },
    {
      title: 'Active Relationships',
      value: '186',
      trend: 8,
      trendLabel: 'vs last month',
      icon: 'CheckCircleIcon',
      bgColor: 'bg-success',
    },
    {
      title: 'Average Invoice Value',
      value: '$2,847',
      trend: -3,
      trendLabel: 'vs last month',
      icon: 'CurrencyDollarIcon',
      bgColor: 'bg-accent',
    },
    {
      title: 'Outstanding Balances',
      value: '$45,230',
      trend: -15,
      trendLabel: 'vs last month',
      icon: 'ExclamationTriangleIcon',
      bgColor: 'bg-warning',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryData.map((card, index) => (
        <div
          key={index}
          className="bg-card rounded-lg shadow-elevation-1 p-6 transition-smooth hover:shadow-elevation-2"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`${card.bgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
              <Icon name={card.icon as any} size={24} className="text-white" />
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                card.trend >= 0
                  ? 'bg-success/10 text-success' :'bg-error/10 text-error'
              }`}
            >
              <Icon
                name={card.trend >= 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'}
                size={14}
              />
              <span>{Math.abs(card.trend)}%</span>
            </div>
          </div>
          <h3 className="text-2xl font-heading font-semibold text-foreground mb-1">
            {card.value}
          </h3>
          <p className="text-sm text-muted-foreground">{card.title}</p>
          <p className="text-xs text-muted-foreground mt-2">{card.trendLabel}</p>
        </div>
      ))}
    </div>
  );
};

export default ClientSummaryCards;