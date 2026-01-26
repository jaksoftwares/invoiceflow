'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserSettings, Profile } from '@/types/database';

export async function updateSettingsAction(settingsData: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserSettings> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: settings, error } = await supabase
    .from('user_settings')
    .update(settingsData)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update settings');
  }

  revalidatePath('/user-profile-settings');

  return settings;
}

export async function updateBusinessSettingsAction(businessData: {
  company_logo_url?: string;
  default_template: string;
  default_payment_terms: string;
  default_tax_rate: number;
  tax_label: string;
  invoice_prefix: string;
  invoice_footer?: string;
}): Promise<Partial<UserSettings>> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: settings, error } = await supabase
    .from('user_settings')
    .update(businessData)
    .eq('user_id', user.id)
    .select('company_logo_url, default_template, default_payment_terms, default_tax_rate, tax_label, invoice_prefix, invoice_footer')
    .single();

  if (error) {
    throw new Error('Failed to update business settings');
  }

  revalidatePath('/user-profile-settings');

  return settings;
}

export async function updateNotificationSettingsAction(notificationData: {
  email_notifications: UserSettings['email_notifications'];
  push_notifications: UserSettings['push_notifications'];
  reminder_settings: UserSettings['reminder_settings'];
}): Promise<Partial<UserSettings>> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: settings, error } = await supabase
    .from('user_settings')
    .update(notificationData)
    .eq('user_id', user.id)
    .select('email_notifications, push_notifications, reminder_settings')
    .single();

  if (error) {
    throw new Error('Failed to update notification settings');
  }

  revalidatePath('/user-profile-settings');

  return settings;
}

export async function updateProfileAction(profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<Profile> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update profile');
  }

  revalidatePath('/user-profile-settings');

  return profile;
}