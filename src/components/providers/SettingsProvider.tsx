'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import type { UserSettings, Profile, BusinessProfile } from '@/types/database';

interface SettingsContextType {
  settings: UserSettings | null;
  profile: Profile | null;
  business: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshBusiness: () => Promise<void>;
  refreshAll: () => Promise<void>;
  updateSettings: (data: any) => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  updateBusinessProfile: (data: any) => Promise<any>;
  updateBusinessSettings: (data: any) => Promise<any>;
  updateNotificationSettings: (data: any) => Promise<any>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const updateSettings = useCallback(async (settingsData: any) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      const updated = await response.json();
      setSettings(updated);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const updated = await response.json();
      setProfile(updated);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateBusinessProfile = useCallback(async (businessData: any) => {
    try {
      const response = await fetch('/api/settings/business-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData),
      });
      if (!response.ok) throw new Error('Failed to update business profile');
      const updated = await response.json();
      setBusiness(updated);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateBusinessSettings = useCallback(async (businessData: any) => {
     try {
      const response = await fetch('/api/settings/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData),
      });
      if (!response.ok) throw new Error('Failed to update business settings');
      const updated = await response.json();
      setSettings(prev => prev ? { ...prev, ...updated } : null);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const updateNotificationSettings = useCallback(async (notificationData: any) => {
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData),
      });
      if (!response.ok) throw new Error('Failed to update notification settings');
      const updated = await response.json();
      setSettings(prev => prev ? { ...prev, ...updated } : null);
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/settings/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        if (data.business_profile) setBusiness(data.business_profile);
      }
    } catch (err) { console.error('Failed to fetch profile:', err); }
  }, [user]);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) { console.error('Failed to fetch settings:', err); }
  }, [user]);

  const fetchBusiness = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/settings/business-profile');
      if (response.ok) {
        const data = await response.json();
        setBusiness(data);
      }
    } catch (err) { console.error('Failed to fetch business profile:', err); }
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/bootstrap');
      if (!response.ok) throw new Error('Failed to bootstrap settings');
      
      const data = await response.json();
      setProfile(data.profile);
      setSettings(data.settings);
      setBusiness(data.business);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Bootstrap error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);


  useEffect(() => {
    if (user) {
      refreshAll();
    } else {
      setSettings(null);
      setProfile(null);
      setBusiness(null);
    }
  }, [user, refreshAll]);

  const value = useMemo(() => ({
    settings,
    profile,
    business,
    isLoading,
    error,
    refreshSettings: fetchSettings,
    refreshProfile: fetchProfile,
    refreshBusiness: fetchBusiness,
    refreshAll,
    updateSettings,
    updateProfile,
    updateBusinessProfile,
    updateBusinessSettings,
    updateNotificationSettings
  }), [settings, profile, business, isLoading, error, fetchSettings, fetchProfile, fetchBusiness, refreshAll, updateSettings, updateProfile, updateBusinessProfile, updateBusinessSettings, updateNotificationSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
