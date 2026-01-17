-- Add linked_investor_id to global_contacts to link to actual platform users
ALTER TABLE public.global_contacts 
ADD COLUMN IF NOT EXISTS linked_investor_id uuid REFERENCES public.investor_profiles(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_global_contacts_linked_investor ON public.global_contacts(linked_investor_id);
CREATE INDEX IF NOT EXISTS idx_global_contacts_email ON public.global_contacts(email);
CREATE INDEX IF NOT EXISTS idx_global_contacts_organization ON public.global_contacts(organization_name);

-- Create a function to auto-link contacts when an investor signs up
CREATE OR REPLACE FUNCTION public.link_investor_to_matching_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the user's email from profiles
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE id = NEW.id;
  
  -- Link any global_contacts that match this email
  IF user_email IS NOT NULL THEN
    UPDATE public.global_contacts
    SET linked_investor_id = NEW.id,
        updated_at = now()
    WHERE LOWER(email) = LOWER(user_email)
      AND linked_investor_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run on investor profile creation
DROP TRIGGER IF EXISTS on_investor_profile_created ON public.investor_profiles;
CREATE TRIGGER on_investor_profile_created
  AFTER INSERT ON public.investor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.link_investor_to_matching_contacts();

-- Also link existing contacts that match current investors by email
UPDATE public.global_contacts gc
SET linked_investor_id = ip.id
FROM public.investor_profiles ip
JOIN public.profiles p ON p.id = ip.id
WHERE LOWER(gc.email) = LOWER(p.email)
  AND gc.linked_investor_id IS NULL
  AND gc.email IS NOT NULL;