import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseMemoJobRealtimeOptions {
  jobId: string | null;
  onCompleted: () => void;
  onFailed: (errorMessage: string | null) => void;
  /** Safety timeout in ms (default: 10 minutes) */
  timeoutMs?: number;
  onTimeout?: () => void;
}

/**
 * Subscribe to Realtime changes on memo_generation_jobs for a specific job.
 * Replaces all polling patterns (setInterval, while loops) with push-based updates.
 */
export function useMemoJobRealtime({
  jobId,
  onCompleted,
  onFailed,
  timeoutMs = 10 * 60 * 1000,
  onTimeout,
}: UseMemoJobRealtimeOptions) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settledRef = useRef(false);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;

    settledRef.current = false;

    // 1. Do an immediate check in case the job already completed before we subscribed
    const checkCurrentStatus = async () => {
      try {
        const { data: job } = await supabase
          .from("memo_generation_jobs")
          .select("status, error_message")
          .eq("id", jobId)
          .maybeSingle();

        if (settledRef.current) return;

        if (job?.status === "completed") {
          settledRef.current = true;
          cleanup();
          onCompleted();
          return;
        }
        if (job?.status === "failed") {
          settledRef.current = true;
          cleanup();
          onFailed(job.error_message);
          return;
        }
      } catch (err) {
        console.error("useMemoJobRealtime: initial status check failed", err);
      }
    };

    checkCurrentStatus();

    // 2. Subscribe to realtime changes
    const channel = supabase
      .channel(`memo-job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "memo_generation_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          if (settledRef.current) return;

          const newStatus = (payload.new as any)?.status;
          const errorMessage = (payload.new as any)?.error_message;

          if (newStatus === "completed") {
            settledRef.current = true;
            cleanup();
            onCompleted();
          } else if (newStatus === "failed") {
            settledRef.current = true;
            cleanup();
            onFailed(errorMessage);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // 3. Safety timeout
    timeoutRef.current = setTimeout(() => {
      if (!settledRef.current) {
        console.warn("useMemoJobRealtime: safety timeout reached");
        settledRef.current = true;
        cleanup();
        onTimeout?.();
      }
    }, timeoutMs);

    return cleanup;
  }, [jobId]); // Only re-subscribe when jobId changes
}
