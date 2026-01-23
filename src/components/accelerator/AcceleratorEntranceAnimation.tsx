import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2 } from "lucide-react";

interface AcceleratorEntranceAnimationProps {
  onComplete: () => void;
  acceleratorName?: string;
}

/**
 * Cinematic "threshold crossing" animation for accelerator onboarding completion.
 * Plays once when an accelerator admin finishes setup and enters the dashboard.
 * Duration: ~3.5 seconds
 * 
 * Concept: "Ecosystem formation" - nodes connecting into a network structure
 */
export function AcceleratorEntranceAnimation({
  onComplete,
  acceleratorName,
}: AcceleratorEntranceAnimationProps) {
  const [phase, setPhase] = useState<"gather" | "connect" | "form" | "reveal" | "complete">("gather");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Phase timing for the cinematic sequence
    const gatherTimer = setTimeout(() => setPhase("connect"), 800);
    const connectTimer = setTimeout(() => setPhase("form"), 1600);
    const formTimer = setTimeout(() => setPhase("reveal"), 2600);
    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(gatherTimer);
      clearTimeout(connectTimer);
      clearTimeout(formTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Generate node positions for ecosystem visualization
  const nodes = [...Array(16)].map((_, i) => ({
    angle: (i / 16) * Math.PI * 2,
    radius: 150 + (i % 3) * 40,
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
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
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
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{
                opacity: phase === "gather" ? 0.4 : phase === "connect" ? 0.6 : phase === "form" ? 0.3 : 0,
                scale: phase === "gather" ? 1.1 : 1,
              }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Radial depth gradient */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, transparent 0%, hsl(var(--background)) 70%)`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase !== "reveal" ? 0.4 : 0,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

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
                  x: Math.cos(node.angle) * 400 - 6,
                  y: Math.sin(node.angle) * 400 - 6,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: phase === "gather" 
                    ? Math.cos(node.angle) * node.radius - 6
                    : phase === "connect" || phase === "form"
                    ? Math.cos(node.angle) * (node.radius * 0.8) - 6
                    : 0,
                  y: phase === "gather"
                    ? Math.sin(node.angle) * node.radius - 6
                    : phase === "connect" || phase === "form"
                    ? Math.sin(node.angle) * (node.radius * 0.8) - 6
                    : 0,
                  opacity: phase !== "reveal" ? 1 : 0,
                  scale: phase === "gather" ? 1 : phase === "connect" ? 1.2 : phase === "form" ? 0 : 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: node.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
          </div>

          {/* Connection lines between nodes */}
          {(phase === "connect" || phase === "form") && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {nodes.slice(0, 8).map((node, i) => {
                const nextNode = nodes[(i + 1) % 8];
                const x1 = window.innerWidth / 2 + Math.cos(node.angle) * (node.radius * 0.8);
                const y1 = window.innerHeight / 2 + Math.sin(node.angle) * (node.radius * 0.8);
                const x2 = window.innerWidth / 2 + Math.cos(nextNode.angle) * (nextNode.radius * 0.8);
                const y2 = window.innerHeight / 2 + Math.sin(nextNode.angle) * (nextNode.radius * 0.8);
                
                return (
                  <motion.line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="hsl(var(--primary) / 0.3)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: phase === "form" ? 0 : 1,
                      opacity: phase === "form" ? 0 : 0.6,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                );
              })}
            </svg>
          )}

          {/* Central hub - accelerator core */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase === "gather" ? 0.5 : phase === "connect" ? 1 : phase === "form" ? 1.5 : 20,
              opacity: phase !== "reveal" ? 1 : 0,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute -inset-8 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.2), transparent, hsl(var(--primary) / 0.15), transparent)`,
                filter: "blur(15px)",
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Core building icon */}
            <motion.div
              className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center"
              style={{
                boxShadow: "0 0 40px hsl(var(--primary) / 0.3)",
              }}
              animate={{
                scale: phase === "form" ? 1.1 : 1,
              }}
            >
              <Building2 className="w-12 h-12 text-primary" />
            </motion.div>
          </motion.div>

          {/* Particle burst on form phase */}
          {phase === "form" && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary/60"
                  style={{
                    left: "50%",
                    top: "50%",
                  }}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.5, 0.5],
                    x: Math.cos((i / 20) * Math.PI * 2) * (180 + Math.random() * 120),
                    y: Math.sin((i / 20) * Math.PI * 2) * (180 + Math.random() * 120),
                    opacity: [1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.02,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
            </div>
          )}

          {/* Central text - appears during form phase */}
          <motion.div
            className="relative z-10 text-center px-4"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{
              opacity: phase === "connect" ? 1 : phase === "form" ? 0.9 : 0,
              scale: phase === "connect" ? 1 : phase === "form" ? 1.05 : 0.8,
              y: phase === "connect" ? 0 : phase === "form" ? -10 : 30,
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
              style={{
                textShadow: "0 0 40px hsl(var(--primary) / 0.3)",
              }}
            >
              Welcome to {acceleratorName || "Your Ecosystem"}
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "connect" ? 0.8 : 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Your startup ecosystem awaits
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
