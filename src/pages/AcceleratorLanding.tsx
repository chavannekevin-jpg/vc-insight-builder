import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/sections/Footer";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Eye, 
  Zap, 
  CheckCircle2, 
  Brain,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  Network,
  LineChart,
  Building2,
  Rocket,
  UserPlus,
  Share2,
  FileSearch,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AcceleratorLanding = () => {
  const navigate = useNavigate();

  const platformCapabilities = [
    {
      icon: Layers,
      title: "Multi-Cohort Architecture",
      description: "Run multiple batches simultaneously with cohort-specific analytics, invite codes, and Demo Day timelines.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Fundability Tracking",
      description: "Live scoring across 8 VC dimensions. See which startups are Demo Day-ready before they hit the stage.",
    },
    {
      icon: Users,
      title: "Unlimited Team Access",
      description: "Invite mentors, program managers, and advisors. Everyone sees the same live data.",
    },
    {
      icon: Share2,
      title: "Startup Discount Codes",
      description: "Generate invite links with custom discounts. Control how many startups get free or reduced access.",
    },
    {
      icon: FileSearch,
      title: "Deep Portfolio Insights",
      description: "Access the same VC-grade reports your startups see—scorecards, spider matrices, strategic recommendations.",
    },
    {
      icon: Globe,
      title: "Investor-Ready Previews",
      description: "Generate shareable profiles for investors. Professional startup teasers that drive curiosity.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Create Your Ecosystem",
      description: "Set up your accelerator with cohorts, branding, and team members in minutes.",
      icon: Building2,
    },
    {
      step: "02",
      title: "Invite Your Startups",
      description: "Share invite links with custom discounts. Startups complete their diagnostic in 30 minutes.",
      icon: UserPlus,
    },
    {
      step: "03",
      title: "Monitor & Support",
      description: "Track real-time scores, identify weak spots, and route mentor time where it matters.",
      icon: LineChart,
    },
    {
      step: "04",
      title: "Demo Day Ready",
      description: "Stress-tested pitches, investor-ready profiles, and fewer blind spots on stage.",
      icon: Rocket,
    },
  ];

  const ecosystemBenefits = [
    "Unlimited cohorts and batches",
    "Unlimited team members",
    "Full access to all founder reports",
    "Custom startup discount codes",
    "Cohort-wide analytics dashboard",
    "Shareable investor previews",
    "Priority support",
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, hsl(var(--primary) / 0.03) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, hsl(var(--secondary) / 0.2) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Accelerator Operating System</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              The Command Center
              <br />
              <span className="text-primary">For Your Startup Cohort</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              VC-grade fundability analysis for every startup in your portfolio. 
              Real-time insights that help you support founders before Demo Day.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground pt-2">
              {[
                "Cohort-wide scoring",
                "Unlimited team access",
                "Custom startup discounts"
              ].map((prop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="h-14 px-8 text-lg gap-3 shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                onClick={() => navigate('/accelerator/signup')}
              >
                <Building2 className="w-5 h-5" />
                Launch Your Ecosystem
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg gap-2 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80"
                onClick={() => navigate('/accelerator-demo')}
              >
                <Eye className="w-5 h-5" />
                See a Demo Cohort
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="relative py-20 border-t border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground mb-4">
              <Zap className="w-3.5 h-3.5" />
              Platform Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Run
              <br />
              <span className="text-muted-foreground">A World-Class Accelerator</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {platformCapabilities.map((capability, idx) => {
              const Icon = capability.icon;
              return (
                <motion.div
                  key={idx}
                  className="group relative p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{capability.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{capability.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 bg-muted/10 border-y border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground mb-4">
              <Target className="w-3.5 h-3.5" />
              Your Workflow
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Setup to Demo Day
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A streamlined process that integrates with your existing program
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  className="relative p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                >
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-lg shadow-primary/30">
                    {step.step}
                  </div>
                  <div className="pt-4">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground mb-4">
                <Shield className="w-3.5 h-3.5" />
                Simple Pricing
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                One License. Unlimited Potential.
              </h2>
              <p className="text-muted-foreground">
                No per-startup fees. No monthly subscriptions. One payment, lifetime access.
              </p>
            </div>

            {/* Pricing Card */}
            <motion.div 
              className="relative rounded-3xl bg-card/60 backdrop-blur-2xl border-2 border-primary/30 p-8 md:p-12 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
              
              <div className="relative">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
                      <Building2 className="w-4 h-4" />
                      Ecosystem License
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl md:text-6xl font-bold">€1,000</span>
                      <span className="text-muted-foreground text-lg">/one-time</span>
                    </div>
                    <p className="text-muted-foreground mt-2">Lifetime access to your ecosystem</p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg gap-2 shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                    onClick={() => navigate('/accelerator/signup')}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="h-px bg-border/50 mb-8" />

                <div className="grid sm:grid-cols-2 gap-4">
                  {ecosystemBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Value context */}
            <motion.div 
              className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/50 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Compare:</strong> Individual startups pay €100 for access. 
                With your ecosystem, invite unlimited startups at custom discounts—or completely free.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 bg-muted/10 border-t border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-2xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Network className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Ecosystem Awaits</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform
              <br />
              <span className="text-muted-foreground">How You Support Founders?</span>
            </h2>
            
            <p className="text-muted-foreground max-w-md mx-auto">
              Join accelerators using VC-grade insights to identify gaps early, 
              focus mentor time, and deliver stronger Demo Days.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="h-14 px-8 text-lg gap-3 shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
                onClick={() => navigate('/accelerator/signup')}
              >
                <Building2 className="w-5 h-5" />
                Launch Your Ecosystem
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground"
                onClick={() => navigate('/sample-memo')}
              >
                See a Startup Analysis →
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AcceleratorLanding;
