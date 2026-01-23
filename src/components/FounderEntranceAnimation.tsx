import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";

interface FounderEntranceAnimationProps {
  onComplete: () => void;
  companyName?: string;
}

/**
 * Cinematic "threshold crossing" animation for founder onboarding completion.
 * Plays once when a founder finishes deck import/review and enters the dashboard.
 * Duration: ~3.5 seconds
 * 
 * Concept: "Launch sequence" - ascending from preparation into the product
 */
export function FounderEntranceAnimation({
  onComplete,
  companyName,
}: FounderEntranceAnimationProps) {
  const [phase, setPhase] = useState<"ignite" | "ascend" | "breakthrough" | "complete">("ignite");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phase timing for the cinematic launch sequence
    const igniteTimer = setTimeout(() => setPhase("ascend"), 1200);
    const ascendTimer = setTimeout(() => setPhase("breakthrough"), 2400);
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(igniteTimer);
      clearTimeout(ascendTimer);
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
          {/* Dynamic background with ascending energy */}
          <div className="absolute inset-0">
            {/* Vertical streaks - speed lines suggesting upward motion */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  180deg,
                  transparent,
                  transparent 40px,
                  hsl(var(--primary) / 0.03) 40px,
                  hsl(var(--primary) / 0.03) 41px
                )`,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: phase === "ignite" ? 0.4 : phase === "ascend" ? 0.8 : 0,
                y: phase === "ascend" ? -200 : phase === "breakthrough" ? -600 : 0,
              }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Radial glow from bottom center - "launch pad" */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
              style={{
                background: `radial-gradient(ellipse at 50% 100%, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0.1) 30%, transparent 70%)`,
                filter: "blur(40px)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: phase === "ignite" ? 1 : phase === "ascend" ? 0.6 : 0,
                scale: phase === "ignite" ? 1 : phase === "ascend" ? 1.5 : 2,
                y: phase === "ascend" ? -100 : phase === "breakthrough" ? -300 : 0,
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Ascending particle trail */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => {
              const delay = i * 0.05;
              const xOffset = (Math.random() - 0.5) * 200;
              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-8 rounded-full"
                  style={{
                    left: `calc(50% + ${xOffset}px)`,
                    bottom: "-20px",
                    background: `linear-gradient(to top, hsl(var(--primary) / 0.6), transparent)`,
                  }}
                  initial={{ y: 0, opacity: 0, scaleY: 0 }}
                  animate={{
                    y: phase !== "ignite" ? [-20, -window.innerHeight - 100] : 0,
                    opacity: phase !== "ignite" ? [0, 0.8, 0] : 0,
                    scaleY: phase !== "ignite" ? [0.5, 1.5, 0.5] : 0,
                  }}
                  transition={{
                    duration: 1.8,
                    delay: phase !== "ignite" ? delay : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              );
            })}
          </div>

          {/* Central rocket/icon with ascent animation */}
          <motion.div
            className="relative z-10"
            initial={{ y: 50, scale: 0.8, opacity: 0 }}
            animate={{
              y: phase === "ignite" ? 0 : phase === "ascend" ? -150 : -400,
              scale: phase === "ignite" ? 1 : phase === "ascend" ? 1.1 : 0.6,
              opacity: phase === "breakthrough" ? 0 : 1,
            }}
            transition={{ 
              duration: phase === "breakthrough" ? 0.6 : 1, 
              ease: [0.16, 1, 0.3, 1] 
            }}
          >
            {/* Glow ring around icon */}
            <motion.div
              className="absolute inset-0 -m-6 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)`,
                filter: "blur(20px)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: phase === "ignite" ? Infinity : 0,
                ease: "easeInOut",
              }}
            />
            
            {/* Icon container */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl shadow-primary/40">
              <Rocket className="w-12 h-12 text-primary-foreground" />
            </div>

            {/* Engine flame effect during ignite/ascend */}
            {(phase === "ignite" || phase === "ascend") && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-full w-8"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: phase === "ignite" ? 40 : 80,
                  opacity: phase === "ignite" ? 0.8 : 1,
                }}
                transition={{ duration: 0.4 }}
              >
                <div 
                  className="w-full h-full rounded-b-full"
                  style={{
                    background: `linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary) / 0.5), transparent)`,
                    filter: "blur(4px)",
                  }}
                />
              </motion.div>
            )}
          </motion.div>

          {/* Text content */}
          <motion.div
            className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-center px-4 w-full max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: phase === "ignite" ? 1 : phase === "ascend" ? 0.7 : 0,
              y: phase === "ignite" ? 0 : phase === "ascend" ? -20 : -50,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3"
              style={{
                textShadow: "0 0 40px hsl(var(--primary) / 0.3)",
              }}
            >
              {companyName ? `Launching ${companyName}` : "Preparing your analysis"}
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "ignite" ? 0.8 : 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Your VC-grade insights are ready
            </motion.p>
          </motion.div>

          {/* Breakthrough flash */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "breakthrough" ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: "easeIn" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
