import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WorkshopTemplate, WorkshopResponse } from "@/hooks/useWorkshopData";
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkshopPainMeter } from "./WorkshopPainMeter";
import { WorkshopEvidenceChecklist } from "./WorkshopEvidenceChecklist";
import { WorkshopDiscoveryPrompt } from "./WorkshopDiscoveryPrompt";
import { WorkshopBlindSpotWarning } from "./WorkshopBlindSpotWarning";

interface WorkshopSectionProps {
  template: WorkshopTemplate;
  response: WorkshopResponse | undefined;
  stepNumber: number;
  totalSteps: number;
  onSave: (answer: string) => Promise<void>;
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSaving: boolean;
  allComplete: boolean;
  isCompiling: boolean;
}

export function WorkshopSection({
  template,
  response,
  stepNumber,
  totalSteps,
  onSave,
  onPrevious,
  onNext,
  isFirst,
  isLast,
  isSaving,
  allComplete,
  isCompiling,
}: WorkshopSectionProps) {
  const [answer, setAnswer] = useState(response?.answer || "");
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when response changes
  useEffect(() => {
    setAnswer(response?.answer || "");
    setHasChanges(false);
  }, [response?.answer, template.section_key]);

  const handleChange = (value: string) => {
    setAnswer(value);
    setHasChanges(value !== (response?.answer || ""));
  };

  const handleAddToResponse = (addition: string) => {
    const newAnswer = answer + addition;
    setAnswer(newAnswer);
    setHasChanges(true);
  };

  const handleBlur = async () => {
    if (hasChanges && answer.trim().length > 0) {
      await onSave(answer);
      setHasChanges(false);
    }
  };

  const handleNext = async () => {
    if (hasChanges && answer.trim().length > 0) {
      await onSave(answer);
    }
    onNext();
  };

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Input */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Step {stepNumber} of {totalSteps}
            </Badge>
            {response?.completed_at && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl mt-2">{template.section_title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Guidance */}
          {template.guidance_text && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary mb-1">How Investors Think</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {template.guidance_text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Question/Prompt */}
          {template.prompt_question && (
            <div>
              <p className="text-sm font-medium mb-2">{template.prompt_question}</p>
            </div>
          )}

          {/* Pain Meter - Only for Problem section */}
          {template.section_key === 'problem' && answer.trim().length > 0 && (
            <WorkshopPainMeter text={answer} />
          )}

          {/* Answer Textarea */}
          <div className="space-y-2">
            <Textarea
              value={answer}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Write your response here..."
              rows={10}
              className="resize-none text-base"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              {isSaving && (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
          </div>

          {/* Evidence Checklist - All sections */}
          {answer.trim().length > 0 && (
            <WorkshopEvidenceChecklist 
              text={answer} 
              sectionKey={template.section_key} 
            />
          )}

          {/* Discovery Follow-Up Prompts */}
          {answer.trim().length > 20 && (
            <WorkshopDiscoveryPrompt 
              text={answer} 
              sectionKey={template.section_key}
              onAddToResponse={handleAddToResponse}
            />
          )}

          {/* Blind Spot Warnings */}
          {answer.trim().length > 50 && (
            <WorkshopBlindSpotWarning 
              text={answer} 
              sectionKey={template.section_key}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isFirst}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {isLast ? (
              <Button
                onClick={handleNext}
                disabled={!allComplete || isCompiling}
                className={cn(
                  allComplete && "bg-gradient-to-r from-primary to-primary/80"
                )}
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Compile Mini-Memo
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Benchmark Example */}
      <Card className="border-border/50 bg-muted/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Benchmark Example
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {template.benchmark_example ? (
            <>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {template.benchmark_example}
                </p>
              </div>
              
              {template.benchmark_tips && template.benchmark_tips.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    What makes this effective
                  </p>
                  <div className="space-y-2">
                    {template.benchmark_tips.map((tip, i) => (
                      <div 
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                No benchmark example configured yet.
              </p>
              <p className="text-xs mt-1">
                Admins can add examples from the Workshop settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
