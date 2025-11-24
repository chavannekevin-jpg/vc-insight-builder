import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogIn } from "lucide-react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Product", path: "/product" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary/15 to-secondary/15 border border-primary/20 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:scale-105">
              <span className="text-primary font-bold text-lg transition-all duration-300">UB</span>
            </div>
            <span className="font-serif text-2xl hidden sm:inline text-foreground tracking-tight font-semibold">UglyBaby</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl h-10 px-5 font-medium transition-all duration-300"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
            <Button 
              onClick={() => {
                if (location.pathname !== '/') {
                  window.location.href = '/#waitlist-form';
                } else {
                  document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="gradient-primary rounded-xl h-10 px-6 font-semibold shadow-md hover:shadow-lg transition-all duration-500 hover:scale-105"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/auth');
                }}
                variant="outline"
                className="w-full gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (location.pathname !== '/') {
                    window.location.href = '/#waitlist-form';
                  } else {
                    document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="gradient-primary w-full"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
