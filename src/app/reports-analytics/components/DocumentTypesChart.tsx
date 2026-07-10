'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DocumentTypesData {
 name: string;
 value: number;
 color: string;
 [key: string]: any;
}

interface DocumentTypesChartProps {
 data: DocumentTypesData[];
}

const DocumentTypesChart = ({ data }: DocumentTypesChartProps) => {
 return (
 <div className="w-full h-80" aria-label="Document Types Distribution Pie Chart">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={5}
 dataKey="value"
 animationDuration={1500}
 >
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 backgroundColor: 'white',
 border: '1px solid var(--color-border)',
 borderRadius: '12px',
 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
 padding: '12px'
 }}
 itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
 formatter={(value: number) => [value, 'Count']}
 />
 <Legend 
 verticalAlign="bottom" 
 align="center"
 wrapperStyle={{ paddingTop: '20px' }}
 iconType="circle"
 formatter={(value) => <span className="text-xs font-bold text-muted-foreground font-medium">{value}</span>}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 );
};

export default DocumentTypesChart;
