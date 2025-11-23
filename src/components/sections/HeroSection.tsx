import { Win98Button } from "../Win98Button";

export const HeroSection = () => {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="font-pixel text-2xl md:text-4xl leading-relaxed text-foreground">
            Turn Your Startup Into a VC-Ready Startup
          </h1>
          <p className="font-retro text-2xl md:text-3xl max-w-2xl mx-auto">
            Generate a VC-calibrated investment memorandum based on 10+ years of venture capital experience. 
            Stop getting rejected without clarity.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Win98Button 
            variant="primary" 
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto"
          >
            Join the Waitlist
          </Win98Button>
          <Win98Button 
            variant="secondary"
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto"
          >
            Skip the Line: Manual Memo
          </Win98Button>
        </div>

        <div className="pt-8 win98-border-inset bg-input p-4 inline-block">
          <p className="font-retro text-xl">
            💾 Early Access Discount Available
          </p>
        </div>
      </div>
    </section>
  );
};
