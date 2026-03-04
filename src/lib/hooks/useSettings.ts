'use client';

import { useSettingsContext } from '@/components/providers/SettingsProvider';
import type { UserSettings, Profile, BusinessProfile } from '@/types/database';

interface UseSettingsOptions {
  autoFetch?: boolean;
}

interface UseSettingsReturn {
  settings: UserSettings | null;
  profile: Profile | null;
  business: BusinessProfile | null;
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
  refetchBusiness: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<UserSettings | null>;
  updateBusinessSettings: (businessData: any) => Promise<Partial<UserSettings> | null>;
  updateBusinessProfile: (businessData: Partial<Omit<BusinessProfile, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>) => Promise<BusinessProfile | null>;
  updateNotificationSettings: (notificationData: any) => Promise<Partial<UserSettings> | null>;
  updateProfile: (profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => Promise<Profile | null>;
}

/**
 * useSettings hook refactored to use SettingsProvider context.
 * This ensures that multiple components using this hook share the same state
 * and don't trigger redundant API requests on load.
 */
export function useSettings(options: UseSettingsOptions = {}): UseSettingsReturn {
  const context = useSettingsContext();

  // Map context to the legacy return format if needed
  // Note: Standardizing this makes the app more maintainable.
  
  return {
    settings: context.settings,
    profile: context.profile,
    business: context.business,
    loading: {
      settings: context.isLoading,
      profile: context.isLoading,
      business: context.isLoading,
      notifications: context.isLoading,
    },
    error: {
      settings: context.error,
      profile: context.error,
      business: context.error,
      notifications: context.error,
    },
    refetch: context.refreshAll,
    refetchSettings: context.refreshSettings,
    refetchProfile: context.refreshProfile,
    refetchBusiness: context.refreshBusiness,
    updateSettings: context.updateSettings,
    updateBusinessSettings: context.updateBusinessSettings,
    updateBusinessProfile: context.updateBusinessProfile,
    updateNotificationSettings: context.updateNotificationSettings,
    updateProfile: context.updateProfile,
  };
}
