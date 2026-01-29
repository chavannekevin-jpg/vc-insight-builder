import { motion, useReducedMotion } from "framer-motion";
import { 
  Brain,
  FileSearch,
  Wrench,
  Telescope,
  Users,
  ArrowRight,
  Zap
} from "lucide-react";

const PlatformFlowInfographic = () => {
  const shouldReduceMotion = useReducedMotion();

  const outputItems = [
    { icon: FileSearch, label: "Full Audit", desc: "8-Dimension Score", delay: 0 },
    { icon: Wrench, label: "23+ Tools", desc: "Diagnostic Suite", delay: 0.15 },
    { icon: Telescope, label: "Market Lens", desc: "Intelligence Brief", delay: 0.3 },
    { icon: Users, label: "800+ Investors", desc: "Matched Network", delay: 0.45 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 12,
      },
    },
  };

  // Continuous floating particles animation
  const FloatingParticle = ({ delay, duration, startX, startY }: { delay: number; duration: number; startX: number; startY: number }) => (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-primary/60 to-secondary/40"
      initial={{ x: startX, y: startY, opacity: 0, scale: 0 }}
      animate={shouldReduceMotion ? {} : {
        x: [startX, startX + 150, startX + 300],
        y: [startY, startY - 20 + Math.random() * 40, startY],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    />
  );

  // Flowing bubble between sections
  const FlowingBubble = ({ delay, y }: { delay: number; y: number }) => (
    <motion.div
      className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-primary/70 to-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
      initial={{ x: 0, opacity: 0, scale: 0.5 }}
      animate={shouldReduceMotion ? {} : {
        x: [0, 120],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 0.8, 0.3],
      }}
      transition={{
        duration: 1.8,
        delay,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
      style={{ top: y }}
    />
  );

  return (
    <section className="py-16 md:py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Your Data In. <span className="text-primary">Investment-Ready Out.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Watch your raw materials transform into a complete investor toolkit
          </p>
        </motion.div>

        {/* Desktop Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="hidden md:flex items-center justify-between gap-6 lg:gap-10"
        >
          {/* INPUT SECTION - Simplified & Lighter */}
          <motion.div
            variants={itemVariants}
            className="flex-1 relative"
          >
            {/* Single unified input card with streaming data effect */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-card/30 to-transparent backdrop-blur-sm border border-border/20">
              {/* Floating data particles inside */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {!shouldReduceMotion && [...Array(8)].map((_, i) => (
                  <FloatingParticle
                    key={i}
                    delay={i * 0.4}
                    duration={3 + Math.random() * 2}
                    startX={-20}
                    startY={20 + (i * 15) % 80}
                  />
                ))}
              </div>
              
              {/* Simple text labels floating */}
              <div className="relative space-y-3">
                {["Pitch Deck", "Metrics", "Data"].map((label, idx) => (
                  <motion.div
                    key={label}
                    animate={shouldReduceMotion ? {} : {
                      x: [0, 5, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2 + idx * 0.5,
                      delay: idx * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                    }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Zap className="w-3 h-3 text-primary/60" />
                    <span>{label}</span>
                  </motion.div>
                ))}
              </div>
              
              {/* Corner accent */}
              <motion.div
                animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/40"
              />
            </div>
          </motion.div>

          {/* FLOW ARROWS with flowing bubbles */}
          <motion.div
            variants={itemVariants}
            className="relative flex items-center w-32 lg:w-44"
          >
            {/* Flowing bubbles */}
            <div className="relative h-12 w-full overflow-hidden">
              {!shouldReduceMotion && [...Array(5)].map((_, i) => (
                <FlowingBubble key={i} delay={i * 0.4} y={4 + (i % 3) * 14} />
              ))}
            </div>
            
            {/* Long arrow line */}
            <div className="absolute inset-0 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
              <motion.div
                animate={shouldReduceMotion ? {} : { x: [0, 8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }}
              >
                <ArrowRight className="w-6 h-6 text-primary ml-1" />
              </motion.div>
            </div>
          </motion.div>

          {/* CENTER HUB - More dynamic */}
          <motion.div
            variants={itemVariants}
            className="relative flex-shrink-0"
          >
            {/* Multiple pulsing rings */}
            {!shouldReduceMotion && [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5 + i * 0.2, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: "easeOut" as const,
                }}
                className="absolute inset-0 rounded-full border border-primary/30"
                style={{ transform: `scale(${1.2 + i * 0.15})` }}
              />
            ))}
            
            {/* Rotating ring */}
            <motion.div
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" as const }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
              style={{ transform: "scale(1.4)" }}
            />

            {/* Main hub */}
            <motion.div
              animate={shouldReduceMotion ? {} : {
                boxShadow: [
                  "0 0 30px hsl(var(--primary)/0.3)",
                  "0 0 60px hsl(var(--primary)/0.5)",
                  "0 0 30px hsl(var(--primary)/0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
              className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-2 border-primary/40 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={shouldReduceMotion ? {} : {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
              >
                <Brain className="w-10 h-10 lg:w-12 lg:h-12 text-primary mb-1" />
              </motion.div>
              <span className="text-[10px] lg:text-xs font-bold text-primary uppercase tracking-wider">Analysis</span>
              <span className="text-[9px] lg:text-[10px] text-muted-foreground">Engine</span>
            </motion.div>

            {/* Orbiting particles */}
            {!shouldReduceMotion && [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/50"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "linear" as const,
                  delay: i * 0.5,
                }}
                style={{
                  transformOrigin: `${70 + i * 5}px center`,
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </motion.div>

          {/* FLOW ARROWS - Right with flowing bubbles */}
          <motion.div
            variants={itemVariants}
            className="relative flex items-center w-32 lg:w-44"
          >
            {/* Flowing bubbles */}
            <div className="relative h-12 w-full overflow-hidden">
              {!shouldReduceMotion && [...Array(5)].map((_, i) => (
                <FlowingBubble key={i} delay={i * 0.4 + 0.2} y={4 + (i % 3) * 14} />
              ))}
            </div>
            
            {/* Long arrow line */}
            <div className="absolute inset-0 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-primary/30 via-secondary/60 to-secondary/30" />
              <motion.div
                animate={shouldReduceMotion ? {} : { x: [0, 8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" as const, delay: 0.2 }}
              >
                <ArrowRight className="w-6 h-6 text-secondary ml-1" />
              </motion.div>
            </div>
          </motion.div>

          {/* OUTPUT SECTION */}
          <div className="flex-1 flex flex-col gap-3">
            {outputItems.map((item, idx) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                custom={idx}
                whileHover={{ scale: 1.02, x: 5 }}
                className="group relative"
              >
                <motion.div
                  animate={shouldReduceMotion ? {} : {
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 2 + idx * 0.3,
                    delay: idx * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 hover:border-secondary/40 hover:bg-card/60 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--secondary)/0.2)]"
                >
                  <motion.div
                    animate={shouldReduceMotion ? {} : {
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: idx * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                    }}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/10 border border-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <item.icon className="w-5 h-5 text-secondary" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mobile Layout - Vertical Flow */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="md:hidden flex flex-col items-center gap-4"
        >
          {/* Simplified Input - Mobile */}
          <motion.div
            variants={itemVariants}
            className="w-full p-4 rounded-xl bg-gradient-to-br from-card/30 to-transparent backdrop-blur-sm border border-border/20"
          >
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              {["Deck", "Metrics", "Data"].map((label, idx) => (
                <motion.span
                  key={label}
                  animate={shouldReduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                  className="flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-primary/60" />
                  {label}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Down Arrow */}
          <motion.div
            variants={itemVariants}
            animate={shouldReduceMotion ? {} : { y: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" as const }}
            className="flex flex-col items-center py-2"
          >
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-primary" />
            <ArrowRight className="w-5 h-5 text-primary rotate-90" />
          </motion.div>

          {/* Center Hub - Mobile */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <motion.div
              animate={shouldReduceMotion ? {} : {
                boxShadow: [
                  "0 0 20px hsl(var(--primary)/0.3)",
                  "0 0 40px hsl(var(--primary)/0.5)",
                  "0 0 20px hsl(var(--primary)/0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-2 border-primary/40 flex flex-col items-center justify-center"
            >
              <Brain className="w-8 h-8 text-primary mb-1" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Analysis</span>
            </motion.div>
          </motion.div>

          {/* Down Arrow */}
          <motion.div
            variants={itemVariants}
            animate={shouldReduceMotion ? {} : { y: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
            className="flex flex-col items-center py-2"
          >
            <div className="w-px h-8 bg-gradient-to-b from-primary to-secondary/50" />
            <ArrowRight className="w-5 h-5 text-secondary rotate-90" />
          </motion.div>

          {/* Outputs Row - Mobile */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {outputItems.map((item, idx) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                animate={shouldReduceMotion ? {} : { y: [0, -2, 0] }}
                transition={{ duration: 2, delay: idx * 0.2, repeat: Infinity }}
                className="flex items-center gap-2 p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/10 border border-secondary/20 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                  <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformFlowInfographic;
