'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ComparisonData {
  metric: string;
  currentYear: number;
  previousYear: number;
  change: number;
}

const ComparisonTools = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [comparisonYear, setComparisonYear] = useState('2025');

  const comparisonData: ComparisonData[] = [
    { metric: 'Total Revenue', currentYear: 485000, previousYear: 412000, change: 17.7 },
    { metric: 'Total Invoices', currentYear: 342, previousYear: 298, change: 14.8 },
    { metric: 'Average Invoice Value', currentYear: 1418, previousYear: 1382, change: 2.6 },
    { metric: 'Collection Rate', currentYear: 94.5, previousYear: 91.2, change: 3.6 },
    { metric: 'New Clients', currentYear: 48, previousYear: 35, change: 37.1 },
    { metric: 'Client Retention', currentYear: 92.3, previousYear: 88.7, change: 4.1 }
  ];

  return (
    <div className="bg-card rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="ArrowsRightLeftIcon" size={24} className="text-primary" />
        <h2 className="text-xl font-heading font-semibold text-foreground">Year-over-Year Comparison</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="selectedYear" className="block text-sm font-medium text-foreground mb-2">
            Current Year
          </label>
          <select
            id="selectedYear"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <div>
          <label htmlFor="comparisonYear" className="block text-sm font-medium text-foreground mb-2">
            Compare With
          </label>
          <select
            id="comparisonYear"
            value={comparisonYear}
            onChange={(e) => setComparisonYear(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {comparisonData.map((item, index) => (
          <div key={index} className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{item.metric}</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                item.change >= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                <Icon 
                  name={item.change >= 0 ? 'ArrowUpIcon' : 'ArrowDownIcon'} 
                  size={14} 
                />
                <span className="text-xs font-medium">{Math.abs(item.change)}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{selectedYear}</p>
                <p className="text-lg font-semibold text-foreground">
                  {item.metric.includes('Rate') || item.metric.includes('Retention') 
                    ? `${item.currentYear}%` 
                    : item.metric.includes('Average') 
                    ? `$${item.currentYear.toLocaleString()}`
                    : item.currentYear.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{comparisonYear}</p>
                <p className="text-lg font-semibold text-muted-foreground">
                  {item.metric.includes('Rate') || item.metric.includes('Retention') 
                    ? `${item.previousYear}%` 
                    : item.metric.includes('Average') 
                    ? `$${item.previousYear.toLocaleString()}`
                    : item.previousYear.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonTools;