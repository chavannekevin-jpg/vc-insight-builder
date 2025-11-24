import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Flame } from "lucide-react";
export const HeroSection = () => {
  const scrollToPricing = () => {
    document.getElementById('pricing-section')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative min-h-[90vh] flex items-center justify-center px-6 sm:px-8 lg:px-12 py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero -z-10" />
      
      {/* Subtle glow decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-50" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse opacity-50" style={{
      animationDelay: '1s'
    }} />
      
      <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Badge with personal branding */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg shadow-lg">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Built by VCs</span>
          </div>
          <p className="text-sm text-muted-foreground">
            by Kevin Chavanne • Nordic VC • 10+ Years Experience <span className="text-foreground font-semibold">Kevin Chavanne</span> • Nordic VC @ Tenity • 10+ Years Experience
          </p>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
          I've Rejected Thousands.<br />
          <span className="text-primary text-neon">
            Here's How
          </span>{" "}
          to Not Be Next.
        </h1>

        {/* Subheadline with personal perspective */}
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="text-xl md:text-2xl text-foreground font-semibold leading-relaxed">
            I'm tired of watching founders fail.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            After 10 years in VC, reviewing thousands of startups, I see the same mistakes over and over. So I built this — a simple platform that gives you access to the same frameworks and clarity I use to evaluate startups every day. <span className="text-foreground font-semibold">10 years in VC</span>, reviewing thousands of pitches, I see the same mistakes over and over. <span className="text-primary font-semibold">So I built this</span> — a simple platform that gives you access to the same frameworks and clarity I use to evaluate startups every day.
          </p>
        </div>

        {/* CTA section */}
        <div className="flex flex-col items-center gap-6 pt-8">
          <p className="text-xl md:text-2xl text-foreground font-sans font-medium tracking-tight max-w-2xl">
            Because nobody will tell you that your baby is ugly.
          </p>
          <Button size="lg" className="text-lg px-10 py-6 gradient-primary shadow-glow hover-neon-pulse transition-all duration-300 font-bold uppercase tracking-wider" onClick={scrollToPricing}>
            Level Up Your Startup →
          </Button>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">
              <span className="text-primary font-bold">50% OFF</span> for early sign-ups
            </span>
          </div>
        </div>
      </div>
    </section>;
};