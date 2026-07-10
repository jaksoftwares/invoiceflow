'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { useSettings } from '@/lib/hooks/useSettings';
import ProfileTab from './ProfileTab';
import BusinessTab from './BusinessTab';
import NotificationsTab from './NotificationsTab';
import SecurityTab from './SecurityTab';

type SettingsTab = 'profile' | 'business' | 'notifications' | 'security';

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

const SettingsInteractive = () => {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
 const [isHydrated, setIsHydrated] = useState(false);
 
 // Notification state
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
 overdueFrequency: 'daily',
 },
 });

 // Security state
 const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

 const { settings, refetchSettings, updateNotificationSettings } = useSettings();

 useEffect(() => {
 setIsHydrated(true);
 }, []);

 useEffect(() => {
 if (settings) {
 setNotificationSettings({
 emailNotifications: settings.email_notifications || notificationSettings.emailNotifications,
 pushNotifications: settings.push_notifications || notificationSettings.pushNotifications,
 reminderSettings: settings.reminder_settings || notificationSettings.reminderSettings,
 });
 }
 }, [settings]);

 const handleNotificationSave = async (data: NotificationSettings) => {
 try {
 const apiData = {
 email_notifications: data.emailNotifications,
 push_notifications: data.pushNotifications,
 reminder_settings: data.reminderSettings,
 };
 
 await updateNotificationSettings(apiData);
 toast.success('Notification settings updated successfully');
 } catch (error) {
 console.error('Error saving notification settings:', error);
 toast.error('Failed to update notification settings');
 }
 };

 const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
 toast.success('Password change functionality coming soon');
 };

 const handleTwoFactorToggle = (enabled: boolean) => {
 setTwoFactorEnabled(enabled);
 toast.success(enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
 };

 if (!isHydrated) {
 return (
 <div className="min-h-screen bg-background text-foreground">
 <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
 <div className="animate-pulse space-y-8">
 <div className="h-10 bg-muted rounded-xl w-1/4" />
 <div className="h-[600px] bg-muted rounded-2xl" />
 </div>
 </div>
 </div>
 );
 }

 const tabs: { id: SettingsTab; label: string; icon: string }[] = [
 { id: 'profile', label: 'Profile', icon: 'UserIcon' },
 { id: 'business', label: 'Business', icon: 'BuildingOfficeIcon' },
 { id: 'notifications', label: 'Notifications', icon: 'BellIcon' },
 { id: 'security', label: 'Security', icon: 'ShieldCheckIcon' },
 ];

 return (
 <div className="min-h-screen bg-background">
 <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
 <div className="mb-10">
 <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl">Settings</h1>
 <p className="text-muted-foreground mt-3 text-lg font-medium">Manage your account and app preferences.</p>
 </div>

        {/* Horizontal Tab Navigation */}
        <div className="mb-8 overflow-hidden">
          <nav className="flex overflow-x-auto no-scrollbar gap-2 pb-4 border-b border-border mask-edges-right">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-smooth ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon as any} size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

 {/* Content Area */}
 <div>
 {activeTab === 'profile' && (
 <ProfileTab />
 )}
 {activeTab === 'business' && (
 <BusinessTab />
 )}
 {activeTab === 'notifications' && (
 <NotificationsTab
 notificationSettings={notificationSettings}
 onSave={handleNotificationSave}
 />
 )}
 {activeTab === 'security' && (
 <SecurityTab
 onPasswordChange={handlePasswordChange}
 onTwoFactorToggle={handleTwoFactorToggle}
 twoFactorEnabled={twoFactorEnabled}
 />
 )}
 </div>
 </div>
 </div>
 );
};

export default SettingsInteractive;
