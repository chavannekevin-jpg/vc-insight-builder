import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const HeroSection = () => {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 sm:px-8 lg:px-12 py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero -z-10" />
      
      {/* Subtle glow decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-50" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-full shadow-lg">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Built by VCs</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight leading-[1.1]">
          Stop Getting{" "}
          <span className="text-primary relative inline-block">
            Ghosted
            <span className="absolute -inset-2 bg-primary/10 blur-2xl rounded-full -z-10"></span>
          </span>{" "}
          by VCs
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          We're active early-stage investors who know exactly what VCs look for.
          Get the unfiltered truth about your startup—before investors do.
        </p>

        {/* CTA section */}
        <div className="flex flex-col items-center gap-8 pt-4">
          <p className="text-lg md:text-xl text-foreground/90 font-medium max-w-xl leading-relaxed">
            Because nobody will tell you that your baby is ugly.
          </p>
          <Button 
            size="lg" 
            className="text-base px-12 py-7 gradient-primary shadow-lg hover:shadow-xl transition-all duration-500 font-semibold tracking-wide rounded-2xl hover:scale-105"
            onClick={scrollToWaitlist}
          >
            Build My Memo
          </Button>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-xl">
            <span className="text-sm text-muted-foreground font-medium">
              🔥 <span className="text-primary font-semibold">50% OFF</span> for early sign-ups
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
