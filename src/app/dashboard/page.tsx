import React from 'react';
import NavigationWrapper from '../../components/common/NavigationWrapper';
import DashboardInteractive from './components/DashboardInteractive';

export default function DashboardPage() {
  return (
    <NavigationWrapper>
      <div className="min-h-screen bg-background">
        <DashboardInteractive />
      </div>
    </NavigationWrapper>
  );
}