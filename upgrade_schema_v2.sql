-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Add plan_id to subscription_payments to track target plan during upgrade
ALTER TABLE public.subscription_payments 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);

-- 2. Ensure checkout_request_id is indexed for fast lookups in callback
CREATE INDEX IF NOT EXISTS idx_subscription_payments_checkout_request_id 
ON public.subscription_payments(checkout_request_id);

-- 3. Verify plans include 'upgrade' status in CHECK constraints (added previously)
-- ALTER TABLE public.subscription_payments DROP CONSTRAINT IF EXISTS subscription_payments_payment_type_check;
-- ALTER TABLE public.subscription_payments ADD CONSTRAINT subscription_payments_payment_type_check CHECK (payment_type IN ('subscription', 'upgrade', 'renewal'));
