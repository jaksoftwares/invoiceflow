import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Invoice } from '@/types/database';

interface UseInvoicesOptions {
  page?: number;
  limit?: number;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  client_id?: string;
  issue_date_from?: string;
  issue_date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
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

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
  };
}

interface UseInvoicesReturn {
  invoices: InvoiceWithClient[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Invoice | null>;
  updateInvoice: (id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  bulkDeleteInvoices: (invoiceIds: string[]) => Promise<{ affected: number } | null>;
  bulkUpdateStatus: (invoiceIds: string[], status: Invoice['status']) => Promise<{ affected: number } | null>;
  getInvoice: (id: string) => Promise<Invoice | null>;
}

export function useInvoices(options: UseInvoicesOptions = {}): UseInvoicesReturn {
  const {
    page = 1,
    limit = 10,
    status,
    client_id,
    issue_date_from,
    issue_date_to,
    due_date_from,
    due_date_to,
    search,
    autoFetch = true
  } = options;

  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (status) params.set('status', status);
    if (client_id) params.set('client_id', client_id);
    if (issue_date_from) params.set('issue_date_from', issue_date_from);
    if (issue_date_to) params.set('issue_date_to', issue_date_to);
    if (due_date_from) params.set('due_date_from', due_date_from);
    if (due_date_to) params.set('due_date_to', due_date_to);
    if (search) params.set('search', search);
    return params.toString();
  }, [page, limit, status, client_id, issue_date_from, issue_date_to, due_date_from, due_date_to, search]);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/invoices?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.invoices || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setInvoices([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  const refetch = useCallback(async () => {
    await fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Invoice | null> => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      const newInvoice = await response.json();

      // Optimistically update the list if we're on the first page
      if (page === 1) {
        setInvoices(prev => [newInvoice, ...prev]);
        if (pagination) {
          setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
        }
      }

      toast.success('Invoice created successfully');
      return newInvoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [page, pagination]);

  const updateInvoice = useCallback(async (id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Invoice | null> => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }

      const updatedInvoice = await response.json();

      // Optimistically update the invoice in the list
      setInvoices(prev => prev.map(invoice =>
        invoice.id === id ? { ...updatedInvoice, clients: invoice.clients } : invoice
      ));

      toast.success('Invoice updated successfully');
      return updatedInvoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }

      // Optimistically remove the invoice from the list
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }

      toast.success('Invoice deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [pagination]);

  const bulkDeleteInvoices = useCallback(async (invoiceIds: string[]): Promise<{ affected: number } | null> => {
    try {
      const response = await fetch('/api/invoices/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          ids: invoiceIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoices');
      }

      const result = await response.json();

      // Optimistically remove the invoices from the list
      setInvoices(prev => prev.filter(invoice => !invoiceIds.includes(invoice.id)));
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - result.affected } : null);
      }

      toast.success(`${result.affected} invoice(s) deleted successfully`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoices';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [pagination]);

  const bulkUpdateStatus = useCallback(async (invoiceIds: string[], status: Invoice['status']): Promise<{ affected: number } | null> => {
    try {
      const response = await fetch('/api/invoices/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          ids: invoiceIds,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice status');
      }

      const result = await response.json();

      // Optimistically update the status in the list
      setInvoices(prev => prev.map(invoice =>
        invoiceIds.includes(invoice.id) ? { ...invoice, status } : invoice
      ));

      toast.success(`${result.affected} invoice(s) status updated successfully`);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice status';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const getInvoice = useCallback(async (id: string): Promise<Invoice | null> => {
    try {
      const response = await fetch(`/api/invoices/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchInvoices();
    }
  }, [fetchInvoices, autoFetch]);

  return {
    invoices,
    loading,
    error,
    pagination,
    refetch,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    bulkDeleteInvoices,
    bulkUpdateStatus,
    getInvoice,
  };
}