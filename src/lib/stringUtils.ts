import type { MemoStructuredContent, MemoStructuredSection } from "@/types/memo";

/**
 * Safe string helpers.
 *
 * We occasionally receive AI-generated fields as objects (e.g. { text: "..." })
 * instead of raw strings. These helpers normalize those values to prevent
 * runtime crashes (e.g. `.toLowerCase is not a function`).
 */
export const safeStr = (val: unknown, context?: string): string => {
  if (typeof val === "string") return val;
  if (val === null || val === undefined) return "";

  if (typeof val === "number" || typeof val === "boolean") return String(val);

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if ("text" in obj) return safeStr(obj.text, context);
    if ("value" in obj) return safeStr(obj.value, context);

    if (context) {
      // Warn but never crash the UI.
      console.warn(`[safeStr] Expected string in ${context}, got object`, val);
    }
    return "";
  }

  if (context) {
    console.warn(`[safeStr] Expected string in ${context}, got ${typeof val}`, val);
  }
  return "";
};

export const safeLower = (val: unknown, context?: string): string =>
  safeStr(val, context).toLowerCase();

/**
 * Safely extracts a string from a value that might be a string or an object with a 'text' property.
 * This handles cases where AI-generated section titles might be returned as objects instead of strings.
 */
export const safeTitle = (title: unknown): string => safeStr(title, "safeTitle");

/**
 * Deep sanitize memo content to ensure all string fields are actual strings.
 * This prevents "p.toLowerCase is not a function" errors when AI returns objects.
 */
export const sanitizeMemoContent = (content: unknown): MemoStructuredContent | null => {
  if (!content || typeof content !== 'object') {
    console.warn('[sanitizeMemoContent] Invalid content:', typeof content);
    return null;
  }

  const raw = content as Record<string, unknown>;
  
  // Helper for string arrays
  const sanitizeStringArray = (arr: unknown, context?: string): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item, i) => safeStr(item, context ? `${context}[${i}]` : undefined));
  };
  
  // Sanitize paragraphs - returns MemoParagraph[]
  const sanitizeParagraphs = (paragraphs: unknown, sectionIdx: number) => {
    if (!Array.isArray(paragraphs)) return [];
    return paragraphs.map((p, pIdx) => {
      if (!p || typeof p !== 'object') return { text: '' };
      const para = p as Record<string, unknown>;
      
      const validEmphasis = ["high", "medium", "normal", "hero", "narrative", "quote"];
      const rawEmphasis = para.emphasis ? safeStr(para.emphasis) : undefined;
      const emphasis = rawEmphasis && validEmphasis.includes(rawEmphasis) 
        ? (rawEmphasis as "high" | "medium" | "normal" | "hero" | "narrative" | "quote")
        : undefined;
      
      return {
        text: safeStr(para.text, `section[${sectionIdx}].paragraph[${pIdx}].text`),
        emphasis,
      };
    });
  };
  
  // Sanitize highlights - returns MemoHighlight[]
  const sanitizeHighlights = (highlights: unknown) => {
    if (!Array.isArray(highlights)) return [];
    return highlights.map((h, i) => {
      if (!h || typeof h !== 'object') {
        // Handle case where highlight is just a string
        if (typeof h === 'string') {
          return { metric: h, label: '' };
        }
        return { metric: '', label: '' };
      }
      const highlight = h as Record<string, unknown>;
      return {
        metric: safeStr(highlight.metric, `highlight[${i}].metric`),
        label: safeStr(highlight.label, `highlight[${i}].label`),
      };
    });
  };

  // Sanitize sections array
  const sanitizeSections = (sections: unknown): MemoStructuredSection[] => {
    if (!Array.isArray(sections)) return [];
    
    return sections.map((section, idx) => {
      if (!section || typeof section !== 'object') {
        console.warn(`[sanitizeMemoContent] Invalid section at index ${idx}`);
        return { title: '' };
      }
      
      const s = section as Record<string, unknown>;
      
      // Sanitize title
      const title = safeStr(s.title, `section[${idx}].title`);
      if (typeof s.title !== 'string' && s.title) {
        console.warn(`[sanitizeMemoContent] Normalized section title from:`, typeof s.title, s.title);
      }
      
      // Build sanitized section
      const sanitizedSection: MemoStructuredSection = {
        title,
        paragraphs: sanitizeParagraphs(s.paragraphs, idx),
        highlights: sanitizeHighlights(s.highlights),
        keyPoints: sanitizeStringArray(s.keyPoints, `section[${idx}].keyPoints`),
      };
      
      // Handle narrative if present
      if (s.narrative && typeof s.narrative === 'object') {
        const n = s.narrative as Record<string, unknown>;
        sanitizedSection.narrative = {
          paragraphs: sanitizeParagraphs(n.paragraphs, idx),
          highlights: sanitizeHighlights(n.highlights),
          keyPoints: sanitizeStringArray(n.keyPoints, `section[${idx}].narrative.keyPoints`),
        };
      }
      
      // Handle vcReflection if present (correct field name per types)
      if (s.vcReflection && typeof s.vcReflection === 'object') {
        const vr = s.vcReflection as Record<string, unknown>;
        sanitizedSection.vcReflection = {
          analysis: safeStr(vr.analysis),
          questions: Array.isArray(vr.questions) ? vr.questions.map((q, i) => {
            if (typeof q === 'string') return safeStr(q);
            if (q && typeof q === 'object') {
              const qObj = q as Record<string, unknown>;
              return {
                question: safeStr(qObj.question),
                vcRationale: safeStr(qObj.vcRationale),
                whatToPrepare: safeStr(qObj.whatToPrepare),
              };
            }
            return safeStr(q, `vcReflection.questions[${i}]`);
          }) : [],
          benchmarking: vr.benchmarking ? safeStr(vr.benchmarking) : undefined,
          conclusion: safeStr(vr.conclusion),
        };
      }
      
      return sanitizedSection;
    });
  };
  
  // Sanitize vcQuickTake
  const sanitizeVCQuickTake = (quickTake: unknown) => {
    if (!quickTake || typeof quickTake !== 'object') return undefined;
    const qt = quickTake as Record<string, unknown>;
    
    const rawReadinessLevel = safeStr(qt.readinessLevel).toUpperCase();
    const validLevels = ["LOW", "MEDIUM", "HIGH"] as const;
    const readinessLevel = validLevels.includes(rawReadinessLevel as typeof validLevels[number]) 
      ? (rawReadinessLevel as "LOW" | "MEDIUM" | "HIGH")
      : "MEDIUM"; // Default to MEDIUM if invalid
    
    return {
      verdict: safeStr(qt.verdict),
      concerns: sanitizeStringArray(qt.concerns, "vcQuickTake.concerns"),
      strengths: sanitizeStringArray(qt.strengths, "vcQuickTake.strengths"),
      readinessLevel,
      readinessRationale: safeStr(qt.readinessRationale),
    };
  };
  
  const result: MemoStructuredContent = {
    sections: sanitizeSections(raw.sections),
    vcQuickTake: sanitizeVCQuickTake(raw.vcQuickTake),
  };
  
  return result;
};
