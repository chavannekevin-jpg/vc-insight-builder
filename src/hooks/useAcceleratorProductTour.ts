import { useState, useCallback, useEffect } from "react";
import { type TourStep } from "@/components/tour/ProductTourSpotlight";

const ACCELERATOR_TOUR_KEY = "accelerator_product_tour_completed";
const TOUR_TRIGGER_KEY = "accelerator_tour_trigger";

export const ACCELERATOR_TOUR_STEPS: TourStep[] = [
  {
    id: "portfolio-stats",
    target: "tour-portfolio-stats",
    title: "Portfolio Overview",
    description: "See your entire portfolio at a glance: total startups, fundability distribution, and analysis completion rates.",
    placement: "bottom"
  },
  {
    id: "portfolio",
    target: "tour-portfolio",
    title: "Portfolio Management",
    description: "Browse all startups in your ecosystem. Filter by status, search by name, and click any startup to see their full analysis.",
    placement: "right"
  },
  {
    id: "cohorts",
    target: "tour-cohorts",
    title: "Cohort Organization",
    description: "Organize startups into batches. Create cohorts, assign startups, and track progress by program cycle.",
    placement: "right"
  },
  {
    id: "team",
    target: "tour-team",
    title: "Team Collaboration",
    description: "Invite team members to help manage your accelerator ecosystem. Set roles and permissions.",
    placement: "right"
  },
  {
    id: "invites",
    target: "tour-invites",
    title: "Startup Invites",
    description: "Generate invite links for startups to join your ecosystem. Track usage and manage active invitations.",
    placement: "right"
  },
  {
    id: "analytics",
    target: "tour-analytics",
    title: "Portfolio Analytics",
    description: "Deep dive into fundability trends, score distributions, and identify areas where your startups need support.",
    placement: "right"
  }
];

export function useAcceleratorProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentStep = ACCELERATOR_TOUR_STEPS[currentStepIndex];

  // Check if tour should start (triggered by product guide completion)
  useEffect(() => {
    const shouldStart = sessionStorage.getItem(TOUR_TRIGGER_KEY) === "true";
    const hasCompleted = localStorage.getItem(ACCELERATOR_TOUR_KEY) === "true";
    
    setIsInitialized(true);
    
    // Auto-start tour after a short delay if triggered
    if (shouldStart && !hasCompleted) {
      sessionStorage.removeItem(TOUR_TRIGGER_KEY);
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < ACCELERATOR_TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    localStorage.setItem(ACCELERATOR_TOUR_KEY, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(ACCELERATOR_TOUR_KEY, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(ACCELERATOR_TOUR_KEY);
    setCurrentStepIndex(0);
  }, []);

  // Trigger tour externally (from product guide)
  const triggerTour = useCallback(() => {
    sessionStorage.setItem(TOUR_TRIGGER_KEY, "true");
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const hasCompletedTour = localStorage.getItem(ACCELERATOR_TOUR_KEY) === "true";

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: ACCELERATOR_TOUR_STEPS.length,
    isInitialized,
    hasCompletedTour,
    startTour,
    triggerTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour,
  };
}
