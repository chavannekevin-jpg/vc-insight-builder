import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Win98StartButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
  size?: "default" | "large";
}

const Win98StartButton = forwardRef<HTMLButtonElement, Win98StartButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "win98-button font-sans font-medium transition-all",
          size === "large" && "px-8 py-3 text-base",
          variant === "primary" && "bg-win98-teal text-white border-t-[hsl(180_50%_65%)] border-l-[hsl(180_50%_65%)] border-b-[hsl(180_50%_35%)] border-r-[hsl(180_50%_35%)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Win98StartButton.displayName = "Win98StartButton";

export { Win98StartButton };
