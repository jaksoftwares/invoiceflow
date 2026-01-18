'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

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

interface NotificationsTabProps {
  notificationSettings: NotificationSettings;
  onSave: (data: NotificationSettings) => void;
}

const NotificationsTab = ({ notificationSettings, onSave }: NotificationsTabProps) => {
  const [formData, setFormData] = useState<NotificationSettings>(notificationSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEmailToggle = (key: keyof NotificationSettings['emailNotifications']) => {
    setFormData(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: !prev.emailNotifications[key],
      },
    }));
    setHasChanges(true);
  };

  const handlePushToggle = (key: keyof NotificationSettings['pushNotifications']) => {
    setFormData(prev => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [key]: !prev.pushNotifications[key],
      },
    }));
    setHasChanges(true);
  };

  const handleReminderChange = (key: keyof NotificationSettings['reminderSettings'], value: string) => {
    setFormData(prev => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData(notificationSettings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-semibold text-foreground">Notification Preferences</h2>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-start gap-3">
              <Icon name="BanknotesIcon" size={20} className="text-success mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Payment Received</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get notified when a client makes a payment
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEmailToggle('paymentReceived')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.emailNotifications.paymentReceived ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.emailNotifications.paymentReceived ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-start gap-3">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-warning mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Invoice Overdue</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Alert when an invoice becomes overdue
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEmailToggle('invoiceOverdue')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.emailNotifications.invoiceOverdue ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.emailNotifications.invoiceOverdue ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-start gap-3">
              <Icon name="BellIcon" size={20} className="text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Payment Reminders</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatic reminders sent to clients before due date
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEmailToggle('paymentReminder')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.emailNotifications.paymentReminder ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.emailNotifications.paymentReminder ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-start gap-3">
              <Icon name="UserPlusIcon" size={20} className="text-accent mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">New Client Added</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Confirmation when a new client is added to your account
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEmailToggle('newClient')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.emailNotifications.newClient ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.emailNotifications.newClient ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-start gap-3">
              <Icon name="ChartBarIcon" size={20} className="text-secondary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Weekly Summary Report</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Weekly overview of invoices and payments
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEmailToggle('weeklyReport')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.emailNotifications.weeklyReport ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.emailNotifications.weeklyReport ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Icon name="DocumentChartBarIcon" size={20} className="text-secondary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Monthly Financial Report</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Comprehensive monthly financial summary
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEmailToggle('monthlyReport')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.emailNotifications.monthlyReport ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.emailNotifications.monthlyReport ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-start gap-3">
              <Icon name="BanknotesIcon" size={20} className="text-success mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Payment Received</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Instant notification for payments
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePushToggle('paymentReceived')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.pushNotifications.paymentReceived ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.pushNotifications.paymentReceived ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-start gap-3">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-warning mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Invoice Overdue</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate alert for overdue invoices
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePushToggle('invoiceOverdue')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.pushNotifications.invoiceOverdue ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.pushNotifications.invoiceOverdue ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Icon name="BellAlertIcon" size={20} className="text-primary mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">System Updates</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Important system announcements and updates
                </p>
              </div>
            </div>
            <button
              onClick={() => handlePushToggle('systemUpdates')}
              className={`relative w-12 h-6 rounded-full transition-smooth ${
                formData.pushNotifications.systemUpdates ? 'bg-success' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                  formData.pushNotifications.systemUpdates ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Reminder Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Send Reminder Before Due Date
            </label>
            <select
              value={formData.reminderSettings.daysBeforeDue}
              onChange={(e) => handleReminderChange('daysBeforeDue', e.target.value)}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
            >
              <option value="1">1 day before</option>
              <option value="3">3 days before</option>
              <option value="5">5 days before</option>
              <option value="7">7 days before</option>
              <option value="14">14 days before</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Overdue Reminder Frequency
            </label>
            <select
              value={formData.reminderSettings.overdueFrequency}
              onChange={(e) => handleReminderChange('overdueFrequency', e.target.value)}
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
            >
              <option value="daily">Daily</option>
              <option value="every_3_days">Every 3 days</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-border rounded-md text-sm font-medium text-foreground transition-smooth hover:bg-muted"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;