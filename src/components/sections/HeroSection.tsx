import { ModernRetroButton } from "../ModernRetroButton";

export const HeroSection = () => {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl text-center space-y-8">
        <div className="space-y-6">
          <div className="inline-block">
            <h1 className="font-pixel text-xl md:text-3xl leading-relaxed text-foreground mb-2">
              Turn Your Startup Into a VC-Ready Startup
            </h1>
            <div className="h-1 gradient-retro rounded-full mt-4"></div>
          </div>
          <p className="font-sans text-xl md:text-2xl max-w-2xl mx-auto text-muted-foreground leading-relaxed">
            Generate a VC-calibrated investment memorandum based on 10+ years of venture capital experience. 
            Stop getting rejected without clarity.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <ModernRetroButton 
            variant="primary" 
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto min-w-[240px]"
          >
            Join the Waitlist
          </ModernRetroButton>
          <ModernRetroButton 
            variant="secondary"
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto min-w-[240px]"
          >
            Skip the Line
          </ModernRetroButton>
        </div>

        <div className="pt-8">
          <div className="retro-card inline-block px-6 py-3">
            <p className="font-sans text-base font-medium">
              💾 Early Access Discount Available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
