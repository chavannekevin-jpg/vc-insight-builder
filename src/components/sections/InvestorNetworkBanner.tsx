import { Building2, Users, Globe } from "lucide-react";

export const InvestorNetworkBanner = () => {
  return (
    <section className="py-8 relative overflow-hidden">
      {/* Subtle glow background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div 
                className="text-2xl md:text-3xl font-bold text-primary"
                style={{ 
                  textShadow: '0 0 10px hsl(var(--primary) / 0.4)'
                }}
              >
                760+
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Funds Listed</div>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div 
                className="text-2xl md:text-3xl font-bold text-primary"
                style={{ 
                  textShadow: '0 0 10px hsl(var(--primary) / 0.4)'
                }}
              >
                800+
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Investors</div>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div 
                className="text-2xl md:text-3xl font-bold text-primary"
                style={{ 
                  textShadow: '0 0 10px hsl(var(--primary) / 0.4)'
                }}
              >
                Europe
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Focus Region</div>
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-center text-muted-foreground text-sm md:text-base mt-6 max-w-xl mx-auto">
            Skip the cold outreach. Your analysis unlocks access to investors actively funding companies at your stage.
          </p>
        </div>
      </div>
    </section>
  );
};
