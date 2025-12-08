import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Sparkles, Mail, AlertCircle } from "lucide-react";
import { useMemo } from "react";

interface VCQuickTake {
  verdict: string;
  concerns: string[];
  strengths: string[];
  readinessLevel: "LOW" | "MEDIUM" | "HIGH";
}

interface VCRejectionPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  vcQuickTake: VCQuickTake;
  onPreviewMemo: () => void;
  onGetFullMemo: () => void;
  founderName?: string;
  industry?: string;
  stage?: string;
}

// Rotating VC personas for variety
const vcPersonas = [
  { name: "Sarah Chen", title: "Partner", firm: "Apex Ventures" },
  { name: "Michael Torres", title: "General Partner", firm: "Horizon Capital" },
  { name: "Emily Nakamura", title: "Principal", firm: "Foundry Partners" },
  { name: "David Park", title: "Partner", firm: "Summit Growth" },
  { name: "Rachel Goldman", title: "Managing Partner", firm: "Catalyst Fund" },
  { name: "James Liu", title: "Partner", firm: "Vector Capital" },
];

// Map concern keywords to subtle VC language hints
const getConcernHint = (concern: string): string | null => {
  const lowerConcern = concern.toLowerCase();
  
  if (lowerConcern.includes("market") || lowerConcern.includes("tam") || lowerConcern.includes("size")) {
    return "questions around the size of the addressable opportunity";
  }
  if (lowerConcern.includes("competition") || lowerConcern.includes("defensib") || lowerConcern.includes("moat")) {
    return "concerns about long-term defensibility in this space";
  }
  if (lowerConcern.includes("traction") || lowerConcern.includes("revenue") || lowerConcern.includes("customer")) {
    return "we'd need to see more proof points around customer demand";
  }
  if (lowerConcern.includes("team") || lowerConcern.includes("experience") || lowerConcern.includes("founder")) {
    return "questions around execution capabilities at this stage";
  }
  if (lowerConcern.includes("unit economics") || lowerConcern.includes("business model") || lowerConcern.includes("monetiz")) {
    return "uncertainty about the path to sustainable unit economics";
  }
  if (lowerConcern.includes("timing") || lowerConcern.includes("early") || lowerConcern.includes("premature")) {
    return "questions about whether the market is ready for this solution";
  }
  if (lowerConcern.includes("scale") || lowerConcern.includes("growth")) {
    return "concerns about the scalability of the current approach";
  }
  if (lowerConcern.includes("differentiat") || lowerConcern.includes("unique") || lowerConcern.includes("commodity")) {
    return "questions around what truly differentiates this from alternatives";
  }
  return null;
};

// Generate personalized rejection email with industry context and subtle insights
const generateEmailBody = (
  readinessLevel: "LOW" | "MEDIUM" | "HIGH",
  concerns: string[],
  industry?: string,
  founderName?: string
): { greeting: string; opening: string; mainParagraph: string; closing: string } => {
  
  // Extract 1-2 subtle hints from the actual concerns
  const hints: string[] = [];
  for (const concern of concerns) {
    const hint = getConcernHint(concern);
    if (hint && !hints.includes(hint) && hints.length < 2) {
      hints.push(hint);
    }
  }
  
  const hintText = hints.length > 0 
    ? `We had ${hints.join(" and ")}. ` 
    : "";
  
  // Personalized greeting
  const greeting = founderName ? `Hi ${founderName},` : "Hi,";
  
  // Industry-aware language
  const industryPhrase = industry 
    ? `the ${industry.toLowerCase()} space` 
    : "this space";
  
  if (readinessLevel === "LOW") {
    return {
      greeting,
      opening: "We've taken time to review your company internally.",
      mainParagraph: `${hintText}At this stage, we're not comfortable with the scalability relative to our fund's risk profile. While the product solves a real problem, we see challenges in building a large, venture-scale outcome in ${industryPhrase}.`,
      closing: "We appreciate the openness of the discussion and wish you success moving forward."
    };
  } else if (readinessLevel === "MEDIUM") {
    return {
      greeting,
      opening: "Thank you for walking us through your business.",
      mainParagraph: `While we find ${industryPhrase} interesting, ${hints.length > 0 ? hints.join(" and ") + ". We're" : "we're"} not yet convinced that the signals are strong enough at this stage to build a venture-scale outcome.`,
      closing: "We'll follow along and would be happy to re-evaluate as things evolve."
    };
  } else {
    return {
      greeting,
      opening: "Thank you for the thoughtful discussion about your company.",
      mainParagraph: `We think there's something compelling here in ${industryPhrase}. ${hintText}At this stage, we'd like to see a bit more before we can get comfortable. The opportunity is interesting, but the timing isn't quite right for us.`,
      closing: "Please do keep us updated on your progress — we'd love to revisit this in a few months."
    };
  }
};

export function VCRejectionPreview({
  open,
  onOpenChange,
  companyName,
  vcQuickTake,
  onPreviewMemo,
  onGetFullMemo,
  founderName,
  industry,
  stage,
}: VCRejectionPreviewProps) {
  const { readinessLevel, concerns } = vcQuickTake;
  
  // Select a random VC persona (memoized to stay consistent during session)
  const vcPersona = useMemo(() => {
    const index = Math.floor(Math.random() * vcPersonas.length);
    return vcPersonas[index];
  }, []);
  
  const { greeting, opening, mainParagraph, closing } = generateEmailBody(
    readinessLevel, 
    concerns, 
    industry, 
    founderName
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-border/50 bg-card overflow-hidden">
        {/* Reality Check Header */}
        <div className="bg-primary/5 border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Reality Check</h3>
              <p className="text-xs text-muted-foreground">
                This is how a VC would likely respond today
              </p>
            </div>
          </div>
        </div>
        
        {/* Email Container with inbox styling */}
        <div className="bg-muted/30 p-4">
          <div className="bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden">
            {/* Email Header */}
            <div className="bg-muted/50 border-b border-border px-5 py-3">
              <div className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-14">From:</span>
                  <span className="text-foreground">{vcPersona.name}, {vcPersona.title}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-14">To:</span>
                  <span className="text-foreground">{founderName || "Founder"} (You)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-14">Subject:</span>
                  <span className="text-foreground">Re: {companyName} — Following Up</span>
                </div>
              </div>
            </div>
            
            {/* Email Body */}
            <div className="px-5 py-5 space-y-4">
              <p className="text-sm text-foreground leading-relaxed">
                {greeting}
              </p>
              
              <p className="text-sm text-foreground leading-relaxed">
                {opening}
              </p>
              
              <p className="text-sm text-foreground leading-relaxed">
                {mainParagraph}
              </p>
              
              <p className="text-sm text-foreground leading-relaxed">
                {closing}
              </p>
              
              {/* Signature */}
              <div className="pt-3">
                <p className="text-sm text-foreground">Best regards,</p>
                <p className="text-sm text-foreground font-medium mt-2">{vcPersona.name}</p>
                <p className="text-xs text-muted-foreground">{vcPersona.title}, {vcPersona.firm}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contextual Footer Note */}
        <div className="px-6 py-3 bg-muted/20 border-t border-border/50">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on what you've shared, this reflects how most VCs would respond. 
              Your full memo reveals exactly why — and how to change it.
            </p>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="border-t border-border bg-card px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onPreviewMemo}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview your memo
            </Button>
            
            <Button
              className="flex-1 gap-2"
              onClick={onGetFullMemo}
            >
              <Sparkles className="w-4 h-4" />
              Get the full memo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
