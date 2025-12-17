import { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentBlockProps {
  children: ReactNode;
  className?: string;
}

export const ContentBlock = ({ children, className }: ContentBlockProps) => (
  <div className={cn("prose prose-lg max-w-none", className)}>
    {children}
  </div>
);

interface CalloutProps {
  type?: "warning" | "success" | "danger" | "info";
  children: ReactNode;
}

export const Callout = ({ type = "info", children }: CalloutProps) => {
  const styles = {
    warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-500",
    success: "bg-green-500/10 border-green-500/50 text-green-500",
    danger: "bg-red-500/10 border-red-500/50 text-red-500",
    info: "bg-primary/10 border-primary/50 text-primary",
  };

  const icons = {
    warning: AlertTriangle,
    success: CheckCircle2,
    danger: XCircle,
    info: AlertTriangle,
  };

  const Icon = icons[type];

  return (
    <div className={cn("border-l-4 p-4 rounded-r-lg my-6", styles[type])}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

interface ComparisonTableProps {
  good: string[];
  bad: string[];
}

export const ComparisonTable = ({ good, bad }: ComparisonTableProps) => (
  <div className="grid md:grid-cols-2 gap-4 my-8">
    <div className="border border-green-500/30 rounded-lg p-6 bg-green-500/5">
      <h4 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5" />
        What Works
      </h4>
      <ul className="space-y-2">
        {good.map((item, i) => (
          <li key={i} className="text-sm text-foreground flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="border border-red-500/30 rounded-lg p-6 bg-red-500/5">
      <h4 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
        <XCircle className="w-5 h-5" />
        What Fails
      </h4>
      <ul className="space-y-2">
        {bad.map((item, i) => (
          <li key={i} className="text-sm text-foreground flex items-start gap-2">
            <span className="text-red-500 mt-1">✗</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

interface ChecklistProps {
  items: string[];
}

export const Checklist = ({ items }: ChecklistProps) => (
  <div className="bg-card border border-border rounded-lg p-6 my-8">
    <h4 className="text-lg font-bold text-foreground mb-4">Checklist</h4>
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-foreground">
          <input type="checkbox" className="mt-1 w-4 h-4" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

interface ConversionBannerProps {
  message: string;
  buttonText?: string;
}

export const ConversionBanner = ({ message, buttonText = "Get Your Analysis" }: ConversionBannerProps) => (
  <div className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg p-6 my-8 text-center">
    <p className="text-foreground font-semibold mb-4">{message}</p>
    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-bold transition-colors">
      {buttonText}
    </button>
  </div>
);
