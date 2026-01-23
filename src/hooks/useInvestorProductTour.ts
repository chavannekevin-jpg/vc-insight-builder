import { useState, useCallback, useEffect } from "react";
import { type TourStep } from "@/components/tour/ProductTourSpotlight";

const INVESTOR_TOUR_KEY = "investor_product_tour_completed";
const TOUR_TRIGGER_KEY = "investor_onboarding_entrance";

export const INVESTOR_TOUR_STEPS: TourStep[] = [
  {
    id: "network-map",
    target: "tour-network-map",
    title: "Your Network vs Global Network",
    description: "See your personal investor network on a world map. Toggle between your connections and the global investor directory to discover new contacts.",
    placement: "right"
  },
  {
    id: "crm-pipeline",
    target: "tour-crm",
    title: "CRM Pipeline",
    description: "Track relationships with founders and co-investors. Move contacts through stages from prospect to invested.",
    placement: "right"
  },
  {
    id: "dealflow",
    target: "tour-dealflow",
    title: "Dealflow",
    description: "Your deal pipeline at a glance. Review startup pitches, AI-generated snapshots, and track deal progress in a Kanban view.",
    placement: "right"
  },
  {
    id: "scout-deals",
    target: "tour-scout",
    title: "Scout Deals",
    description: "Invite startups to pitch directly to you. Share your unique scout link and let founders submit their decks for review.",
    placement: "right"
  },
  {
    id: "upload-deck",
    target: "tour-upload",
    title: "Upload Deck",
    description: "Quickly analyze any pitch deck. Upload a PDF and get an AI-powered investment snapshot in seconds.",
    placement: "right"
  },
  {
    id: "calendar",
    target: "tour-calendar",
    title: "Calendar & Booking",
    description: "Your fully customizable, white-label booking page. Share your personal link for founders to schedule meetings directly on your calendar.",
    placement: "right"
  }
];

export function useInvestorProductTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const currentStep = INVESTOR_TOUR_STEPS[currentStepIndex];

  // Check if tour should start (triggered by onboarding completion)
  useEffect(() => {
    const shouldStart = sessionStorage.getItem(TOUR_TRIGGER_KEY) === "true";
    const hasCompleted = localStorage.getItem(INVESTOR_TOUR_KEY) === "true";
    
    setIsInitialized(true);
    
    // Auto-start tour after a short delay if coming from onboarding
    if (shouldStart && !hasCompleted) {
      // Clear the trigger
      sessionStorage.removeItem(TOUR_TRIGGER_KEY);
      // Start tour after dashboard has rendered
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
    if (currentStepIndex < INVESTOR_TOUR_STEPS.length - 1) {
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
    localStorage.setItem(INVESTOR_TOUR_KEY, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(INVESTOR_TOUR_KEY, "true");
    setIsActive(false);
    setCurrentStepIndex(0);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(INVESTOR_TOUR_KEY);
    setCurrentStepIndex(0);
  }, []);

  const hasCompletedTour = localStorage.getItem(INVESTOR_TOUR_KEY) === "true";

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: INVESTOR_TOUR_STEPS.length,
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
