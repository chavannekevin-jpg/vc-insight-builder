-- Add profile_slug to investor_profiles for clean public URLs
ALTER TABLE public.investor_profiles 
ADD COLUMN IF NOT EXISTS profile_slug TEXT UNIQUE;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_investor_profiles_slug ON public.investor_profiles(profile_slug);

-- Function to generate a slug from full name
CREATE OR REPLACE FUNCTION public.generate_profile_slug(full_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(regexp_replace(full_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure it's not empty
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'investor';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.investor_profiles WHERE profile_slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$;

-- Trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION public.set_profile_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.profile_slug IS NULL OR NEW.profile_slug = '' THEN
        NEW.profile_slug := generate_profile_slug(NEW.full_name);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profile_slug_trigger ON public.investor_profiles;
CREATE TRIGGER set_profile_slug_trigger
    BEFORE INSERT ON public.investor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_profile_slug();

-- Backfill existing profiles with slugs
UPDATE public.investor_profiles 
SET profile_slug = generate_profile_slug(full_name)
WHERE profile_slug IS NULL;