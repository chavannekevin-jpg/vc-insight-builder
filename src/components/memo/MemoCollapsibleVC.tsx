import { useState } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MemoVCReflection } from "@/components/memo/MemoVCReflection";
import { MemoVCQuestions } from "@/components/memo/MemoVCQuestions";
import { MemoBenchmarking } from "@/components/memo/MemoBenchmarking";
import { MemoAIConclusion } from "@/components/memo/MemoAIConclusion";
import { MemoVCReflection as MemoVCReflectionType } from "@/types/memo";

interface MemoCollapsibleVCProps {
  vcReflection: MemoVCReflectionType;
  defaultOpen?: boolean;
}

export const MemoCollapsibleVC = ({ vcReflection, defaultOpen = false }: MemoCollapsibleVCProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!vcReflection) return null;

  const hasContent = vcReflection.analysis || 
    (vcReflection.questions && vcReflection.questions.length > 0) ||
    vcReflection.benchmarking ||
    vcReflection.conclusion;

  if (!hasContent) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground">VC Analysis</span>
              <p className="text-xs text-muted-foreground">
                Perspective, questions, benchmarks & conclusion
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-0">
        {vcReflection.analysis && (
          <MemoVCReflection text={vcReflection.analysis} />
        )}
        {vcReflection.questions && vcReflection.questions.length > 0 && (
          <MemoVCQuestions questions={vcReflection.questions} />
        )}
        {vcReflection.benchmarking && (
          <MemoBenchmarking text={vcReflection.benchmarking} />
        )}
        {vcReflection.conclusion && (
          <MemoAIConclusion text={vcReflection.conclusion} />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
