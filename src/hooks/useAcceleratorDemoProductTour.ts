import { useState, useEffect, useCallback } from "react";
import { type TourStep } from "@/components/tour/ProductTourSpotlight";

export type { TourStep };

// Tour steps for the accelerator demo walkthrough
export const ACCELERATOR_DEMO_TOUR_STEPS: TourStep[] = [
  {
    id: "cohort-stats",
    target: "cohort-stats",
    title: "Portfolio Overview",
    description: "At a glance stats for your entire cohort—fundability scores, Demo Day readiness, and startups needing attention.",
    placement: "bottom"
  },
  {
    id: "priority-interventions",
    target: "priority-interventions",
    title: "Priority Interventions",
    description: "Startups that need your attention most, sorted by fundability score. Click to see their full analysis.",
    placement: "bottom"
  },
  {
    id: "demo-ready-startups",
    target: "demo-ready-startups",
    title: "Demo Day Ready",
    description: "Your strongest startups. These are ready to pitch to investors with confidence.",
    placement: "top"
  },
  {
    id: "sidebar-portfolio",
    target: "sidebar-portfolio",
    title: "Full Portfolio",
    description: "View all startups in your cohort with detailed scores and status indicators.",
    placement: "right"
  },
  {
    id: "sidebar-analytics",
    target: "sidebar-analytics",
    title: "Cohort Analytics",
    description: "Section heatmaps, score distributions, and trend analysis across your entire portfolio.",
    placement: "right"
  },
  {
    id: "sidebar-cohorts",
    target: "sidebar-cohorts",
    title: "Cohort Management",
    description: "Manage multiple batches, programs, and cohorts from a single dashboard.",
    placement: "right"
  },
  {
    id: "quick-actions",
    target: "quick-actions",
    title: "Quick Actions",
    description: "Jump to key features: full cohort view, analytics, and startup comparisons.",
    placement: "left"
  }
];

const ACCELERATOR_DEMO_TOUR_KEY = "accelerator_demo_product_tour_completed";

export function useAcceleratorDemoProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ACCELERATOR_DEMO_TOUR_KEY) === "true";
    setIsInitialized(true);
  }, []);

  const currentStep = ACCELERATOR_DEMO_TOUR_STEPS[currentStepIndex];

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < ACCELERATOR_DEMO_TOUR_STEPS.length - 1) {
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
    localStorage.setItem(ACCELERATOR_DEMO_TOUR_KEY, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(ACCELERATOR_DEMO_TOUR_KEY, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(ACCELERATOR_DEMO_TOUR_KEY);
    setCurrentStepIndex(0);
  }, []);

  const hasCompletedTour = localStorage.getItem(ACCELERATOR_DEMO_TOUR_KEY) === "true";

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: ACCELERATOR_DEMO_TOUR_STEPS.length,
    isInitialized,
    hasCompletedTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour
  };
}
