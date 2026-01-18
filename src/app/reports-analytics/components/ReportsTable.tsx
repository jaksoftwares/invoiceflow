import Icon from '@/components/ui/AppIcon';

interface ReportRow {
  id: number;
  client: string;
  invoiceCount: number;
  totalRevenue: number;
  avgInvoiceValue: number;
  paymentRate: number;
  outstanding: number;
}

interface ReportsTableProps {
  data: ReportRow[];
}

const ReportsTable = ({ data }: ReportsTableProps) => {
  return (
    <div className="bg-card rounded-lg shadow-elevation-1 overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Client Performance Report
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed breakdown of client metrics and financial performance
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Client</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Invoices</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Total Revenue</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Avg Invoice</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Payment Rate</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="BuildingOfficeIcon" size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{row.client}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">{row.invoiceCount}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-foreground">
                    ${row.totalRevenue.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">
                    ${row.avgInvoiceValue.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      row.paymentRate >= 95 ? 'text-success' :
                      row.paymentRate >= 90 ? 'text-warning' : 'text-error'
                    }`}>
                      {row.paymentRate}%
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      row.paymentRate >= 95 ? 'bg-success' :
                      row.paymentRate >= 90 ? 'bg-warning' : 'bg-error'
                    }`} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${
                    row.outstanding > 0 ? 'text-warning' : 'text-success'
                  }`}>
                    ${row.outstanding.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {data.length} clients
          </span>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Total Revenue: <span className="font-medium text-foreground">
                ${data.reduce((sum, row) => sum + row.totalRevenue, 0).toLocaleString()}
              </span>
            </span>
            <span className="text-muted-foreground">
              Total Outstanding: <span className="font-medium text-foreground">
                ${data.reduce((sum, row) => sum + row.outstanding, 0).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTable;