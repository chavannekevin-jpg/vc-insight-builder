-- Create pricing_settings table
CREATE TABLE public.pricing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view pricing settings (needed for checkout/pricing pages)
CREATE POLICY "Anyone can view pricing settings" 
ON public.pricing_settings 
FOR SELECT 
USING (true);

-- Only admins can manage pricing settings
CREATE POLICY "Admins can manage pricing settings" 
ON public.pricing_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_pricing_settings_updated_at
BEFORE UPDATE ON public.pricing_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing data
INSERT INTO public.pricing_settings (setting_key, setting_value) VALUES 
('memo_pricing', '{"base_price": 59.99, "currency": "EUR", "early_access_discount": 50, "early_access_enabled": true, "original_price": 119.99, "show_original_price": true}'::jsonb),
('network_pricing', '{"base_price": 159.99, "currency": "EUR"}'::jsonb);