import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { WorkshopTemplate, WorkshopResponse } from "@/hooks/useWorkshopData";

interface WorkshopProgressProps {
  templates: WorkshopTemplate[];
  responses: WorkshopResponse[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export function WorkshopProgress({
  templates,
  responses,
  currentStep,
  onStepClick,
}: WorkshopProgressProps) {
  const isCompleted = (sectionKey: string) => {
    const response = responses.find(r => r.section_key === sectionKey);
    return response?.completed_at !== null;
  };

  return (
    <div className="w-full">
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress line background */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -translate-y-1/2" />
          
          {/* Progress line fill */}
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
            style={{ 
              width: `${(currentStep / (templates.length - 1)) * 100}%` 
            }}
          />
          
          {templates.map((template, index) => {
            const completed = isCompleted(template.section_key);
            const isCurrent = index === currentStep;
            const isPast = index < currentStep;
            
            return (
              <button
                key={template.section_key}
                onClick={() => onStepClick(index)}
                className={cn(
                  "relative z-10 flex flex-col items-center transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                    "border-2 font-semibold text-sm",
                    completed && "bg-primary border-primary text-primary-foreground",
                    isCurrent && !completed && "bg-primary/20 border-primary text-primary",
                    isPast && !completed && "bg-muted border-border text-muted-foreground",
                    !isCurrent && !isPast && !completed && "bg-background border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium max-w-[80px] text-center leading-tight",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {template.section_title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            Step {currentStep + 1} of {templates.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {templates[currentStep]?.section_title}
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / templates.length) * 100}%` }}
          />
        </div>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-2">
          {templates.map((template, index) => {
            const completed = isCompleted(template.section_key);
            const isCurrent = index === currentStep;
            
            return (
              <button
                key={template.section_key}
                onClick={() => onStepClick(index)}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  completed && "bg-primary text-primary-foreground",
                  isCurrent && !completed && "bg-primary/20 text-primary ring-2 ring-primary",
                  !isCurrent && !completed && "bg-muted text-muted-foreground"
                )}
              >
                {completed ? <Check className="w-4 h-4" /> : index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
