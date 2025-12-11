import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface MemoResponse {
  question_key: string;
  answer: string | null;
  source?: string | null;
}

interface CompletionProgressProps {
  responses: MemoResponse[];
  questionLabels: Record<string, { section: string; title: string }>;
}

const SECTION_ORDER = ["Problem", "Solution", "Market", "Competition", "Team", "Business Model", "Traction", "Vision"];

export function CompletionProgress({ responses, questionLabels }: CompletionProgressProps) {
  const sectionStatus = SECTION_ORDER.map(section => {
    const sectionResponses = responses.filter(
      r => questionLabels[r.question_key]?.section === section && r.answer?.trim()
    );
    const hasContent = sectionResponses.length > 0;
    const content = sectionResponses[0]?.answer || "";
    const isSubstantial = content.length > 100;
    
    return {
      section,
      hasContent,
      isSubstantial,
      charCount: content.length
    };
  });

  const completed = sectionStatus.filter(s => s.hasContent).length;
  const substantial = sectionStatus.filter(s => s.isSubstantial).length;
  const percentage = Math.round((completed / SECTION_ORDER.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Profile Completion</h3>
          <p className="text-sm text-muted-foreground">
            {completed}/{SECTION_ORDER.length} sections • {substantial} with substantial content
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{percentage}%</span>
        </div>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {sectionStatus.map(({ section, hasContent, isSubstantial }) => (
          <div 
            key={section} 
            className="flex flex-col items-center gap-1 text-center"
            title={`${section}: ${hasContent ? (isSubstantial ? 'Complete' : 'Brief') : 'Empty'}`}
          >
            {isSubstantial ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : hasContent ? (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground/30" />
            )}
            <span className="text-[10px] text-muted-foreground truncate w-full">
              {section.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
