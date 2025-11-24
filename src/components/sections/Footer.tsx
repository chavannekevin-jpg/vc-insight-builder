import { Button } from "../ui/button";

export const Footer = () => {
  const links = [
    { label: "About", href: "/about" },
    { label: "FAQ", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "#" }
  ];

  return (
    <footer className="py-16 px-6 sm:px-8 border-t border-primary/20 bg-card/30 backdrop-blur-sm relative overflow-hidden">
      {/* Animated neon accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {links.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => window.location.href = link.href}
              className="text-sm text-muted-foreground hover:text-primary hover:scale-105 transition-all duration-300 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Button>
          ))}
        </div>
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm mb-2 hover:bg-primary/20 hover:shadow-glow transition-all duration-300 cursor-default">
            <span className="text-sm font-bold text-primary">Built by Active Early-Stage VCs</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            © 2025 UglyBaby • Active Venture Capital Investors • Pre-Seed to Series A Specialists
          </p>
        </div>
      </div>
    </footer>
  );
};
