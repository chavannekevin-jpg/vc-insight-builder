-- Enable Realtime on memo_generation_jobs so clients can subscribe instead of polling
ALTER PUBLICATION supabase_realtime ADD TABLE public.memo_generation_jobs;