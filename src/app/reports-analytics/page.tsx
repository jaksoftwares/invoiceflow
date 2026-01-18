import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import ReportsAnalyticsInteractive from './components/ReportsAnalyticsInteractive';
export const metadata: Metadata = {
  title: 'Reports & Analytics - InvoiceFlow',
  description: 'Comprehensive financial insights and exportable business intelligence for invoice performance tracking, revenue analysis, and strategic decision-making.',
};

export default function ReportsAnalyticsPage() {
  return (
    <NavigationWrapper>
      <ReportsAnalyticsInteractive />
    </NavigationWrapper>
  );
}