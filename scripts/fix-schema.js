const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function updateSchema() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
    const supabaseKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Adding plan_id to subscription_payments if missing...');
    
    // Check if column exists
    const { data: cols, error: colError } = await supabase.rpc('run_sql', {
        sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'plan_id'"
    });

    // Note: rpc('run_sql') might not exist unless manually added. 
    // I'll just try to add it with a raw query via postgres.
    // If rpc fails, I'll assume I can't run raw SQL this way and use another method.
    
    const query = `
        ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id);
        
        -- Also add a unique index to checkout_request_id if not already there
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_checkout_request_id') THEN
                CREATE INDEX idx_checkout_request_id ON public.subscription_payments(checkout_request_id);
            END IF;
        END $$;
    `;

    // Try to run SQL via supabase.auth.admin.basePath (hacky) or just skip if no rpc
    // Since I don't have a reliable way to run raw SQL yet, I'll check if project uses migrations.
    console.log('Query prepared, but rpc("run_sql") is needed.');
}

updateSchema();
