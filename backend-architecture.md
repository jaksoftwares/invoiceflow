# InvoiceFlow Backend Architecture

## Overview
This document outlines the complete backend system for InvoiceFlow, a Next.js serverless invoice management system using Supabase (PostgreSQL) and Supabase Auth.

## Entities and Relationships

### Core Entities
1. **Users** (via Supabase Auth + profiles table)
2. **Clients**
3. **Invoices**
4. **Invoice Items**
5. **Payments**
6. **Client Activities**
7. **User Settings**

### Entity Relationships
```
User (1) ──── (M) Clients
User (1) ──── (M) Invoices
Client (1) ──── (M) Invoices
Invoice (1) ──── (M) Invoice Items
Invoice (1) ──── (M) Payments
Client (1) ──── (M) Client Activities
User (1) ──── (1) User Settings
```

## Database Schema

### 1. profiles
Extends Supabase auth.users table.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  business_name TEXT,
  business_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. clients
```sql
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  total_billed DECIMAL(10,2) DEFAULT 0,
  last_invoice_date DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
  outstanding_balance DECIMAL(10,2) DEFAULT 0,
  avatar_url TEXT,
  billing_frequency TEXT CHECK (billing_frequency IN ('monthly', 'quarterly', 'annually', 'one-time')) DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own clients
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);
```

### 3. invoices
```sql
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_terms TEXT DEFAULT 'net30',
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  terms TEXT,
  payment_instructions TEXT,
  template TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
```

### 4. invoice_items
```sql
CREATE TABLE invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can access items of their invoices
CREATE POLICY "Users can view own invoice items" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items" ON invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items" ON invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
```

### 5. payments
```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'credit_card', 'paypal', 'check', 'cash', 'other')) DEFAULT 'bank_transfer',
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can access payments of their invoices
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = payments.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
```

### 6. client_activities
```sql
CREATE TABLE client_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  activity TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  type TEXT CHECK (type IN ('new', 'communication', 'payment', 'invoice_sent', 'invoice_overdue', 'other')) DEFAULT 'other',
  metadata JSONB
);

-- Enable RLS
ALTER TABLE client_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can access activities of their clients
CREATE POLICY "Users can view own client activities" ON client_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_activities.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own client activities" ON client_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_activities.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_client_activities_client_id ON client_activities(client_id);
CREATE INDEX idx_client_activities_timestamp ON client_activities(timestamp);
CREATE INDEX idx_client_activities_type ON client_activities(type);
```

### 7. user_settings
```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_logo_url TEXT,
  default_template TEXT DEFAULT 'professional',
  default_payment_terms TEXT DEFAULT 'net30',
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_label TEXT DEFAULT 'Tax',
  invoice_prefix TEXT DEFAULT 'INV-',
  invoice_footer TEXT,
  email_notifications JSONB DEFAULT '{
    "paymentReceived": true,
    "invoiceOverdue": true,
    "paymentReminder": true,
    "newClient": true,
    "weeklyReport": true,
    "monthlyReport": true
  }',
  push_notifications JSONB DEFAULT '{
    "paymentReceived": true,
    "invoiceOverdue": true,
    "systemUpdates": true
  }',
  reminder_settings JSONB DEFAULT '{
    "daysBeforeDue": "7",
    "overdueFrequency": "daily"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
```

## Triggers and Functions

### Update updated_at columns
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-create profile on user signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Update client totals trigger
```sql
CREATE OR REPLACE FUNCTION update_client_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_billed and last_invoice_date for the client
  UPDATE clients
  SET
    total_billed = (
      SELECT COALESCE(SUM(total_amount), 0)
      FROM invoices
      WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
      AND status IN ('sent', 'paid', 'overdue')
    ),
    last_invoice_date = (
      SELECT MAX(issue_date)
      FROM invoices
      WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
      AND status IN ('sent', 'paid', 'overdue')
    ),
    outstanding_balance = (
      SELECT COALESCE(SUM(total_amount), 0) - COALESCE(SUM(payments.amount), 0)
      FROM invoices
      LEFT JOIN payments ON invoices.id = payments.invoice_id
      WHERE invoices.client_id = COALESCE(NEW.client_id, OLD.client_id)
      AND invoices.status IN ('sent', 'overdue')
    )
  WHERE id = COALESCE(NEW.client_id, OLD.client_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_totals_on_invoice_change
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_client_totals();

CREATE TRIGGER update_client_totals_on_payment_change
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_client_totals();
```

### Update invoice totals trigger
```sql
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  inv RECORD;
BEGIN
  -- Get the invoice
  SELECT * INTO inv FROM invoices WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Update subtotal, tax_amount, total_amount
  UPDATE invoices
  SET
    subtotal = COALESCE((
      SELECT SUM(amount) FROM invoice_items WHERE invoice_id = inv.id
    ), 0),
    tax_amount = COALESCE((
      SELECT SUM(amount) FROM invoice_items WHERE invoice_id = inv.id
    ), 0) * (inv.tax_rate / 100),
    total_amount = COALESCE((
      SELECT SUM(amount) FROM invoice_items WHERE invoice_id = inv.id
    ), 0) * (1 + inv.tax_rate / 100) - inv.discount
  WHERE id = inv.id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_totals_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();
```

## TypeScript Types

```typescript
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
```

## API Routes Structure

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Client Management Routes
- `GET /api/clients` - List clients with filtering/pagination
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client
- `POST /api/clients/bulk-delete` - Bulk delete clients

### Invoice Management Routes
- `GET /api/invoices` - List invoices with filtering/pagination
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/[id]/send` - Send invoice to client
- `POST /api/invoices/bulk-actions` - Bulk actions on invoices

### Payment Management Routes
- `GET /api/payments` - List payments
- `POST /api/payments` - Record new payment
- `GET /api/payments/[id]` - Get payment details
- `PUT /api/payments/[id]` - Update payment
- `DELETE /api/payments/[id]` - Delete payment

### Dashboard Routes
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/recent-invoices` - Get recent invoices
- `GET /api/dashboard/recent-activities` - Get recent client activities
- `GET /api/dashboard/revenue-chart` - Get revenue chart data

### Reports & Analytics Routes
- `GET /api/reports/overview` - Get reports overview
- `GET /api/reports/revenue` - Get revenue reports
- `GET /api/reports/payment-status` - Get payment status distribution
- `GET /api/reports/client-performance` - Get client performance data
- `GET /api/reports/export` - Export reports

### Settings Routes
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `GET /api/settings/profile` - Get profile settings
- `PUT /api/settings/profile` - Update profile settings
- `GET /api/settings/business` - Get business settings
- `PUT /api/settings/business` - Update business settings
- `GET /api/settings/notifications` - Get notification settings
- `PUT /api/settings/notifications` - Update notification settings

## Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS enabled with policies ensuring users can only access their own data.

2. **Authentication**: All API routes require valid Supabase session tokens.

3. **Input Validation**: All inputs are validated using Zod schemas.

4. **Rate Limiting**: API routes implement rate limiting to prevent abuse.

5. **Data Sanitization**: All user inputs are sanitized to prevent XSS attacks.

6. **HTTPS Only**: All communications must be over HTTPS.

## Performance Optimizations

1. **Indexes**: Strategic indexes on frequently queried columns.

2. **Pagination**: All list endpoints support pagination.

3. **Caching**: Implement caching for frequently accessed data.

4. **Database Optimization**: Use efficient queries and avoid N+1 problems.

5. **CDN**: Static assets served via CDN.

## Scalability Considerations

1. **Serverless Functions**: API routes are serverless and auto-scale.

2. **Database Connection Pooling**: Supabase handles connection pooling.

3. **Horizontal Scaling**: Application can scale horizontally.

4. **Caching Strategy**: Redis for session and data caching.

5. **Background Jobs**: Use Supabase Edge Functions for background processing.

## Integration Guidelines

### Frontend Integration

1. **Supabase Client Setup**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

2. **API Calls**: Use the defined API routes for all data operations.

3. **Real-time Subscriptions**: Use Supabase real-time for live updates.

4. **Error Handling**: Implement proper error handling for all API calls.

5. **Loading States**: Show loading states during API calls.

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

### Deployment

1. Deploy to Vercel for optimal Next.js performance.

2. Configure Supabase project with the provided schema.

3. Set up environment variables in deployment platform.

4. Enable Supabase real-time features if needed.

5. Configure monitoring and logging.

This backend architecture provides a solid foundation for the InvoiceFlow application, ensuring security, performance, and scalability while maintaining data integrity and user privacy.