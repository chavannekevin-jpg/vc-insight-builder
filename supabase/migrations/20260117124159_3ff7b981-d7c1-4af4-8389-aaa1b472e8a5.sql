-- Add email and phone fields to global_contacts
ALTER TABLE public.global_contacts 
ADD COLUMN email VARCHAR(255) DEFAULT NULL,
ADD COLUMN phone VARCHAR(50) DEFAULT NULL;

-- Add local email/phone overrides to investor_contacts
ALTER TABLE public.investor_contacts
ADD COLUMN local_email VARCHAR(255) DEFAULT NULL,
ADD COLUMN local_phone VARCHAR(50) DEFAULT NULL;