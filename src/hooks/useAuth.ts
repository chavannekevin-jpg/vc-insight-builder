import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useAuth = (): AuthState => {
  const queryClient = useQueryClient();
  const [initializing, setInitializing] = useState(true);

  // Listen for auth state changes and update cache directly
  useEffect(() => {
    // First, get the initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Handle invalid refresh token by signing out
      if (error && error.message?.includes('Refresh Token')) {
        console.warn('Invalid refresh token, signing out...');
        supabase.auth.signOut();
        queryClient.setQueryData(["auth-session"], null);
      } else {
        queryClient.setQueryData(["auth-session"], session);
      }
      setInitializing(false);
    }).catch((err) => {
      console.error('Auth error:', err);
      queryClient.setQueryData(["auth-session"], null);
      setInitializing(false);
    });

    // Then set up the listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Update query cache directly to prevent race conditions
      queryClient.setQueryData(["auth-session"], session);
      // Invalidate user role to refetch with new session
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error && error.message?.includes('Refresh Token')) {
        await supabase.auth.signOut();
        return null;
      }
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: isAdmin = false, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isAdmin,
    isLoading: initializing || sessionLoading || roleLoading,
  };
};
