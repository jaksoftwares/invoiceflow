import { useState, useEffect, useCallback } from 'react';
import type { UserSettings, Profile } from '@/types/database';

interface UseSettingsOptions {
  autoFetch?: boolean;
}

interface UseSettingsReturn {
  settings: UserSettings | null;
  profile: Profile | null;
  loading: {
    settings: boolean;
    profile: boolean;
    business: boolean;
    notifications: boolean;
  };
  error: {
    settings: string | null;
    profile: string | null;
    business: string | null;
    notifications: string | null;
  };
  refetch: () => Promise<void>;
  refetchSettings: () => Promise<void>;
  refetchProfile: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<UserSettings | null>;
  updateBusinessSettings: (businessData: {
    company_logo_url?: string;
    default_template: string;
    default_payment_terms: string;
    default_tax_rate: number;
    tax_label: string;
    invoice_prefix: string;
    invoice_footer?: string;
  }) => Promise<Partial<UserSettings> | null>;
  updateNotificationSettings: (notificationData: {
    email_notifications: UserSettings['email_notifications'];
    push_notifications: UserSettings['push_notifications'];
    reminder_settings: UserSettings['reminder_settings'];
  }) => Promise<Partial<UserSettings> | null>;
  updateProfile: (profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => Promise<Profile | null>;
}

export function useSettings(options: UseSettingsOptions = {}): UseSettingsReturn {
  const { autoFetch = true } = options;

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState({
    settings: false,
    profile: false,
    business: false,
    notifications: false,
  });

  const [error, setError] = useState({
    settings: null as string | null,
    profile: null as string | null,
    business: null as string | null,
    notifications: null as string | null,
  });

  const fetchSettings = useCallback(async () => {
    setLoading(prev => ({ ...prev, settings: true }));
    setError(prev => ({ ...prev, settings: null }));

    try {
      const response = await fetch('/api/settings');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(prev => ({
        ...prev,
        settings: err instanceof Error ? err.message : 'Failed to fetch settings'
      }));
      setSettings(null);
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    setError(prev => ({ ...prev, profile: null }));

    try {
      const response = await fetch('/api/settings/profile');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(prev => ({
        ...prev,
        profile: err instanceof Error ? err.message : 'Failed to fetch profile'
      }));
      setProfile(null);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchSettings(), fetchProfile()]);
  }, [fetchSettings, fetchProfile]);

  const refetchSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const refetchProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const updateSettings = useCallback(async (settingsData: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserSettings | null> => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError(prev => ({
        ...prev,
        settings: err instanceof Error ? err.message : 'Failed to update settings'
      }));
      return null;
    }
  }, []);

  const updateBusinessSettings = useCallback(async (businessData: {
    company_logo_url?: string;
    default_template: string;
    default_payment_terms: string;
    default_tax_rate: number;
    tax_label: string;
    invoice_prefix: string;
    invoice_footer?: string;
  }): Promise<Partial<UserSettings> | null> => {
    setLoading(prev => ({ ...prev, business: true }));
    setError(prev => ({ ...prev, business: null }));

    try {
      const response = await fetch('/api/settings/business', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update business settings');
      }

      const updatedBusinessSettings = await response.json();

      // Update the main settings state with the business settings
      setSettings(prev => prev ? { ...prev, ...updatedBusinessSettings } : null);

      return updatedBusinessSettings;
    } catch (err) {
      setError(prev => ({
        ...prev,
        business: err instanceof Error ? err.message : 'Failed to update business settings'
      }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, business: false }));
    }
  }, []);

  const updateNotificationSettings = useCallback(async (notificationData: {
    email_notifications: UserSettings['email_notifications'];
    push_notifications: UserSettings['push_notifications'];
    reminder_settings: UserSettings['reminder_settings'];
  }): Promise<Partial<UserSettings> | null> => {
    setLoading(prev => ({ ...prev, notifications: true }));
    setError(prev => ({ ...prev, notifications: null }));

    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notification settings');
      }

      const updatedNotificationSettings = await response.json();

      // Update the main settings state with the notification settings
      setSettings(prev => prev ? { ...prev, ...updatedNotificationSettings } : null);

      return updatedNotificationSettings;
    } catch (err) {
      setError(prev => ({
        ...prev,
        notifications: err instanceof Error ? err.message : 'Failed to update notification settings'
      }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<Profile | null> => {
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(prev => ({
        ...prev,
        profile: err instanceof Error ? err.message : 'Failed to update profile'
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return {
    settings,
    profile,
    loading,
    error,
    refetch,
    refetchSettings,
    refetchProfile,
    updateSettings,
    updateBusinessSettings,
    updateNotificationSettings,
    updateProfile,
  };
}