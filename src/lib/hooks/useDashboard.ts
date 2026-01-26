import { useState, useEffect, useCallback } from 'react';
import type { Invoice, ClientActivity } from '@/types/database';

interface DashboardMetrics {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
}

interface InvoiceWithClient extends Invoice {
  clients?: {
    company_name: string;
  };
}

interface ActivityWithClient extends ClientActivity {
  clients?: {
    company_name: string;
  };
}

interface RevenueChartData {
  period: string;
  revenue: number;
}

interface UseDashboardOptions {
  revenuePeriod?: 'monthly' | 'yearly';
  autoFetch?: boolean;
}

interface UseDashboardReturn {
  metrics: DashboardMetrics | null;
  recentInvoices: InvoiceWithClient[];
  recentActivities: ActivityWithClient[];
  revenueChart: RevenueChartData[];
  loading: {
    metrics: boolean;
    recentInvoices: boolean;
    recentActivities: boolean;
    revenueChart: boolean;
  };
  error: {
    metrics: string | null;
    recentInvoices: string | null;
    recentActivities: string | null;
    revenueChart: string | null;
  };
  refetch: () => Promise<void>;
  refetchMetrics: () => Promise<void>;
  refetchRecentInvoices: () => Promise<void>;
  refetchRecentActivities: () => Promise<void>;
  refetchRevenueChart: () => Promise<void>;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const { revenuePeriod = 'monthly', autoFetch = true } = options;

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceWithClient[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityWithClient[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);

  const [loading, setLoading] = useState({
    metrics: false,
    recentInvoices: false,
    recentActivities: false,
    revenueChart: false,
  });

  const [error, setError] = useState({
    metrics: null as string | null,
    recentInvoices: null as string | null,
    recentActivities: null as string | null,
    revenueChart: null as string | null,
  });

  const fetchMetrics = useCallback(async () => {
    setLoading(prev => ({ ...prev, metrics: true }));
    setError(prev => ({ ...prev, metrics: null }));

    try {
      const response = await fetch('/api/dashboard/metrics');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(prev => ({
        ...prev,
        metrics: err instanceof Error ? err.message : 'Failed to fetch metrics'
      }));
      setMetrics(null);
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  }, []);

  const fetchRecentInvoices = useCallback(async () => {
    setLoading(prev => ({ ...prev, recentInvoices: true }));
    setError(prev => ({ ...prev, recentInvoices: null }));

    try {
      const response = await fetch('/api/dashboard/recent-invoices');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recent invoices');
      }

      const data = await response.json();
      setRecentInvoices(data.invoices || []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        recentInvoices: err instanceof Error ? err.message : 'Failed to fetch recent invoices'
      }));
      setRecentInvoices([]);
    } finally {
      setLoading(prev => ({ ...prev, recentInvoices: false }));
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    setLoading(prev => ({ ...prev, recentActivities: true }));
    setError(prev => ({ ...prev, recentActivities: null }));

    try {
      const response = await fetch('/api/dashboard/recent-activities');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recent activities');
      }

      const data = await response.json();
      setRecentActivities(data.activities || []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        recentActivities: err instanceof Error ? err.message : 'Failed to fetch recent activities'
      }));
      setRecentActivities([]);
    } finally {
      setLoading(prev => ({ ...prev, recentActivities: false }));
    }
  }, []);

  const fetchRevenueChart = useCallback(async () => {
    setLoading(prev => ({ ...prev, revenueChart: true }));
    setError(prev => ({ ...prev, revenueChart: null }));

    try {
      const response = await fetch(`/api/dashboard/revenue-chart?period=${revenuePeriod}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch revenue chart data');
      }

      const data = await response.json();
      setRevenueChart(data.chartData || []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        revenueChart: err instanceof Error ? err.message : 'Failed to fetch revenue chart data'
      }));
      setRevenueChart([]);
    } finally {
      setLoading(prev => ({ ...prev, revenueChart: false }));
    }
  }, [revenuePeriod]);

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchMetrics(),
      fetchRecentInvoices(),
      fetchRecentActivities(),
      fetchRevenueChart(),
    ]);
  }, [fetchMetrics, fetchRecentInvoices, fetchRecentActivities, fetchRevenueChart]);

  const refetchMetrics = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  const refetchRecentInvoices = useCallback(async () => {
    await fetchRecentInvoices();
  }, [fetchRecentInvoices]);

  const refetchRecentActivities = useCallback(async () => {
    await fetchRecentActivities();
  }, [fetchRecentActivities]);

  const refetchRevenueChart = useCallback(async () => {
    await fetchRevenueChart();
  }, [fetchRevenueChart]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return {
    metrics,
    recentInvoices,
    recentActivities,
    revenueChart,
    loading,
    error,
    refetch,
    refetchMetrics,
    refetchRecentInvoices,
    refetchRecentActivities,
    refetchRevenueChart,
  };
}