/**
 * StartupGuide - Comprehensive public guide for founders
 * 
 * Explains how the UglyBaby platform works with FAQ section
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  CheckCircle2,
  Zap,
  Shield,
  Brain,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Rocket,
  Award,
  Calculator,
  Eye,
  Upload,
  Edit,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const journeySteps = [
  { icon: Upload, title: "Upload Deck", description: "Start with your pitch deck" },
  { icon: Edit, title: "Review Sections", description: "Refine 8 key areas" },
  { icon: Building2, title: "Dashboard", description: "Your startup hub" },
  { icon: BarChart3, title: "Request Analysis", description: "Trigger AI evaluation" },
  { icon: Clock, title: "Processing", description: "AI analyzes your data" },
  { icon: Sparkles, title: "Review Audit", description: "Get actionable insights" },
];

const sections = [
  { name: "Problem", icon: AlertTriangle, description: "The pain point you're solving and why it matters" },
  { name: "Solution", icon: Lightbulb, description: "Your unique approach and how it addresses the problem" },
  { name: "Market", icon: Target, description: "TAM/SAM/SOM and market dynamics" },
  { name: "Competition", icon: BarChart3, description: "Competitive landscape and your positioning" },
  { name: "Team", icon: Users, description: "Founders, key hires, and relevant experience" },
  { name: "Business Model", icon: DollarSign, description: "Revenue streams and unit economics" },
  { name: "Traction", icon: TrendingUp, description: "Metrics, milestones, and proof of progress" },
  { name: "Vision", icon: Building2, description: "Long-term goals and strategic roadmap" },
];

const platformFeatures = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our AI evaluates your startup across 8 dimensions that VCs actually care about, providing a fundability score and detailed feedback.",
  },
  {
    icon: BookOpen,
    title: "VC Memorandum",
    description: "Get a professional investment memo written in VC language, highlighting your strengths and addressing potential concerns proactively.",
  },
  {
    icon: Globe,
    title: "Market Lens",
    description: "Access market sizing calculators, competitive mapping tools, and trend analysis to strengthen your market narrative.",
  },
  {
    icon: Building2,
    title: "Investor Network",
    description: "Discover matching VCs based on your stage, sector, and geography. Access curated lists of active investors.",
  },
  {
    icon: Calculator,
    title: "Financial Tools",
    description: "Valuation calculator, dilution lab, and raise planning tools to help you navigate fundraising mechanics.",
  },
  {
    icon: MessageSquare,
    title: "Roast Your Baby",
    description: "Practice tough VC questions with AI-powered mock interviews. Get comfortable defending your thesis.",
  },
];

const faqItems = [
  {
    question: "What is UglyBaby?",
    answer: "UglyBaby is an AI-powered investment readiness platform that helps founders prepare for VC conversations. We analyze your startup across 8 key dimensions that investors evaluate, provide a fundability score, and generate professional materials to strengthen your pitch.",
  },
  {
    question: "How does the analysis work?",
    answer: "You start by uploading your pitch deck (PDF). Our AI extracts key information and pre-fills 8 sections covering Problem, Solution, Market, Competition, Team, Business Model, Traction, and Vision. You review and enhance this information, then request an AI analysis. The system evaluates your startup and generates a comprehensive Investment Audit with scores, insights, and recommendations.",
  },
  {
    question: "What's included in the Investment Audit?",
    answer: "The Investment Audit includes: (1) Overall Fundability Score based on VC evaluation criteria, (2) Section-by-section scores with detailed feedback, (3) VC Quick Take - a concise summary of investment thesis, (4) Key strengths and areas for improvement, (5) Actionable recommendations to increase fundability.",
  },
  {
    question: "What is the VC Memorandum?",
    answer: "The VC Memorandum is a professional investment memo written in the language VCs use internally. It presents your startup's case for investment, covering market opportunity, solution differentiation, team capabilities, traction, and financial projections. This document helps VCs quickly understand your opportunity.",
  },
  {
    question: "How long does the analysis take?",
    answer: "The AI analysis typically takes 2-5 minutes to complete. You'll see a progress indicator and be notified when your Investment Audit is ready for review.",
  },
  {
    question: "Can I update my information after analysis?",
    answer: "Yes! You can update your company profile and section responses at any time. After making significant changes, you can request a new analysis to get updated scores and feedback. This is useful as your startup evolves.",
  },
  {
    question: "What file format should my pitch deck be?",
    answer: "We support PDF format for pitch decks. For best results, ensure your deck is clear, well-structured, and includes information about your team, market, problem, solution, traction, and business model.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Your data is encrypted and stored securely. We do not share your information with third parties. Your pitch deck and company details remain confidential and are only used to generate your personalized analysis.",
  },
  {
    question: "What is Market Lens?",
    answer: "Market Lens is a suite of market intelligence tools including: TAM/SAM/SOM calculator for market sizing, competitive landscape mapping, market trend analysis, and benchmark comparisons. These tools help you build a compelling market narrative backed by data.",
  },
  {
    question: "How does the Investor Network work?",
    answer: "The Investor Network helps you discover VCs that match your startup profile. You can filter by investment stage (Pre-seed, Seed, Series A+), sector focus, geographic preferences, and typical check size. This helps you prioritize outreach to the most relevant investors.",
  },
  {
    question: "What is 'Roast Your Baby'?",
    answer: "Roast Your Baby is an AI-powered mock interview feature that simulates tough VC questions. It helps you practice defending your thesis, handling objections, and articulating your value proposition under pressure. Great preparation before real investor meetings.",
  },
  {
    question: "I'm part of an accelerator. How does that work?",
    answer: "If your accelerator partners with UglyBaby, you may have access to special pricing or features. Your accelerator can invite you via a join link or code. Once connected, your progress may be visible to your accelerator managers for portfolio tracking and support.",
  },
  {
    question: "What's the difference between free and paid features?",
    answer: "Free users can upload their deck, complete their company profile, and access educational content. Paid users unlock the full AI Analysis, Investment Audit, VC Memorandum, Market Lens tools, Investor Network access, and premium features like Roast Your Baby and Dilution Lab.",
  },
  {
    question: "How do I get the most out of UglyBaby?",
    answer: "Be specific and honest in your responses. Include concrete numbers, metrics, and examples wherever possible. The more detailed and accurate your input, the more valuable your analysis will be. Review the AI's feedback carefully and use it to improve your pitch.",
  },
];

export default function StartupGuide() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/6 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/20 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Platform Guide</h1>
              <p className="text-xs text-muted-foreground">Everything you need to know about UglyBaby</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <section className="text-center space-y-4 py-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Investment Readiness Platform</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Build Your VC-Grade Case
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              UglyBaby helps founders understand how investors think, speak their language, and present a compelling investment thesis.
            </p>
          </section>

          {/* Journey Overview */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Your Journey</h3>
            </div>
            
            <div className="p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/30">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {journeySteps.map((step, i) => (
                  <motion.div 
                    key={step.title} 
                    className="flex flex-col items-center gap-3 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Step-by-Step Guide */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Step-by-Step Guide</h3>
            </div>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Upload Your Pitch Deck</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Start by uploading your pitch deck in PDF format. Our AI will analyze it and extract key information about your startup, pre-filling the 8 sections that investors evaluate.
                </p>
                <div className="pl-11">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Tip:</strong> Ensure your deck covers team, market, problem, solution, traction, and business model for best results.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Review the 8 Sections</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11 mb-3">
                  Review and enhance each section with additional details. The more specific and accurate your input, the better your analysis will be.
                </p>
                <div className="pl-11 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {sections.map((section) => (
                    <div 
                      key={section.name}
                      className="p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-default"
                      onMouseEnter={() => setActiveSection(section.name)}
                      onMouseLeave={() => setActiveSection(null)}
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-foreground">{section.name}</span>
                      </div>
                      {activeSection === section.name && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-[10px] text-muted-foreground mt-1.5 leading-tight"
                        >
                          {section.description}
                        </motion.p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Access Your Dashboard</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Your dashboard is your startup's command center. See your profile completion status, access tools, and track your investment readiness progress.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Request AI Analysis</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  When your sections are complete, request your AI-powered investment analysis. This generates your fundability score and detailed feedback across all dimensions.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">5</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Review Your Investment Audit</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Your comprehensive Investment Audit includes your overall fundability score, section-by-section evaluation, VC Quick Take, key strengths, areas for improvement, and actionable recommendations.
                </p>
              </div>

              {/* Step 6 */}
              <div className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">6</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Use Strategic Tools</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Access Market Lens for market intelligence, Investor Network to find matching VCs, financial calculators, and practice tools to prepare for investor conversations.
                </p>
              </div>
            </div>
          </section>

          {/* Platform Features */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Platform Features</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {platformFeatures.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 space-y-3 hover:bg-card/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tips for Success */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Tips for Success</h3>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { tip: "Be Specific", detail: "Concrete numbers and examples score higher than vague statements" },
                  { tip: "Show Traction", detail: "Any proof of progress helps significantly - users, revenue, partnerships" },
                  { tip: "Know Your Numbers", detail: "Have key metrics like CAC, LTV, burn rate, and runway ready" },
                  { tip: "Be Honest", detail: "VCs appreciate self-awareness about challenges and risks" },
                  { tip: "Update Regularly", detail: "Keep your profile current as your startup evolves" },
                  { tip: "Practice Your Pitch", detail: "Use Roast Your Baby to prepare for tough questions" },
                ].map((item) => (
                  <div key={item.tip} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{item.tip}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h3>
            </div>
            
            <div className="rounded-2xl bg-card/40 backdrop-blur-sm border border-border/30 overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-border/30">
                    <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-muted/20 transition-colors">
                      <span className="font-medium text-foreground text-sm">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 text-sm text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="text-center py-8 space-y-4">
            <p className="text-muted-foreground italic">
              UglyBaby helps founders build VC-grade cases by teaching you how investors think and speak.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate("/hub")} className="gap-2">
                <Rocket className="w-4 h-4" />
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
