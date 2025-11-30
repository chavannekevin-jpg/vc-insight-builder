import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-muted/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Decorative glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <span className="text-sm font-medium text-primary">10 Years as a VC</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Thousands of Pitches Reviewed</span>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15] max-w-5xl mx-auto">
            <span className="inline-block">I've Rejected</span>{" "}
            <span 
              className="text-primary font-bold inline-block"
              style={{ 
                textShadow: '0 0 10px hsl(var(--primary) / 0.6), 0 0 20px hsl(var(--primary) / 0.4), 0 0 30px hsl(var(--primary) / 0.2)'
              }}
            >
              Thousands of Founders
            </span>
            <br />
            <span className="inline-block">Here's How Not to Be Next</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            After a decade of rejecting founders, I built this platform with my investment framework, resources, and tools—so you can master what actually works before you pitch.
          </p>

          {/* Three-tier value prop */}
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary mb-1">Free Hub</div>
              <div className="text-sm text-muted-foreground">Guides, resources & frameworks</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary mb-1">Methodology</div>
              <div className="text-sm text-muted-foreground">My proven investment framework</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary mb-1">VC Memo</div>
              <div className="text-sm text-muted-foreground">Tailor made to your business</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
            >
              Access the Hub & Library →
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-8 py-4 rounded-lg bg-muted border border-border text-foreground font-semibold text-lg hover:bg-muted/80 transition-all"
            >
              Learn More
            </button>
          </div>

          {/* Social proof hint */}
          <p className="text-sm text-muted-foreground pt-2">
            Create a free account to access the complete knowledge library
          </p>
        </div>
      </div>
    </section>
  );
};
