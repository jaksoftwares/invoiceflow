'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
 Loader2, 
 Store, 
 Upload, 
 ArrowRight,
 ChevronLeft,
 Building2,
 MapPin,
 Globe,
 Plus,
 CheckCircle2
} from 'lucide-react';
import { uploadFile } from '@/lib/cloudinary';
import CongratulationsModal from '@/components/auth/CongratulationsModal';
import PlanSelection from '@/components/auth/PlanSelection';

export default function OnboardingPage() {
 const [step, setStep] = useState(0); 
 const [loading, setLoading] = useState(false);
 const [profile, setProfile] = useState<any>(null);
 const [businessName, setBusinessName] = useState('');
 const [businessAddress, setBusinessAddress] = useState('');
 const [city, setCity] = useState('');
 const [state, setState] = useState('');
 const [zipCode, setZipCode] = useState('');
 const [country, setCountry] = useState('');
 const [logoFile, setLogoFile] = useState<File | null>(null);
 const [logoPreview, setLogoPreview] = useState<string | null>(null);

 const [plans, setPlans] = useState<any[]>([]);
 const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
 const [activePlanId, setActivePlanId] = useState<string | null>(null);
 const [phoneNumber, setPhoneNumber] = useState('');

 const router = useRouter();

 useEffect(() => {
 const fetchProfileAndPlans = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 router.push('/auth/login');
 return;
 }

 const { data: profileData } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', user.id)
 .single();

 if (profileData) {
 setProfile(profileData);
 if (profileData.onboarding_status === 'active') {
 router.push('/dashboard');
 }
 }

 const { data: plansData } = await supabase
 .from('plans')
 .select('*');
 
 if (plansData) {
 const order = ['free', 'starter', 'business', 'lifetime'];
 const sortedPlans = [...plansData].sort((a, b) => {
 return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
 });
 setPlans(sortedPlans);
 }
 };

 fetchProfileAndPlans();
 }, [router]);

 useEffect(() => {
 let pollInterval: NodeJS.Timeout;

 if (activeRequestId && activePlanId) {
 pollInterval = setInterval(async () => {
 try {
 const { checkPaymentStatus, switchPlanAction } = await import('@/lib/actions/subscription');
 const { status } = await checkPaymentStatus(activeRequestId);
 
 if (status === 'completed') {
 clearInterval(pollInterval);
 
 // Activate the subscription
 await switchPlanAction(activePlanId);
 
 const { data: { user } } = await supabase.auth.getUser();
 if (user) {
 await supabase
 .from('profiles')
 .update({ onboarding_status: 'active' })
 .eq('id', user.id);
 }

 setActiveRequestId(null);
 setLoading(false);
 toast.success('Subscription activated.');
 router.push('/dashboard');
 } else if (status === 'failed') {
 clearInterval(pollInterval);
 setActiveRequestId(null);
 setLoading(false);
 toast.error('Payment failed.');
 }
 } catch (error) {
 console.error('Polling error:', error);
 }
 }, 5000);
 }

 return () => {
 if (pollInterval) clearInterval(pollInterval);
 };
 }, [activeRequestId, activePlanId, router]);

 const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 if (file.size > 2 * 1024 * 1024) {
 toast.error('Logo must be under 2MB.');
 return;
 }
 setLogoFile(file);
 const reader = new FileReader();
 reader.onload = () => setLogoPreview(reader.result as string);
 reader.readAsDataURL(file);
 }
 };

 const submitBusinessProfile = async () => {
 if (!businessName) {
 toast.error('Business name is required');
 return;
 }

 setLoading(true);
 try {
 let logoUrl = '';
 if (logoFile) {
 logoUrl = await uploadFile(logoFile, 'invoiceflow_logos');
 }

 const { error } = await supabase.rpc('complete_onboarding', {
 p_first_name: profile.first_name,
 p_last_name: profile.last_name,
 p_phone: profile.phone || '',
 p_business_name: businessName,
 p_business_address: businessAddress,
 p_city: city,
 p_state: state,
 p_zip_code: zipCode,
 p_country: country,
 p_logo_url: logoUrl,
 });

 if (error) throw error;

 toast.success('Profile updated.');
 setStep(2);
 } catch (error: any) {
 console.error('Onboarding error:', error);
 toast.error('Failed to update profile.');
 } finally {
 setLoading(false);
 }
 };

 const selectPlan = async (planId: string, phone?: string) => {
 setLoading(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error('Not authenticated');

 const plan = plans.find(p => p.id === planId);
 if (!plan) throw new Error('Plan not found.');

 if (plan.price_monthly === 0 && plan.price_lifetime === 0) {
 const { switchPlanAction } = await import('@/lib/actions/subscription');
 const res = await switchPlanAction(plan.id);
 
 if (res.success) {
 await supabase
 .from('profiles')
 .update({ onboarding_status: 'active' })
 .eq('id', user.id);
 
 toast.success('Account setup complete.');
 router.push('/dashboard');
 } else {
 throw new Error('Failed to activate plan.');
 }
 } else {
 if (!phone) throw new Error('Phone number is required.');
 setPhoneNumber(phone);
 setActivePlanId(plan.id);
 
 const { initiateStkPush } = await import('@/lib/mpesa');
 const result = await initiateStkPush(phone, plan.price_monthly || plan.price_lifetime, 'subscription', plan.id);
 
 if (result.success) {
 setActiveRequestId(result.checkoutRequestId || null);
 toast.info('Please check your phone for the M-Pesa prompt.');
 } else {
 throw new Error(result.error || 'M-Pesa initiation failed.');
 }
 }
 } catch (error: any) {
 console.error('Plan selection error:', error);
 toast.error(error.message || 'Failed to complete setup.');
 setLoading(false);
 }
 };

 if (!profile) return (
 <div className="min-h-screen flex items-center justify-center bg-white">
 <Loader2 className="animate-spin text-indigo-600" size={32} />
 </div>
 );

 return (
 <div className="min-h-screen bg-gray-50/30 flex flex-col items-center py-12 px-4">
 {/* M-Pesa Processing Overlay */}
 {activeRequestId && (
 <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
 <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6">
 <div className="relative mx-auto w-16 h-16">
 <Loader2 className="text-indigo-600 animate-spin w-full h-full stroke-[3]" />
 </div>
 <div className="space-y-2">
 <h3 className="text-xl font-bold text-gray-900">Confirm Payment</h3>
 <p className="text-gray-500 text-sm font-medium">
 Enter your M-Pesa PIN on the device associated with <span className="text-indigo-600 font-bold">{phoneNumber}</span>.
 </p>
 </div>
 <button 
 onClick={() => setActiveRequestId(null)}
 className="w-full py-2 text-gray-400 hover:text-gray-600 font-bold font-medium text-[10px]"
 >
 Close and check later
 </button>
 </div>
 </div>
 )}

 <div className="w-full max-w-4xl">
 <div className="flex justify-center mb-10">
 <img src="/assets/logo.png" alt="InvoiceFlow" className="h-8 w-auto" />
 </div>

 {step > 0 && !activeRequestId && (
 <div className="flex items-center justify-between mb-8 max-w-xs mx-auto">
 <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-indigo-600 transition-colors">
 <ChevronLeft size={20} />
 </button>
 <div className="flex gap-2">
 <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
 <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
 </div>
 <div className="w-5"></div>
 </div>
 )}

 {step === 0 && (
 <CongratulationsModal onContinue={() => setStep(1)} onSkip={() => setStep(2)} />
 )}

 {step === 1 && (
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
 <div className="grid md:grid-cols-5 min-h-[500px]">
 <div className="md:col-span-2 bg-gray-50/50 p-10 border-r border-gray-50 flex flex-col justify-center">
 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
 <Building2 size={24} />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-3">Business Profile</h2>
 <p className="text-gray-500 text-sm leading-relaxed mb-8">
 Complete your profile to customize your invoices with your company details and logo.
 </p>
 <ul className="space-y-3">
 <li className="flex items-center gap-2 text-xs font-bold text-gray-400 font-medium">
 <CheckCircle2 size={14} className="text-indigo-500" /> Custom Logo
 </li>
 <li className="flex items-center gap-2 text-xs font-bold text-gray-400 font-medium">
 <CheckCircle2 size={14} className="text-indigo-500" /> Office Address
 </li>
 </ul>
 </div>

 <div className="md:col-span-3 p-10 space-y-8">
 <div className="flex flex-col items-center mb-4">
 <div className="relative group">
 <div className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${logoPreview ? 'border-indigo-500' : 'border-gray-200 bg-gray-50'}`}>
 {logoPreview ? (
 <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
 ) : (
 <Plus size={24} className="text-gray-300" />
 )}
 <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoChange} />
 </div>
 <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm border-2 border-white">
 <Upload size={12} />
 </div>
 </div>
 <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Upload Logo</p>
 </div>

 <div className="grid gap-5">
 <div className="grid gap-1.5">
 <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Business Name</label>
 <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Inc." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
 </div>

 <div className="grid gap-1.5">
 <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Office Address</label>
 <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="123 Business Way" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
 <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="ZIP Code" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
 <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-medium" />
 </div>
 </div>

 <div className="pt-6 space-y-3">
 <button onClick={submitBusinessProfile} disabled={loading} className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50">
 {loading ? <Loader2 className="animate-spin size={18}" /> : 'Continue to plans'}
 <ArrowRight size={18} />
 </button>
 <button onClick={() => setStep(2)} className="w-full text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors font-medium">
 Setup later
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="animate-in slide-in-from-bottom-4 duration-300">
 <PlanSelection plans={plans} onSelect={selectPlan} loading={loading} />
 </div>
 )}
 </div>
 </div>
 );
}
