import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Building2, Users, Target, 
  Lightbulb, TrendingUp, BarChart3, ExternalLink,
  AlertTriangle, Layers, Eye, DollarSign, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getStartupById, DemoStartup } from "@/data/acceleratorDemo/demoStartups";
import { getDemoMemo } from "@/data/acceleratorDemo/demoMemos";
import { AcceleratorDemoLayout } from "@/components/acceleratorDemo/AcceleratorDemoLayout";

const sectionIcons: Record<string, any> = {
  problem: AlertTriangle,
  solution: Lightbulb,
  market: Target,
  competition: BarChart3,
  team: Users,
  businessModel: DollarSign,
  traction: TrendingUp,
  vision: Building2,
};

const sectionLabels: Record<string, string> = {
  problem: "Problem",
  solution: "Solution",
  market: "Market",
  competition: "Competition",
  team: "Team",
  businessModel: "Business Model",
  traction: "Traction",
  vision: "Vision",
};

// Map from camelCase keys to memo section titles
const sectionToMemoTitle: Record<string, string> = {
  problem: "Problem",
  solution: "Solution",
  market: "Market",
  competition: "Competition",
  team: "Team",
  businessModel: "Business Model",
  traction: "Traction",
  vision: "Vision",
};

const getScoreColor = (score: number | null) => {
  if (!score) return "text-muted-foreground";
  if (score >= 75) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 45) return "text-warning";
  return "text-destructive";
};

const getScoreBg = (score: number | null) => {
  if (!score) return "bg-muted";
  if (score >= 75) return "bg-success";
  if (score >= 60) return "bg-primary";
  if (score >= 45) return "bg-warning";
  return "bg-destructive";
};

const StartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const startup = getStartupById(id || "");
  const memoData = getDemoMemo(id || "");
  
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  if (!startup) {
    return (
      <AcceleratorDemoLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Startup Not Found</h2>
            <Button onClick={() => navigate("/accelerator-demo")}>Back to Dashboard</Button>
          </div>
        </div>
      </AcceleratorDemoLayout>
    );
  }

  // Demo cohort info
  const cohortInfo = {
    name: "Batch 3 - Spring 2025",
  };

  // Generate demo VC quick take from startup data
  const vcQuickTake = {
    verdict: startup.fundabilityScore >= 75 ? "Strong Potential" : 
             startup.fundabilityScore >= 60 ? "Conditional Ready" : 
             startup.fundabilityScore >= 45 ? "Needs Development" : "High Risk",
    strengths: startup.topStrengths,
    concerns: startup.topConcerns,
  };

  // Get section content from memo data
  const getSectionContent = (sectionKey: string) => {
    if (!memoData) return null;
    const memoTitle = sectionToMemoTitle[sectionKey];
    return memoData.sections.find(s => s.title === memoTitle);
  };

  const selectedSectionContent = selectedSection ? getSectionContent(selectedSection) : null;
  const SelectedIcon = selectedSection ? (sectionIcons[selectedSection] || Building2) : Building2;

  return (
    <AcceleratorDemoLayout>
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/accelerator-demo")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold text-lg text-foreground">{startup.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {startup.category} • {startup.stage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/demo")}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Ecosystem
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/demo/analysis")}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Share Preview
              </Button>
              <div className={cn("text-3xl font-bold", getScoreColor(startup.fundabilityScore))}>
                {startup.fundabilityScore}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Cohort Assignment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-card/60 border border-border/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cohort</p>
              <p className="font-medium text-foreground">{cohortInfo.name}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 opacity-50 cursor-not-allowed"
            disabled
          >
            <Layers className="w-4 h-4" />
            Change Cohort
          </Button>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-xl bg-card/60 border border-border/50"
            >
              <h2 className="font-semibold text-foreground mb-3">About</h2>
              <p className="text-muted-foreground">{startup.tagline}</p>
            </motion.div>

            {/* VC Quick Take */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20"
            >
              <h2 className="font-semibold text-foreground mb-4">VC Quick Take</h2>
              
              <div className="mb-4 p-3 rounded-lg bg-card/60">
                <span className={cn("text-lg font-bold", getScoreColor(startup.fundabilityScore))}>
                  {vcQuickTake.verdict}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-success mb-2">Strengths</h3>
                  <ul className="space-y-2">
                    {vcQuickTake.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-0.5">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-warning mb-2">Concerns</h3>
                  <ul className="space-y-2">
                    {vcQuickTake.concerns.map((concern, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-warning mt-0.5">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Section Scores - Clickable */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-xl bg-card/60 border border-border/50"
            >
              <h2 className="font-semibold text-foreground mb-4">Section Breakdown</h2>
              <p className="text-xs text-muted-foreground mb-4">Click a section to view detailed analysis</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(startup.sectionScores).map(([section, score]) => {
                  const Icon = sectionIcons[section] || Building2;
                  return (
                    <motion.div
                      key={section}
                      onClick={() => setSelectedSection(section)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 rounded-lg border border-border/50 bg-card/40 cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {sectionLabels[section] || section}
                        </span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className={cn("text-2xl font-bold", getScoreColor(score))}>
                          {score}
                        </span>
                        <div className="flex-1 h-1.5 bg-muted/30 rounded-full mb-1.5">
                          <div
                            className={cn("h-full rounded-full", getScoreBg(score))}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Founding Team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-xl bg-card/60 border border-border/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Founding Team</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {startup.founders.map((founder, index) => (
                  <div key={index} className="p-3 border border-border/50 rounded-lg bg-card/40">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center text-xs font-bold">
                        {founder.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{founder.name}</h3>
                        <p className="text-xs text-primary">{founder.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{founder.background}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-5 rounded-xl bg-card/60 border border-border/50 text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">Fundability Score</p>
              <div className={cn("text-5xl font-bold mb-1", getScoreColor(startup.fundabilityScore))}>
                {startup.fundabilityScore}
              </div>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </motion.div>

            {/* Mentor Focus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-5 rounded-xl bg-card/60 border border-border/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Mentor Focus</h3>
              </div>
              <p className="text-sm text-muted-foreground">{startup.mentorFocus}</p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border/50"
                  onClick={() => navigate("/demo")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Ecosystem
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-border/50"
                  onClick={() => navigate("/demo/analysis")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Share Preview
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Section Detail Modal */}
      <Dialog open={!!selectedSection} onOpenChange={(open) => !open && setSelectedSection(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <SelectedIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <span>{selectedSection ? sectionLabels[selectedSection] : ""}</span>
              </div>
              {selectedSection && (
                <div className={cn("text-xl font-bold", getScoreColor(startup.sectionScores[selectedSection as keyof typeof startup.sectionScores]))}>
                  {startup.sectionScores[selectedSection as keyof typeof startup.sectionScores]}
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedSectionContent ? (
            <div className="space-y-4 mt-4">
              {/* Narrative */}
              <div className="p-4 rounded-lg bg-card/60 border border-border/50">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {selectedSectionContent.narrative}
                </p>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-3">Key Points</h4>
                <ul className="space-y-2">
                  {selectedSectionContent.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="text-foreground/80">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* View Full Analysis CTA */}
              <div className="pt-4 border-t border-border/50">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSelectedSection(null);
                    navigate(`/accelerator-demo/startup/${id}/analysis`);
                  }}
                >
                  View Full Analysis
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>Section content not available for this startup.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AcceleratorDemoLayout>
  );
};

export default StartupDetail;
