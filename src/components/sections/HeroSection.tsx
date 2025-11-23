import { Win98StartButton } from "../Win98StartButton";
import { Win98Card } from "../Win98Card";

export const HeroSection = () => {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl text-center space-y-10">
        <div className="space-y-6">
          <div className="inline-block">
            <h1 className="font-pixel text-xl md:text-3xl leading-relaxed text-foreground mb-2">
              Turn Your Startup Into a VC-Ready Startup
            </h1>
            <div className="flex gap-1 mt-6 justify-center">
              <div className="w-16 h-1 pastel-pink"></div>
              <div className="w-16 h-1 pastel-yellow"></div>
              <div className="w-16 h-1 pastel-green"></div>
              <div className="w-16 h-1 pastel-blue"></div>
            </div>
          </div>
          <p className="font-sans text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Generate a VC-calibrated investment memorandum based on 10+ years of venture capital experience. 
            Stop getting rejected without clarity.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Win98StartButton 
            variant="primary"
            size="large"
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto min-w-[240px]"
          >
            <span className="flex items-center gap-2">
              <span className="font-pixel text-xs">▶</span> Join the Waitlist
            </span>
          </Win98StartButton>
          <Win98StartButton 
            size="large"
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto min-w-[240px]"
          >
            Skip the Line
          </Win98StartButton>
        </div>

        <div className="pt-8 inline-block">
          <Win98Card accentColor="yellow">
            <p className="font-sans text-sm font-medium flex items-center gap-2 justify-center">
              <span className="text-lg">💾</span> Early Access Discount Available
            </p>
          </Win98Card>
        </div>
      </div>
    </section>
  );
};
