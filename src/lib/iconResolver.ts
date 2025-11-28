import * as LucideIcons from "lucide-react";

/**
 * Resolves a Lucide icon name string to its React component
 * Falls back to Circle icon if the name is invalid
 */
export const resolveIcon = (iconName: string): React.ComponentType<any> => {
  const icon = (LucideIcons as any)[iconName];
  return icon || LucideIcons.Circle;
};

/**
 * Get all available Lucide icon names for use in dropdowns/pickers
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(LucideIcons).filter(
    (key) => key !== "createLucideIcon" && key !== "default"
  );
};
