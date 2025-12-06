import { Flame, AlertTriangle, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";

interface RoastEntryScreenProps {
  companyName: string;
  onStart: () => void;
  isLoading: boolean;
}

export const RoastEntryScreen = ({ companyName, onStart, isLoading }: RoastEntryScreenProps) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      {/* Flame animation container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl bg-gradient-to-t from-orange-500/30 via-red-500/20 to-transparent animate-pulse" />
        <Flame className="w-24 h-24 text-orange-500 animate-bounce relative z-10" />
      </div>

      <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-4">
        Roast Your Baby
      </h1>
      
      <p className="text-xl text-muted-foreground text-center mb-8 max-w-md">
        Can <span className="text-primary font-semibold">{companyName}</span> survive 10 brutal VC questions?
      </p>

      {/* Rules card */}
      <ModernCard className="max-w-lg w-full mb-8">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          The Rules
        </h3>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">1.</span>
            <span>10 tough questions tailored to YOUR company data</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">2.</span>
            <span>Each answer is scored 0-10 with real-time roast feedback</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">3.</span>
            <span>No time limit, but the VC gets impatient...</span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-green-500 mt-0.5" />
            <span><strong className="text-green-500">Speed Bonus:</strong> Answer in under 30 seconds for +1 point</span>
          </li>
          <li className="flex items-start gap-3">
            <Trophy className="w-4 h-4 text-yellow-500 mt-0.5" />
            <span><strong className="text-yellow-500">Goal:</strong> Score 70+ to prove you're investor-ready</span>
          </li>
        </ul>
      </ModernCard>

      {/* Start button */}
      <Button
        size="lg"
        onClick={onStart}
        disabled={isLoading}
        className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
      >
        {isLoading ? (
          <>
            <Flame className="w-5 h-5 mr-2 animate-pulse" />
            Preparing Questions...
          </>
        ) : (
          <>
            <Flame className="w-5 h-5 mr-2" />
            Start the Roast
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground mt-4">
        Takes about 10-15 minutes
      </p>
    </div>
  );
};
