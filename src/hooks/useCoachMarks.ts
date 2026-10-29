"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CoachMarkStep } from "@/types/onboarding";

export const COACH_MARK_STEPS: CoachMarkStep[] = [
  {
    id: "set-inputs",
    targetSelector: '[data-tour="set-inputs"]',
    title: "Log your first set",
    description: "Enter the weight and reps you completed for this set.",
    placement: "bottom",
  },
  {
    id: "set-complete",
    targetSelector: '[data-tour="set-complete"]',
    title: "Mark the set complete",
    description: "Tap the checkmark when done. This records your set and automatically starts the rest timer.",
    placement: "bottom",
  },
  {
    id: "rest-timer",
    targetSelector: '[data-tour="rest-timer"]',
    title: "Rest timer",
    description: "Keep your recovery on track. You can add seconds, subtract, or skip directly to the next set.",
    placement: "top",
  },
  {
    id: "warmup-panel",
    targetSelector: '[data-tour="warmup-panel"]',
    title: "Need a warm-up?",
    description: "Use ramp-up sets to prime your joints. Warm-up sets are strictly for prep and never saved to your log.",
    placement: "bottom",
  },
  {
    id: "finish-workout",
    targetSelector: '[data-tour="finish-workout"]',
    title: "Finish your workout",
    description: "When finished, tap Complete Workout to save your session, break personal records, and view recovery.",
    placement: "top",
  },
];

export function useCoachMarks(enabled: boolean = false) {
  const [isActive, setIsActive] = useState(enabled);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const currentStep = COACH_MARK_STEPS[currentStepIdx] || null;

  const updateTargetRect = useCallback(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    setIsActive(enabled);
    if (enabled) {
      setCurrentStepIdx(0);
    }
  }, [enabled]);

  useEffect(() => {
    if (!isActive) return;

    updateTargetRect();

    const handleScrollOrResize = () => {
      updateTargetRect();
    };

    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });

    // Also observe the target element for DOM changes
    if (currentStep) {
      const el = document.querySelector(currentStep.targetSelector);
      if (el && typeof ResizeObserver !== "undefined") {
        resizeObserverRef.current = new ResizeObserver(() => updateTargetRect());
        resizeObserverRef.current.observe(el);
      }
    }

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isActive, currentStepIdx, updateTargetRect, currentStep]);

  const nextStep = useCallback(() => {
    if (currentStepIdx < COACH_MARK_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setIsActive(false);
    }
  }, [currentStepIdx]);

  const prevStep = useCallback(() => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  }, [currentStepIdx]);

  const skipTour = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    currentStepIdx,
    currentStep,
    totalSteps: COACH_MARK_STEPS.length,
    targetRect,
    nextStep,
    prevStep,
    skipTour,
  };
}

