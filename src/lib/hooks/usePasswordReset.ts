import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

interface UsePasswordResetOptions {
  onSuccess?: () => void;
}

interface UsePasswordResetReturn {
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function usePasswordReset(options: UsePasswordResetOptions = {}): UsePasswordResetReturn {
  const { onSuccess } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (authError) {
        throw authError;
      }

      toast.success('Password reset email sent! Please check your inbox.');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Password reset failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { resetPassword, loading, error };
}