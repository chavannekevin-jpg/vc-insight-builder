/**
 * StartupGuide - Public page for the startup guide
 * 
 * Accelerators can share this link with their startups
 */

import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
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
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const steps = [
  { icon: FileText, title: "Upload Deck", color: "text-blue-500" },
  { icon: Target, title: "Review Sections", color: "text-primary" },
  { icon: Building2, title: "Dashboard", color: "text-success" },
  { icon: BarChart3, title: "Request Analysis", color: "text-warning" },
  { icon: Clock, title: "Wait", color: "text-muted-foreground" },
  { icon: Sparkles, title: "Review Audit", color: "text-purple-500" },
];

export default function StartupGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Startup Guide</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Quick visual overview */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Start Journey</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {steps.map((step, i) => (
                <div key={step.title} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50",
                    step.color
                  )}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-muted-foreground text-center leading-tight">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <section className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">Getting Started with UglyBaby</h3>
              <p className="text-muted-foreground">
                Welcome to UglyBaby - your AI-powered investment readiness platform. This guide will help you make the most of the platform to strengthen your pitch and prepare for investor conversations.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Step 1: Upload Your Pitch Deck 📄</h3>
              <p className="text-muted-foreground">
                Start by uploading your pitch deck (PDF format works best). Our AI will analyze it and extract key information about your startup automatically.
              </p>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Make sure your deck includes information about your team, market, problem, solution, traction, and business model.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Step 2: Review the Sections 🎯</h3>
              <p className="text-muted-foreground">
                Review each of the 8 sections that investors evaluate. The AI pre-fills information from your deck, but you can edit and add details:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
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
                  <div key={item.name} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Step 3: Land on Your Dashboard 🏠</h3>
              <p className="text-muted-foreground">
                Once sections are reviewed, access your startup dashboard to see your progress.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Step 4: Request the Analysis 📊</h3>
              <p className="text-muted-foreground">
                From your dashboard, request your AI-powered investment analysis. This generates your fundability score and detailed feedback.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Step 5: Wait for the Analysis ⏳</h3>
              <p className="text-muted-foreground">
                The analysis takes a few minutes. You'll be notified when it's ready.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Step 6: Review Your Audit 📋</h3>
              <p className="text-muted-foreground">
                Review your comprehensive Investment Audit with scores, VC Quick Take, and actionable feedback across all 8 dimensions.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Step 7: Use Strategic Tools 🛠️</h3>
              <div className="space-y-3 mt-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Market Lens</span>
                  </div>
                  <p className="text-sm text-muted-foreground">TAM/SAM/SOM Calculator, Competitive Maps, Market Trends</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Investor Network</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Find matching VCs by stage, sector, and geography</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Tools Library</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Unit Economics, Valuations, Fundraising Readiness</p>
                </div>
              </div>
            </section>

            <div className="p-6 rounded-xl bg-muted/30 border border-border">
              <h4 className="text-lg font-semibold mb-4 text-foreground">💡 Tips for Success</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Be specific</strong> - Concrete numbers and examples score higher</li>
                <li>• <strong>Show traction</strong> - Any proof of progress helps significantly</li>
                <li>• <strong>Know your numbers</strong> - Have your key metrics ready</li>
                <li>• <strong>Be honest</strong> - VCs appreciate self-awareness about challenges</li>
              </ul>
            </div>

            <div className="text-center pt-8 pb-4">
              <p className="text-sm text-muted-foreground italic">
                UglyBaby helps founders build VC-grade cases by teaching you how investors think and speak.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
