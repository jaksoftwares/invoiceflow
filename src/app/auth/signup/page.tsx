'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, User, Key, Mail, Phone, ArrowRight } from 'lucide-react';
import EmailConfirmationModal from '@/components/auth/EmailConfirmationModal';

const signupSchema = z.object({
 firstName: z.string().min(1, 'First name is required'),
 lastName: z.string().min(1, 'Last name is required'),
 phone: z.string().optional(),
 email: z.string().email('Invalid email address'),
 password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpPage() {
 const [loading, setLoading] = useState(false);
 const [showConfirmation, setShowConfirmation] = useState(false);
 const [userEmail, setUserEmail] = useState('');
 
 const router = useRouter();

 const {
 register,
 handleSubmit,
 formState: { errors },
 } = useForm<SignupFormData>({
 resolver: zodResolver(signupSchema),
 mode: 'onChange',
 });

 const onSubmit = async (data: SignupFormData) => {
 setLoading(true);
 setUserEmail(data.email);
 try {
 const { data: authData, error: authError } = await supabase.auth.signUp({
 email: data.email,
 password: data.password,
 options: {
 data: {
 first_name: data.firstName,
 last_name: data.lastName,
 },
 emailRedirectTo: `${window.location.origin}/auth/confirmation`,
 },
 });

 if (authError) throw authError;

 if (authData.user) {
 setShowConfirmation(true);
 }
 } catch (error: any) {
 console.error('Signup error:', error);
 toast.error(error.message || 'Failed to create account');
 } finally {
 setLoading(false);
 }
 };

 if (showConfirmation) {
 return <EmailConfirmationModal email={userEmail} />;
 }

 return (
 <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
 <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
 <div className="text-center">
 <div className="flex justify-center mb-6">
 <img src="/assets/logo.png" alt="InvoiceFlow Logo" className="h-10 w-auto" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
 Create your account
 </h2>
 <p className="mt-2 text-sm text-gray-500 font-medium">
 Professional invoicing for your business starts here.
 </p>
 </div>

 <form className="space-y-6 mt-8" onSubmit={handleSubmit(onSubmit)}>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-sm font-semibold text-gray-700 ml-1">First Name</label>
 <div className="relative">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input 
 {...register('firstName')} 
 placeholder="John"
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
 />
 </div>
 {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.firstName.message}</p>}
 </div>
 <div className="space-y-1">
 <label className="text-sm font-semibold text-gray-700 ml-1">Last Name</label>
 <div className="relative">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input 
 {...register('lastName')} 
 placeholder="Doe"
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
 />
 </div>
 {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.lastName.message}</p>}
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input 
 type="email" 
 {...register('email')} 
 placeholder="john@example.com"
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
 />
 </div>
 {errors.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
 <div className="relative">
 <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input 
 type="password" 
 {...register('password')} 
 placeholder="Minimum 8 characters"
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
 />
 </div>
 {errors.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.password.message}</p>}
 </div>

 <div className="space-y-1">
 <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number (Optional)</label>
 <div className="relative">
 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input 
 type="tel" 
 {...register('phone')} 
 placeholder="+254 700 000000"
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
 />
 </div>
 </div>

 <div className="pt-2">
 <button
 type="submit"
 disabled={loading}
 className={`group relative flex items-center justify-center gap-2 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
 >
 {loading ? (
 <>
 <Loader2 className="animate-spin h-5 w-5" />
 Creating Account...
 </>
 ) : (
 <>
 Create Account
 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
 </>
 )}
 </button>

 <p className="text-center text-[11px] text-gray-500 font-medium px-4 mt-4">
 By creating an account, you agree to our{' '}
 <Link href="/legal/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
 {' '}and{' '}
 <Link href="/legal/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
 </p>
 </div>

 <p className="text-center text-sm text-gray-500 font-medium">
 Already have an account?{' '}
 <Link href="/auth/login" className="text-indigo-600 hover:underline">
 Sign in
 </Link>
 </p>
 </form>
 </div>
 </div>
 );
}
