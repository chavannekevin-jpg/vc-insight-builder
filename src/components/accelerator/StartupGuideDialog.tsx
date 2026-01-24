/**
 * StartupGuideDialog - Sharable guide for startups on how to use UglyBaby
 * 
 * Provides a template that accelerators can share with their startups
 * explaining how to use the platform effectively.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Building2,
  Clock,
  Globe,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StartupGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acceleratorName?: string;
}

const guideContent = `# Getting Started with UglyBaby

Welcome to UglyBaby - your AI-powered investment readiness platform. This guide will help you make the most of the platform to strengthen your pitch and prepare for investor conversations.

## Step 1: Upload Your Pitch Deck 📄

Start by uploading your pitch deck (PDF format works best). Our AI will analyze it and extract key information about your startup automatically.

**Tip:** Make sure your deck includes information about your team, market, problem, solution, traction, and business model.

## Step 2: Review the Sections 🎯

After the deck upload, review each of the 8 sections that investors evaluate. The AI pre-fills information from your deck, but you can edit and add details:

- Problem, Solution, Market, Competition
- Team, Business Model, Traction, Vision

Click on each section to review, edit, and complete your profile.

## Step 3: Land on Your Dashboard 🏠

Once your sections are reviewed, you'll land on your startup dashboard where you can see your progress and scores.

## Step 4: Request the Analysis 📊

From your dashboard, request your AI-powered investment analysis. This generates your fundability score and detailed feedback.

## Step 5: Wait for the Analysis ⏳

The analysis takes a few minutes to complete. You'll be notified when it's ready.

## Step 6: Review Your Audit 📋

Once complete, review your Investment Audit - a comprehensive breakdown of your startup's investment readiness across all 8 dimensions, including:

- Section-by-section scores with benchmarks
- VC Quick Take summary
- Strengths and areas for improvement

## Step 7: Use the Strategic Tools 🛠️

Explore the powerful tools available to strengthen your pitch:

**Market Lens**
- TAM/SAM/SOM Calculator - Size your market opportunity
- Competitive Landscape Maps
- Market Trend Analysis

**Investor Network**  
- Find VCs aligned with your stage and sector
- Geographic matching
- Thesis alignment scores

**Tools Library**
- Unit Economics Calculator
- Valuation Benchmarks
- Fundraising Readiness Checker
- Pitch Deck Analyzer

## Tips for Success 💡

- **Be specific** - Concrete numbers and examples score higher
- **Show traction** - Any proof of progress helps significantly
- **Know your numbers** - Have your key metrics ready
- **Be honest** - VCs appreciate self-awareness about challenges

## Need Help?

Contact your accelerator program manager for personalized guidance and support.

---

*UglyBaby helps founders build VC-grade cases by teaching you how investors think and speak.*
`;

export function StartupGuideDialog({ open, onOpenChange, acceleratorName }: StartupGuideDialogProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(guideContent);
    setCopied(true);
    toast.success("Guide copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { icon: FileText, title: "Upload Deck", color: "text-blue-500" },
    { icon: Target, title: "Review Sections", color: "text-primary" },
    { icon: Building2, title: "Dashboard", color: "text-success" },
    { icon: BarChart3, title: "Request Analysis", color: "text-warning" },
    { icon: Clock, title: "Wait", color: "text-muted-foreground" },
    { icon: Sparkles, title: "Review Audit", color: "text-purple-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-border bg-card/95 backdrop-blur-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            Startup Guide
          </DialogTitle>
          <DialogDescription>
            Copy and share this guide with startups to help them use UglyBaby effectively
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw Text</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {/* Quick visual overview */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
                <h4 className="text-sm font-semibold mb-3 text-foreground">Quick Start Journey</h4>
                <div className="grid grid-cols-6 gap-1">
                  {steps.map((step, i) => (
                    <div key={step.title} className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50",
                        step.color
                      )}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="space-y-5">
                <section>
                  <h3 className="text-base font-semibold text-foreground mb-2">Step 1: Upload Your Pitch Deck 📄</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by uploading your pitch deck (PDF format works best). Our AI will analyze it and extract key information about your startup automatically.
                  </p>
                </section>

                <section>
                  <h3 className="text-base font-semibold text-foreground mb-2">Step 2: Review the Sections 🎯</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Review each of the 8 sections that investors evaluate:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Problem", icon: AlertTriangle },
                      { name: "Solution", icon: Lightbulb },
                      { name: "Market", icon: Target },
                      { name: "Competition", icon: BarChart3 },
                      { name: "Team", icon: Users },
                      { name: "Business Model", icon: DollarSign },
                      { name: "Traction", icon: TrendingUp },
                      { name: "Vision", icon: Building2 },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <item.icon className="w-3.5 h-3.5 text-primary" />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-semibold text-foreground mb-2">Step 3: Land on Your Dashboard 🏠</h3>
                  <p className="text-sm text-muted-foreground">
                    Once sections are reviewed, access your startup dashboard to see your progress.
                  </p>
                </section>

                <section>
                  <h3 className="text-base font-semibold text-foreground mb-2">Step 4: Request the Analysis 📊</h3>
                  <p className="text-sm text-muted-foreground">
                    From your dashboard, request your AI-powered investment analysis.
                  </p>
                </section>

                <section>
                  <h3 className="text-base font-semibold text-foreground mb-2">Step 5: Wait for the Analysis ⏳</h3>
                  <p className="text-sm text-muted-foreground">
                    The analysis takes a few minutes. You'll be notified when it's ready.
                  </p>
                </section>

                <section>
                  <h3 className="text-base font-semibold text-foreground mb-2">Step 6: Review Your Audit 📋</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your comprehensive Investment Audit with scores, VC Quick Take, and actionable feedback.
                  </p>
                </section>

                <section>
                  <h3 className="text-base font-semibold text-foreground mb-2">Step 7: Use Strategic Tools 🛠️</h3>
                  <div className="space-y-3 mt-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Market Lens</span>
                      </div>
                      <p className="text-xs text-muted-foreground">TAM/SAM/SOM Calculator, Competitive Maps, Market Trends</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Investor Network</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Find matching VCs by stage, sector, and geography</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Tools Library</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Unit Economics, Valuations, Fundraising Readiness</p>
                    </div>
                  </div>
                </section>

                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <h4 className="text-sm font-semibold mb-2 text-foreground">💡 Tips for Success</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Be specific - Concrete numbers and examples score higher</li>
                    <li>• Show traction - Any proof of progress helps significantly</li>
                    <li>• Know your numbers - Have your key metrics ready</li>
                    <li>• Be honest - VCs appreciate self-awareness about challenges</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[400px]">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-lg">
                {guideContent}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <p className="text-xs text-muted-foreground">
            Copy and share via your preferred channel
          </p>
          <Button
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Guide
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
