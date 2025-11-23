import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: t('nav.product'), path: "/product" },
    { name: t('nav.pricing'), path: "/pricing" },
    { name: t('nav.about'), path: "/about" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-card border-2 border-primary flex items-center justify-center" style={{ boxShadow: 'var(--shadow-md)' }}>
              <span className="text-primary font-bold text-lg group-hover:text-neon transition-all">UB</span>
            </div>
            <span className="font-serif text-2xl hidden sm:inline text-primary text-neon tracking-tight">UglyBaby</span>
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
            <LanguageSwitcher />
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              {t('nav.login')}
            </Button>
            <Button 
              onClick={() => {
                if (location.pathname !== '/') {
                  window.location.href = '/#waitlist-form';
                } else {
                  document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="gradient-primary"
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
              <LanguageSwitcher />
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/auth');
                }}
                variant="outline"
                className="w-full gap-2"
              >
                <LogIn className="w-4 h-4" />
                {t('nav.login')}
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
