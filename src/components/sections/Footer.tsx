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
    <footer className="py-12 px-4 border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {links.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => window.location.href = link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Button>
          ))}
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Built by Active Early-Stage VCs
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025 UglyBaby • Active Venture Capital Investors • Pre-Seed to Series A Specialists
          </p>
        </div>
      </div>
    </footer>
  );
};
