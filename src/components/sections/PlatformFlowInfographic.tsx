import { motion, useReducedMotion } from "framer-motion";
import { 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Database,
  Brain,
  FileSearch,
  Wrench,
  Telescope,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react";

const PlatformFlowInfographic = () => {
  const shouldReduceMotion = useReducedMotion();

  const inputItems = [
    { icon: FileText, label: "Pitch Deck", delay: 0 },
    { icon: BarChart3, label: "Metrics", delay: 0.1 },
    { icon: MessageSquare, label: "Questions", delay: 0.2 },
    { icon: Database, label: "Data", delay: 0.3 },
  ];

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
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: 0.2,
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
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const floatAnimation = shouldReduceMotion ? undefined : {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  const pulseAnimation = shouldReduceMotion ? undefined : {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  return (
    <section className="py-16 md:py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
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
          className="hidden md:flex items-center justify-between gap-4 lg:gap-8"
        >
          {/* INPUT SECTION */}
          <div className="flex-1 flex flex-col gap-3">
            {inputItems.map((item, idx) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                animate={floatAnimation}
                style={{ animationDelay: `${idx * 0.5}s` }}
                className="group relative"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 hover:border-primary/40 hover:bg-card/60 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FLOW ARROWS - Left */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={shouldReduceMotion ? undefined : { x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
              className="flex items-center gap-1"
            >
              <div className="w-12 lg:w-20 h-px bg-gradient-to-r from-primary/50 to-primary" />
              <ArrowRight className="w-5 h-5 text-primary" />
            </motion.div>
            <motion.div
              animate={shouldReduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
              className="flex gap-1"
            >
              {[...Array(3)].map((_, i) => (
                <Sparkles key={i} className="w-3 h-3 text-primary/60" />
              ))}
            </motion.div>
          </motion.div>

          {/* CENTER HUB */}
          <motion.div
            variants={itemVariants}
            className="relative flex-shrink-0"
          >
            {/* Outer glow ring */}
            <motion.div
              animate={pulseAnimation}
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              style={{ transform: "scale(1.5)" }}
            />
            
            {/* Rotating ring */}
            <motion.div
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" as const }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
              style={{ transform: "scale(1.3)" }}
            />

            {/* Main hub */}
            <div className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-2 border-primary/40 flex flex-col items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.3)]">
              <motion.div
                animate={pulseAnimation}
              >
                <Brain className="w-10 h-10 lg:w-12 lg:h-12 text-primary mb-1" />
              </motion.div>
              <span className="text-[10px] lg:text-xs font-bold text-primary uppercase tracking-wider">Analysis</span>
              <span className="text-[9px] lg:text-[10px] text-muted-foreground">Engine</span>
            </div>

            {/* Floating particles */}
            {!shouldReduceMotion && [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/40"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut" as const,
                }}
              />
            ))}
          </motion.div>

          {/* FLOW ARROWS - Right */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={shouldReduceMotion ? undefined : { x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
              className="flex items-center gap-1"
            >
              <div className="w-12 lg:w-20 h-px bg-gradient-to-r from-primary to-secondary/50" />
              <ArrowRight className="w-5 h-5 text-secondary" />
            </motion.div>
            <motion.div
              animate={shouldReduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
              className="flex gap-1"
            >
              {[...Array(3)].map((_, i) => (
                <Sparkles key={i} className="w-3 h-3 text-secondary/60" />
              ))}
            </motion.div>
          </motion.div>

          {/* OUTPUT SECTION */}
          <div className="flex-1 flex flex-col gap-3">
            {outputItems.map((item, idx) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                custom={idx}
                className="group relative"
              >
                <motion.div
                  animate={floatAnimation}
                  style={{ animationDelay: `${idx * 0.5 + 1}s` }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30 hover:border-secondary/40 hover:bg-card/60 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--secondary)/0.2)]"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/10 border border-secondary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <item.icon className="w-5 h-5 text-secondary" />
                  </div>
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
          {/* Inputs Row */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {inputItems.map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                className="flex items-center gap-2 p-3 rounded-xl bg-card/40 backdrop-blur-sm border border-border/30"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Down Arrow */}
          <motion.div
            variants={itemVariants}
            animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
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
              animate={pulseAnimation}
              className="absolute inset-0 rounded-full bg-primary/20 blur-lg"
              style={{ transform: "scale(1.3)" }}
            />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-2 border-primary/40 flex flex-col items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              <Brain className="w-8 h-8 text-primary mb-1" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Analysis</span>
            </div>
          </motion.div>

          {/* Down Arrow */}
          <motion.div
            variants={itemVariants}
            animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 }}
            className="flex flex-col items-center py-2"
          >
            <div className="w-px h-8 bg-gradient-to-b from-primary to-secondary/50" />
            <ArrowRight className="w-5 h-5 text-secondary rotate-90" />
          </motion.div>

          {/* Outputs Row */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {outputItems.map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
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
