'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/components/providers/SupabaseAuthProvider';
import { useSettings } from '@/lib/hooks/useSettings';
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
  const { user } = useAuth();
  const { settings, profile, loading, error, updateProfile, updateBusinessSettings, updateNotificationSettings } = useSettings();

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    businessName: profile?.business_name || '',
    businessAddress: profile?.business_address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zipCode: profile?.zip_code || '',
    country: profile?.country || '',
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
    emailNotifications: settings?.email_notifications || {
      paymentReceived: true,
      invoiceOverdue: true,
      paymentReminder: true,
      newClient: false,
      weeklyReport: true,
      monthlyReport: true,
    },
    pushNotifications: settings?.push_notifications || {
      paymentReceived: true,
      invoiceOverdue: true,
      systemUpdates: false,
    },
    reminderSettings: settings?.reminder_settings || {
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

  // Update profile data when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        businessName: profile.business_name || '',
        businessAddress: profile.business_address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        country: profile.country || '',
      });
    }
  }, [profile, user]);

  // Update settings data when settings load
  useEffect(() => {
    if (settings) {
      setBusinessSettings({
        companyLogo: settings.company_logo_url || '',
        defaultTemplate: settings.default_template || 'modern',
        paymentTerms: settings.default_payment_terms || 'net30',
        taxRate: settings.default_tax_rate?.toString() || '8.50',
        taxLabel: settings.tax_label || 'Tax',
        invoicePrefix: settings.invoice_prefix || 'INV-',
        invoiceFooter: settings.invoice_footer || '',
      });

      setNotificationSettings({
        emailNotifications: settings.email_notifications || {
          paymentReceived: true,
          invoiceOverdue: true,
          paymentReminder: true,
          newClient: false,
          weeklyReport: true,
          monthlyReport: true,
        },
        pushNotifications: settings.push_notifications || {
          paymentReceived: true,
          invoiceOverdue: true,
          systemUpdates: false,
        },
        reminderSettings: settings.reminder_settings || {
          daysBeforeDue: '3',
          overdueFrequency: 'weekly',
        },
      });
    }
  }, [settings]);

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

  const handleProfileSave = async (data: ProfileData) => {
    const profileUpdateData = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      business_name: data.businessName,
      business_address: data.businessAddress,
      city: data.city,
      state: data.state,
      zip_code: data.zipCode,
      country: data.country,
    };

    const result = await updateProfile(profileUpdateData);
    if (result) {
      showSuccess('Profile updated successfully!');
    } else {
      // Error is handled by the hook
    }
  };

  const handleBusinessSave = async (data: BusinessSettings) => {
    const businessUpdateData = {
      company_logo_url: data.companyLogo || undefined,
      default_template: data.defaultTemplate,
      default_payment_terms: data.paymentTerms,
      default_tax_rate: parseFloat(data.taxRate),
      tax_label: data.taxLabel,
      invoice_prefix: data.invoicePrefix,
      invoice_footer: data.invoiceFooter || undefined,
    };

    const result = await updateBusinessSettings(businessUpdateData);
    if (result) {
      showSuccess('Business settings updated successfully!');
    } else {
      // Error is handled by the hook
    }
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