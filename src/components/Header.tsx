import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogIn, LogOut, ChevronDown, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [hasMemo, setHasMemo] = useState(false);
  const [memoCompanyId, setMemoCompanyId] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Refs for managing hover delays
  const hubTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toolsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsAuthenticated(!!session);
      
      // Check admin role and memo
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
        
        // Check if user has a generated memo
        const { data: companies } = await supabase
          .from("companies")
          .select("id")
          .eq("founder_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (companies && companies.length > 0) {
          const { data: memo } = await supabase
            .from("memos")
            .select("id, structured_content")
            .eq("company_id", companies[0].id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (memo && memo.structured_content) {
            setHasMemo(true);
            setMemoCompanyId(companies[0].id);
          }
        }
      } else {
        setIsAdmin(false);
        setHasMemo(false);
        setMemoCompanyId(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      
      // Check admin role and memo on auth state change
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
        
        // Check if user has a generated memo
        const { data: companies } = await supabase
          .from("companies")
          .select("id")
          .eq("founder_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (companies && companies.length > 0) {
          const { data: memo } = await supabase
            .from("memos")
            .select("id, structured_content")
            .eq("company_id", companies[0].id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (memo && memo.structured_content) {
            setHasMemo(true);
            setMemoCompanyId(companies[0].id);
          }
        }
      } else {
        setIsAdmin(false);
        setHasMemo(false);
        setMemoCompanyId(null);
      }
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

  const handleSoftReset = async () => {
    if (!memoCompanyId) {
      toast.error("No company found to reset");
      return;
    }

    setIsResetting(true);
    try {
      // 1. Get all memo IDs for this company
      const { data: memos } = await supabase
        .from('memos')
        .select('id')
        .eq('company_id', memoCompanyId);
      
      // 2. Delete memo_analyses for those memos
      if (memos && memos.length > 0) {
        const memoIds = memos.map(m => m.id);
        await supabase
          .from('memo_analyses')
          .delete()
          .in('memo_id', memoIds);
      }
      
      // 3. Delete memos
      await supabase.from('memos').delete().eq('company_id', memoCompanyId);
      
      // 4. Delete memo_responses
      await supabase.from('memo_responses').delete().eq('company_id', memoCompanyId);
      
      // 5. Delete waitlist_signups
      await supabase.from('waitlist_signups').delete().eq('company_id', memoCompanyId);
      
      // 6. Delete memo_purchases
      await supabase.from('memo_purchases').delete().eq('company_id', memoCompanyId);
      
      // 7. Reset company fields
      await supabase
        .from('companies')
        .update({
          deck_url: null,
          deck_parsed_at: null,
          deck_confidence_scores: null,
          description: null,
          category: null,
          biggest_challenge: null
        })
        .eq('id', memoCompanyId);

      setHasMemo(false);
      toast.success("Profile reset successfully! Refreshing...");
      
      // Refresh the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Failed to reset profile");
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
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
      category: "Diagnostics",
      items: [
        { label: "Venture Scale Diagnostic", path: "/venture-scale-diagnostic", description: "Are you truly VC-scale?" },
        { label: "Roast Your Baby", path: "/roast-your-baby", description: "Survive 10 brutal VC questions", badge: "Premium" }
      ]
    },
    {
      category: "Resources",
      items: [
        { label: "Outreach Lab", path: "/investor-email-generator", description: "Craft cold email templates" },
        { label: "Sample Memo", path: "/sample-memo", description: "Preview a full investment memo", public: true }
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

  // Handlers for Hub dropdown with delay
  const handleHubMouseEnter = () => {
    if (hubTimeoutRef.current) {
      clearTimeout(hubTimeoutRef.current);
    }
    setHubDropdownOpen(true);
  };

  const handleHubMouseLeave = () => {
    hubTimeoutRef.current = setTimeout(() => {
      setHubDropdownOpen(false);
    }, 150);
  };

  // Handlers for Tools dropdown with delay
  const handleToolsMouseEnter = () => {
    if (toolsTimeoutRef.current) {
      clearTimeout(toolsTimeoutRef.current);
    }
    setToolsDropdownOpen(true);
  };

  const handleToolsMouseLeave = () => {
    toolsTimeoutRef.current = setTimeout(() => {
      setToolsDropdownOpen(false);
    }, 150);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hubTimeoutRef.current) clearTimeout(hubTimeoutRef.current);
      if (toolsTimeoutRef.current) clearTimeout(toolsTimeoutRef.current);
    };
  }, []);

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
            {/* Home link first */}
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-300 ${
                isActive("/") ? "neon-pink" : "text-muted-foreground hover:neon-pink"
              }`}
            >
              Home
            </Link>
            
            {/* Hub dropdown */}
            <div
              className="relative"
              onMouseEnter={handleHubMouseEnter}
              onMouseLeave={handleHubMouseLeave}
            >
              <button
                onClick={() => isAuthenticated ? navigate("/hub") : navigate('/auth')}
                className={`text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  isActive("/hub") ? "neon-pink" : "text-muted-foreground hover:neon-pink"
                }`}
              >
                Hub
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Hub Dropdown Menu */}
              {hubDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-[600px] bg-card border border-border/50 rounded-2xl shadow-2xl z-[100] p-6"
                  onMouseEnter={handleHubMouseEnter}
                  onMouseLeave={handleHubMouseLeave}
                >
                  {!isAuthenticated && (
                    <div className="mb-4 px-3 py-2.5 bg-primary/10 border border-primary/30 rounded-xl">
                      <p className="text-xs text-primary font-semibold">🔒 Sign in to access VC Brain resources</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-6">
                    {vcBrainSections.map((section) => (
                      <div key={section.category} className="space-y-3">
                        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider px-3">
                          {section.category}
                        </h4>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleHubLinkClick(item.path)}
                              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
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
            
            {/* Tools Dropdown - visible to everyone */}
            <div
              className="relative"
              onMouseEnter={handleToolsMouseEnter}
              onMouseLeave={handleToolsMouseLeave}
            >
              <button
                onClick={() => navigate("/tools")}
                className="text-sm font-medium transition-all duration-300 flex items-center gap-1 text-muted-foreground hover:neon-pink"
              >
                Tools
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Tools Dropdown Menu */}
              {toolsDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-[400px] bg-card border border-border/50 rounded-2xl shadow-2xl z-[100] p-6"
                  onMouseEnter={handleToolsMouseEnter}
                  onMouseLeave={handleToolsMouseLeave}
                >
                  {!isAuthenticated && (
                    <div className="mb-4 px-3 py-2.5 bg-primary/10 border border-primary/30 rounded-xl">
                      <p className="text-xs text-primary font-semibold">🔒 Sign in to access all tools</p>
                    </div>
                  )}
                  <div className="space-y-5">
                    {toolsSections.map((section) => (
                      <div key={section.category} className="space-y-3">
                        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider px-3">
                          {section.category}
                        </h4>
                        <div className="space-y-1">
                          {section.items.map((item) => (
                            <button
                              key={item.path}
                              onClick={() => handleToolClick(item.path, item.public)}
                              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
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
            
            {/* My Memo link - only show if user has a generated memo */}
            {isAuthenticated && hasMemo && memoCompanyId && (
              <Link
                to={`/memo?companyId=${memoCompanyId}`}
                className={`text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/memo" ? "neon-pink" : "text-muted-foreground hover:neon-pink"
                }`}
              >
                My Memo
              </Link>
            )}
            
            {/* Other nav links (Product, Pricing, About) */}
            {navLinks.map((link) => {
              if (link.name === "Home" || link.name === "Hub") return null;
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
            
            {/* Admin link - only visible to admins */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive("/admin") ? "neon-pink" : "text-muted-foreground hover:neon-pink"
                  }`}
                >
                  Admin
                </Link>
                <button
                  onClick={() => setResetDialogOpen(true)}
                  className="text-sm font-medium transition-all duration-300 text-destructive hover:text-destructive/80 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </>
            )}
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
              {/* My Memo link in mobile menu */}
              {isAuthenticated && hasMemo && memoCompanyId && (
                <Link
                  to={`/memo?companyId=${memoCompanyId}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-all duration-300 ${
                    location.pathname === "/memo" ? "neon-pink" : "text-muted-foreground hover:neon-pink"
                  }`}
                >
                  My Memo
                </Link>
              )}
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

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Profile Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all responses, memos, deck data, and analysis for the current company. 
              The company record will be kept, but you'll return to an empty profile state.
              <br /><br />
              <strong className="text-destructive">This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSoftReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? "Resetting..." : "Reset Profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};
