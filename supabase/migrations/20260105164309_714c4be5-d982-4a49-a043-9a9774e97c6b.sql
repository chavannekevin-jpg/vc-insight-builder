-- Schedule the abandonment email to run every hour
-- Using pg_net to call the edge function
SELECT cron.schedule(
  'send-abandonment-emails',
  '0 * * * *',  -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://lgmbbycblcflqzvdboxp.supabase.co/functions/v1/send-abandonment-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnbWJieWNibGNmbHF6dmRib3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTMyODUsImV4cCI6MjA3OTQ4OTI4NX0.txTN2JMQpXdrhSNUwknFOa0vfmUJPCCTo6qRfV60w_U'
    ),
    body := '{}'::jsonb
  );
  $$
);