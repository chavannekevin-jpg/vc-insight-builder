import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { type TourStep } from "@/hooks/useProductTour";

interface ProductTourSpotlightProps {
  isActive: boolean;
  currentStep: TourStep | undefined;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export function ProductTourSpotlight({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip
}: ProductTourSpotlightProps) {
  const [spotlightPos, setSpotlightPos] = useState<SpotlightPosition | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const calculatePositions = useCallback(() => {
    if (!currentStep) return;

    const targetElement = document.querySelector(`[data-tour-step="${currentStep.target}"]`);
    
    if (!targetElement) {
      console.warn(`Tour target not found: ${currentStep.target}`);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    const padding = 8;
    const spotlight: SpotlightPosition = {
      top: rect.top + scrollTop - padding,
      left: rect.left + scrollLeft - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    };

    setSpotlightPos(spotlight);

    // Calculate tooltip position based on placement
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const gap = 16;

    let tooltip: TooltipPosition = {
      top: 0,
      left: 0,
      placement: currentStep.placement || 'bottom'
    };

    const placement = currentStep.placement || 'bottom';

    switch (placement) {
      case 'top':
        tooltip.top = spotlight.top - tooltipHeight - gap;
        tooltip.left = spotlight.left + (spotlight.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        tooltip.top = spotlight.top + spotlight.height + gap;
        tooltip.left = spotlight.left + (spotlight.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        tooltip.top = spotlight.top + (spotlight.height / 2) - (tooltipHeight / 2);
        tooltip.left = spotlight.left - tooltipWidth - gap;
        break;
      case 'right':
        tooltip.top = spotlight.top + (spotlight.height / 2) - (tooltipHeight / 2);
        tooltip.left = spotlight.left + spotlight.width + gap;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight + scrollTop;

    if (tooltip.left < 16) tooltip.left = 16;
    if (tooltip.left + tooltipWidth > viewportWidth - 16) {
      tooltip.left = viewportWidth - tooltipWidth - 16;
    }
    if (tooltip.top < scrollTop + 16) tooltip.top = scrollTop + 16;
    if (tooltip.top + tooltipHeight > viewportHeight - 16) {
      tooltip.top = viewportHeight - tooltipHeight - 16;
    }

    tooltip.placement = placement;
    setTooltipPos(tooltip);

    // Scroll element into view if needed
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep]);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    setIsAnimating(true);
    
    // Small delay to allow for scroll and animation
    const timer = setTimeout(() => {
      calculatePositions();
      setIsAnimating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [isActive, currentStep, calculatePositions]);

  // Recalculate on resize
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => calculatePositions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, calculatePositions]);

  // Handle escape key
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft' && currentStepIndex > 0) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onSkip, onNext, onPrev, currentStepIndex]);

  if (!isActive || !currentStep || !spotlightPos || !tooltipPos) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'none' }}>
      {/* Dark overlay with spotlight cutout */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        style={{ pointerEvents: 'auto' }}
        onClick={onSkip}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlightPos.left}
              y={spotlightPos.top}
              width={spotlightPos.width}
              height={spotlightPos.height}
              rx="12"
              fill="black"
              className={cn(
                "transition-all duration-300 ease-out",
                isAnimating && "opacity-0"
              )}
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight ring animation */}
      <div
        className={cn(
          "absolute rounded-xl border-2 border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.2)] transition-all duration-300 ease-out",
          isAnimating && "opacity-0"
        )}
        style={{
          top: spotlightPos.top,
          left: spotlightPos.left,
          width: spotlightPos.width,
          height: spotlightPos.height,
          pointerEvents: 'none',
          animation: 'pulse-border 2s infinite'
        }}
      />

      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-10 w-80 transition-all duration-300 ease-out",
          isAnimating && "opacity-0 scale-95"
        )}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          pointerEvents: 'auto'
        }}
      >
        <div className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-primary/5 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
              </div>
              <button
                onClick={onSkip}
                className="p-1 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="text-base font-semibold text-foreground">
              {currentStep.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                  className="gap-1"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={onNext}
                className="gap-1"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="px-4 pb-3 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  i === currentStepIndex
                    ? "w-4 bg-primary"
                    : i < currentStepIndex
                      ? "bg-primary/50"
                      : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
