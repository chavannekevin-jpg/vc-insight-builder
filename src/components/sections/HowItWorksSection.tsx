import { ClipboardList, FileSearch, Wrench, Telescope, Users, Rocket } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Build Your Profile",
      description: "Complete the structured questionnaire covering the 8 dimensions VCs actually evaluate—problem, solution, market, competition, team, traction, business model, and vision.",
      icon: ClipboardList
    },
    {
      number: "02",
      title: "Receive Your Full Audit",
      description: "Get a comprehensive investment memo with scores across 8 dimensions, benchmark comparisons, red flags surfaced, and a prioritized action plan—all in VC framing.",
      icon: FileSearch
    },
    {
      number: "03",
      title: "Unlock Diagnostic Tools",
      description: "Access 23+ strategic tools auto-populated with your data—TAM calculators, moat assessments, unit economics models, competitor positioning, and 90-day action plans.",
      icon: Wrench
    },
    {
      number: "04",
      title: "Access Market Intelligence",
      description: "Market Lens synthesizes 50+ industry reports into a personalized briefing. Tailwinds, headwinds, funding trends, and exit precedents—all filtered for your sector and stage.",
      icon: Telescope
    },
    {
      number: "05",
      title: "Discover Matching Investors",
      description: "Access 800+ curated European investors. AI-powered matching scores each fund by stage, sector, and thesis fit. No more spray-and-pray outreach.",
      icon: Users
    },
    {
      number: "06",
      title: "Execute With Confidence",
      description: "Generate personalized outreach with Outreach Lab. Practice tough questions with Roast Your Baby simulations. Tap into 60+ tactical guides in VC Brain.",
      icon: Rocket
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
            <span className="text-sm font-medium text-primary">Your Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From profile to investment-ready through a complete founder ecosystem
          </p>
        </div>
        
        {/* Timeline container */}
        <div className="max-w-5xl mx-auto relative">
          {/* Vertical connecting line - desktop */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px transform -translate-x-1/2">
            <div className="h-full w-full bg-gradient-to-b from-primary/60 via-primary/40 to-primary/60" />
            <div className="absolute inset-0 w-full bg-gradient-to-b from-primary/30 via-primary/20 to-primary/30 blur-sm" />
          </div>
          
          <div className="space-y-6 md:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index} 
                  className={`relative md:flex md:items-center md:gap-12 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Card */}
                  <div className={`md:w-[calc(50%-3rem)] ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="group relative rounded-2xl p-6 transition-all duration-300 bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/40 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5">
                      {/* Subtle gradient overlay on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Mobile layout */}
                      <div className="flex gap-4 items-start md:hidden relative z-10">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="text-xs font-bold text-primary/80 mb-2 tracking-widest font-mono">
                            STEP {step.number}
                          </div>
                          <h3 className="font-semibold text-lg mb-2 text-foreground">{step.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                      
                      {/* Desktop layout */}
                      <div className="hidden md:block relative z-10">
                        <div className="text-xs font-bold text-primary/80 mb-3 tracking-widest font-mono">
                          STEP {step.number}
                        </div>
                        <h3 className="font-semibold text-xl mb-2 text-foreground group-hover:text-primary/90 transition-colors">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Center icon - desktop only */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className="relative group/icon">
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-primary/30 blur-md group-hover/icon:bg-primary/50 transition-all duration-300" />
                      {/* Icon container */}
                      <div className="relative w-14 h-14 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center group-hover/icon:border-primary group-hover/icon:scale-110 transition-all duration-300">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Spacer for opposite side - desktop only */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                  
                  {/* Spacing for timeline */}
                  {index < steps.length - 1 && <div className="hidden md:block h-20" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
