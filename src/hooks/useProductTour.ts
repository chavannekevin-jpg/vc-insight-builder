import { useState, useEffect, useCallback } from "react";
import { type TourStep } from "@/components/tour/ProductTourSpotlight";

export type { TourStep };

// Tour steps for the product walkthrough
export const TOUR_STEPS: TourStep[] = [
  {
    id: "section-breakdown",
    target: "section-breakdown",
    title: "Section Breakdown",
    description: "Click each card to dive deep into that area of your analysis. See VC perspective, strategic tools, and actionable insights.",
    placement: "bottom"
  },
  {
    id: "investment-thesis",
    target: "investment-thesis",
    title: "Investment Thesis",
    description: "Your complete VC investment recommendation. See how investors would summarize your fundability.",
    placement: "top"
  },
  {
    id: "strategic-tools",
    target: "strategic-tools",
    title: "Strategic Analysis Tools",
    description: "23+ AI-powered tools including 90-day action plans, case studies, and competitive matrices.",
    placement: "top"
  },
  {
    id: "sidebar-profile",
    target: "sidebar-profile",
    title: "Your Profile",
    description: "View and edit the questionnaire responses that power your analysis. Better inputs = better insights.",
    placement: "right"
  },
  {
    id: "sidebar-memo",
    target: "sidebar-memo",
    title: "VC Memorandum",
    description: "The full 9-page investment memo written in authentic VC language — ready to share with investors.",
    placement: "right"
  },
  {
    id: "sidebar-network",
    target: "sidebar-network",
    title: "VC Network",
    description: "800+ active investors matched to your profile. Find VCs who invest in your stage, sector, and geography.",
    placement: "right"
  },
  {
    id: "sidebar-market-lens",
    target: "sidebar-market-lens",
    title: "Market Lens",
    description: "AI-generated market intelligence tailored to your sector. Trends, benchmarks, and competitive landscape.",
    placement: "right"
  }
];

const DEMO_TOUR_KEY = "demo_product_tour_completed";
const LIVE_TOUR_KEY = "product_tour_completed";

export function useProductTour(isDemo: boolean = false) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const storageKey = isDemo ? DEMO_TOUR_KEY : LIVE_TOUR_KEY;

  // Check if tour has been completed before
  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === "true";
    setIsInitialized(true);
    // Don't auto-start here - let parent component control this
  }, [storageKey]);

  const currentStep = TOUR_STEPS[currentStepIndex];

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Complete the tour
      completeTour();
    }
  }, [currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, [storageKey]);

  const completeTour = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, [storageKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setCurrentStepIndex(0);
  }, [storageKey]);

  const hasCompletedTour = localStorage.getItem(storageKey) === "true";

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: TOUR_STEPS.length,
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
