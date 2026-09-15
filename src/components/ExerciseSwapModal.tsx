"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { type ExerciseDefinition } from "@/types/workout";
import { ArrowLeftRight, X } from "lucide-react";

interface ExerciseSwapModalProps {
  open: boolean;
  currentName: string;
  alternatives: ExerciseDefinition[];
  onClose: () => void;
  onSwap: (name: string) => void;
}

export default function ExerciseSwapModal({
  open,
  currentName,
  alternatives,
  onClose,
  onSwap,
}: ExerciseSwapModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <GlassCard className="max-h-[80vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200 border-brand-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                Swap Exercise
              </h3>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                Pick an “OR” alternative
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] font-bold text-foreground/50 mb-3 leading-relaxed">
          Instead of <span className="text-foreground font-black">{currentName}</span>,
          I&apos;ll do:
        </p>

        <div className="space-y-2">
          {alternatives.length === 0 ? (
            <p className="text-xs text-foreground/40 font-medium py-4 text-center">
              No alternatives defined for this exercise yet.
            </p>
          ) : (
            alternatives.map((alt) => (
              <button
                key={alt.id || alt.name}
                onClick={() => onSwap(alt.name)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 border-foreground/8 bg-foreground/3 text-left transition-all hover:border-brand-primary hover:bg-brand-primary/5 group",
                )}>
                <p className="text-sm font-black text-foreground group-hover:text-brand-primary">
                  {alt.name}
                </p>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">
                  {alt.muscleGroup}
                </p>
              </button>
            ))
          )}
        </div>
      </GlassCard>
      </div>
    </div>
  );
}