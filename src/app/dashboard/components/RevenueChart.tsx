'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartData {
  period: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueChartData[];
  currency?: string;
}

const RevenueChart = ({ data, currency = 'USD' }: RevenueChartProps) => {
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
    <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-heading font-black text-foreground tracking-tight">Revenue Analytics</h2>
        <div className="flex items-center gap-2">
           <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
             Monthly
           </span>
        </div>
      </div>
      
      <div className="h-80 w-full" aria-label="Monthly Revenue Line Chart">
        {data && data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                stroke="rgba(100, 116, 139, 0.5)"
                style={{ fontSize: '11px', fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                stroke="rgba(100, 116, 139, 0.5)"
                style={{ fontSize: '11px', fontWeight: 'bold' }}
                tickFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-foreground)' }}
                labelStyle={{ fontSize: '10px', color: 'var(--color-muted-foreground)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                formatter={(value: number | undefined) => value !== undefined ? [new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value), 'Revenue'] : ['N/A', 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--color-primary)" 
                strokeWidth={4}
                dot={{ fill: 'var(--color-primary)', r: 6, strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 8, strokeWidth: 2, stroke: 'white', fill: 'var(--color-primary)' }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-muted/5 rounded-2xl border border-dashed border-border p-8">
            <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-foreground">Waiting for more data</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">Once you have multiple paid invoices over different months, your revenue trend will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;