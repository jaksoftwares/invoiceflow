'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <div className="w-full h-80" aria-label="Monthly Revenue Bar Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '14px' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-foreground)'
            }}
            formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : '$0'}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar dataKey="revenue" fill="var(--color-primary)" name="Revenue" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expenses" fill="var(--color-accent)" name="Expenses" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;