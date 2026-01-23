import { useState, useEffect } from "react";
import { Pencil, RotateCcw, Check, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditableToolCardProps {
  title: string;
  icon: React.ReactNode;
  dataSource: "ai-complete" | "ai-partial" | "user-input";
  inputGuidance?: string[];
  children: React.ReactNode;
  isEditing?: boolean;
  onEditToggle?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  className?: string;
  accentColor?: string;
  hideHeader?: boolean;
}

export const EditableToolCard = ({
  title,
  icon,
  dataSource,
  inputGuidance,
  children,
  isEditing = false,
  onEditToggle,
  onSave,
  onReset,
  className,
  accentColor = "primary",
  hideHeader = false
}: EditableToolCardProps) => {
  const [showGuidance, setShowGuidance] = useState(false);

  const getDataSourceBadge = () => {
    switch (dataSource) {
      case "ai-complete":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </span>
        );
      case "ai-partial":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            Needs Input
          </span>
        );
      case "user-input":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Check className="w-3 h-3" />
            Your Data
          </span>
        );
    }
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200",
      isEditing && "ring-2 ring-primary/50 border-primary/30",
      className
    )}>
      {/* Header - can be hidden when used inside modal with its own header */}
      {!hideHeader && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              `bg-${accentColor}/10`
            )}>
              {icon}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{title}</h4>
              <div className="mt-1">{getDataSourceBadge()}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onReset && dataSource === "user-input" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            {onEditToggle && (
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={isEditing ? onSave : onEditToggle}
              >
                {isEditing ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Input Guidance */}
      {inputGuidance && inputGuidance.length > 0 && (dataSource === "ai-partial" || isEditing) && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <button 
            onClick={() => setShowGuidance(!showGuidance)}
            className="flex items-center gap-2 text-sm font-medium text-amber-600 w-full text-left"
          >
            <AlertCircle className="w-4 h-4" />
            {showGuidance ? "Hide" : "Show"} input guidance
          </button>
          {showGuidance && (
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {inputGuidance.map((guidance, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {guidance}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "transition-opacity duration-200",
        isEditing && "opacity-90"
      )}>
        {children}
      </div>
    </div>
  );
};
