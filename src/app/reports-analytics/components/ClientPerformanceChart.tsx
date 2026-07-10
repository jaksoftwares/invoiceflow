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
 <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
 />
 <Tooltip 
 contentStyle={{
 backgroundColor: 'white',
 border: '1px solid var(--color-border)',
 borderRadius: '12px',
 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
 padding: '12px'
 }}
 itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
 />
 <Legend 
 verticalAlign="bottom" 
 align="center"
 wrapperStyle={{ paddingTop: '20px' }}
 iconType="circle"
 formatter={(value) => <span className="text-xs font-bold text-muted-foreground font-medium">{value}</span>}
 />
 <Line 
 type="monotone" 
 dataKey="newClients" 
 stroke="#10b981" 
 strokeWidth={4}
 name="Acquisitions"
 dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: 'white' }}
 activeDot={{ r: 7, strokeWidth: 2, stroke: 'white' }}
 animationDuration={2000}
 />
 <Line 
 type="monotone" 
 dataKey="activeClients" 
 stroke="var(--color-primary)" 
 strokeWidth={4}
 name="Participating"
 dot={{ fill: 'var(--color-primary)', r: 5, strokeWidth: 2, stroke: 'white' }}
 activeDot={{ r: 7, strokeWidth: 2, stroke: 'white' }}
 animationDuration={2000}
 />
 </LineChart>
 </ResponsiveContainer>
 </div>
 );
};

export default ClientPerformanceChart;