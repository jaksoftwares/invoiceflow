'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClientPerformanceData {
  month: string;
  newClients: number;
  activeClients: number;
}

interface ClientPerformanceChartProps {
  data: ClientPerformanceData[];
}

const ClientPerformanceChart = ({ data }: ClientPerformanceChartProps) => {
  return (
    <div className="w-full h-80" aria-label="Client Performance Line Chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '14px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-foreground)'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="newClients" 
            stroke="var(--color-success)" 
            strokeWidth={3}
            name="New Clients"
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line 
            type="monotone" 
            dataKey="activeClients" 
            stroke="var(--color-primary)" 
            strokeWidth={3}
            name="Active Clients"
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClientPerformanceChart;