import { Flame, AlertTriangle, Zap, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ModernCard";
import { cn } from "@/lib/utils";

export type GameMode = 'quick' | 'medium' | 'full';

interface RoastEntryScreenProps {
  companyName: string;
  onStart: (mode: GameMode) => void;
  isLoading: boolean;
}

const gameModes = [
  {
    id: 'quick' as GameMode,
    name: 'Quick Fire',
    questions: 3,
    time: '2-3 min',
    description: 'Perfect for a quick test',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'medium' as GameMode,
    name: 'Standard',
    questions: 5,
    time: '5-7 min',
    description: 'Balanced challenge',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'full' as GameMode,
    name: 'Full Roast',
    questions: 10,
    time: '10-15 min',
    description: 'The complete VC grilling',
    color: 'from-orange-500 to-red-500',
  },
];

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
        Can <span className="text-primary font-semibold">{companyName}</span> survive the VC heat?
      </p>

      {/* Game mode selection */}
      <div className="w-full max-w-2xl mb-8">
        <h3 className="text-center text-muted-foreground mb-4">Choose your challenge:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => !isLoading && onStart(mode.id)}
              disabled={isLoading}
              className={cn(
                "relative group p-6 rounded-xl border-2 border-border/50 bg-card hover:border-primary/50 transition-all duration-300",
                "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              )}
            >
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity",
                `bg-gradient-to-br ${mode.color}`
              )} />
              
              <div className="relative z-10">
                <h4 className="font-semibold text-lg mb-1">{mode.name}</h4>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">{mode.questions} questions</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{mode.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rules card */}
      <ModernCard className="max-w-lg w-full mb-8">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          The Rules
        </h3>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-primary font-bold">1.</span>
            <span>Tough questions tailored to YOUR company data</span>
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
            <span><strong className="text-yellow-500">Goal:</strong> Score 70%+ to prove you're investment-ready</span>
          </li>
        </ul>
      </ModernCard>

      {isLoading && (
        <div className="text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="w-5 h-5 animate-pulse text-orange-500" />
            <span>Preparing your questions...</span>
          </div>
        </div>
      )}
    </div>
  );
};