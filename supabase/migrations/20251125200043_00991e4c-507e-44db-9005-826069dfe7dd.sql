-- Create waitlist settings table
CREATE TABLE IF NOT EXISTS public.waitlist_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default active waitlist mode
INSERT INTO public.waitlist_settings (is_active) VALUES (true);

-- Create waitlist signups table
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_id uuid NOT NULL,
  pricing_tier text NOT NULL DEFAULT 'early_access',
  discount_amount numeric NOT NULL DEFAULT 29.99,
  has_paid boolean NOT NULL DEFAULT false,
  payment_intent_id text,
  signed_up_at timestamp with time zone NOT NULL DEFAULT now(),
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_signups_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
  CONSTRAINT waitlist_signups_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT unique_user_company UNIQUE (user_id, company_id)
);

-- Enable RLS
ALTER TABLE public.waitlist_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Settings policies (admins can manage, everyone can view)
CREATE POLICY "Admins can manage waitlist settings"
  ON public.waitlist_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view waitlist settings"
  ON public.waitlist_settings
  FOR SELECT
  USING (true);

-- Waitlist signup policies
CREATE POLICY "Users can view their own waitlist signups"
  ON public.waitlist_signups
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own waitlist signups"
  ON public.waitlist_signups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waitlist signups"
  ON public.waitlist_signups
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all waitlist signups"
  ON public.waitlist_signups
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_waitlist_settings_updated_at
  BEFORE UPDATE ON public.waitlist_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waitlist_signups_updated_at
  BEFORE UPDATE ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();