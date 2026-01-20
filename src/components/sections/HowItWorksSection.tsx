import { Upload, FileText, Users, Rocket } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Create your account in 30 seconds. Upload your deck or answer key questions about your startup.",
      icon: Upload
    },
    {
      number: "02",
      title: "Get Your VC Analysis",
      description: "Receive your 9-page investment memo. See exactly how VCs evaluate your startup, with scores, benchmarks, and actionable insights.",
      icon: FileText
    },
    {
      number: "03",
      title: "Discover Matching Investors",
      description: "Access 800+ curated investors filtered by stage, sector, and thesis fit. No more spray-and-pray outreach.",
      icon: Users
    },
    {
      number: "04",
      title: "Pitch With Confidence",
      description: "Fix weaknesses before meetings. Walk in knowing exactly what VCs will ask—and how to answer.",
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
            From signup to investor-ready in four simple steps
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
