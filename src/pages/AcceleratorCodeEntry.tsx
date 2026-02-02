import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Building2, Sparkles } from "lucide-react";

export default function AcceleratorCodeEntry() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) return;
    
    // Convert code to slug format: "KEVIN-S-WORKSHOP" -> "kevin-s-workshop"
    const slug = code.trim().toLowerCase().replace(/_/g, "-");
    
    navigate(`/join/${slug}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      
      {/* Back button */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-20 text-muted-foreground hover:text-foreground backdrop-blur-sm bg-card/30 border border-border/30 rounded-full px-4 py-2 hover:bg-card/50 transition-all duration-300"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-3xl blur-sm opacity-50" />
          
          <div className="relative bg-card/60 backdrop-blur-2xl rounded-3xl p-8 border border-border/50 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Join Your Accelerator
              </h1>
              <p className="text-muted-foreground">
                Enter the invite code from your accelerator
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-foreground">
                  Accelerator Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KEVIN-S-WORKSHOP"
                  className="h-12 bg-background/50 border-border/50 rounded-xl text-center font-mono text-lg tracking-wider uppercase"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Your accelerator should have provided this code
                </p>
              </div>

              <Button
                type="submit"
                disabled={!code.trim()}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/60 px-3 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Alternative actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Sign up without accelerator
              </Button>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Don't have a code? Ask your accelerator program manager.
        </p>
      </div>
    </div>
  );
}
