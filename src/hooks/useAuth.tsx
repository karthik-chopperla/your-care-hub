import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useAuth = (requireAuth = true) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && requireAuth) {
          navigate('/auth', { replace: true });
          return;
        }
        
        setUser(session?.user || null);
      } catch (error) {
        console.error('Auth check error:', error);
        if (requireAuth) {
          navigate('/auth', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (!session && requireAuth) {
          navigate('/auth', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, requireAuth]);

  return { user, loading };
};

export const getUserRole = async (userId: string): Promise<'user' | 'partner' | 'admin' | null> => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return data?.role || null;
};
