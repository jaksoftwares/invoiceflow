import { useState, useEffect, useCallback } from 'react';
import type { InvoiceItem } from '@/types/database';

interface UseInvoiceItemsOptions {
  invoiceId: string;
  autoFetch?: boolean;
}

interface UseInvoiceItemsReturn {
  items: InvoiceItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createItem: (itemData: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>) => Promise<InvoiceItem | null>;
  updateItem: (itemId: string, itemData: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>) => Promise<InvoiceItem | null>;
  deleteItem: (itemId: string) => Promise<boolean>;
}

export function useInvoiceItems({ invoiceId, autoFetch = true }: UseInvoiceItemsOptions): UseInvoiceItemsReturn {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!invoiceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice items');
      }

      const data = await response.json();
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  const refetch = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  const createItem = useCallback(async (itemData: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>): Promise<InvoiceItem | null> => {
    if (!invoiceId) return null;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice item');
      }

      const newItem = await response.json();

      // Optimistically add the item to the list
      setItems(prev => [...prev, newItem]);

      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice item');
      return null;
    }
  }, [invoiceId]);

  const updateItem = useCallback(async (itemId: string, itemData: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>): Promise<InvoiceItem | null> => {
    if (!invoiceId) return null;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice item');
      }

      const updatedItem = await response.json();

      // Optimistically update the item in the list
      setItems(prev => prev.map(item =>
        item.id === itemId ? updatedItem : item
      ));

      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice item');
      return null;
    }
  }, [invoiceId]);

  const deleteItem = useCallback(async (itemId: string): Promise<boolean> => {
    if (!invoiceId) return false;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice item');
      }

      // Optimistically remove the item from the list
      setItems(prev => prev.filter(item => item.id !== itemId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice item');
      return false;
    }
  }, [invoiceId]);

  useEffect(() => {
    if (autoFetch && invoiceId) {
      fetchItems();
    }
  }, [fetchItems, autoFetch, invoiceId]);

  return {
    items,
    loading,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem,
  };
}