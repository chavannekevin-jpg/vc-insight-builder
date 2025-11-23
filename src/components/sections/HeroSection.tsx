import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export const HeroSection = () => {
  const scrollToWaitlist = () => {
    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-[85vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero -z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10 animate-pulse" />
      
      <div className="max-w-5xl text-center space-y-8 animate-fade-in">
        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold shadow-md hover:shadow-lg transition-shadow">
          Built on 10+ Years of VC Experience
        </Badge>
        
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight tracking-tight drop-shadow-sm">
            VCs Won't Tell You{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-scale-in font-bold">
              What They Want
            </span>{" "}
            — But I Will
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            Generate a memo that speaks their language, not yours. 
            Built from 10+ years of watching founders fail at fundraising.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button 
            size="lg"
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto px-8 py-6 text-lg gradient-primary hover:opacity-95 shadow-lg hover:shadow-glow"
          >
            Get In Early
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={scrollToWaitlist}
            className="w-full sm:w-auto px-8 py-6 text-lg font-bold"
          >
            Get It Now →
          </Button>
        </div>

        <div className="pt-12 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary pulse-glow" />
          <p className="text-sm text-muted-foreground font-semibold">
            Early Access Discount Available
          </p>
        </div>
      </div>
    </section>
  );
};
