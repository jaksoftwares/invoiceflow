import { useState, useEffect, useCallback } from 'react';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
}

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface ClientPerformanceData {
  month: string;
  newClients: number;
  activeClients: number;
}

interface KPIData {
  title: string;
  value: string;
  change: number;
  icon: string;
  trend: 'up' | 'down';
}

interface ReportRow {
  id: number;
  client: string;
  invoiceCount: number;
  totalRevenue: number;
  avgInvoiceValue: number;
  paymentRate: number;
  outstanding: number;
}

interface ReportsData {
  revenueChart: RevenueData[];
  paymentStatusChart: PaymentStatusData[];
  clientPerformanceChart: ClientPerformanceData[];
  kpis: KPIData[];
  reportsTable: ReportRow[];
}

interface UseReportsOptions {
  dateRange?: string;
  autoFetch?: boolean;
}

interface UseReportsReturn {
  data: ReportsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReports(options: UseReportsOptions = {}): UseReportsReturn {
  const { dateRange = 'last-6-months', autoFetch = true } = options;

  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (range: string = dateRange) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports?dateRange=${range}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reports data');
      }

      const reportsData = await response.json();
      setData(reportsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchReports(dateRange);
  }, [fetchReports, dateRange]);

  useEffect(() => {
    if (autoFetch) {
      fetchReports(dateRange);
    }
  }, [fetchReports, dateRange, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}