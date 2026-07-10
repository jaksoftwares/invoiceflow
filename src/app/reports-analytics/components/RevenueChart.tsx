'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
 month: string;
 revenue: number;
 expenses: number;
}

interface RevenueChartProps {
 data: RevenueData[];
 currency?: string;
}

const RevenueChart = ({ data, currency = 'KES' }: RevenueChartProps) => {
 return (
 <div className="w-full h-80" aria-label="Monthly Revenue Bar Chart">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
 <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
 <XAxis 
 dataKey="month" 
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
 tickFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(value)}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: 'white',
 border: '1px solid var(--color-border)',
 borderRadius: '12px',
 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
 padding: '12px'
 }}
 cursor={{ fill: 'rgba(0,0,0,0.02)' }}
 formatter={(value: number | undefined) => value !== undefined ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value) : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0)}
 />
 <Bar dataKey="revenue" fill="var(--color-primary)" name="Gross Revenue" radius={[6, 6, 0, 0]} barSize={32} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 );
};

export default RevenueChart;