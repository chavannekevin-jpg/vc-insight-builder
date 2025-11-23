import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Win98StartButton } from "@/components/Win98StartButton";
import { Win98Card } from "@/components/Win98Card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Portal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Form data state - organized by sections
  const [formData, setFormData] = useState({
    // Company Basics
    foundingDate: "",
    location: "",
    website: "",
    legalStructure: "",
    
    // Problem & Solution
    problemStatement: "",
    targetCustomer: "",
    whyNow: "",
    solution: "",
    valueProposition: "",
    
    // Product/Service
    productDescription: "",
    developmentStage: "",
    keyFeatures: "",
    competitiveAdvantage: "",
    intellectualProperty: "",
    
    // Business Model
    revenueModel: "",
    pricingStrategy: "",
    customerAcquisition: "",
    unitEconomics: "",
    keyMetrics: "",
    
    // Market
    targetMarket: "",
    marketSizeTAM: "",
    marketSizeSAM: "",
    marketSizeSOM: "",
    marketTrends: "",
    competitors: "",
    differentiation: "",
    
    // Traction
    currentRevenue: "",
    userMetrics: "",
    growthRate: "",
    keyMilestones: "",
    customerTestimonials: "",
    partnerships: "",
    
    // Team
    founderBackground: "",
    keyTeamMembers: "",
    advisors: "",
    whyThisTeam: "",
    
    // Financials
    currentFinancialStatus: "",
    burnRate: "",
    runway: "",
    financialProjections: "",
    
    // Funding
    amountRaising: "",
    useOfFunds: "",
    previousFunding: "",
    currentValuation: "",
    
    // Vision & Strategy
    longTermVision: "",
    roadmap: "",
    keyRisks: "",
    exitStrategy: ""
  });

  useEffect(() => {
    const storedEmail = localStorage.getItem('founderEmail');
    const storedCompanyName = localStorage.getItem('companyName');
    
    if (!storedEmail || !storedCompanyName) {
      toast({
        title: "Access Denied",
        description: "Please register first to access the portal.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    setFounderEmail(storedEmail);
    setCompanyName(storedCompanyName);
  }, [navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-save to localStorage
    localStorage.setItem(`formData_${field}`, value);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Questionnaire Submitted!",
      description: "Your information has been saved. We'll start generating your memorandum.",
    });
    // Here you would send data to backend
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <h3 className="font-pixel text-sm mb-6">Section 1: Company Basics & Problem</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Founding Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.foundingDate}
                  onChange={(e) => handleInputChange('foundingDate', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Location (City, Country) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                  placeholder="e.g., London, UK"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Legal Structure *
                </label>
                <select
                  required
                  value={formData.legalStructure}
                  onChange={(e) => handleInputChange('legalStructure', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                >
                  <option value="">Select...</option>
                  <option value="ltd">Limited Company (Ltd)</option>
                  <option value="llc">LLC</option>
                  <option value="c-corp">C-Corp</option>
                  <option value="delaware-c-corp">Delaware C-Corp</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  What problem are you solving? * <span className="text-muted-foreground font-normal">(Be specific)</span>
                </label>
                <textarea
                  required
                  value={formData.problemStatement}
                  onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[120px]"
                  placeholder="Describe the problem your target customers face..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Who is your target customer? *
                </label>
                <textarea
                  required
                  value={formData.targetCustomer}
                  onChange={(e) => handleInputChange('targetCustomer', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Define your ideal customer profile..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Why now? * <span className="text-muted-foreground font-normal">(Market timing)</span>
                </label>
                <textarea
                  required
                  value={formData.whyNow}
                  onChange={(e) => handleInputChange('whyNow', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="What has changed that makes this the right time for your solution?"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <h3 className="font-pixel text-sm mb-6">Section 2: Solution & Product</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Your Solution * <span className="text-muted-foreground font-normal">(How do you solve the problem?)</span>
                </label>
                <textarea
                  required
                  value={formData.solution}
                  onChange={(e) => handleInputChange('solution', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[120px]"
                  placeholder="Describe your solution in detail..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Unique Value Proposition * <span className="text-muted-foreground font-normal">(Why you vs alternatives?)</span>
                </label>
                <textarea
                  required
                  value={formData.valueProposition}
                  onChange={(e) => handleInputChange('valueProposition', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="What makes your solution unique and better?"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Product Description *
                </label>
                <textarea
                  required
                  value={formData.productDescription}
                  onChange={(e) => handleInputChange('productDescription', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[120px]"
                  placeholder="Describe your product/service in detail..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Development Stage *
                </label>
                <select
                  required
                  value={formData.developmentStage}
                  onChange={(e) => handleInputChange('developmentStage', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                >
                  <option value="">Select...</option>
                  <option value="concept">Concept/Idea</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="beta">Beta/Live Testing</option>
                  <option value="launched">Launched</option>
                  <option value="scaling">Scaling</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Key Features <span className="text-muted-foreground font-normal">(List main features)</span>
                </label>
                <textarea
                  value={formData.keyFeatures}
                  onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="• Feature 1&#10;• Feature 2&#10;• Feature 3"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Competitive Advantage * <span className="text-muted-foreground font-normal">(Your moat)</span>
                </label>
                <textarea
                  required
                  value={formData.competitiveAdvantage}
                  onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="What makes it hard for competitors to replicate your success?"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Intellectual Property <span className="text-muted-foreground font-normal">(Patents, trademarks, etc.)</span>
                </label>
                <textarea
                  value={formData.intellectualProperty}
                  onChange={(e) => handleInputChange('intellectualProperty', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[80px]"
                  placeholder="Any IP, patents pending, or proprietary technology?"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <h3 className="font-pixel text-sm mb-6">Section 3: Business Model & Market</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Revenue Model * <span className="text-muted-foreground font-normal">(How do you make money?)</span>
                </label>
                <textarea
                  required
                  value={formData.revenueModel}
                  onChange={(e) => handleInputChange('revenueModel', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Subscription, transaction fees, licensing, etc."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Pricing Strategy *
                </label>
                <textarea
                  required
                  value={formData.pricingStrategy}
                  onChange={(e) => handleInputChange('pricingStrategy', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Pricing tiers, average deal size, etc."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Customer Acquisition Strategy *
                </label>
                <textarea
                  required
                  value={formData.customerAcquisition}
                  onChange={(e) => handleInputChange('customerAcquisition', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="How do you acquire customers? Channels, tactics, partnerships..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Unit Economics <span className="text-muted-foreground font-normal">(CAC, LTV, margins)</span>
                </label>
                <textarea
                  value={formData.unitEconomics}
                  onChange={(e) => handleInputChange('unitEconomics', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Customer Acquisition Cost, Lifetime Value, LTV:CAC ratio, gross margins..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Target Market * <span className="text-muted-foreground font-normal">(Define your market)</span>
                </label>
                <textarea
                  required
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Who are you selling to? Geography, industry, company size, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                    TAM <span className="text-muted-foreground font-normal">(Total Addressable)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.marketSizeTAM}
                    onChange={(e) => handleInputChange('marketSizeTAM', e.target.value)}
                    className="w-full retro-input font-sans text-sm"
                    placeholder="$XB"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                    SAM <span className="text-muted-foreground font-normal">(Serviceable Available)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.marketSizeSAM}
                    onChange={(e) => handleInputChange('marketSizeSAM', e.target.value)}
                    className="w-full retro-input font-sans text-sm"
                    placeholder="$XM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                    SOM <span className="text-muted-foreground font-normal">(Serviceable Obtainable)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.marketSizeSOM}
                    onChange={(e) => handleInputChange('marketSizeSOM', e.target.value)}
                    className="w-full retro-input font-sans text-sm"
                    placeholder="$XM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Market Trends & Dynamics
                </label>
                <textarea
                  value={formData.marketTrends}
                  onChange={(e) => handleInputChange('marketTrends', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="What trends are driving market growth? Regulatory changes, technology shifts, etc."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Main Competitors * <span className="text-muted-foreground font-normal">(Direct & indirect)</span>
                </label>
                <textarea
                  required
                  value={formData.competitors}
                  onChange={(e) => handleInputChange('competitors', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="List main competitors and alternatives customers use today"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Your Differentiation * <span className="text-muted-foreground font-normal">(How are you different?)</span>
                </label>
                <textarea
                  required
                  value={formData.differentiation}
                  onChange={(e) => handleInputChange('differentiation', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Why will customers choose you over competitors?"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <h3 className="font-pixel text-sm mb-6">Section 4: Traction & Team</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Current Revenue <span className="text-muted-foreground font-normal">(MRR, ARR, or one-time)</span>
                </label>
                <input
                  type="text"
                  value={formData.currentRevenue}
                  onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                  placeholder="e.g., $50K MRR, $600K ARR, or 'Pre-revenue'"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  User/Customer Metrics
                </label>
                <textarea
                  value={formData.userMetrics}
                  onChange={(e) => handleInputChange('userMetrics', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Active users, paying customers, retention rates, engagement metrics..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Growth Rate <span className="text-muted-foreground font-normal">(Month-over-month or year-over-year)</span>
                </label>
                <input
                  type="text"
                  value={formData.growthRate}
                  onChange={(e) => handleInputChange('growthRate', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                  placeholder="e.g., 15% MoM, 3x YoY"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Key Milestones Achieved
                </label>
                <textarea
                  value={formData.keyMilestones}
                  onChange={(e) => handleInputChange('keyMilestones', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Product launches, major partnerships, awards, media coverage..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Customer Testimonials / Case Studies
                </label>
                <textarea
                  value={formData.customerTestimonials}
                  onChange={(e) => handleInputChange('customerTestimonials', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Notable customers, success stories, testimonials..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Key Partnerships
                </label>
                <textarea
                  value={formData.partnerships}
                  onChange={(e) => handleInputChange('partnerships', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[80px]"
                  placeholder="Strategic partners, distribution agreements, etc."
                />
              </div>

              <div className="win98-inset p-3 bg-win98-blue/10 my-6">
                <p className="font-sans text-xs font-bold mb-2">TEAM INFORMATION</p>
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Founder(s) Background * <span className="text-muted-foreground font-normal">(Why are you uniquely positioned?)</span>
                </label>
                <textarea
                  required
                  value={formData.founderBackground}
                  onChange={(e) => handleInputChange('founderBackground', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[120px]"
                  placeholder="Relevant experience, domain expertise, previous companies, education..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Key Team Members
                </label>
                <textarea
                  value={formData.keyTeamMembers}
                  onChange={(e) => handleInputChange('keyTeamMembers', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="CTO, Head of Sales, etc. - their backgrounds and roles"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Advisors / Board Members
                </label>
                <textarea
                  value={formData.advisors}
                  onChange={(e) => handleInputChange('advisors', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[80px]"
                  placeholder="Notable advisors, board members, mentors..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Why This Team? * <span className="text-muted-foreground font-normal">(What makes this team special?)</span>
                </label>
                <textarea
                  required
                  value={formData.whyThisTeam}
                  onChange={(e) => handleInputChange('whyThisTeam', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="What unique combination of skills, experience, and passion does your team bring?"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <h3 className="font-pixel text-sm mb-6">Section 5: Financials & Vision</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Current Financial Status
                </label>
                <textarea
                  value={formData.currentFinancialStatus}
                  onChange={(e) => handleInputChange('currentFinancialStatus', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[80px]"
                  placeholder="Cash in bank, recent revenue trends..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                    Monthly Burn Rate
                  </label>
                  <input
                    type="text"
                    value={formData.burnRate}
                    onChange={(e) => handleInputChange('burnRate', e.target.value)}
                    className="w-full retro-input font-sans text-sm"
                    placeholder="e.g., $50K/month"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                    Runway <span className="text-muted-foreground font-normal">(Months)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.runway}
                    onChange={(e) => handleInputChange('runway', e.target.value)}
                    className="w-full retro-input font-sans text-sm"
                    placeholder="e.g., 18 months"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Financial Projections <span className="text-muted-foreground font-normal">(Next 3 years)</span>
                </label>
                <textarea
                  value={formData.financialProjections}
                  onChange={(e) => handleInputChange('financialProjections', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Revenue projections, key assumptions, path to profitability..."
                />
              </div>

              <div className="win98-inset p-3 bg-win98-green/10 my-6">
                <p className="font-sans text-xs font-bold mb-2">FUNDING INFORMATION</p>
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Amount Raising * <span className="text-muted-foreground font-normal">(This round)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.amountRaising}
                  onChange={(e) => handleInputChange('amountRaising', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                  placeholder="e.g., €500K, $1M-$1.5M"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Use of Funds * <span className="text-muted-foreground font-normal">(How will you use the capital?)</span>
                </label>
                <textarea
                  required
                  value={formData.useOfFunds}
                  onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Breakdown: e.g., 40% product development, 30% sales & marketing, 20% team, 10% operations"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Previous Funding
                </label>
                <textarea
                  value={formData.previousFunding}
                  onChange={(e) => handleInputChange('previousFunding', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[80px]"
                  placeholder="Angels, pre-seed, seed rounds, notable investors..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Current Valuation / Terms <span className="text-muted-foreground font-normal">(If set)</span>
                </label>
                <input
                  type="text"
                  value={formData.currentValuation}
                  onChange={(e) => handleInputChange('currentValuation', e.target.value)}
                  className="w-full retro-input font-sans text-sm"
                  placeholder="e.g., $5M post-money, SAFE with $8M cap"
                />
              </div>

              <div className="win98-inset p-3 bg-win98-purple/10 my-6">
                <p className="font-sans text-xs font-bold mb-2">VISION & STRATEGY</p>
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Long-Term Vision * <span className="text-muted-foreground font-normal">(5-10 years)</span>
                </label>
                <textarea
                  required
                  value={formData.longTermVision}
                  onChange={(e) => handleInputChange('longTermVision', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="Where do you see the company in 5-10 years? What's the ultimate goal?"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  12-24 Month Roadmap * <span className="text-muted-foreground font-normal">(Key milestones)</span>
                </label>
                <textarea
                  required
                  value={formData.roadmap}
                  onChange={(e) => handleInputChange('roadmap', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="What are the key milestones you plan to achieve with this funding?"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Key Risks & Mitigation *
                </label>
                <textarea
                  required
                  value={formData.keyRisks}
                  onChange={(e) => handleInputChange('keyRisks', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[100px]"
                  placeholder="What are the biggest risks to your business and how are you addressing them?"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-xs font-bold block uppercase tracking-wide">
                  Exit Strategy <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.exitStrategy}
                  onChange={(e) => handleInputChange('exitStrategy', e.target.value)}
                  className="w-full retro-input font-sans text-sm min-h-[80px]"
                  placeholder="Potential acquirers, IPO plans, or strategic exits..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Taskbar Style */}
      <header className="bg-win98-taskbar border-b-2 border-win98-light shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="win98-inset px-3 py-1 bg-background">
            <h1 className="font-pixel text-[10px] mb-0.5">{companyName}</h1>
            <p className="font-sans text-xs text-muted-foreground">{founderEmail}</p>
          </div>
          <Win98StartButton onClick={handleLogout}>
            Logout
          </Win98StartButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Win98Card title="Investment_Memo_Builder.exe" accentColor="blue" className="mb-6">
          <div className="text-center mb-6">
            <h2 className="font-pixel text-base mb-3">Company Questionnaire</h2>
            <p className="font-sans text-sm max-w-2xl mx-auto text-muted-foreground">
              Complete all sections to generate your VC-grade Investment Memorandum
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={cn(
                    "w-8 h-8 border-2 flex items-center justify-center font-pixel text-[10px] transition-all cursor-pointer",
                    step === currentStep 
                      ? 'win98-raised pastel-teal font-bold' 
                      : step < currentStep
                      ? 'win98-inset bg-win98-green/30'
                      : 'win98-inset bg-muted'
                  )}
                  onClick={() => setCurrentStep(step)}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 5 && (
                  <div className={`w-8 h-0.5 ${step < currentStep ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Auto-save indicator */}
          <div className="mb-6 text-center">
            <div className="win98-inset px-3 py-1 bg-win98-yellow/20 inline-block">
              <p className="font-sans text-xs">💾 Your progress is automatically saved</p>
            </div>
          </div>
        </Win98Card>

        {/* Form Content */}
        <Win98Card accentColor="purple">
          <form onSubmit={(e) => e.preventDefault()}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t-2 border-border flex justify-between items-center">
              <Win98StartButton 
                onClick={handlePrevious}
                disabled={currentStep === 1}
                type="button"
              >
                ← Previous
              </Win98StartButton>

              <div className="font-sans text-xs text-muted-foreground">
                Step {currentStep} of 5
              </div>

              {currentStep < 5 ? (
                <Win98StartButton 
                  variant="primary"
                  onClick={handleNext}
                  type="button"
                >
                  Next →
                </Win98StartButton>
              ) : (
                <Win98StartButton 
                  variant="primary"
                  onClick={handleSubmit}
                  type="button"
                  size="large"
                >
                  Submit & Generate Memo
                </Win98StartButton>
              )}
            </div>
          </form>
        </Win98Card>

        {/* Help Card */}
        <div className="mt-6">
          <Win98Card title="Help.exe" accentColor="yellow">
            <div className="space-y-2">
              <p className="font-sans text-xs">
                <span className="font-bold">💡 Tip:</span> Be specific and detailed in your answers. The more information you provide, the better your memorandum will be.
              </p>
              <p className="font-sans text-xs">
                <span className="font-bold">📝 Note:</span> Fields marked with * are required. You can save and come back later to complete the form.
              </p>
            </div>
          </Win98Card>
        </div>
      </main>
    </div>
  );
};

export default Portal;
