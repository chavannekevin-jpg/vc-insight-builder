-- Allow relationship_status to be nullable (contacts not in CRM have NULL status)
-- This is already nullable based on the schema, so we just need to ensure the default is NULL
COMMENT ON COLUMN investor_contacts.relationship_status IS 'NULL means contact is in directory only, not tracked in CRM. Set to prospect/warm/connected/invested when actively tracking.';