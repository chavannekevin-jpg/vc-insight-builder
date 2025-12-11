import { User, CheckCircle, XCircle, Eye } from "lucide-react";
import { LeadInvestorRequirements } from "@/types/memo";
import { cn } from "@/lib/utils";

interface LeadInvestorCardProps {
  requirements: LeadInvestorRequirements;
  sectionName: string;
}

export const LeadInvestorCard = ({ requirements, sectionName }: LeadInvestorCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-background p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">If I Were Your Lead Investor...</h4>
          <p className="text-xs text-muted-foreground">Based on {sectionName}</p>
        </div>
      </div>

      {/* Investor Paragraph */}
      <div className="p-4 rounded-lg bg-background border border-border/50 mb-4">
        <p className="text-foreground italic leading-relaxed">
          "{requirements.investorParagraph}"
        </p>
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Requirements */}
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">Requirements</span>
          </div>
          <ul className="space-y-1">
            {requirements.requirements.map((req, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Dealbreakers */}
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">Dealbreakers</span>
          </div>
          <ul className="space-y-1">
            {requirements.dealbreakers.map((db, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {db}
              </li>
            ))}
          </ul>
        </div>

        {/* Would Want to See */}
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Want to See</span>
          </div>
          <ul className="space-y-1">
            {requirements.wouldWantToSee.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
