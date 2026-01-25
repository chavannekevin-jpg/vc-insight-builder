import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogIn, LogOut, ChevronDown, RotateCcw, Rocket, Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      } else {
        setIsAdmin(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        setIsAdmin(!!roleData);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      // Immediately update local state to prevent UI flicker
      setIsAuthenticated(false);
      setIsAdmin(false);
      
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
    setIsResetting(true);
    try {
      // Fetch user's company ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("No user session found");
        return;
      }

      const { data: companies } = await supabase
        .from("companies")
        .select("id")
        .eq("founder_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!companies || companies.length === 0) {
        toast.error("No company found to reset");
        return;
      }

      const companyId = companies[0].id;

      // 1. Get all memo IDs for this company
      const { data: memos } = await supabase
        .from('memos')
        .select('id')
        .eq('company_id', companyId);
      
      // 2. Delete memo_analyses for those memos
      if (memos && memos.length > 0) {
        const memoIds = memos.map(m => m.id);
        await supabase
          .from('memo_analyses')
          .delete()
          .in('memo_id', memoIds);
      }
      
      // 3. Delete memos
      await supabase.from('memos').delete().eq('company_id', companyId);
      
      // 4. Delete memo_responses
      await supabase.from('memo_responses').delete().eq('company_id', companyId);
      
      // 5. Delete waitlist_signups
      await supabase.from('waitlist_signups').delete().eq('company_id', companyId);
      
      // 6. Delete memo_purchases
      await supabase.from('memo_purchases').delete().eq('company_id', companyId);
      
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
        .eq('id', companyId);

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
        { label: "Roast Your Baby", path: "/roast-your-baby", description: "Survive 10 brutal VC questions", badge: "Premium" },
        { label: "Dilution Lab", path: "/dilution-lab", description: "Simulate funding rounds & cap tables", badge: "Premium" }
      ]
    },
    {
      category: "Resources",
      items: [
        { label: "Outreach Lab", path: "/investor-email-generator", description: "Craft cold email templates" },
        { label: "Demo Ecosystem", path: "/demo", description: "Explore the full analysis experience", public: true }
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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20">
              <span className="text-primary font-bold text-base">UB</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline text-primary tracking-tight">UglyBaby</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Home link first */}
            <Link
              to="/"
              className={`text-sm font-medium transition-all duration-200 ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                className={`text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  isActive("/hub") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Hub
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Hub Dropdown Menu */}
              {hubDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-[600px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-[100] p-6"
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
                className="text-sm font-medium transition-all duration-200 flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                Tools
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Tools Dropdown Menu */}
              {toolsDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-[400px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-[100] p-6"
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
            
            {/* Other nav links (Product, Pricing, About) */}
            {navLinks.map((link) => {
              if (link.name === "Home" || link.name === "Hub") return null;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActive(link.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActive("/admin") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Admin
                </Link>
                <button
                  onClick={() => setResetDialogOpen(true)}
                  className="text-sm font-medium transition-all duration-200 text-destructive hover:text-destructive/80 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/investor"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 px-3 py-1.5 rounded-full hover:bg-muted/50"
            >
              For Investors
            </Link>
            <Link
              to="/accelerators"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 px-3 py-1.5 rounded-full hover:bg-muted/50"
            >
              For Accelerators
            </Link>
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="text-primary hover:text-primary/80 transition-all duration-200 cursor-pointer font-medium text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/30">
                    <LogIn className="w-4 h-4" />
                    Sign In
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border-border/50">
                  <DropdownMenuItem onClick={() => navigate('/auth')} className="cursor-pointer py-3">
                    <Rocket className="w-4 h-4 mr-3 text-primary" />
                    <div>
                      <div className="font-medium">Startup Founder</div>
                      <div className="text-xs text-muted-foreground">Get your investment audit</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/investor/auth')} className="cursor-pointer py-3">
                    <Users className="w-4 h-4 mr-3 text-primary" />
                    <div>
                      <div className="font-medium">Investor</div>
                      <div className="text-xs text-muted-foreground">Access the investor network</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/accelerator/auth')} className="cursor-pointer py-3">
                    <Building2 className="w-4 h-4 mr-3 text-primary" />
                    <div>
                      <div className="font-medium">Accelerator</div>
                      <div className="text-xs text-muted-foreground">Manage your ecosystem</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActive(link.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-primary hover:text-primary/80 transition-all duration-200 cursor-pointer font-medium text-sm flex items-center justify-center gap-2 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground px-2 font-medium">Sign in as:</p>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                    className="w-full text-left px-2 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Rocket className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">Startup Founder</div>
                      <div className="text-xs text-muted-foreground">Get your investment analysis</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/investor/auth'); }}
                    className="w-full text-left px-2 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Users className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">Investor</div>
                      <div className="text-xs text-muted-foreground">Access the investor network</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/accelerator/auth'); }}
                    className="w-full text-left px-2 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">Accelerator</div>
                      <div className="text-xs text-muted-foreground">Manage your ecosystem</div>
                    </div>
                  </button>
                </div>
              )}
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
