import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

interface UseSignupOptions {
  onSuccess?: () => void;
}

interface UseSignupReturn {
  signup: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useSignup(options: UseSignupOptions = {}): UseSignupReturn {
  const { onSuccess } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      toast.success('Signup successful! Please check your email for verification.');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Signup failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { signup, loading, error };
}