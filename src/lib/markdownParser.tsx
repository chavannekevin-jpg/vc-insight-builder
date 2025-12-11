import React from "react";

/**
 * Parse markdown bold syntax (**text**) and convert to React strong elements
 */
export const parseMarkdownBold = (text: string): React.ReactNode[] => {
  if (!text) return [];
  
  // Guard against objects being passed instead of strings
  if (typeof text !== 'string') {
    console.warn('parseMarkdownBold received non-string:', text);
    return [String(text)];
  }
  
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the bold text
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

/**
 * Render text with markdown bold parsing
 * Use this as a drop-in replacement for direct text rendering
 */
export const renderMarkdownText = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Guard against objects being passed instead of strings
  if (typeof text !== 'string') {
    console.warn('renderMarkdownText received non-string:', text);
    return <>{String(text)}</>;
  }
  
  return <>{parseMarkdownBold(text)}</>;
};
