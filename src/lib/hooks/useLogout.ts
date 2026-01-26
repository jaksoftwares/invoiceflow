import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import type { AuthError } from '@supabase/supabase-js';

interface UseLogoutOptions {
  onSuccess?: () => void;
}

interface UseLogoutReturn {
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useLogout(options: UseLogoutOptions = {}): UseLogoutReturn {
  const { onSuccess } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        throw authError;
      }

      toast.success('Logged out successfully!');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Logout failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { logout, loading, error };
}