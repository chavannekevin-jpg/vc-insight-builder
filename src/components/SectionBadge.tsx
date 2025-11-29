import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
  icon: LucideIcon | React.ComponentType<any>;
  title: string;
  isComplete?: boolean;
  className?: string;
}

export const SectionBadge = ({ icon: Icon, title, isComplete, className }: SectionBadgeProps) => {
  const getGradient = () => {
    const lower = title.toLowerCase();
    if (lower.includes("problem")) return "from-red-500 via-orange-500 to-pink-500";
    if (lower.includes("solution")) return "from-yellow-400 via-amber-500 to-orange-500";
    if (lower.includes("market")) return "from-blue-500 via-cyan-500 to-teal-500";
    if (lower.includes("competition")) return "from-purple-500 via-violet-500 to-fuchsia-500";
    if (lower.includes("team")) return "from-green-500 via-emerald-500 to-teal-500";
    if (lower.includes("usp")) return "from-orange-500 via-red-500 to-pink-500";
    if (lower.includes("business")) return "from-emerald-500 via-green-500 to-lime-500";
    if (lower.includes("traction")) return "from-pink-500 via-rose-500 to-red-500";
    return "from-primary via-pink-500 to-purple-500";
  };

  return (
    <div className={cn("relative group", className)}>
      {/* Neon glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getGradient()} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
      
      {/* Main badge */}
      <div className={cn(
        "relative w-16 h-16 rounded-2xl flex items-center justify-center",
        "border-2 backdrop-blur-sm transition-all duration-300",
        "group-hover:scale-110 group-hover:rotate-3",
        isComplete 
          ? "bg-gradient-to-br from-green-400/20 to-green-600/20 border-green-400/50 shadow-[0_0_30px_rgba(74,222,128,0.3)]"
          : `bg-gradient-to-br ${getGradient()} bg-opacity-10 border-white/20 shadow-[0_0_20px_rgba(236,72,153,0.2)]`
      )}>
        <Icon className={cn(
          "w-8 h-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all",
          isComplete ? "text-green-400" : "text-white"
        )} />
        
        {/* Corner accent */}
        <div className={`absolute top-0 right-0 w-3 h-3 rounded-full bg-gradient-to-br ${getGradient()} animate-pulse`} />
      </div>
      
      {isComplete && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(74,222,128,0.6)] animate-scale-in">
          ✓
        </div>
      )}
    </div>
  );
};
