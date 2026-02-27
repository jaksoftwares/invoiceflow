-- Subscription Module Setup for InvoiceFlow
-- This script creates the architecture for tiered subscriptions and usage tracking.

-- 🔹 1. plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- free, starter, business, lifetime
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    price_lifetime DECIMAL(10,2) DEFAULT 0,
    max_invoices_per_month INTEGER DEFAULT 0, -- 0 for unlimited
    max_clients INTEGER DEFAULT 0,
    max_products INTEGER DEFAULT 0,
    max_templates_access INTEGER DEFAULT 0,
    max_email_sends INTEGER DEFAULT 0,
    watermark_enabled BOOLEAN DEFAULT TRUE,
    allow_csv_export BOOLEAN DEFAULT FALSE,
    allow_branding BOOLEAN DEFAULT FALSE,
    allow_priority_email BOOLEAN DEFAULT FALSE,
    allow_payg_after_limit BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 🔹 2. subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled', 'suspended', 'grace_period')) DEFAULT 'active',
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')) DEFAULT 'monthly',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    grace_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT one_active_subscription_per_user UNIQUE(user_id)
);

-- 🔹 3. subscription_payments table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    mpesa_receipt_number TEXT UNIQUE,
    phone_number TEXT,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    payment_type TEXT CHECK (payment_type IN ('subscription', 'upgrade', 'renewal')) DEFAULT 'subscription',
    checkout_request_id TEXT UNIQUE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 🔹 4. usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    invoices_created INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    pdf_downloads INTEGER DEFAULT 0,
    templates_used INTEGER DEFAULT 0,
    clients_created INTEGER DEFAULT 0,
    products_created INTEGER DEFAULT 0,
    report_exports INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, billing_period_start)
);

-- 🔹 5. payg_transactions table
CREATE TABLE IF NOT EXISTS public.payg_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT CHECK (action_type IN ('premium_template', 'email_send', 'pdf_download', 'extra_invoice')) NOT NULL,
    related_invoice_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    mpesa_receipt_number TEXT UNIQUE,
    checkout_request_id TEXT UNIQUE,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 🔹 6. activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    resource_id UUID,
    ip_address TEXT,
    device_info TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 🔹 7. audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event TEXT NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    description TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payg_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Plans: Anyone can view plans
CREATE POLICY "Public plans are viewable by everyone" ON public.plans FOR SELECT USING (true);

-- Subscriptions: Users can only view their own
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Subscription Payments: Users can only view their own
CREATE POLICY "Users can view own subscription payments" ON public.subscription_payments FOR SELECT USING (auth.uid() = user_id);

-- Usage Tracking: Users can only view their own
CREATE POLICY "Users can view own usage tracking" ON public.usage_tracking FOR SELECT USING (auth.uid() = user_id);

-- PAYG Transactions: Users can only view their own
CREATE POLICY "Users can view own payg transactions" ON public.payg_transactions FOR SELECT USING (auth.uid() = user_id);

-- Activity Logs: Users can only view their own
CREATE POLICY "Users can view own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);

-- Audit Logs: Admins only (simplified for now to auth.uid() = user_id)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Data for Plans
INSERT INTO public.plans (name, description, price_monthly, price_yearly, price_lifetime, max_invoices_per_month, max_clients, max_products, max_templates_access, max_email_sends, watermark_enabled, allow_csv_export, allow_branding, allow_priority_email, allow_payg_after_limit)
VALUES 
('Free', 'Basic plan for individuals starting out', 0, 0, 0, 5, 3, 5, 3, 3, true, false, false, false, true),
('Starter', 'Great for freelancers and small businesses', 499, 4990, 0, 50, 20, 50, 10, 50, false, false, false, false, true),
('Business', 'Full features for growing businesses', 999, 9990, 0, 0, 0, 0, 0, 0, false, true, true, true, true),
('Lifetime', 'One-time payment for lifetime access', 0, 0, 4999, 0, 0, 0, 0, 0, false, true, true, true, false)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    price_lifetime = EXCLUDED.price_lifetime,
    max_invoices_per_month = EXCLUDED.max_invoices_per_month,
    max_clients = EXCLUDED.max_clients,
    max_products = EXCLUDED.max_products,
    max_templates_access = EXCLUDED.max_templates_access,
    max_email_sends = EXCLUDED.max_email_sends,
    watermark_enabled = EXCLUDED.watermark_enabled,
    allow_csv_export = EXCLUDED.allow_csv_export,
    allow_branding = EXCLUDED.allow_branding,
    allow_priority_email = EXCLUDED.allow_priority_email,
    allow_payg_after_limit = EXCLUDED.allow_payg_after_limit;

-- Function to initialize usage tracking for new subscriptions or cycles
CREATE OR REPLACE FUNCTION public.initialize_usage_tracking()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usage_tracking (
        user_id, 
        subscription_id, 
        billing_period_start, 
        billing_period_end
    ) VALUES (
        NEW.user_id, 
        NEW.id, 
        NEW.start_date, 
        COALESCE(NEW.end_date, NEW.start_date + interval '1 month')
    )
    ON CONFLICT (user_id, billing_period_start) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize usage tracking on new subscription
CREATE TRIGGER on_subscription_created
    AFTER INSERT ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.initialize_usage_tracking();
