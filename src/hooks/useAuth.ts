import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useAuth = (): AuthState => {
  const queryClient = useQueryClient();

  // Listen for auth state changes and invalidate cache
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
    isLoading: sessionLoading || roleLoading,
  };
};
