'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/cloudinary';
import { Loader2, CheckCircle, Store, User, Upload } from 'lucide-react';

// --- Validation Schemas ---

const userDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const businessDetailsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

// Merged schema for type inference
const signupSchema = userDetailsSchema.merge(businessDetailsSchema);
type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  // Track if we are in "resuming" mode (user already created auth account)
  const [isResuming, setIsResuming] = useState(false); 
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  // Check for existing session on mount to support resumable signup
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.onboarding_status === 'active' || profile.onboarding_status === 'verified') {
            router.push('/dashboard');
            return;
          }
          // Resume flow
          setIsResuming(true);
          setValue('email', session.user.email || '');
          setValue('firstName', profile.first_name || '');
          setValue('lastName', profile.last_name || '');
          if (profile.phone) setValue('phone', profile.phone);
          
          // If profile exists but not complete, move to step 2
          setStep(2);
          toast.info('Resuming your signup process...');
        }
      }
    };
    checkSession();
  }, [router, setValue]);

  const handleNextStep = async () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = await trigger(['firstName', 'lastName', 'phone', 'email', 'password']);
      if (isValid) {
        // If not resuming, we could theoretically create the auth user here to "save" progress
        // But for simplicity, we do it all at the end OR partially.
        // Prompt says "Support resumable signup sessions".
        // Best practice: Create Auth User at Step 1.
        if (!isResuming) {
          await createAuthUser();
        } else {
            setStep(2);
        }
      }
    } else if (step === 2) {
      isValid = await trigger(['businessName', 'businessAddress', 'city', 'state', 'zipCode', 'country']);
      if (isValid) setStep(3);
    }
  };

  const createAuthUser = async () => {
    setLoading(true);
    const data = getValues();
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        setIsResuming(true);
        setStep(2);
        toast.success('Account created! Please continue with business details.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File too large. Max 5MB.');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onFinalSubmit = async () => {
    setLoading(true);
    try {
      // 1. Upload Logo if present
      let logoUrl = '';
      if (logoFile) {
        try {
          logoUrl = await uploadFile(logoFile, 'invoiceflow_logos');
        } catch (uploadError) {
          console.error('Logo upload failed', uploadError);
          toast.error('Failed to upload logo, but continuing signup...');
        }
      }

      // 2. Call Atomic RPC
      const formData = getValues();
      const { data, error } = await supabase.rpc('complete_onboarding', {
        p_first_name: formData.firstName,
        p_last_name: formData.lastName,
        p_phone: formData.phone || '',
        p_business_name: formData.businessName,
        p_business_address: formData.businessAddress || '',
        p_city: formData.city || '',
        p_state: formData.state || '',
        p_zip_code: formData.zipCode || '',
        p_country: formData.country || '',
        p_logo_url: logoUrl,
      });

      if (error) throw error;

      toast.success('Setup complete! Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---

  const steps = [
    { id: 1, title: 'User Details', icon: User },
    { id: 2, title: 'Business Info', icon: Store },
    { id: 3, title: 'Branding', icon: Upload },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        
        {/* Progress Bar */}
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((s, index) => (
                    <li key={s.id} className={`${index !== steps.length - 1 ? 'w-full' : ''} relative`}>
                        <div className="flex items-center" aria-current="step">
                            <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${step >= s.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'}`}>
                                <s.icon className={`h-5 w-5 ${step >= s.id ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            {index !== steps.length - 1 && (
                                <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${step > s.id ? 'border-indigo-600' : 'border-gray-300'} w-full ml-4 mr-4`} />
                            )}
                        </div>
                        <span className="absolute -bottom-6 left-0 w-20 -ml-5 text-center text-xs font-medium text-gray-500">{s.title}</span>
                    </li>
                ))}
            </ol>
        </nav>

        <div className="mt-8">
             <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
                {steps[step-1].title}
            </h2>
            <p className="text-center text-sm text-gray-500 mb-8">
                step {step} of 3
            </p>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); }}>
                
                {/* Step 1: User Details */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input {...register('firstName')} disabled={isResuming} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input {...register('lastName')} disabled={isResuming} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" {...register('email')} disabled={isResuming} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        {!isResuming && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" {...register('password')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                            <input type="tel" {...register('phone')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                )}

                {/* Step 2: Business Details */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Business Name</label>
                            <input {...register('businessName')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Acme Corp" />
                            {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input {...register('businessAddress')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input {...register('city')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input {...register('state')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                                <input {...register('zipCode')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input {...register('country')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Logo Upload */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                         <label className="block text-sm font-medium text-gray-700 text-center">
                            Upload Business Logo
                        </label>
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors ${logoPreview ? 'border-indigo-500 bg-indigo-50' : ''}`}>
                            <div className="space-y-1 text-center">
                                {logoPreview ? (
                                    <div className="relative">
                                        <img src={logoPreview} alt="Preview" className="h-32 w-32 object-contain mx-auto" />
                                        <button
                                            type="button"
                                            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                            className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between pt-4">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            disabled={loading}
                            className={`ml-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Next Step'}
                        </button>
                    ) : (
                         <button
                            type="button" // Use type="button" and explicit handler to prevent double submit
                            onClick={onFinalSubmit}
                            disabled={loading}
                            className={`ml-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="-ml-1 mr-2 h-5 w-5" />
                                    Complete Setup
                                </>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}