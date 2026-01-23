import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface DashboardEntranceAnimationProps {
  companyName?: string;
  onComplete: () => void;
}

const SESSION_KEY = "dashboard_entrance_shown";

export function DashboardEntranceAnimation({ 
  companyName = "Your Dashboard", 
  onComplete 
}: DashboardEntranceAnimationProps) {
  const [phase, setPhase] = useState<"intro" | "reveal" | "complete">("intro");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phase timing
    const introTimer = setTimeout(() => setPhase("reveal"), 1200);
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "complete" && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
        >
          {/* Base background with gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-background via-background to-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "reveal" ? 0 : 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Animated mesh gradient orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            animate={{ 
              scale: phase === "reveal" ? 2.5 : 1.2,
              x: phase === "reveal" ? "-30%" : "-50%",
              y: phase === "reveal" ? "-30%" : "-50%",
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--secondary) / 0.25) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
            initial={{ scale: 0, x: "50%", y: "50%" }}
            animate={{ 
              scale: phase === "reveal" ? 2.2 : 1,
              x: phase === "reveal" ? "30%" : "50%",
              y: phase === "reveal" ? "30%" : "50%",
            }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            animate={{ 
              scale: phase === "reveal" ? 1.8 : 0.8,
              rotate: phase === "reveal" ? 180 : 0,
            }}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Particle burst effect */}
          {phase === "intro" && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-primary/60"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    x: Math.cos((i / 20) * Math.PI * 2) * (150 + Math.random() * 100),
                    y: Math.sin((i / 20) * Math.PI * 2) * (150 + Math.random() * 100),
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.3 + (i * 0.02),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
            </div>
          )}

          {/* Center content */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-4"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: phase === "intro" ? 1 : 0,
              y: phase === "intro" ? 0 : -30,
              scale: phase === "intro" ? 1 : 0.95,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Animated icon */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.1 
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-primary/30"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Welcome back
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              {companyName}
            </motion.p>

            {/* Loading dots */}
            <motion.div 
              className="flex gap-1.5 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/60"
                  animate={{
                    y: [-2, 2, -2],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Wipe reveal overlay */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ 
              clipPath: phase === "reveal" 
                ? "circle(150% at 50% 50%)" 
                : "circle(0% at 50% 50%)" 
            }}
            transition={{ 
              duration: 0.8, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            style={{ opacity: 0 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage entrance animation state per session
export function useDashboardEntrance() {
  const [showEntrance, setShowEntrance] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Check if we've already shown the entrance this session
    const hasShown = sessionStorage.getItem(SESSION_KEY);
    if (!hasShown) {
      setShowEntrance(true);
    }
    setIsChecked(true);
  }, []);

  const completeEntrance = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setShowEntrance(false);
  };

  const resetEntrance = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setShowEntrance(true);
  };

  return { showEntrance, isChecked, completeEntrance, resetEntrance };
}
