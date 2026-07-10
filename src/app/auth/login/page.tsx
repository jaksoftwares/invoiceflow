'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, Key, Loader2, ArrowRight } from 'lucide-react'
import EmailConfirmationModal from '@/components/auth/EmailConfirmationModal'

const loginSchema = z.object({
 email: z.string().email('Invalid email address'),
 password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
 const [loading, setLoading] = useState(false)
 const [showConfirmation, setShowConfirmation] = useState(false)
 const [userEmail, setUserEmail] = useState('')
 const router = useRouter()

 const {
 register,
 handleSubmit,
 formState: { errors },
 } = useForm<LoginFormData>({
 resolver: zodResolver(loginSchema),
 })

 const onSubmit = async (data: LoginFormData) => {
 setLoading(true)
 setUserEmail(data.email)

 try {
 const { data: authData, error } = await supabase.auth.signInWithPassword({
 email: data.email,
 password: data.password,
 })

 if (error) {
 if (error.message.toLowerCase().includes('email not confirmed')) {
 setShowConfirmation(true)
 return
 }
 toast.error(error.message)
 return
 }

 if (authData.user && !authData.user.email_confirmed_at) {
 setShowConfirmation(true)
 return
 }

 if (authData.user) {
 const { data: profile } = await supabase
 .from('profiles')
 .select('onboarding_status')
 .eq('id', authData.user.id)
 .single();

 if (profile && (profile.onboarding_status === 'pending_signup' || profile.onboarding_status === 'profile_incomplete' || profile.onboarding_status === 'business_pending')) {
 router.push('/onboarding');
 return;
 }
 }

 toast.success('Logged in successfully')
 
 const params = new URLSearchParams(window.location.search);
 const returnUrl = params.get('redirectedFrom') || '/dashboard';
 window.location.href = returnUrl;
 } catch (error) {
 console.error('Login error:', error);
 toast.error('An unexpected error occurred. Please try again.')
 } finally {
 setLoading(false)
 }
 }

 if (showConfirmation) {
 return <EmailConfirmationModal email={userEmail} />;
 }

 return (
 <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
 <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
 <div className="text-center">
 <div className="flex justify-center mb-6">
 <img src="/assets/logo.png" alt="InvoiceFlow Logo" className="h-10 w-auto" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
 Sign in to InvoiceFlow
 </h2>
 <p className="mt-2 text-sm text-gray-500 font-medium">
 Access your business dashboard and invoices.
 </p>
 </div>

 <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
 <div className="space-y-4">
 <div className="space-y-1">
 <label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">
 Email Address
 </label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input
 id="email"
 type="email"
 {...register('email')}
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
 placeholder="name@company.com"
 />
 </div>
 {errors.email && (
 <p className="mt-1 text-xs text-red-600 ml-1 font-medium">{errors.email.message}</p>
 )}
 </div>
 
 <div className="space-y-1">
 <div className="flex items-center justify-between ml-1">
 <label htmlFor="password" className="text-sm font-semibold text-gray-700">
 Password
 </label>
 </div>
 <div className="relative">
 <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
 <input
 id="password"
 type="password"
 {...register('password')}
 className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
 placeholder="••••••••"
 />
 </div>
 {errors.password && (
 <p className="mt-1 text-xs text-red-600 ml-1 font-medium">{errors.password.message}</p>
 )}
 </div>
 </div>

 <div className="flex items-center justify-end">
 <Link href="/auth/forgot-password" title='forgot password' className="text-sm font-semibold text-indigo-600 hover:underline">
 Forgot password?
 </Link>
 </div>

 <div>
 <button
 type="submit"
 disabled={loading}
 className={`group relative flex items-center justify-center gap-2 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
 >
 {loading ? (
 <>
 <Loader2 className="animate-spin h-5 w-5" />
 Signing in...
 </>
 ) : (
 <>
 Sign In
 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
 </>
 )}
 </button>
 </div>

 <p className="text-center text-sm text-gray-500 font-medium">
 Don't have an account?{' '}
 <Link href="/auth/signup" className="text-indigo-600 hover:underline">
 Create one for free
 </Link>
 </p>
 </form>
 </div>
 </div>
 )
}
