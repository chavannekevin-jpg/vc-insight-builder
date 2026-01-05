-- Create email_templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'manual',
  automation_key TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the abandonment email template
INSERT INTO public.email_templates (name, subject, content, template_type, automation_key) VALUES
('24h Abandonment Email', 'Your VC verdict is waiting (expires soon)', '<div style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a; margin-bottom: 20px;">Hey there 👋</h2>
  
  <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
    I noticed you started building your VC-ready profile on VC Brain but haven''t unlocked your full analysis yet.
  </p>
  
  <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
    Your free verdict showed some areas VCs would flag — but the <strong>full memo</strong> shows you exactly how to fix them before your next pitch.
  </p>
  
  <p style="color: #333; line-height: 1.6; margin-bottom: 12px;">
    Here''s what other founders discovered in their full analysis:
  </p>
  
  <ul style="color: #333; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
    <li>The exact phrases that made VCs tune out</li>
    <li>Which metrics were missing (and how to add them)</li>
    <li>A 90-day action plan to become fundable</li>
  </ul>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://vc-brain.com/" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Unlock Your Full Analysis →
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 24px;">
    P.S. Your verdict data expires after 7 days. Don''t let that research go to waste!
  </p>
  
  <p style="color: #333; margin-top: 24px;">
    — Kev
  </p>
</div>', 'automated', 'abandonment_24h'),

-- Seed manual templates
('Welcome Email', 'Welcome to VC Brain! 🚀', '<div style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a; margin-bottom: 20px;">Welcome to VC Brain! 🚀</h2>
  <p style="color: #333; line-height: 1.6;">Thanks for joining! We''re excited to help you become VC-ready.</p>
  <p style="color: #333; line-height: 1.6; margin-top: 16px;">— The VC Brain Team</p>
</div>', 'manual', NULL),

('Happy New Year 2026', '🎉 Happy New Year from VC Brain!', '<div style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a; margin-bottom: 20px;">Happy New Year! 🎉</h2>
  <p style="color: #333; line-height: 1.6;">Wishing you an amazing 2026 filled with successful fundraising!</p>
  <p style="color: #333; line-height: 1.6; margin-top: 16px;">— The VC Brain Team</p>
</div>', 'manual', NULL),

('Discount Announcement', '🔥 Special offer just for you!', '<div style="font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a; margin-bottom: 20px;">Special Offer! 🔥</h2>
  <p style="color: #333; line-height: 1.6;">For a limited time, get 20% off your VC Brain memo!</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="https://vc-brain.com/" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Claim Your Discount</a>
  </div>
  <p style="color: #333; line-height: 1.6; margin-top: 16px;">— The VC Brain Team</p>
</div>', 'manual', NULL);