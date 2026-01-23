import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DemoToolWrapperProps {
  children: React.ReactNode;
  toolName: string;
  toolDescription: string;
}

/**
 * Wraps any tool component with a demo overlay that:
 * 1. Grays out the content to indicate it's view-only
 * 2. Shows a persistent CTA to create an account
 * 3. Disables all interactions within the tool
 */
export const DemoToolWrapper = ({ 
  children, 
  toolName,
  toolDescription 
}: DemoToolWrapperProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* The actual tool content - grayed out and non-interactive */}
      <div className="opacity-60 pointer-events-none select-none">
        {children}
      </div>
      
      {/* Persistent overlay with signup CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/95 to-transparent pt-16 pb-6 px-4">
        <div className="max-w-md mx-auto text-center space-y-3 p-5 rounded-2xl bg-card/90 backdrop-blur-2xl border border-border/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/15 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground">{toolName} - View Only</h4>
          <p className="text-sm text-muted-foreground">
            {toolDescription}
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full gap-2"
          >
            Create Account to Use This Tool
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
