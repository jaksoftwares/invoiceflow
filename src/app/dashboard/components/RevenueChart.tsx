'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartData {
  period: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueChartData[];
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-elevation-2">
        <h2 className="text-xl font-heading font-semibold text-foreground mb-6">Monthly Revenue Trend</h2>
        <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <h2 className="text-xl font-heading font-semibold text-foreground mb-6">Monthly Revenue Trend</h2>
      <div className="h-80" aria-label="Monthly Revenue Line Chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis
              dataKey="period"
              stroke="rgba(100, 116, 139, 0.5)"
              style={{ fontSize: '14px' }}
            />
            <YAxis 
              stroke="rgba(100, 116, 139, 0.5)"
              style={{ fontSize: '14px' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(30, 58, 95, 0.1)'
              }}
              formatter={(value: number | undefined) => value !== undefined ? [`$${value.toLocaleString()}`, 'Revenue'] : ['N/A', 'Revenue']}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--color-primary)', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;