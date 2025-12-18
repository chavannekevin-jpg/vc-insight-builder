import { useState, useEffect, useRef, useCallback } from "react";
import { MemoStructuredSection } from "@/types/memo";

interface MemoNavigationProps {
  sections: MemoStructuredSection[];
  hasQuickTake?: boolean;
}

export const MemoNavigation = ({ sections, hasQuickTake }: MemoNavigationProps) => {
  const [activeSection, setActiveSection] = useState<string>("quick-take");
  const [isVisible, setIsVisible] = useState(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset idle timer on any interaction
  const resetIdleTimer = useCallback(() => {
    setIsVisible(true);
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Hide after 3 seconds of no interaction
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Reset idle timer on scroll
      resetIdleTimer();

      // Determine active section based on scroll position
      const sectionElements = document.querySelectorAll("[data-section]");
      let currentSection = hasQuickTake ? "quick-take" : sections[0]?.title || "";

      sectionElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 150) {
          currentSection = element.getAttribute("data-section") || currentSection;
        }
      });

      setActiveSection(currentSection);
    };

    const handleMouseMove = () => {
      resetIdleTimer();
    };

    const handleTouchStart = () => {
      resetIdleTimer();
    };

    // Initial timer
    resetIdleTimer();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [sections, hasQuickTake, resetIdleTimer]);

  const scrollToSection = (sectionId: string) => {
    resetIdleTimer();
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
    }
  };

  const allItems = [
    ...(hasQuickTake ? [{ id: "quick-take", label: "Quick Take" }] : []),
    ...sections.map((s) => ({ id: s.title, label: s.title }))
  ];

  return (
    <nav 
      className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-50 transition-all duration-300 no-print ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-full px-2 py-2 shadow-xl flex items-center gap-1 overflow-x-auto max-w-[90vw] scrollbar-hide">
        {allItems.map((item, index) => {
          const isActive = activeSection === item.id;
          // Truncate long labels
          const truncatedLabel = item.label.length > 12 
            ? item.label.substring(0, 10) + "..." 
            : item.label;

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
              title={item.label}
            >
              <span className="md:hidden">{index + 1}</span>
              <span className="hidden md:inline">{truncatedLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};