/**
 * Safely extracts a string from a value that might be a string or an object with a 'text' property.
 * This handles cases where AI-generated section titles might be returned as objects instead of strings.
 */
export const safeTitle = (title: unknown): string => {
  if (typeof title === 'string') return title;
  if (title && typeof title === 'object' && 'text' in title) {
    return String((title as { text: unknown }).text || '');
  }
  return String(title || '');
};
