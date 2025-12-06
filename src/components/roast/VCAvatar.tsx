import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VCAvatarProps {
  timeElapsed: number;
  isThinking?: boolean;
}

const moods = [
  { maxTime: 30, emoji: "😎", label: "Engaged", color: "from-green-500/20 to-green-500/5", comment: null },
  { maxTime: 60, emoji: "🤔", label: "Waiting...", color: "from-yellow-500/20 to-yellow-500/5", comment: "Take your time... I guess." },
  { maxTime: 90, emoji: "😒", label: "Getting bored", color: "from-orange-500/20 to-orange-500/5", comment: "I do have other pitches today." },
  { maxTime: Infinity, emoji: "🙄", label: "Losing interest", color: "from-red-500/20 to-red-500/5", comment: "My next meeting is in 5 minutes..." },
];

export const VCAvatar = ({ timeElapsed, isThinking }: VCAvatarProps) => {
  const [showComment, setShowComment] = useState(false);
  
  const currentMood = moods.find(m => timeElapsed <= m.maxTime) || moods[moods.length - 1];
  const moodIndex = moods.indexOf(currentMood);

  useEffect(() => {
    if (currentMood.comment && timeElapsed > 30) {
      setShowComment(true);
      const timer = setTimeout(() => setShowComment(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [moodIndex]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech bubble */}
      {showComment && currentMood.comment && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground whitespace-nowrap animate-fade-in shadow-lg">
          {currentMood.comment}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-border" />
        </div>
      )}

      {/* Avatar container */}
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-500",
          "bg-gradient-to-br",
          currentMood.color,
          "border-2",
          moodIndex === 0 && "border-green-500/50",
          moodIndex === 1 && "border-yellow-500/50",
          moodIndex === 2 && "border-orange-500/50",
          moodIndex === 3 && "border-red-500/50 animate-pulse"
        )}
      >
        {isThinking ? (
          <span className="animate-bounce">🤖</span>
        ) : (
          <span className={cn(
            "transition-transform duration-300",
            moodIndex >= 2 && "animate-pulse"
          )}>
            {currentMood.emoji}
          </span>
        )}
      </div>

      {/* Mood label */}
      <span className={cn(
        "mt-2 text-xs font-medium transition-colors duration-300",
        moodIndex === 0 && "text-green-500",
        moodIndex === 1 && "text-yellow-500",
        moodIndex === 2 && "text-orange-500",
        moodIndex === 3 && "text-red-500"
      )}>
        {isThinking ? "Thinking..." : currentMood.label}
      </span>

      {/* Speed bonus indicator */}
      {timeElapsed <= 30 && !isThinking && (
        <div className="absolute -right-2 -top-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
          +1
        </div>
      )}
    </div>
  );
};
