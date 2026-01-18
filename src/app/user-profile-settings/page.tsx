import type { Metadata } from 'next';
import NavigationWrapper from '@/components/common/NavigationWrapper';
import SettingsInteractive from './components/SettingsInteractive';

export const metadata: Metadata = {
  title: 'User Profile Settings - InvoiceFlow',
  description: 'Manage your account preferences, business configuration, notification settings, security options, and subscription details for your InvoiceFlow account.',
};

export default function UserProfileSettingsPage() {
  return (
    <NavigationWrapper>
      <SettingsInteractive />
    </NavigationWrapper>
  );
}