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
      
      {/* Pink neon glow decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ boxShadow: 'var(--shadow-neon-pink)' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', boxShadow: 'var(--shadow-neon-purple)' }} />
      
      <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Badge with brutalist style */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border-2 border-primary" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <span className="text-sm font-bold text-primary uppercase tracking-wider">Built by VCs</span>
        </div>

        {/* Main headline with neon effect */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
          Stop Getting{" "}
          <span className="text-primary text-neon">
            Ghosted
          </span>{" "}
          by VCs
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto leading-relaxed font-light">
          We're active early-stage investors who know exactly what VCs look for.
          Get the unfiltered truth about your startup—before investors do.
        </p>

        {/* CTA button with brutal design */}
        <div className="flex flex-col items-center gap-6 pt-8">
          <p className="text-2xl md:text-3xl text-primary font-neon uppercase tracking-wider text-neon">
            Because nobody will tell you that your baby is ugly.
          </p>
          <Button 
            size="lg" 
            className="text-xl px-12 py-8 bg-primary text-primary-foreground border-2 border-primary font-bold uppercase tracking-wider hover:translate-x-1 hover:translate-y-1 transition-transform"
            onClick={scrollToWaitlist}
            style={{ boxShadow: '6px 6px 0 hsl(var(--secondary))' }}
          >
            Build My Memo
          </Button>
          <p className="text-sm text-muted-foreground font-medium">
            🔥 <span className="text-primary font-bold">50% OFF</span> for early sign-ups
          </p>
        </div>
      </div>
    </section>
  );
};
