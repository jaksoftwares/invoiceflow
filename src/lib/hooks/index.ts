// Data fetching hooks
export { useClients } from './useClients';
export { useInvoices } from './useInvoices';
export { useInvoiceItems } from './useInvoiceItems';
export { usePayments } from './usePayments';
export { useDashboard } from './useDashboard';
export { useReports } from './useReports';
export { useSettings } from './useSettings';

// Auth hooks
export { useLogin } from './useLogin';
export { useSignup } from './useSignup';
export { useLogout } from './useLogout';
export { usePasswordReset } from './usePasswordReset';
export { useEmailVerification } from './useEmailVerification';

// Re-export types for convenience
export type { Client, Invoice, InvoiceItem, Payment, UserSettings, Profile } from '@/types/database';