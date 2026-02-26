import Icon from '@/components/ui/AppIcon';
import type { Client } from '@/types/database';

interface SummaryCard {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

interface ClientSummaryCardsProps {
  clients: Client[];
  currency?: string;
}

const ClientSummaryCards = ({ clients, currency = 'KES' }: ClientSummaryCardsProps) => {
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalBilled = clients.reduce((sum, client) => sum + client.total_billed, 0);
  const outstandingBalances = clients.reduce((sum, client) => sum + client.outstanding_balance, 0);

  const summaryData: SummaryCard[] = [
    {
      title: 'Total Database',
      value: totalClients.toString(),
      icon: 'UsersIcon',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Clients',
      value: activeClients.toString(),
      icon: 'CheckCircleIcon',
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Gross Billings',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(totalBilled),
      icon: 'BanknotesIcon',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Pending Collections',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(outstandingBalances),
      icon: 'ExclamationCircleIcon',
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryData.map((card, index) => (
        <div
          key={index}
          className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`${card.bgColor} w-12 h-12 rounded-xl flex items-center justify-center transition-smooth group-hover:scale-110`}>
              <Icon name={card.icon as any} size={24} className={card.iconColor} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">
                {card.title}
              </p>
              <h3 className="text-2xl font-heading font-black text-foreground tracking-tight">
                {card.value}
              </h3>
            </div>
          </div>
          <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
             <div 
               className={`h-full ${card.bgColor.replace('/10', '')}`} 
               style={{ width: index === 0 ? '100%' : `${(parseInt(card.value.replace(/[^0-9]/g, '')) / totalClients) * 100}%` }}
             />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientSummaryCards;
