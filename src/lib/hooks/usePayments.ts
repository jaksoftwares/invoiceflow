import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Payment } from '@/types/database';

interface UsePaymentsOptions {
  page?: number;
  limit?: number;
  invoice_id?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  payment_method?: 'bank_transfer' | 'credit_card' | 'paypal' | 'check' | 'cash' | 'other';
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

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
  createPayment: (paymentData: Omit<Payment, 'id' | 'created_at'>) => Promise<Payment | null>;
  updatePayment: (id: string, paymentData: Partial<Omit<Payment, 'id' | 'created_at'>>) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
  getPayment: (id: string) => Promise<Payment | null>;
}

export function usePayments(options: UsePaymentsOptions = {}): UsePaymentsReturn {
  const {
    page = 1,
    limit = 10,
    invoice_id,
    payment_date_from,
    payment_date_to,
    payment_method,
    autoFetch = true
  } = options;

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (invoice_id) params.set('invoice_id', invoice_id);
    if (payment_date_from) params.set('payment_date_from', payment_date_from);
    if (payment_date_to) params.set('payment_date_to', payment_date_to);
    if (payment_method) params.set('payment_method', payment_method);
    return params.toString();
  }, [page, limit, invoice_id, payment_date_from, payment_date_to, payment_method]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/payments?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPayments([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  const refetch = useCallback(async () => {
    await fetchPayments();
  }, [fetchPayments]);

  const createPayment = useCallback(async (paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment | null> => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const newPayment = await response.json();

      // Optimistically update the list if we're on the first page
      if (page === 1) {
        setPayments(prev => [newPayment, ...prev]);
        if (pagination) {
          setPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
        }
      }

      return newPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      return null;
    }
  }, [page, pagination]);

  const updatePayment = useCallback(async (id: string, paymentData: Partial<Omit<Payment, 'id' | 'created_at'>>): Promise<Payment | null> => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }

      const updatedPayment = await response.json();

      // Optimistically update the payment in the list
      setPayments(prev => prev.map(payment =>
        payment.id === id ? updatedPayment : payment
      ));

      return updatedPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      return null;
    }
  }, []);

  const deletePayment = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment');
      }

      // Optimistically remove the payment from the list
      setPayments(prev => prev.filter(payment => payment.id !== id));
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      return false;
    }
  }, [pagination]);

  const getPayment = useCallback(async (id: string): Promise<Payment | null> => {
    try {
      const response = await fetch(`/api/payments/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment');
      return null;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
    }
  }, [fetchPayments, autoFetch]);

  return {
    payments,
    loading,
    error,
    pagination,
    refetch,
    createPayment,
    updatePayment,
    deletePayment,
    getPayment,
  };
}