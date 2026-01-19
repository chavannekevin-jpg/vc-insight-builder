import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface EventType {
  id: string;
  investor_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  color: string;
  is_active: boolean;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  max_bookings_per_day: number | null;
  created_at: string;
}

export interface Availability {
  id: string;
  investor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
}

export interface SlotOverride {
  id: string;
  investor_id: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface Booking {
  id: string;
  investor_id: string;
  event_type_id: string;
  booker_name: string;
  booker_email: string;
  booker_company: string | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  google_event_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  booking_event_types?: EventType;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  connectedAt?: string;
}

export function useEventTypes(investorId: string | null) {
  return useQuery({
    queryKey: ["event-types", investorId],
    queryFn: async () => {
      if (!investorId) return [];
      const { data, error } = await supabase
        .from("booking_event_types")
        .select("*")
        .eq("investor_id", investorId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as EventType[];
    },
    enabled: !!investorId,
  });
}

export function useAvailability(investorId: string | null) {
  return useQuery({
    queryKey: ["availability", investorId],
    queryFn: async () => {
      if (!investorId) return [];
      const { data, error } = await supabase
        .from("booking_availability")
        .select("*")
        .eq("investor_id", investorId)
        .order("day_of_week", { ascending: true });
      if (error) throw error;
      return data as Availability[];
    },
    enabled: !!investorId,
  });
}

export function useSlotOverrides(investorId: string | null) {
  return useQuery({
    queryKey: ["slot-overrides", investorId],
    queryFn: async () => {
      if (!investorId) return [];
      const { data, error } = await supabase
        .from("booking_slot_overrides")
        .select("*")
        .eq("investor_id", investorId)
        .order("date", { ascending: true });
      if (error) throw error;
      return data as SlotOverride[];
    },
    enabled: !!investorId,
  });
}

export function useBookings(investorId: string | null) {
  return useQuery({
    queryKey: ["bookings", investorId],
    queryFn: async () => {
      if (!investorId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, booking_event_types(*)")
        .eq("investor_id", investorId)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!investorId,
  });
}

export function useGoogleCalendarStatus(investorId: string | null) {
  return useQuery({
    queryKey: ["google-calendar-status", investorId],
    queryFn: async () => {
      if (!investorId) return { connected: false };
      const { data, error } = await supabase
        .from("google_calendar_tokens")
        .select("connected_at")
        .eq("investor_id", investorId)
        .maybeSingle();
      if (error) throw error;
      return {
        connected: !!data,
        connectedAt: data?.connected_at,
      } as GoogleCalendarStatus;
    },
    enabled: !!investorId,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<EventType, "id" | "created_at">) => {
      const { data: result, error } = await supabase
        .from("booking_event_types")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event-types", variables.investor_id] });
      toast({ title: "Event type created!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating event type", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<EventType> & { id: string }) => {
      const { error } = await supabase
        .from("booking_event_types")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
      toast({ title: "Event type updated!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating event type", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("booking_event_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-types"] });
      toast({ title: "Event type deleted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting event type", description: error.message, variant: "destructive" });
    },
  });
}

export function useSaveAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ investorId, availability }: { investorId: string; availability: Omit<Availability, "id" | "investor_id">[] }) => {
      // Delete existing availability
      const { error: deleteError } = await supabase
        .from("booking_availability")
        .delete()
        .eq("investor_id", investorId);
      if (deleteError) throw deleteError;
      
      // Insert new availability
      if (availability.length > 0) {
        const { error: insertError } = await supabase
          .from("booking_availability")
          .insert(availability.map(a => ({ ...a, investor_id: investorId })));
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast({ title: "Availability saved!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error saving availability", description: error.message, variant: "destructive" });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({ title: "Booking cancelled" });
    },
    onError: (error: Error) => {
      toast({ title: "Error cancelling booking", description: error.message, variant: "destructive" });
    },
  });
}

export function useConnectGoogleCalendar() {
  return useMutation({
    mutationFn: async ({ investorId, redirectUrl }: { investorId: string; redirectUrl?: string }) => {
      const { data, error } = await supabase.functions.invoke("google-calendar-auth", {
        body: { investorId, redirectUrl },
      });
      if (error) throw error;
      return data.authUrl;
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl;
    },
    onError: (error: Error) => {
      toast({ title: "Error connecting Google Calendar", description: error.message, variant: "destructive" });
    },
  });
}

export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (investorId: string) => {
      const { error } = await supabase
        .from("google_calendar_tokens")
        .delete()
        .eq("investor_id", investorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar-status"] });
      toast({ title: "Google Calendar disconnected" });
    },
    onError: (error: Error) => {
      toast({ title: "Error disconnecting", description: error.message, variant: "destructive" });
    },
  });
}
