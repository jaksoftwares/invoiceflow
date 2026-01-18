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

interface ClientTableRowProps {
  client: Client;
  onEdit: (clientId: string) => void;
  onViewHistory: (clientId: string) => void;
  onCreateInvoice: (clientId: string) => void;
  onViewLogs: (clientId: string) => void;
}

const ClientTableRow = ({
  client,
  onEdit,
  onViewHistory,
  onCreateInvoice,
  onViewLogs,
}: ClientTableRowProps) => {
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
    <>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <img
            src={client.avatar}
            alt={client.avatarAlt}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-foreground">{client.companyName}</p>
            <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{client.email}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{client.phone}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-foreground">
          ${client.totalBilled.toLocaleString()}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-foreground">{client.lastInvoiceDate}</p>
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
            client.status
          )}`}
        >
          {client.status}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(client.id)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit client"
          >
            <Icon name="PencilIcon" size={16} />
          </button>
          <button
            onClick={() => onViewHistory(client.id)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="View history"
          >
            <Icon name="ClockIcon" size={16} />
          </button>
          <button
            onClick={() => onCreateInvoice(client.id)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Create invoice"
          >
            <Icon name="DocumentPlusIcon" size={16} />
          </button>
          <button
            onClick={() => onViewLogs(client.id)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="View logs"
          >
            <Icon name="DocumentTextIcon" size={16} />
          </button>
        </div>
      </td>
    </>
  );
};

export default ClientTableRow;