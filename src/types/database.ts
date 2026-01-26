// types/database.ts
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  business_name?: string;
  business_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  total_billed: number;
  last_invoice_date?: string;
  status: 'active' | 'inactive' | 'pending';
  outstanding_balance: number;
  avatar_url?: string;
  billing_frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total_amount: number;
  currency: string;
  notes?: string;
  terms?: string;
  payment_instructions?: string;
  template: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'bank_transfer' | 'credit_card' | 'paypal' | 'check' | 'cash' | 'other';
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity: string;
  timestamp: string;
  type: 'new' | 'communication' | 'payment' | 'invoice_sent' | 'invoice_overdue' | 'other';
  metadata?: Record<string, any>;
}

export interface UserSettings {
  id: string;
  user_id: string;
  company_logo_url?: string;
  default_template: string;
  default_payment_terms: string;
  default_tax_rate: number;
  tax_label: string;
  invoice_prefix: string;
  invoice_footer?: string;
  email_notifications: {
    paymentReceived: boolean;
    invoiceOverdue: boolean;
    paymentReminder: boolean;
    newClient: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  push_notifications: {
    paymentReceived: boolean;
    invoiceOverdue: boolean;
    systemUpdates: boolean;
  };
  reminder_settings: {
    daysBeforeDue: string;
    overdueFrequency: string;
  };
  created_at: string;
  updated_at: string;
}