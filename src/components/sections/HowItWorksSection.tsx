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
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Your Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From profile to pitch-ready through a complete founder ecosystem
          </p>
        </div>
        
        {/* Timeline container */}
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical connecting line - hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-primary/50 transform -translate-x-1/2" />
          
          <div className="space-y-8 md:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={index} 
                  className={`relative md:flex md:items-center md:gap-8 ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Card */}
                  <div className={`md:w-[calc(50%-2rem)] ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all">
                      {/* Mobile layout */}
                      <div className="flex gap-4 items-start md:hidden">
                        <div className="flex-shrink-0">
                          <div 
                            className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform"
                            style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}
                          >
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div 
                            className="text-xs font-bold text-primary mb-2 tracking-widest"
                            style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.5)' }}
                          >
                            {step.number}
                          </div>
                          <h3 className="font-bold text-xl mb-2 text-foreground">{step.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                      
                      {/* Desktop layout */}
                      <div className="hidden md:block">
                        <div 
                          className="text-xs font-bold text-primary mb-3 tracking-widest"
                          style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.5)' }}
                        >
                          {step.number}
                        </div>
                        <h3 className="font-bold text-xl mb-2 text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Center icon - desktop only */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div 
                      className="w-16 h-16 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center"
                      style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.4)' }}
                    >
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  
                  {/* Spacer for opposite side - desktop only */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                  
                  {/* Spacing for timeline */}
                  {index < steps.length - 1 && <div className="hidden md:block h-24" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
