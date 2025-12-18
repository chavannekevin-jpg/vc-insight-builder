/**
 * Utility functions for safely handling tool data in memo components
 * Prevents React Error #310 (Objects are not valid as React children)
 */

// Safely convert any value to a string for rendering
export const safeText = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    // Handle objects with 'text' property (AI sometimes returns { text: "..." })
    if ('text' in val && typeof (val as { text: unknown }).text === 'string') {
      return (val as { text: string }).text;
    }
    console.warn('safeText received object instead of string:', val);
    return '';
  }
  // Fallback for any other type
  try {
    return String(val);
  } catch {
    return '';
  }
};

// Safely get an array, returning empty array if invalid
export const safeArray = <T>(arr: unknown): T[] => {
  if (Array.isArray(arr)) return arr as T[];
  if (arr === null || arr === undefined) return [];
  console.warn('safeArray received non-array:', arr);
  return [];
};

// Safely get a number, with default fallback
export const safeNumber = (val: unknown, defaultVal: number = 0): number => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return defaultVal;
};

// Check if data structure is valid for EditableTool
export const isValidEditableTool = <T>(data: unknown): data is { aiGenerated: T; userOverrides?: Partial<T>; dataSource?: string } => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  
  // Check for aiGenerated wrapper
  if ('aiGenerated' in d && d.aiGenerated !== null && typeof d.aiGenerated === 'object') {
    return true;
  }
  
  return false;
};

// Unwrap potentially double-wrapped data
export const unwrapToolData = <T>(data: unknown): T | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  
  // Check for double-wrapping: { aiGenerated: { aiGenerated: {...} } }
  if ('aiGenerated' in d && d.aiGenerated && typeof d.aiGenerated === 'object') {
    const inner = d.aiGenerated as Record<string, unknown>;
    if ('aiGenerated' in inner && inner.aiGenerated && typeof inner.aiGenerated === 'object') {
      // Double-wrapped - return the inner aiGenerated
      return inner.aiGenerated as T;
    }
    // Single wrapped - return the aiGenerated content
    return d.aiGenerated as T;
  }
  
  // Not wrapped - return as-is
  return data as T;
};

// Safely merge EditableTool data
export const mergeToolData = <T>(
  aiGenerated: T | undefined | null,
  userOverrides: Partial<T> | undefined | null
): T => {
  const base = (aiGenerated || {}) as T;
  const overrides = (userOverrides || {}) as Partial<T>;
  return { ...base, ...overrides };
};

// Validate that a SectionScore is properly structured
export const isValidSectionScore = (score: unknown): boolean => {
  if (!score || typeof score !== 'object') return false;
  const s = score as Record<string, unknown>;
  return typeof s.score === 'number' && typeof s.label === 'string';
};

// Validate that benchmarks array is properly structured
export const isValidBenchmarksArray = (benchmarks: unknown): boolean => {
  if (!Array.isArray(benchmarks)) return false;
  return benchmarks.length === 0 || benchmarks.every(b => 
    b && typeof b === 'object' && 'metric' in b
  );
};

// Validate Section90DayPlan structure
export const isValidActionPlan = (plan: unknown): boolean => {
  if (!plan || typeof plan !== 'object') return false;
  const p = plan as Record<string, unknown>;
  return Array.isArray(p.actions);
};

// Validate LeadInvestorRequirements structure
export const isValidLeadInvestorRequirements = (req: unknown): boolean => {
  if (!req || typeof req !== 'object') return false;
  const r = req as Record<string, unknown>;
  return Array.isArray(r.requirements) && Array.isArray(r.dealbreakers) && Array.isArray(r.wouldWantToSee);
};
