import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Win98ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary";
}

const Win98Button = forwardRef<HTMLButtonElement, Win98ButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "win98-border px-6 py-3 font-retro text-xl bg-card hover:bg-card/90 active:win98-border-inset transition-all",
          variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "secondary" && "bg-accent text-accent-foreground hover:bg-accent/90",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Win98Button.displayName = "Win98Button";

export { Win98Button };
