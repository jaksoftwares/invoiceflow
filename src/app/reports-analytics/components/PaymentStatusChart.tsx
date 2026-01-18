'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface PaymentStatusChartProps {
  data: PaymentStatusData[];
}

const PaymentStatusChart = ({ data }: PaymentStatusChartProps) => {
  return (
    <div className="w-full h-80" aria-label="Payment Status Distribution Pie Chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentStatusChart;