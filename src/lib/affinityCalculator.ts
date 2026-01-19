/**
 * Shared affinity calculation logic for matching investors
 * Used across Contact Directory, Profile Modal, and Suggestions
 */

export interface AffinityReason {
  type: "location" | "stage" | "sector" | "geo";
  label: string;
  icon?: string;
}

export interface AffinityResult {
  score: number;
  reasons: AffinityReason[];
  percentage: number;
}

export interface UserProfile {
  city?: string | null;
  preferred_stages?: string[] | null;
  primary_sectors?: string[] | null;
  geographic_focus?: string[] | null;
}

export interface ContactForAffinity {
  city?: string | null;
  stages?: string[] | null;
  investment_focus?: string[] | null;
}

// City to region mapping
const CITY_REGION_MAP: Record<string, string> = {
  stockholm: "Nordic", copenhagen: "Nordic", oslo: "Nordic", helsinki: "Nordic",
  berlin: "DACH", munich: "DACH", zurich: "DACH", vienna: "DACH", frankfurt: "DACH",
  london: "UK & Ireland", dublin: "UK & Ireland", edinburgh: "UK & Ireland",
  amsterdam: "Benelux", brussels: "Benelux", rotterdam: "Benelux",
  paris: "France", lyon: "France",
  tallinn: "Baltics", riga: "Baltics", vilnius: "Baltics",
  barcelona: "Southern Europe", madrid: "Southern Europe", lisbon: "Southern Europe", 
  milan: "Southern Europe", rome: "Southern Europe",
  warsaw: "CEE", prague: "CEE", budapest: "CEE", bucharest: "CEE",
  "new york": "North America", "san francisco": "North America", boston: "North America",
  "los angeles": "North America", miami: "North America", toronto: "North America",
  singapore: "Asia Pacific", tokyo: "Asia Pacific", seoul: "Asia Pacific",
  "hong kong": "Asia Pacific", sydney: "Asia Pacific", mumbai: "Asia Pacific",
  dubai: "Middle East", "tel aviv": "Middle East",
};

const EUROPEAN_REGIONS = ["Nordic", "DACH", "UK & Ireland", "Benelux", "France", "Baltics", "Southern Europe", "CEE"];

/**
 * Get the region from a city name
 */
export const getRegionFromCity = (city: string | null | undefined): string | null => {
  if (!city) return null;
  const cityLower = city.toLowerCase().trim();
  return CITY_REGION_MAP[cityLower] || null;
};

/**
 * Check if a contact's region matches the user's geographic focus
 */
export const matchesRegion = (contactRegion: string, userRegion: string): boolean => {
  if (contactRegion === userRegion) return true;
  if (userRegion === "Europe") {
    return EUROPEAN_REGIONS.includes(contactRegion);
  }
  return false;
};

/**
 * Calculate affinity score between a user profile and a contact
 * Returns a score (0-100) and list of matching reasons
 */
export const calculateAffinity = (
  userProfile: UserProfile | null | undefined,
  contact: ContactForAffinity | null | undefined
): AffinityResult => {
  if (!userProfile || !contact) {
    return { score: 0, reasons: [], percentage: 0 };
  }

  const reasons: AffinityReason[] = [];
  let score = 0;
  const maxScore = 100; // Normalize to percentage

  // Location affinity (30 points max)
  if (userProfile.city && contact.city) {
    if (contact.city.toLowerCase().trim() === userProfile.city.toLowerCase().trim()) {
      score += 30;
      reasons.push({ type: "location", label: `Same city (${contact.city})` });
    }
  }

  // Stage overlap (25 points max - 12.5 per match, max 2)
  const userStages = userProfile.preferred_stages || [];
  const contactStages = contact.stages || [];
  const stageOverlap = userStages.filter((s: string) => contactStages.includes(s));
  if (stageOverlap.length > 0) {
    score += Math.min(stageOverlap.length * 12.5, 25);
    reasons.push({ type: "stage", label: stageOverlap.slice(0, 2).join(", ") });
  }

  // Sector/Focus overlap (35 points max - 11.6 per match, max 3)
  const userSectors = userProfile.primary_sectors || [];
  const contactFocus = contact.investment_focus || [];
  const sectorOverlap = userSectors.filter((s: string) =>
    contactFocus.some(
      (f: string) => 
        f.toLowerCase().includes(s.toLowerCase()) || 
        s.toLowerCase().includes(f.toLowerCase())
    )
  );
  if (sectorOverlap.length > 0) {
    score += Math.min(sectorOverlap.length * 11.67, 35);
    reasons.push({ type: "sector", label: sectorOverlap.slice(0, 2).join(", ") });
  }

  // Geographic focus overlap (10 points)
  const userGeo = userProfile.geographic_focus || [];
  const contactRegion = getRegionFromCity(contact.city);
  if (contactRegion && userGeo.some((g: string) => matchesRegion(contactRegion, g))) {
    score += 10;
    reasons.push({ type: "geo", label: `${contactRegion} focus` });
  }

  // Normalize to 0-100 percentage
  const percentage = Math.min(Math.round(score), maxScore);

  return { score, reasons, percentage };
};

/**
 * Get color class for match percentage badge
 */
export const getMatchColor = (percentage: number): { bg: string; text: string; border: string } => {
  if (percentage >= 70) {
    return { 
      bg: "bg-green-500/10", 
      text: "text-green-600 dark:text-green-400", 
      border: "border-green-500/20" 
    };
  }
  if (percentage >= 40) {
    return { 
      bg: "bg-yellow-500/10", 
      text: "text-yellow-600 dark:text-yellow-400", 
      border: "border-yellow-500/20" 
    };
  }
  return { 
    bg: "bg-muted", 
    text: "text-muted-foreground", 
    border: "border-muted" 
  };
};

/**
 * Get icon name for affinity reason type
 */
export const getAffinityIconName = (type: AffinityReason["type"]): string => {
  switch (type) {
    case "location": return "MapPin";
    case "stage": return "Target";
    case "sector": return "Briefcase";
    case "geo": return "Globe";
    default: return "Circle";
  }
};
