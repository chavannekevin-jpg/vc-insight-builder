-- Create table for accelerator invites (admin-managed discount links)
CREATE TABLE public.accelerator_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  accelerator_name VARCHAR(255) NOT NULL,
  accelerator_slug VARCHAR(100) NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 100 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  uses INTEGER DEFAULT 0,
  max_uses INTEGER,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.accelerator_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can manage accelerator invites
CREATE POLICY "Admins can manage accelerator invites"
ON public.accelerator_invites
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Public can read active invites for validation
CREATE POLICY "Anyone can read active accelerator invites"
ON public.accelerator_invites
FOR SELECT
USING (is_active = true);

-- Add index for code lookups
CREATE INDEX idx_accelerator_invites_code ON public.accelerator_invites(code);
CREATE INDEX idx_accelerator_invites_slug ON public.accelerator_invites(accelerator_slug);