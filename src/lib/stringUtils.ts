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
