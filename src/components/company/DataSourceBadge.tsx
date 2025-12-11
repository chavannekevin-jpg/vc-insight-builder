import { Badge } from "@/components/ui/badge";
import { User, FileText, Upload, Calculator, Sparkles, RefreshCw } from "lucide-react";

interface DataSourceBadgeProps {
  source: string | null | undefined;
  className?: string;
}

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  manual: {
    label: "You wrote",
    icon: <User className="w-3 h-3" />,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  },
  memo_sync: {
    label: "From Memo",
    icon: <FileText className="w-3 h-3" />,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  deck_import: {
    label: "From Deck",
    icon: <Upload className="w-3 h-3" />,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20"
  },
  raise_calculator: {
    label: "Raise Calculator",
    icon: <Calculator className="w-3 h-3" />,
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20"
  },
  valuation_calculator: {
    label: "Valuation Calc",
    icon: <Calculator className="w-3 h-3" />,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  },
  enhanced: {
    label: "AI Enhanced",
    icon: <Sparkles className="w-3 h-3" />,
    className: "bg-pink-500/10 text-pink-600 border-pink-500/20"
  },
  auto_sync: {
    label: "Auto-synced",
    icon: <RefreshCw className="w-3 h-3" />,
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20"
  }
};

export function DataSourceBadge({ source, className = "" }: DataSourceBadgeProps) {
  if (!source) return null;
  
  const config = SOURCE_CONFIG[source] || {
    label: source,
    icon: <FileText className="w-3 h-3" />,
    className: "bg-muted text-muted-foreground"
  };

  return (
    <Badge 
      variant="outline" 
      className={`text-xs gap-1 px-2 py-0.5 font-normal ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
