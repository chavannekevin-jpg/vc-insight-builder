import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernRetroButton } from "@/components/ModernRetroButton";
import { useToast } from "@/hooks/use-toast";

const Portal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [founderEmail, setFounderEmail] = useState("");
  
  // Form states - will be expanded later with actual fields
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Check if user came from registration
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

  const handleLogout = () => {
    localStorage.removeItem('founderEmail');
    localStorage.removeItem('companyName');
    localStorage.removeItem('companyStage');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="font-pixel text-sm mb-1">{companyName}</h1>
            <p className="font-sans text-sm text-muted-foreground">{founderEmail}</p>
          </div>
          <ModernRetroButton onClick={handleLogout} variant="default">
            Logout
          </ModernRetroButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="retro-card p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="font-pixel text-2xl mb-4">Welcome to Your Portal</h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete your company profile to generate your VC-grade Investment Memorandum. 
              The information you provide will be used to create a comprehensive analysis of your startup.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center items-center gap-4 mb-12">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-pixel text-xs transition-all ${
                    step === currentStep 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : step < currentStep
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-0.5 ${step < currentStep ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Section - Placeholder */}
          <div className="max-w-3xl mx-auto">
            <div className="retro-card p-8 bg-muted/30">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="font-pixel text-base">Company Information Form</h3>
                <p className="font-sans text-base text-muted-foreground max-w-xl mx-auto">
                  The specific fields and questions for your company profile will be configured soon. 
                  This section will guide you through providing all necessary information for your investment memorandum.
                </p>
                
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <span className="font-sans text-sm font-medium">Business Model & Value Proposition</span>
                    <span className="font-pixel text-xs text-muted-foreground">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <span className="font-sans text-sm font-medium">Market Analysis & Opportunity</span>
                    <span className="font-pixel text-xs text-muted-foreground">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <span className="font-sans text-sm font-medium">Traction & Metrics</span>
                    <span className="font-pixel text-xs text-muted-foreground">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <span className="font-sans text-sm font-medium">Team & Vision</span>
                    <span className="font-pixel text-xs text-muted-foreground">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <ModernRetroButton 
                variant="default"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                ← Previous
              </ModernRetroButton>
              <ModernRetroButton 
                variant="primary"
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                disabled={currentStep === 4}
              >
                Next →
              </ModernRetroButton>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="retro-card p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-pixel text-xs">Save Progress</h3>
              <p className="font-sans text-sm text-muted-foreground">
                Your information is automatically saved as you complete each section
              </p>
            </div>
          </div>

          <div className="retro-card p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-pixel text-xs">Get Feedback</h3>
              <p className="font-sans text-sm text-muted-foreground">
                Receive diagnostic questions and improvement suggestions as you fill in data
              </p>
            </div>
          </div>

          <div className="retro-card p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-pixel text-xs">Generate Memo</h3>
              <p className="font-sans text-sm text-muted-foreground">
                Once complete, generate your professional VC-grade memorandum instantly
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portal;
