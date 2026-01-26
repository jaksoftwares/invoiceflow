import Icon from '@/components/ui/AppIcon';
import type { Client } from '@/types/database';

interface SummaryCard {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: string;
  bgColor: string;
}

interface ClientSummaryCardsProps {
  clients: Client[];
}

const ClientSummaryCards = ({ clients }: ClientSummaryCardsProps) => {
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalBilled = clients.reduce((sum, client) => sum + client.total_billed, 0);
  const averageInvoiceValue = totalClients > 0 ? totalBilled / totalClients : 0;
  const outstandingBalances = clients.reduce((sum, client) => sum + client.outstanding_balance, 0);

  const summaryData: SummaryCard[] = [
    {
      title: 'Total Clients',
      value: totalClients.toString(),
      trend: 0, // Would need historical data for trends
      trendLabel: 'total',
      icon: 'UsersIcon',
      bgColor: 'bg-primary',
    },
    {
      title: 'Active Relationships',
      value: activeClients.toString(),
      trend: 0,
      trendLabel: 'active',
      icon: 'CheckCircleIcon',
      bgColor: 'bg-success',
    },
    {
      title: 'Average Invoice Value',
      value: `$${averageInvoiceValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      trend: 0,
      trendLabel: 'average',
      icon: 'CurrencyDollarIcon',
      bgColor: 'bg-accent',
    },
    {
      title: 'Outstanding Balances',
      value: `$${outstandingBalances.toLocaleString()}`,
      trend: 0,
      trendLabel: 'total outstanding',
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