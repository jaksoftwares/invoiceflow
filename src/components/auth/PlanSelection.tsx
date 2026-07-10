'use client';

import React, { useState } from 'react';
import { Check, Shield, Briefcase, Zap, Sparkles, Building2, Globe, Users } from 'lucide-react';

interface DBPlan {
 id: string;
 name: string;
 description: string;
 price_monthly: number;
 price_yearly: number;
 price_lifetime: number;
 features?: string[];
}

interface PlanSelectionProps {
 plans: DBPlan[];
 onSelect: (planId: string, phone?: string) => void;
 loading?: boolean;
}

const getPlanIcon = (name: string) => {
 const n = name.toLowerCase();
 if (n.includes('free')) return <Shield size={22} />;
 if (n.includes('starter')) return <Zap size={22} />;
 if (n.includes('business')) return <Briefcase size={22} />;
 if (n.includes('lifetime')) return <Sparkles size={22} />;
 return <Shield size={22} />;
};

const getPlanColor = (name: string) => {
 const n = name.toLowerCase();
 if (n.includes('free')) return 'indigo';
 if (n.includes('starter')) return 'blue';
 if (n.includes('business')) return 'emerald';
 if (n.includes('lifetime')) return 'purple';
 return 'indigo';
};

const getPlanFeatures = (plan: DBPlan) => {
 const n = plan.name.toLowerCase();
 if (n.includes('free')) return ['5 Invoices /mo', 'Standard PDF', 'Basic Support', '3 Clients'];
 if (n.includes('starter')) return ['50 Invoices /mo', '20 Clients', 'Priority Support', 'No Watermark'];
 if (n.includes('business')) return ['Unlimited Invoices', 'Unlimited Clients', 'Full Branding', 'Excel Export'];
 if (n.includes('lifetime')) return ['One-time Payment', 'All Business Features', 'Forever Access', 'VIP Support'];
 return [];
};

const PlanSelection: React.FC<PlanSelectionProps> = ({ plans, onSelect, loading }) => {
 const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
 const [phoneNumber, setPhoneNumber] = useState('');

 return (
 <div className="w-full max-w-6xl mx-auto space-y-12 py-10">
 <div className="text-center space-y-4">
 <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
 Select your subscription plan
 </h2>
 <p className="text-base text-gray-500 max-w-xl mx-auto font-medium">
 Choose the plan that best fits your business needs. 
 Dynamic pricing linked to your M-Pesa account.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
 {plans.map((plan) => {
 const color = getPlanColor(plan.name);
 const icon = getPlanIcon(plan.name);
 const features = getPlanFeatures(plan);
 const isLifetime = plan.name.toLowerCase().includes('lifetime');
 const isFree = plan.price_monthly === 0 && plan.price_lifetime === 0;
 const price = isLifetime ? plan.price_lifetime : plan.price_monthly;

 return (
 <div
 key={plan.id}
 onClick={() => setSelectedPlanId(plan.id)}
 className={`relative flex flex-col p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 transform ${
 selectedPlanId === plan.id
 ? `border-indigo-600 bg-white shadow-xl scale-[1.02]`
 : `border-gray-100 bg-white hover:border-indigo-200`
 }`}
 >
 {plan.name === 'Business' && (
 <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-bold font-medium py-1 px-3 rounded-full shadow-md">
 Best Value
 </div>
 )}

 <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
 <p className="text-[11px] text-gray-500 mb-4 font-medium leading-relaxed h-8 line-clamp-2">{plan.description}</p>
 
 <div className="flex items-baseline gap-1 mb-6 border-b border-gray-50 pb-4">
 <span className="text-[10px] font-bold text-gray-400 mr-0.5 uppercase">KES</span>
 <span className="text-3xl font-bold text-gray-900">{price}</span>
 <span className="text-gray-400 text-[10px] font-semibold">/{isFree ? 'forever' : isLifetime ? 'once' : 'mo'}</span>
 </div>

 <div className="space-y-3 mb-8 flex-1">
 {features.map((feature, idx) => (
 <div key={idx} className="flex items-center gap-2">
 <Check size={12} className="text-indigo-500 flex-shrink-0" />
 <span className="text-[11px] text-gray-600 font-medium">{feature}</span>
 </div>
 ))}
 </div>

 {!isFree && selectedPlanId === plan.id && (
 <div className="mb-4 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
 <label className="text-[9px] font-bold font-medium text-indigo-600 ml-1">M-Pesa Number</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
 <span className="text-[10px] font-bold">+254</span>
 </div>
 <input 
 type="text" 
 placeholder="712345678"
 value={phoneNumber}
 onChange={(e) => setPhoneNumber(e.target.value)}
 onClick={(e) => e.stopPropagation()}
 className="w-full pl-11 pr-3 py-2.5 rounded-lg border-2 border-gray-100 bg-gray-50 focus:border-indigo-600 focus:ring-0 outline-none transition-all font-bold text-xs"
 />
 </div>
 </div>
 )}

 <button
 disabled={loading}
 onClick={(e) => {
 e.stopPropagation();
 if (!isFree && !phoneNumber && selectedPlanId !== plan.id) {
 setSelectedPlanId(plan.id);
 return;
 }
 onSelect(plan.id, phoneNumber);
 }}
 className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
 selectedPlanId === plan.id
 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
 : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
 } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {loading && selectedPlanId === plan.id ? 'Starting...' : isFree ? 'Get Started' : 'Select Plan'}
 </button>
 </div>
 );
 })}
 </div>

 <div className="flex flex-wrap justify-center gap-10 pt-10 grayscale opacity-40">
 <div className="flex items-center gap-2">
 <Building2 size={20} />
 <span className="text-[10px] font-bold font-medium">Enterprise Ready</span>
 </div>
 <div className="flex items-center gap-2">
 <Globe size={20} />
 <span className="text-[10px] font-bold font-medium">Global Payments</span>
 </div>
 <div className="flex items-center gap-2">
 <Users size={20} />
 <span className="text-[10px] font-bold font-medium">Team Management</span>
 </div>
 </div>
 </div>
 );
};

export default PlanSelection;
