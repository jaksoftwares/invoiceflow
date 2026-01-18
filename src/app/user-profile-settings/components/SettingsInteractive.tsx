'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import ProfileTab from './ProfileTab';
import BusinessTab from './BusinessTab';
import NotificationsTab from './NotificationsTab';
import SecurityTab from './SecurityTab';
import SubscriptionTab from './SubscriptionTab';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface BusinessSettings {
  companyLogo: string;
  defaultTemplate: string;
  paymentTerms: string;
  taxRate: string;
  taxLabel: string;
  invoicePrefix: string;
  invoiceFooter: string;
}

interface NotificationSettings {
  emailNotifications: {
    paymentReceived: boolean;
    invoiceOverdue: boolean;
    paymentReminder: boolean;
    newClient: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  pushNotifications: {
    paymentReceived: boolean;
    invoiceOverdue: boolean;
    systemUpdates: boolean;
  };
  reminderSettings: {
    daysBeforeDue: string;
    overdueFrequency: string;
  };
}

interface SubscriptionPlan {
  name: string;
  price: string;
  billingCycle: string;
  features: string[];
  current: boolean;
}

interface UsageStats {
  invoicesSent: number;
  invoicesLimit: number;
  clientsAdded: number;
  clientsLimit: number;
  storageUsed: number;
  storageLimit: number;
}

type TabType = 'profile' | 'business' | 'notifications' | 'security' | 'subscription';

const SettingsInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'owner@invoiceflow.com',
    phone: '+1 (555) 123-4567',
    businessName: 'Acme Consulting LLC',
    businessAddress: '123 Business Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  });

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    companyLogo: '',
    defaultTemplate: 'modern',
    paymentTerms: 'net30',
    taxRate: '8.50',
    taxLabel: 'Sales Tax',
    invoicePrefix: 'INV-',
    invoiceFooter: 'Thank you for your business! Payment is due within 30 days.',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: {
      paymentReceived: true,
      invoiceOverdue: true,
      paymentReminder: true,
      newClient: false,
      weeklyReport: true,
      monthlyReport: true,
    },
    pushNotifications: {
      paymentReceived: true,
      invoiceOverdue: true,
      systemUpdates: false,
    },
    reminderSettings: {
      daysBeforeDue: '3',
      overdueFrequency: 'weekly',
    },
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const currentPlan: SubscriptionPlan = {
    name: 'Professional',
    price: '$49',
    billingCycle: 'per month',
    features: [
      'Up to 200 invoices per month',
      'Up to 100 clients',
      '25GB storage',
      'Premium templates',
      'Priority email support',
      'Advanced analytics',
      'Custom branding',
    ],
    current: true,
  };

  const usageStats: UsageStats = {
    invoicesSent: 87,
    invoicesLimit: 200,
    clientsAdded: 42,
    clientsLimit: 100,
    storageUsed: 12.5,
    storageLimit: 25,
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'UserIcon' },
    { id: 'business', label: 'Business', icon: 'BuildingOfficeIcon' },
    { id: 'notifications', label: 'Notifications', icon: 'BellIcon' },
    { id: 'security', label: 'Security', icon: 'ShieldCheckIcon' },
    { id: 'subscription', label: 'Subscription', icon: 'CreditCardIcon' },
  ];

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleProfileSave = (data: ProfileData) => {
    setProfileData(data);
    showSuccess('Profile updated successfully!');
  };

  const handleBusinessSave = (data: BusinessSettings) => {
    setBusinessSettings(data);
    showSuccess('Business settings updated successfully!');
  };

  const handleNotificationsSave = (data: NotificationSettings) => {
    setNotificationSettings(data);
    showSuccess('Notification preferences updated successfully!');
  };

  const handlePasswordChange = (currentPassword: string, newPassword: string) => {
    showSuccess('Password changed successfully!');
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    showSuccess(enabled ? 'Two-factor authentication enabled!' : 'Two-factor authentication disabled!');
  };

  const handleUpgrade = () => {
    showSuccess('Redirecting to upgrade page...');
  };

  const handleCancelSubscription = () => {
    showSuccess('Subscription cancellation initiated. You will receive a confirmation email.');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8" />
            <div className="flex gap-4 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted rounded w-32" />
              ))}
            </div>
            <div className="bg-card rounded-lg shadow-elevation-1 p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and business configuration
          </p>
        </div>

        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-md animate-scale-in">
            <div className="flex items-center gap-3">
              <Icon name="CheckCircleIcon" size={20} className="text-success" />
              <p className="text-sm font-medium text-foreground">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="hidden lg:flex gap-2 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-smooth border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon name={tab.icon as any} size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:hidden mb-6">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          {activeTab === 'profile' && (
            <ProfileTab profileData={profileData} onSave={handleProfileSave} />
          )}
          {activeTab === 'business' && (
            <BusinessTab businessSettings={businessSettings} onSave={handleBusinessSave} />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notificationSettings={notificationSettings}
              onSave={handleNotificationsSave}
            />
          )}
          {activeTab === 'security' && (
            <SecurityTab
              onPasswordChange={handlePasswordChange}
              onTwoFactorToggle={handleTwoFactorToggle}
              twoFactorEnabled={twoFactorEnabled}
            />
          )}
          {activeTab === 'subscription' && (
            <SubscriptionTab
              currentPlan={currentPlan}
              usageStats={usageStats}
              onUpgrade={handleUpgrade}
              onCancelSubscription={handleCancelSubscription}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsInteractive;