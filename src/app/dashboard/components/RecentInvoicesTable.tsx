import Icon from '@/components/ui/AppIcon';
import type { Invoice } from '@/types/database';

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
  };
}

interface RecentInvoicesTableProps {
  invoices: InvoiceWithClient[];
  onViewInvoice: (id: string) => void;
}

const RecentInvoicesTable = ({ invoices, onViewInvoice }: RecentInvoicesTableProps) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'overdue':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-heading font-semibold text-foreground">Recent Invoices</h2>
      </div>
      
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Invoice ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Client Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Due Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4 text-sm text-foreground font-medium">{invoice.invoice_number}</td>
                <td className="px-6 py-4 text-sm text-foreground">{invoice.clients?.company_name || 'Unknown Client'}</td>
                <td className="px-6 py-4 text-sm text-foreground font-semibold">${invoice.total_amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(invoice.due_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewInvoice(invoice.id)}
                    className="text-primary hover:text-primary/80 transition-smooth"
                  >
                    <Icon name="EyeIcon" size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-border">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="p-4 hover:bg-muted/30 transition-smooth">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">{invoice.invoice_number}</p>
                <p className="text-sm text-muted-foreground">{invoice.clients?.company_name || 'Unknown Client'}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">${invoice.total_amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => onViewInvoice(invoice.id)}
                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-smooth"
              >
                <Icon name="EyeIcon" size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInvoicesTable;