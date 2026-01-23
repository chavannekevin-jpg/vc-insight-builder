import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InvestorEntranceAnimationProps {
  onComplete: () => void;
  companyName?: string;
}

/**
 * Cinematic "threshold crossing" animation for investor onboarding completion.
 * Plays once when an investor finishes setup and enters the dashboard.
 * Duration: ~3 seconds
 */
export function InvestorEntranceAnimation({
  onComplete,
  companyName,
}: InvestorEntranceAnimationProps) {
  const [phase, setPhase] = useState<"descend" | "emerge" | "reveal" | "complete">("descend");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phase timing for the cinematic sequence
    const descendTimer = setTimeout(() => setPhase("emerge"), 1000);
    const emergeTimer = setTimeout(() => setPhase("reveal"), 2000);
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(descendTimer);
      clearTimeout(emergeTimer);
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
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          {/* Deep space background with animated depth layers */}
          <div className="absolute inset-0">
            {/* Grid pattern that suggests depth/structure */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--primary) / 0.03) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--primary) / 0.03) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{
                opacity: phase === "descend" ? 0.3 : phase === "emerge" ? 0.6 : 0,
                scale: phase === "descend" ? 1.2 : phase === "emerge" ? 1 : 0.8,
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Radial depth gradient - pulling into center */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, transparent 0%, hsl(var(--background)) 70%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === "descend" ? 0.5 : phase === "emerge" ? 0.3 : 0,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          {/* Converging light rays - "being pulled in" effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * 360;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 h-[200vh] w-[2px]"
                  style={{
                    background: `linear-gradient(to bottom, transparent, hsl(var(--primary) / 0.15), transparent)`,
                    transformOrigin: "top center",
                    rotate: `${angle}deg`,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: phase === "descend" ? 1 : phase === "emerge" ? 1.5 : 0,
                    opacity: phase === "descend" ? 0.6 : phase === "emerge" ? 0.3 : 0,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              );
            })}
          </div>

          {/* Central portal / vortex effect */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase === "descend" ? 1 : phase === "emerge" ? 2.5 : 15,
              opacity: phase === "descend" ? 1 : phase === "emerge" ? 0.8 : 0,
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Outer ring */}
            <div
              className="w-[300px] h-[300px] rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.3), transparent, hsl(var(--primary) / 0.2), transparent)`,
                filter: "blur(20px)",
              }}
            />
          </motion.div>

          {/* Inner core - bright emergence point */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.5) 30%, transparent 70%)`,
              filter: "blur(30px)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase === "descend" ? 0.5 : phase === "emerge" ? 1 : 20,
              opacity: phase === "descend" ? 0.8 : phase === "emerge" ? 1 : 0,
            }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Particle burst on emerge phase */}
          {phase !== "descend" && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/70"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.5, 0.5],
                    x: Math.cos((i / 24) * Math.PI * 2) * (200 + Math.random() * 150),
                    y: Math.sin((i / 24) * Math.PI * 2) * (200 + Math.random() * 150),
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.02,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
            </div>
          )}

          {/* Central text - appears briefly then dissolves */}
          <motion.div
            className="relative z-10 text-center px-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: phase === "descend" ? 1 : phase === "emerge" ? 0.8 : 0,
              scale: phase === "descend" ? 1 : phase === "emerge" ? 1.05 : 1.2,
              y: phase === "descend" ? 0 : phase === "emerge" ? -10 : -30,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3"
              style={{
                textShadow: "0 0 40px hsl(var(--primary) / 0.3)",
              }}
            >
              {companyName ? `Welcome, ${companyName}` : "Entering your dashboard"}
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "descend" ? 0.8 : 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Your investor network awaits
            </motion.p>
          </motion.div>

          {/* Final flash/wipe transition */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "reveal" ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: "easeIn" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
