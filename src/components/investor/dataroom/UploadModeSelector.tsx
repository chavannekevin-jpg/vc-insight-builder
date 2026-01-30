import { FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadModeSelectorProps {
  mode: 'deck' | 'dataroom' | null;
  onSelect: (mode: 'deck' | 'dataroom') => void;
}

export function UploadModeSelector({ mode, onSelect }: UploadModeSelectorProps) {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm">
        <h2 className="text-xl font-bold tracking-tight">Upload & Analyse</h2>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Choose how you'd like to review this investment opportunity.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Select an analysis mode based on what materials you have.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Deck Review */}
            <button
              onClick={() => onSelect('deck')}
              className={cn(
                "group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left",
                "hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg",
                mode === 'deck' 
                  ? "border-primary bg-primary/5 shadow-lg" 
                  : "border-border bg-card"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                mode === 'deck' ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
              )}>
                <FileText className={cn(
                  "w-6 h-6 transition-colors",
                  mode === 'deck' ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Quick Deck Review</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a single pitch deck for a fast snapshot analysis. Get key metrics, 
                deal quality score, and quick debrief in seconds.
              </p>
              
              <div className="mt-auto">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                  ~15-30 seconds
                </span>
              </div>
            </button>

            {/* Full Company Analysis */}
            <button
              onClick={() => onSelect('dataroom')}
              className={cn(
                "group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left",
                "hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg",
                mode === 'dataroom' 
                  ? "border-primary bg-primary/5 shadow-lg" 
                  : "border-border bg-card"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                mode === 'dataroom' ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
              )}>
                <FolderOpen className={cn(
                  "w-6 h-6 transition-colors",
                  mode === 'dataroom' ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Full Company Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a data room with multiple documents: deck, financials, cap table, 
                and more. Get a comprehensive due diligence memo with AI chat.
              </p>
              
              <div className="mt-auto flex gap-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                  Multi-document
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  + AI Chat
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
