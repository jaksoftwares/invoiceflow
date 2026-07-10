import NavigationWrapper from '@/components/common/NavigationWrapper';
import { getActiveSubscription, getUsageStats } from '@/lib/actions/subscription';
import { createClient } from '@/lib/supabase/server';
import SubscriptionClient from '@/app/dashboard/subscription/SubscriptionClient';

export default async function SubscriptionPage() {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();

 if (!user) return null;

 const [activeSubscription, usageStats, plansResult] = await Promise.all([
 getActiveSubscription(),
 getUsageStats(),
 supabase.from('plans').select('*').order('price_monthly', { ascending: true })
 ]);

 const { data: profile } = await supabase
 .from('profiles')
 .select('phone')
 .eq('id', user.id)
 .single();

 const { data: payments } = await supabase
 .from('subscription_payments')
 .select('*')
 .eq('user_id', user.id)
 .order('created_at', { ascending: false });

 const { data: paygTransactions } = await supabase
 .from('payg_transactions')
 .select('*')
 .eq('user_id', user.id)
 .order('created_at', { ascending: false });

 return (
 <NavigationWrapper>
 <div className="container mx-auto px-4 py-8">
 <SubscriptionClient 
 initialSubscription={activeSubscription}
 initialUsage={usageStats}
 plans={plansResult.data || []}
 payments={payments || []}
 paygTransactions={paygTransactions || []}
 userEmail={user.email}
 initialPhone={profile?.phone || ''}
 />
 </div>
 </NavigationWrapper>
 );
}
