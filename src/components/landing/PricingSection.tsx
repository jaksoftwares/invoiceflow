'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/SupabaseAuthProvider';

interface DBPlan {
 id: string;
 name: string;
 description: string;
 price_monthly: number;
 price_yearly: number;
 price_lifetime: number;
}

const getPlanFeatures = (name: string) => {
 const n = name.toLowerCase();
 if (n.includes('free')) return ['5 Invoices /mo', 'Standard PDF', 'Basic Support', '3 Clients'];
 if (n.includes('starter')) return ['50 Invoices /mo', '20 Clients', 'Priority Support', 'No Watermark'];
 if (n.includes('business')) return ['Unlimited Invoices', 'Unlimited Clients', 'Full Branding', 'Excel Export'];
 if (n.includes('lifetime')) return ['One-time Payment', 'All Business Features', 'Forever Access', 'VIP Support'];
 return [];
};

export default function PricingSection() {
 const { user } = useAuth();
 const [plans, setPlans] = useState<DBPlan[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchPlans = async () => {
 const { data, error } = await supabase
 .from('plans')
 .select('*');
 
 if (data) {
 const order = ['free', 'starter', 'business', 'lifetime'];
 const sortedPlans = [...data].sort((a, b) => {
 return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
 });
 setPlans(sortedPlans);
 }
 setLoading(false);
 };

 fetchPlans();
 }, []);

 if (loading) {
 return (
 <section className="py-20 px-4 bg-gray-50/50 flex items-center justify-center">
 <Loader2 className="animate-spin text-indigo-600" size={32} />
 </section>
 );
 }

 return (
 <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100">
 <div className="max-w-7xl mx-auto">
 <div className="text-center mb-16">
 <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
 Pricing
 </h2>
 <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
 Choose the plan that fits your business needs. No hidden fees, just professional invoicing.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {plans.map((plan) => {
 const isLifetime = plan.name.toLowerCase().includes('lifetime');
 const isFree = plan.price_monthly === 0 && plan.price_lifetime === 0;
 const price = isLifetime ? plan.price_lifetime : plan.price_monthly;
 const features = getPlanFeatures(plan.name);
 const isBusiness = plan.name.toLowerCase() === 'business';

 return (
 <div
 key={plan.id}
 className={`flex flex-col p-8 rounded-2xl transition-all duration-300 border shadow-sm relative ${
 isBusiness ? 'border-indigo-600 ring-4 ring-indigo-50/50' : 'border-gray-100'
 }`}
 >
 {isBusiness && (
 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
 <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold font-medium">
 Best Value
 </span>
 </div>
 )}
 <div className="mb-6">
 <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
 <div className="flex items-baseline gap-1">
 <span className="text-sm font-bold text-gray-400 uppercase">KES</span>
 <span className="text-4xl font-bold text-gray-900">{price}</span>
 <span className="text-gray-400 text-xs font-medium uppercase ml-1">
 /{isFree ? 'forever' : isLifetime ? 'once' : 'mo'}
 </span>
 </div>
 <p className="text-gray-500 mt-4 text-sm font-medium leading-relaxed">
 {plan.description}
 </p>
 </div>

 <ul className="space-y-4 mb-10 flex-grow">
 {features.map((feature, idx) => (
 <li key={idx} className="flex items-start text-sm">
 <Check className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
 <span className="text-gray-600 font-medium">{feature}</span>
 </li>
 ))}
 </ul>

 <Link
 href={user ? "/dashboard/subscription" : "/auth/signup"}
 className={`w-full text-center px-6 py-4 font-bold rounded-xl transition-all active:scale-[0.98] ${
 isBusiness
 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
 : 'bg-white border-2 border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200'
 }`}
 >
 {user ? "Go to Dashboard" : (isFree ? "Get Started" : `Join ${plan.name}`)}
 </Link>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}