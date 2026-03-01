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
  currency?: string;
}

const ReportsTable = ({ data, currency = 'KES' }: ReportsTableProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-muted/5">
        <div>
          <h3 className="text-xl font-heading font-black text-foreground tracking-tight">
            Performance Summary
          </h3>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">
             {data.length} Entities
           </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/10 border-b border-border/50">
              <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Client</th>
              <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Invoices</th>
              <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Revenue</th>
              <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Avg Val</th>
              <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Payment Rate</th>
              <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-muted/5 transition-smooth group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-smooth">
                      <Icon name="BuildingOfficeIcon" size={18} className="text-primary group-hover:text-white transition-smooth" />
                    </div>
                    <span className="text-sm font-bold text-foreground">{row.client}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-medium text-foreground">{row.invoiceCount}</span>
                </td>
                <td className="px-8 py-5 text-right font-black text-foreground">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.totalRevenue)}
                </td>
                <td className="px-8 py-5 text-right font-medium text-muted-foreground">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.avgInvoiceValue)}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden">
                       <div className={`h-full rounded-full ${
                         row.paymentRate >= 95 ? 'bg-success' :
                         row.paymentRate >= 70 ? 'bg-warning' : 'bg-error'
                       }`} style={{ width: `${row.paymentRate}%` }} />
                    </div>
                    <span className={`text-xs font-black ${
                      row.paymentRate >= 95 ? 'text-success' :
                      row.paymentRate >= 70 ? 'text-warning' : 'text-error'
                    }`}>
                      {row.paymentRate.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className={`text-sm font-black ${
                    row.outstanding > 0 ? 'text-error' : 'text-success'
                  }`}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(row.outstanding)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-6 border-t border-border/50 bg-muted/5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Gross</span>
            <span className="text-xl font-black text-foreground">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(data.reduce((sum, row) => sum + row.totalRevenue, 0))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Outstanding</span>
            <span className="text-xl font-black text-error">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(data.reduce((sum, row) => sum + row.outstanding, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTable;