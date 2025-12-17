/**
 * Validates that a companyId is a valid UUID format.
 * Returns false for null, undefined, empty strings, or literal "null"/"undefined" strings.
 */
export function isValidCompanyId(companyId: string | null | undefined): companyId is string {
  if (!companyId) return false;
  if (companyId === 'null' || companyId === 'undefined') return false;
  
  // UUID v4 pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(companyId);
}
