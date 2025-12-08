import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Sparkles } from "lucide-react";

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
}

// Generate simple, professional rejection email like real VCs write
const generateEmailBody = (
  readinessLevel: "LOW" | "MEDIUM" | "HIGH"
): { opening: string; mainParagraph: string; closing: string } => {
  
  if (readinessLevel === "LOW") {
    return {
      opening: "We've taken time to review your company internally.",
      mainParagraph: "At this stage, we're not comfortable with the scalability and defensibility of the business relative to our fund's risk profile. While the product solves a real problem, we see challenges in building a large, venture-scale outcome.",
      closing: "We appreciate the openness of the discussion and wish you success moving forward."
    };
  } else if (readinessLevel === "MEDIUM") {
    return {
      opening: "Thank you for walking us through your business.",
      mainParagraph: "While we find the space interesting, we're not yet convinced that the urgency and willingness to pay are strong enough at this stage to build a venture-scale outcome. We'd want to see clearer signals of pull from the market.",
      closing: "We'll follow along and would be happy to re-evaluate as things evolve."
    };
  } else {
    return {
      opening: "Thank you for the thoughtful discussion about your company.",
      mainParagraph: "We think there's something compelling here, but at this stage, we'd like to see a bit more traction before we can get comfortable. The opportunity is interesting, but the timing isn't quite right for us.",
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
}: VCRejectionPreviewProps) {
  const { readinessLevel } = vcQuickTake;
  const { opening, mainParagraph, closing } = generateEmailBody(readinessLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-border/50 bg-card overflow-hidden">
        {/* Email Header */}
        <div className="bg-muted/50 border-b border-border px-6 py-4">
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-16">From:</span>
              <span className="text-foreground">Sarah Chen, Partner</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-16">To:</span>
              <span className="text-foreground">Founder</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-16">Subject:</span>
              <span className="text-foreground">Re: {companyName} — Following Up</span>
            </div>
          </div>
        </div>
        
        {/* Email Body */}
        <div className="px-6 py-6 space-y-4">
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
          <div className="pt-4">
            <p className="text-sm text-foreground">Best regards,</p>
            <p className="text-sm text-foreground font-medium mt-2">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">Partner, Apex Ventures</p>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="border-t border-border bg-muted/30 px-6 py-5">
          <p className="text-xs text-center text-muted-foreground mb-4">
            See the full analysis behind this feedback — and how to address it.
          </p>
          
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
