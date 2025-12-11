import { BookOpen, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { MicroCaseStudy } from "@/types/memo";

interface MicroCaseStudyCardProps {
  caseStudy: MicroCaseStudy;
}

export const MicroCaseStudyCard = ({ caseStudy }: MicroCaseStudyCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
          <BookOpen className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Case Study: {caseStudy.company}</h4>
          <p className="text-xs text-muted-foreground">{caseStudy.sector}</p>
        </div>
      </div>

      {/* Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Problem */}
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <p className="text-xs font-medium text-red-600 mb-1">The Problem</p>
          <p className="text-sm text-foreground">{caseStudy.problem}</p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex md:hidden items-center justify-center py-2">
          <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
        </div>

        {/* Fix */}
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs font-medium text-blue-600 mb-1">The Fix</p>
          <p className="text-sm text-foreground">{caseStudy.fix}</p>
        </div>
      </div>

      {/* Outcome */}
      <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-600 mb-1">Outcome</p>
            <p className="text-foreground">{caseStudy.outcome}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Timeframe: {caseStudy.timeframe}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
