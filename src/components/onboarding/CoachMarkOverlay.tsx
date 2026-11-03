"use client";

import React, { useEffect, useState } from "react";
import { CoachMarkStep } from "@/types/onboarding";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight, ArrowLeft, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachMarkOverlayProps {
  isActive: boolean;
  currentStep: CoachMarkStep | null;
  currentStepIdx: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function CoachMarkOverlay({
  isActive,
  currentStep,
  currentStepIdx,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
}: CoachMarkOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isActive || !currentStep) return null;

  const isLast = currentStepIdx === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dimmed backdrop with highlight cutout or subtle tint */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto" />

      {/* Target Highlight Box */}
      {targetRect && (
        <div
          style={{
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          className="absolute rounded-2xl border-2 border-brand-primary shadow-[0_0_30px_rgba(249,115,22,0.45)] pointer-events-none transition-all duration-300 animate-pulse ring-4 ring-brand-primary/20"
        />
      )}

      {/* Coach Mark Card - Bottom-anchored on mobile for one-handed ergonomics */}
      <div className="absolute inset-x-0 bottom-4 sm:bottom-8 px-4 flex justify-center pointer-events-auto">
        <GlassCard className="w-full max-w-lg p-5 sm:p-6 space-y-4 border-brand-primary/40 bg-background/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                Quick Guide · Step {currentStepIdx + 1} of {totalSteps}
              </p>
            </div>

            <button
              type="button"
              onClick={onSkip}
              className="text-[10px] font-black uppercase tracking-wider text-foreground/40 hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2">
              <X className="w-4 h-4 mr-1" />
              Skip Tour
            </button>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <h3 className="text-base font-black text-foreground uppercase tracking-tight">
              {currentStep.title}
            </h3>
            <p className="text-xs text-foreground/70 font-medium leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Stepper Dots & Navigation Buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-foreground/5">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentStepIdx
                      ? "w-6 bg-brand-primary"
                      : "w-2 bg-foreground/15"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIdx > 0 && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="glass-button min-h-[44px] px-3.5 rounded-xl font-black text-[11px] uppercase tracking-wider text-foreground/60 flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
              )}

              <button
                type="button"
                onClick={onNext}
                className="bg-brand-primary text-black min-h-[44px] px-5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                {isLast ? "Got it" : "Next"}
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

