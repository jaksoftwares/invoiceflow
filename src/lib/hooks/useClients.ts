import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Client } from '@/types/database';

interface UseClientsOptions {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'pending';
  search?: string;
  autoFetch?: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  createClient: (clientData: Omit<Client, 'id' | 'user_id' | 'total_billed' | 'outstanding_balance' | 'created_at' | 'updated_at'>) => Promise<Client | null>;
  updateClient: (id: string, clientData: Partial<Omit<Client, 'id' | 'user_id' | 'total_billed' | 'outstanding_balance' | 'created_at' | 'updated_at'>>) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
  bulkDeleteClients: (clientIds: string[]) => Promise<{ deletedCount: number; deletedIds: string[] } | null>;
  getClient: (id: string) => Promise<Client | null>;
}

export function useClients(options: UseClientsOptions = {}): UseClientsReturn {
  const { page = 1, limit = 10, status, search, autoFetch = true } = options;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    return params.toString();
  }, [page, limit, status, search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/clients?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }

      const data = await response.json();
      setClients(data.clients || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setClients([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  const refetch = useCallback(async () => {
    await fetchClients();
  }, [fetchClients]);

  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'user_id' | 'total_billed' | 'outstanding_balance' | 'created_at' | 'updated_at'>): Promise<Client | null> => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      const newClient = await response.json();

      // Optimistically update the list if we're on the first page
      if (page === 1) {
        setClients(prev => [newClient, ...prev]);
        if (pagination) {
          setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
        }
      }

      toast.success('Client created successfully');
      return newClient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create client';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [page, pagination]);

  const updateClient = useCallback(async (id: string, clientData: Partial<Omit<Client, 'id' | 'user_id' | 'total_billed' | 'outstanding_balance' | 'created_at' | 'updated_at'>>): Promise<Client | null> => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update client');
      }

      const updatedClient = await response.json();

      // Optimistically update the client in the list
      setClients(prev => prev.map(client =>
        client.id === id ? updatedClient : client
      ));

      toast.success('Client updated successfully');
      return updatedClient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update client';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }

      // Optimistically remove the client from the list
      setClients(prev => prev.filter(client => client.id !== id));
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }

      toast.success('Client deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete client';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [pagination]);

  const bulkDeleteClients = useCallback(async (clientIds: string[]): Promise<{ deletedCount: number; deletedIds: string[] } | null> => {
    try {
      const response = await fetch('/api/clients/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete clients');
      }

      const result = await response.json();

      // Optimistically remove the clients from the list
      setClients(prev => prev.filter(client => !clientIds.includes(client.id)));
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - result.deletedCount } : null);
      }

      toast.success(`${result.deletedCount} client(s) deleted successfully`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete clients';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [pagination]);

  const getClient = useCallback(async (id: string): Promise<Client | null> => {
    try {
      const response = await fetch(`/api/clients/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch client');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client');
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchClients();
    }
  }, [fetchClients, autoFetch]);

  return {
    clients,
    loading,
    error,
    pagination,
    refetch,
    createClient,
    updateClient,
    deleteClient,
    bulkDeleteClients,
    getClient,
  };
}