import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

interface UseEmailVerificationOptions {
  onSuccess?: () => void;
}

interface UseEmailVerificationReturn {
  resendVerification: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useEmailVerification(options: UseEmailVerificationOptions = {}): UseEmailVerificationReturn {
  const { onSuccess } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendVerification = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (authError) {
        throw authError;
      }

      toast.success('Verification email resent! Please check your inbox.');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Resend verification failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { resendVerification, loading, error };
}