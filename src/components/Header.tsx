import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogIn, LogOut, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Ignore session_not_found errors - session already invalid
      if (error && error.message !== "Session from session_id claim in JWT does not exist") {
        console.error("Sign out error:", error);
        toast.error("Error signing out");
      } else {
        toast.success("Signed out successfully");
      }
    } catch (error) {
      console.error("Sign out exception:", error);
    } finally {
      // Always navigate to home page after sign out attempt
      navigate('/');
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hub", path: "/hub" },
    { name: "Product", path: "/product" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" }
  ];

  const vcBrainSections = [
    {
      category: "Stage Guides",
      items: [
        { label: "Angel Stage", path: "/vcbrain/angel" },
        { label: "Pre-Seed Stage", path: "/vcbrain/pre-seed" },
        { label: "Seed Stage", path: "/vcbrain/seed" },
        { label: "Stage Comparison", path: "/vcbrain/stage-comparison" }
      ]
    },
    {
      category: "Pitch Deck Library",
      items: [
        { label: "Problem Slide", path: "/vcbrain/deck/problem" },
        { label: "Solution Slide", path: "/vcbrain/deck/solution" },
        { label: "Product Slide", path: "/vcbrain/deck/product" },
        { label: "Market Slide", path: "/vcbrain/deck/market" },
        { label: "Traction Slide", path: "/vcbrain/deck/traction" },
        { label: "Team Slide", path: "/vcbrain/deck/team" }
      ]
    },
    {
      category: "Tactical Guides",
      items: [
        { label: "What Angels Want", path: "/vcbrain/guides/angels" },
        { label: "Early Traction", path: "/vcbrain/guides/traction" },
        { label: "Fake TAMs", path: "/vcbrain/guides/tam" },
        { label: "Why Startups Die", path: "/vcbrain/guides/death" }
      ]
    },
    {
      category: "Tools & Resources",
      items: [
        { label: "VC Glossary", path: "/vcbrain/tools/glossary" },
        { label: "Red Flag Database", path: "/vcbrain/tools/red-flags" },
        { label: "Pitch Checklist", path: "/vcbrain/tools/checklist" }
      ]
    }
  ];

  const toolsSections = [
    {
      category: "Calculators",
      items: [
        { label: "Raise Calculator", path: "/raise-calculator", description: "Calculate how much to raise" },
        { label: "Valuation Calculator", path: "/valuation-calculator", description: "Estimate your valuation" }
      ]
    },
    {
      category: "Resources",
      items: [
        { label: "Sample Memo", path: "/sample-memo", description: "Preview a full investment memo", public: true },
        { label: "Educational Hub", path: "/hub", description: "Access learning resources" }
      ]
    }
  ];

  const handleToolClick = (path: string, isPublic?: boolean) => {
    setToolsDropdownOpen(false);
    if (!isAuthenticated && !isPublic) {
      toast.info("Please sign in to access this tool");
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  const handleHubLinkClick = (path: string) => {
    setHubDropdownOpen(false);
    if (!isAuthenticated) {
      toast.info("Please sign in to access VC Brain");
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-glow">
              <span className="neon-pink font-bold text-lg transition-all duration-300">UB</span>
            </div>
            <span className="font-serif text-2xl hidden sm:inline neon-pink tracking-tight">UglyBaby</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              // Hub dropdown - visible to everyone
              if (link.name === "Hub") {
                return (
                  <div
                    key={link.path}
                    className="relative"
                    onMouseEnter={() => setHubDropdownOpen(true)}
                    onMouseLeave={() => setHubDropdownOpen(false)}
                  >
                    <button
                      onClick={() => isAuthenticated ? navigate(link.path) : navigate('/auth')}
                      className={`text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                        isActive(link.path) ? "neon-pink" : "text-muted-foreground hover:neon-pink"
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {/* Hub Dropdown Menu */}
                    {hubDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-[600px] bg-card border border-border rounded-lg shadow-xl z-50 p-4">
                        {!isAuthenticated && (
                          <div className="mb-3 px-2 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                            <p className="text-xs text-primary font-semibold">🔒 Sign in to access VC Brain resources</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          {vcBrainSections.map((section) => (
                            <div key={section.category} className="space-y-2">
                              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider px-2">
                                {section.category}
                              </h4>
                              <div className="space-y-1">
                                {section.items.map((item) => (
                                  <button
                                    key={item.path}
                                    onClick={() => handleHubLinkClick(item.path)}
                                    className="w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
            
            {/* Tools Dropdown - visible to everyone */}
            <div
              className="relative"
              onMouseEnter={() => setToolsDropdownOpen(true)}
              onMouseLeave={() => setToolsDropdownOpen(false)}
            >
              <button
                className="text-sm font-medium transition-all duration-300 flex items-center gap-1 text-muted-foreground hover:neon-pink"
              >
                Tools
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Tools Dropdown Menu */}
              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[400px] bg-card border border-border rounded-lg shadow-xl z-50 p-4">
                  {!isAuthenticated && (
                    <div className="mb-3 px-2 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-xs text-primary font-semibold">🔒 Sign in to access all tools</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {toolsSections.map((section) => (
                      <div key={section.category} className="space-y-2">
                        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider px-2">
                          {section.category}
                        </h4>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleToolClick(item.path, item.public)}
                              className="w-full text-left px-2 py-2 rounded hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                                {!item.public && !isAuthenticated && (
                                  <span className="text-xs text-primary">🔒</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Other nav links (Product, Pricing, About) */}
            {navLinks.map((link) => {
              if (link.name === "Hub") return null;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive(link.path) ? "neon-pink" : "text-muted-foreground hover:neon-pink"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={isAuthenticated ? handleSignOut : () => navigate('/auth')}
              className="neon-pink hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center gap-2"
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
            <Button 
              onClick={() => {
                const pricingSection = document.getElementById('pricing-section');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="gradient-primary shadow-glow hover:shadow-glow-strong"
            >
              Get your Memo
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
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive(link.path) ? "neon-pink" : "text-muted-foreground hover:neon-pink"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAuthenticated) {
                    handleSignOut();
                  } else {
                    navigate('/auth');
                  }
                }}
                className="w-full neon-pink hover:brightness-125 transition-all duration-300 cursor-pointer font-semibold text-sm flex items-center justify-center gap-2 py-2"
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
              <Button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  const pricingSection = document.getElementById('pricing-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="gradient-primary w-full shadow-glow"
              >
                Get your Memo
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
