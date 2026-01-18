import Icon from '@/components/ui/AppIcon';

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  totalBilled: number;
  lastInvoiceDate: string;
  status: 'active' | 'inactive' | 'pending';
  outstandingBalance: number;
  avatar: string;
  avatarAlt: string;
  billingFrequency: string;
}

interface ClientMobileCardProps {
  client: Client;
  onEdit: (clientId: string) => void;
  onViewHistory: (clientId: string) => void;
  onCreateInvoice: (clientId: string) => void;
  onViewLogs: (clientId: string) => void;
}

const ClientMobileCard = ({
  client,
  onEdit,
  onViewHistory,
  onCreateInvoice,
  onViewLogs,
}: ClientMobileCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'inactive':
        return 'text-muted-foreground bg-muted';
      case 'pending':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-1 p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={client.avatar}
            alt={client.avatarAlt}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-foreground">{client.companyName}</h3>
            <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
            client.status
          )}`}
        >
          {client.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Email:</span>
          <span className="text-sm text-foreground">{client.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Phone:</span>
          <span className="text-sm text-foreground">{client.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Billed:</span>
          <span className="text-sm font-medium text-foreground">
            ${client.totalBilled.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Last Invoice:</span>
          <span className="text-sm text-foreground">{client.lastInvoiceDate}</span>
        </div>
        {client.outstandingBalance > 0 && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Outstanding:</span>
            <span className="text-sm font-medium text-warning">
              ${client.outstandingBalance.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onEdit(client.id)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit client"
          >
            <Icon name="PencilIcon" size={18} />
          </button>
          <button
            onClick={() => onViewHistory(client.id)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="View history"
          >
            <Icon name="ClockIcon" size={18} />
          </button>
          <button
            onClick={() => onCreateInvoice(client.id)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Create invoice"
          >
            <Icon name="DocumentPlusIcon" size={18} />
          </button>
          <button
            onClick={() => onViewLogs(client.id)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="View logs"
          >
            <Icon name="DocumentTextIcon" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientMobileCard;