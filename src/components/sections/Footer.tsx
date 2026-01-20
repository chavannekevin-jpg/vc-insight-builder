import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export const Footer = memo(() => {
  const links = [
    { label: "About", href: "/about" },
    { label: "Accelerators", href: "/accelerators" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ];

  return (
    <footer className="py-16 px-6 sm:px-8 border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {links.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              asChild
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Link to={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg backdrop-blur-sm mb-2">
            <span className="text-sm font-bold text-primary">Built by Kevin Chavanne, Nordic VC</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            © 2025 UglyBaby • Kevin Chavanne • 10+ years investing in European startups
          </p>
          <p className="text-xs text-muted-foreground">
            Tenity • Blast Club • Funderbeam • Plug & Play
          </p>
          <div className="pt-2">
            <a 
              href="https://www.linkedin.com/in/kevin-chavanne-1b8a368a/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
