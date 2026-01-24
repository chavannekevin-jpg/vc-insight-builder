import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2 } from "lucide-react";

interface AcceleratorDemoEntranceAnimationProps {
  onComplete: () => void;
}

const ACCELERATOR_DEMO_ENTRANCE_KEY = "accelerator_demo_entrance_shown";

/**
 * Cinematic entrance animation for the accelerator demo environment.
 * Creates an "ecosystem formation" theme - nodes connecting into a network.
 * Duration: ~2.5 seconds
 */
export function AcceleratorDemoEntranceAnimation({ onComplete }: AcceleratorDemoEntranceAnimationProps) {
  const [phase, setPhase] = useState<"gather" | "form" | "complete">("gather");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gatherTimer = setTimeout(() => setPhase("form"), 1200);
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(gatherTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Generate node positions for ecosystem visualization
  const nodes = [...Array(12)].map((_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    radius: 120 + (i % 3) * 30,
    delay: i * 0.05,
  }));

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
          {/* Background grid pattern */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  radial-gradient(circle at center, hsl(var(--primary) / 0.05) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{
                opacity: phase === "gather" ? 0.5 : 0,
                scale: 1,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            initial={{ scale: 0 }}
            animate={{
              scale: phase === "gather" ? 1 : 2,
              opacity: phase === "gather" ? 1 : 0,
            }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div
            className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--secondary) / 0.15) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            initial={{ scale: 0 }}
            animate={{
              scale: phase === "gather" ? 1 : 1.5,
              opacity: phase === "gather" ? 1 : 0,
            }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Ecosystem nodes - startups gathering */}
          <div className="absolute inset-0 pointer-events-none">
            {nodes.map((node, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                style={{
                  background: `radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.5) 100%)`,
                  boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
                }}
                initial={{
                  x: Math.cos(node.angle) * 300 - 6,
                  y: Math.sin(node.angle) * 300 - 6,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: phase === "gather" 
                    ? Math.cos(node.angle) * node.radius - 6
                    : 0,
                  y: phase === "gather"
                    ? Math.sin(node.angle) * node.radius - 6
                    : 0,
                  opacity: phase === "gather" ? 1 : 0,
                  scale: phase === "gather" ? 1 : 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: node.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
          </div>

          {/* Central content */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-4"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: phase === "gather" ? 1 : 0,
              y: phase === "gather" ? 0 : -20,
              scale: phase === "gather" ? 1 : 1.1,
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
                  <Building2 className="w-10 h-10 text-primary-foreground" />
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
              Entering Accelerator Demo
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Experience the full ecosystem
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

          {/* Flash wipe on form phase */}
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "form" ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeIn" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage accelerator demo entrance animation state per session
export function useAcceleratorDemoEntrance() {
  const [showEntrance, setShowEntrance] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const hasShown = sessionStorage.getItem(ACCELERATOR_DEMO_ENTRANCE_KEY);
    if (!hasShown) {
      setShowEntrance(true);
    }
    setIsChecked(true);
  }, []);

  const completeEntrance = () => {
    sessionStorage.setItem(ACCELERATOR_DEMO_ENTRANCE_KEY, "true");
    setShowEntrance(false);
  };

  const resetEntrance = () => {
    sessionStorage.removeItem(ACCELERATOR_DEMO_ENTRANCE_KEY);
    setShowEntrance(true);
  };

  return { showEntrance, isChecked, completeEntrance, resetEntrance };
}
