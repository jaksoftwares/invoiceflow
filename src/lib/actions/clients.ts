'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Client } from '@/types/database';

export async function createClientAction(clientData: Omit<Client, 'id' | 'user_id' | 'total_billed' | 'outstanding_balance' | 'created_at' | 'updated_at'>): Promise<Client> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      ...clientData,
      user_id: user.id,
      email: clientData.email || null,
      avatar_url: clientData.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create client');
  }

  revalidatePath('/client-management');
  revalidatePath('/dashboard');

  return client;
}

export async function updateClientAction(id: string, clientData: Partial<Omit<Client, 'id' | 'user_id' | 'total_billed' | 'outstanding_balance' | 'created_at' | 'updated_at'>>): Promise<Client> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Check if client exists and belongs to user
  const { data: existingClient, error: fetchError } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    throw new Error('Client not found');
  }

  const { data: client, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update client');
  }

  revalidatePath('/client-management');
  revalidatePath('/dashboard');
  revalidatePath(`/client-management/${id}`);

  return client;
}

export async function deleteClientAction(id: string): Promise<void> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('Failed to delete client');
  }

  revalidatePath('/client-management');
  revalidatePath('/dashboard');
}

export async function bulkDeleteClientsAction(clientIds: string[]): Promise<{ deletedCount: number }> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('clients')
    .delete()
    .in('id', clientIds)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    throw new Error('Failed to delete clients');
  }

  const deletedCount = data?.length || 0;

  revalidatePath('/client-management');
  revalidatePath('/dashboard');

  return { deletedCount };
}