import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ModernRetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary";
}

const ModernRetroButton = forwardRef<HTMLButtonElement, ModernRetroButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-8 py-4 font-sans font-semibold text-base rounded-lg border-2 transition-all duration-200",
          "hover:translate-y-[-2px] active:translate-y-0",
          variant === "default" && "bg-card border-border hover:border-foreground shadow-[4px_4px_0_hsl(var(--retro-shadow))] hover:shadow-[6px_6px_0_hsl(var(--retro-shadow))]",
          variant === "primary" && "bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-[4px_4px_0_hsl(var(--retro-teal))] hover:shadow-[6px_6px_0_hsl(var(--retro-teal))]",
          variant === "secondary" && "bg-accent text-accent-foreground border-accent hover:bg-accent/90 shadow-[4px_4px_0_hsl(var(--retro-blue))] hover:shadow-[6px_6px_0_hsl(var(--retro-blue))]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ModernRetroButton.displayName = "ModernRetroButton";

export { ModernRetroButton };
