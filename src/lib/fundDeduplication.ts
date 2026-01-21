/**
 * Intelligent Fund Deduplication System
 * 
 * Handles duplicate detection, matching, and merging of investor/fund contacts
 * during bulk import operations.
 */

export interface ParsedContact {
  name: string;
  organization_name: string | null;
  entity_type: "investor" | "fund";
  city: string | null;
  country: string | null;
  city_lat: number | null;
  city_lng: number | null;
  email: string | null;
  linkedin_url: string | null;
  stages: string[];
  investment_focus: string[];
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  fund_size: number | null;
  thesis_keywords: string[];
  notable_investments: string[];
}

export interface ExistingContact extends ParsedContact {
  id: string;
  contributor_count?: number;
}

export type MatchType = 
  | 'new'           // No match found - create new record
  | 'exact_duplicate' // Same person at same org - skip
  | 'merge_candidate' // Same org, different/better data - merge
  | 'related';        // Same org, different person - keep both

export interface MatchResult {
  incoming: ParsedContact;
  matchType: MatchType;
  existingMatch: ExistingContact | null;
  confidence: number; // 0-100
  matchReasons: string[];
  mergedData?: ParsedContact; // Only for merge_candidate
}

export interface DeduplicationSummary {
  newContacts: MatchResult[];
  mergeCandidates: MatchResult[];
  exactDuplicates: MatchResult[];
  relatedContacts: MatchResult[];
  total: number;
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalize organization names for fuzzy matching
 * Strips common suffixes and noise words
 */
export function normalizeOrgName(name: string | null): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    // Remove common legal suffixes
    .replace(/\s+(vc|ventures|capital|partners|fund|gmbh|ltd|inc|llc|lp|llp|ag|sa|bv|co\.?|corp\.?|investment[s]?|management|advisors?|group)\s*/gi, ' ')
    // Remove special characters
    .replace(/[^\w\s]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize person names for matching
 */
export function normalizeName(name: string | null): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract domain from email
 */
export function extractEmailDomain(email: string | null): string | null {
  if (!email) return null;
  const match = email.toLowerCase().match(/@([^@]+)$/);
  return match ? match[1] : null;
}

/**
 * Normalize LinkedIn URL for comparison
 */
export function normalizeLinkedIn(url: string | null): string | null {
  if (!url) return null;
  
  // Extract the profile ID/slug from various LinkedIn URL formats
  const match = url.toLowerCase().match(/linkedin\.com\/(?:in|company)\/([^/?]+)/);
  return match ? match[1].replace(/\/$/, '') : null;
}

// ============================================================================
// MATCHING LOGIC
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate string similarity (0-100)
 */
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 100;
  
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  
  const distance = levenshteinDistance(a, b);
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Find the best match for an incoming contact among existing contacts
 */
export function findBestMatch(
  incoming: ParsedContact,
  existingContacts: ExistingContact[]
): MatchResult {
  const normalizedIncomingOrg = normalizeOrgName(incoming.organization_name);
  const normalizedIncomingName = normalizeName(incoming.name);
  const incomingEmailDomain = extractEmailDomain(incoming.email);
  const incomingLinkedIn = normalizeLinkedIn(incoming.linkedin_url);

  let bestMatch: ExistingContact | null = null;
  let bestScore = 0;
  let bestMatchType: MatchType = 'new';
  const matchReasons: string[] = [];

  for (const existing of existingContacts) {
    const normalizedExistingOrg = normalizeOrgName(existing.organization_name);
    const normalizedExistingName = normalizeName(existing.name);
    const existingEmailDomain = extractEmailDomain(existing.email);
    const existingLinkedIn = normalizeLinkedIn(existing.linkedin_url);

    let score = 0;
    const reasons: string[] = [];

    // 1. LinkedIn match is definitive
    if (incomingLinkedIn && existingLinkedIn && incomingLinkedIn === existingLinkedIn) {
      score = 100;
      reasons.push('Exact LinkedIn match');
    }

    // 2. Email match is very strong
    if (incoming.email && existing.email && incoming.email.toLowerCase() === existing.email.toLowerCase()) {
      score = Math.max(score, 95);
      reasons.push('Exact email match');
    }

    // 3. Same email domain + similar org = strong indicator
    if (incomingEmailDomain && existingEmailDomain && incomingEmailDomain === existingEmailDomain) {
      const orgSimilarity = stringSimilarity(normalizedIncomingOrg, normalizedExistingOrg);
      if (orgSimilarity > 70) {
        score = Math.max(score, 80 + Math.floor(orgSimilarity / 10));
        reasons.push(`Same email domain (${incomingEmailDomain}), similar org name`);
      }
    }

    // 4. Organization name matching (fuzzy)
    if (normalizedIncomingOrg && normalizedExistingOrg) {
      const orgSimilarity = stringSimilarity(normalizedIncomingOrg, normalizedExistingOrg);
      
      // Exact org match
      if (orgSimilarity === 100) {
        // Check if same person or different person
        const nameSimilarity = stringSimilarity(normalizedIncomingName, normalizedExistingName);
        
        if (nameSimilarity > 85) {
          // Same person at same org = exact duplicate
          score = Math.max(score, 95);
          reasons.push('Same organization, same person');
        } else if (nameSimilarity > 50) {
          // Similar names = might be duplicate with typo
          score = Math.max(score, 75);
          reasons.push('Same organization, similar name');
        } else {
          // Different person = related (team member)
          score = Math.max(score, 60);
          reasons.push('Same organization, different person');
        }
      } else if (orgSimilarity > 85) {
        // Very similar org name
        score = Math.max(score, 70);
        reasons.push(`Similar organization name (${orgSimilarity}% match)`);
      } else if (orgSimilarity > 70) {
        score = Math.max(score, 50);
        reasons.push(`Possible organization match (${orgSimilarity}%)`);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = existing;
      matchReasons.length = 0;
      matchReasons.push(...reasons);
    }
  }

  // Determine match type based on score and match characteristics
  if (bestScore >= 90) {
    // Check if it's truly the same person or a different team member
    if (bestMatch) {
      const nameMatch = stringSimilarity(
        normalizeName(incoming.name),
        normalizeName(bestMatch.name)
      );
      
      if (nameMatch > 85) {
        bestMatchType = 'exact_duplicate';
      } else if (nameMatch > 50) {
        bestMatchType = 'merge_candidate';
      } else {
        // Same org but clearly different person
        bestMatchType = 'related';
      }
    }
  } else if (bestScore >= 70) {
    bestMatchType = 'merge_candidate';
  } else if (bestScore >= 50) {
    // Low confidence - might be related
    const orgMatch = bestMatch ? stringSimilarity(
      normalizeOrgName(incoming.organization_name),
      normalizeOrgName(bestMatch.organization_name)
    ) : 0;
    
    bestMatchType = orgMatch > 85 ? 'related' : 'new';
  } else {
    bestMatchType = 'new';
  }

  return {
    incoming,
    matchType: bestMatchType,
    existingMatch: bestMatch,
    confidence: bestScore,
    matchReasons,
    mergedData: bestMatchType === 'merge_candidate' && bestMatch 
      ? mergeContacts(bestMatch, incoming) 
      : undefined,
  };
}

// ============================================================================
// MERGING LOGIC
// ============================================================================

type MergeStrategy = 'prefer_existing' | 'prefer_incoming' | 'prefer_larger' | 'merge_arrays' | 'prefer_non_null';

interface MergeRule {
  field: keyof ParsedContact;
  strategy: MergeStrategy;
}

const mergeRules: MergeRule[] = [
  { field: 'organization_name', strategy: 'prefer_non_null' },
  { field: 'name', strategy: 'prefer_non_null' },
  { field: 'entity_type', strategy: 'prefer_existing' },
  { field: 'fund_size', strategy: 'prefer_larger' },
  { field: 'stages', strategy: 'merge_arrays' },
  { field: 'investment_focus', strategy: 'merge_arrays' },
  { field: 'thesis_keywords', strategy: 'merge_arrays' },
  { field: 'notable_investments', strategy: 'merge_arrays' },
  { field: 'ticket_size_min', strategy: 'prefer_larger' },
  { field: 'ticket_size_max', strategy: 'prefer_larger' },
  { field: 'city', strategy: 'prefer_non_null' },
  { field: 'country', strategy: 'prefer_non_null' },
  { field: 'city_lat', strategy: 'prefer_non_null' },
  { field: 'city_lng', strategy: 'prefer_non_null' },
  { field: 'linkedin_url', strategy: 'prefer_non_null' },
  { field: 'email', strategy: 'prefer_non_null' },
];

/**
 * Merge arrays with deduplication (case-insensitive)
 */
function mergeArrays(existing: string[], incoming: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const item of [...(existing || []), ...(incoming || [])]) {
    const key = item.toLowerCase().trim();
    if (!seen.has(key) && item.trim()) {
      seen.add(key);
      result.push(item.trim());
    }
  }
  
  return result;
}

/**
 * Merge two contacts following the merge rules
 */
export function mergeContacts(
  existing: ExistingContact,
  incoming: ParsedContact
): ParsedContact {
  const merged: ParsedContact = { ...existing };

  for (const rule of mergeRules) {
    const existingValue = existing[rule.field];
    const incomingValue = incoming[rule.field];

    switch (rule.strategy) {
      case 'prefer_non_null':
        if (incomingValue !== null && incomingValue !== undefined && incomingValue !== '') {
          (merged as any)[rule.field] = incomingValue;
        } else if (existingValue !== null && existingValue !== undefined) {
          (merged as any)[rule.field] = existingValue;
        }
        break;

      case 'prefer_existing':
        // Keep existing value if it exists
        break;

      case 'prefer_incoming':
        if (incomingValue !== null && incomingValue !== undefined) {
          (merged as any)[rule.field] = incomingValue;
        }
        break;

      case 'prefer_larger':
        if (typeof existingValue === 'number' && typeof incomingValue === 'number') {
          (merged as any)[rule.field] = Math.max(existingValue, incomingValue);
        } else if (incomingValue !== null && existingValue === null) {
          (merged as any)[rule.field] = incomingValue;
        }
        break;

      case 'merge_arrays':
        if (Array.isArray(existingValue) || Array.isArray(incomingValue)) {
          (merged as any)[rule.field] = mergeArrays(
            existingValue as string[] || [],
            incomingValue as string[] || []
          );
        }
        break;
    }
  }

  return merged;
}

// ============================================================================
// MAIN DEDUPLICATION FUNCTION
// ============================================================================

/**
 * Process a batch of incoming contacts against existing contacts
 * Returns categorized results for review
 */
export function deduplicateContacts(
  incomingContacts: ParsedContact[],
  existingContacts: ExistingContact[]
): DeduplicationSummary {
  const results: MatchResult[] = incomingContacts.map(incoming => 
    findBestMatch(incoming, existingContacts)
  );

  return {
    newContacts: results.filter(r => r.matchType === 'new'),
    mergeCandidates: results.filter(r => r.matchType === 'merge_candidate'),
    exactDuplicates: results.filter(r => r.matchType === 'exact_duplicate'),
    relatedContacts: results.filter(r => r.matchType === 'related'),
    total: results.length,
  };
}

/**
 * Get a human-readable summary of the deduplication results
 */
export function getDeduplicationSummary(summary: DeduplicationSummary): string {
  const parts: string[] = [];
  
  if (summary.newContacts.length > 0) {
    parts.push(`${summary.newContacts.length} new`);
  }
  if (summary.mergeCandidates.length > 0) {
    parts.push(`${summary.mergeCandidates.length} to merge`);
  }
  if (summary.exactDuplicates.length > 0) {
    parts.push(`${summary.exactDuplicates.length} duplicates`);
  }
  if (summary.relatedContacts.length > 0) {
    parts.push(`${summary.relatedContacts.length} team members`);
  }
  
  return parts.join(', ');
}
