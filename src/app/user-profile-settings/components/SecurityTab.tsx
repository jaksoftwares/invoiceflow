'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SecurityTabProps {
  onPasswordChange: (currentPassword: string, newPassword: string) => void;
  onTwoFactorToggle: (enabled: boolean) => void;
  twoFactorEnabled: boolean;
}

const SecurityTab = ({ onPasswordChange, onTwoFactorToggle, twoFactorEnabled }: SecurityTabProps) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'New York, USA',
      ipAddress: '192.168.1.1',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'New York, USA',
      ipAddress: '192.168.1.2',
      lastActive: '2 hours ago',
      current: false,
    },
    {
      id: 3,
      device: 'Firefox on MacOS',
      location: 'Boston, USA',
      ipAddress: '192.168.1.3',
      lastActive: '1 day ago',
      current: false,
    },
  ];

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = () => {
    if (validatePassword()) {
      onPasswordChange(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowTwoFactorSetup(true);
    } else {
      onTwoFactorToggle(false);
    }
  };

  const handleTwoFactorSetupComplete = () => {
    onTwoFactorToggle(true);
    setShowTwoFactorSetup(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-semibold text-foreground">Security Settings</h2>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`w-full px-4 py-2 pr-12 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth ${
                  errors.currentPassword ? 'border-error' : 'border-input'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name={showPasswords.current ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-error text-xs mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-4 py-2 pr-12 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth ${
                  errors.newPassword ? 'border-error' : 'border-input'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name={showPasswords.new ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-error text-xs mt-1">{errors.newPassword}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-2 pr-12 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-smooth ${
                  errors.confirmPassword ? 'border-error' : 'border-input'
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              >
                <Icon name={showPasswords.confirm ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            onClick={handlePasswordChange}
            className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
          >
            <Icon name="KeyIcon" size={18} />
            <span>Update Password</span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            onClick={handleTwoFactorToggle}
            className={`relative w-12 h-6 rounded-full transition-smooth ${
              twoFactorEnabled ? 'bg-success' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-smooth ${
                twoFactorEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-md">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircleIcon" size={20} className="text-success mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication Enabled</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account is protected with 2FA. You'll need to enter a code from your authenticator app when signing in.
                </p>
              </div>
            </div>
          </div>
        )}

        {showTwoFactorSetup && (
          <div className="mt-4 p-6 border border-border rounded-md">
            <h4 className="text-base font-semibold text-foreground mb-4">Setup Two-Factor Authentication</h4>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="QrCodeIcon" size={64} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">QR Code Placeholder</p>
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground max-w-md">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTwoFactorSetup(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground transition-smooth hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTwoFactorSetupComplete}
                  className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-smooth hover:-translate-y-[1px] hover:shadow-elevation-2"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg shadow-elevation-1 p-6">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Active Sessions</h3>
        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between p-4 border border-border rounded-md hover:bg-muted transition-smooth"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="ComputerDesktopIcon" size={20} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{session.device}</p>
                    {session.current && (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{session.location}</p>
                  <p className="text-xs text-muted-foreground">IP: {session.ipAddress}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last active: {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button className="text-error text-sm font-medium transition-smooth hover:underline">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;