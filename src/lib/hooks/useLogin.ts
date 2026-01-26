import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

interface UseLoginOptions {
  onSuccess?: () => void;
}

interface UseLoginReturn {
  login: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useLogin(options: UseLoginOptions = {}): UseLoginReturn {
  const { onSuccess } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      toast.success('Login successful!');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { login, loading, error };
}