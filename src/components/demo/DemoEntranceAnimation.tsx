import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Zap } from "lucide-react";

interface DemoEntranceAnimationProps {
  onComplete: () => void;
}

const DEMO_ENTRANCE_KEY = "demo_entrance_shown";

/**
 * Cinematic entrance animation for the demo environment.
 * Creates a "discovery" theme - entering a world of insights.
 * Duration: ~2.5 seconds
 */
export function DemoEntranceAnimation({ onComplete }: DemoEntranceAnimationProps) {
  const [phase, setPhase] = useState<"focus" | "expand" | "complete">("focus");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phase timing for the sequence
    const focusTimer = setTimeout(() => setPhase("expand"), 1000);
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(focusTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "complete" && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          {/* Deep background with subtle grid */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--primary) / 0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--primary) / 0.04) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === "focus" ? 0.5 : 0,
                scale: phase === "focus" ? 1 : 1.1,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
            initial={{ scale: 0, x: "-50%", y: "-50%" }}
            animate={{
              scale: phase === "focus" ? 1 : 2.5,
              opacity: phase === "focus" ? 1 : 0,
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div
            className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--secondary) / 0.2) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
            initial={{ scale: 0, x: "50%", y: "50%" }}
            animate={{
              scale: phase === "focus" ? 1 : 2,
              opacity: phase === "focus" ? 1 : 0,
            }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Converging rays effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * 360;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-[150vh] w-[1px]"
                  style={{
                    background: `linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.12), transparent)`,
                    transformOrigin: "top center",
                    rotate: `${angle}deg`,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: phase === "focus" ? 1 : 0,
                    opacity: phase === "focus" ? 0.7 : 0,
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              );
            })}
          </div>

          {/* Central content */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-4"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: phase === "focus" ? 1 : 0,
              y: phase === "focus" ? 0 : -20,
              scale: phase === "focus" ? 1 : 1.1,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Icon with glow */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-primary/30"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/40">
                  <Eye className="w-10 h-10 text-primary-foreground" />
                </div>
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              style={{
                textShadow: "0 0 40px hsl(var(--primary) / 0.3)",
              }}
            >
              Entering Demo
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Experience the full platform
            </motion.p>

            {/* Pulse dots */}
            <motion.div
              className="flex gap-1.5 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
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

          {/* Flash wipe on expand */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "expand" ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeIn" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage demo entrance animation state per session
export function useDemoEntrance() {
  const [showEntrance, setShowEntrance] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Check if we've already shown the entrance this session
    const hasShown = sessionStorage.getItem(DEMO_ENTRANCE_KEY);
    if (!hasShown) {
      setShowEntrance(true);
    }
    setIsChecked(true);
  }, []);

  const completeEntrance = () => {
    sessionStorage.setItem(DEMO_ENTRANCE_KEY, "true");
    setShowEntrance(false);
  };

  const resetEntrance = () => {
    sessionStorage.removeItem(DEMO_ENTRANCE_KEY);
    setShowEntrance(true);
  };

  return { showEntrance, isChecked, completeEntrance, resetEntrance };
}
