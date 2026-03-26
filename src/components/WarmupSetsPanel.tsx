"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateWarmupSets } from "@/lib/warmup-calculator";
import { type WorkoutMode } from "@/types/workout";
import { GlassCard } from "./ui/GlassCard";

interface WarmupSetsPanelProps {
  workingWeight?: number | null;
  repsField?: string | number | null;
  unit?: 'kg' | 'lbs';
  mode: WorkoutMode;
}

export function WarmupSetsPanel({
  workingWeight,
  repsField,
  unit = 'kg',
  mode
}: WarmupSetsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedSets, setCheckedSets] = useState<Record<number, boolean>>({});
  const [debouncedWeight, setDebouncedWeight] = useState(workingWeight);
  const [debouncedReps, setDebouncedReps] = useState(repsField);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedWeight(workingWeight);
      setDebouncedReps(repsField);
    }, 400);

    return () => clearTimeout(handler);
  }, [workingWeight, repsField]);

  const result = useMemo(() => {
    if (!debouncedWeight || debouncedWeight === 0 || debouncedReps === null) return null;
    return generateWarmupSets(debouncedWeight, debouncedReps, unit);
  }, [debouncedWeight, debouncedReps, unit]);

  if (!result) {
    if (workingWeight === null || repsField === null) {
      return (
        <div className="p-4 rounded-xl border border-dashed border-foreground/10 flex items-center justify-center space-x-2">
           <Info className="w-4 h-4 text-foreground/20" />
           <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
             Enter weight and reps to generate warm-up sets
           </span>
        </div>
      );
    }
    return null;
  }

  if (result && result.workingWeight < 10) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-foreground/10 flex items-center justify-center space-x-2">
         <Info className="w-4 h-4 text-brand-primary/40" />
         <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
           Weight too low for warm-up progression
         </span>
      </div>
    );
  }

  const toggleSet = (index: number) => {
    if (mode !== 'LIVE_SESSION') return;
    setCheckedSets(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const schemeLabels: Record<string, string> = {
    STRENGTH: "Strength",
    STRENGTH_HYPER: "Strength-Hypertrophy",
    HYPERTROPHY: "Hypertrophy",
    ENDURANCE: "Endurance"
  };

  return (
    <div className="w-full space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10 hover:bg-brand-primary/10 transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
            Warm-up Suggestions for {workingWeight}{unit} — {schemeLabels[result.scheme]}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-foreground/40 group-hover:text-brand-primary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-foreground/40 group-hover:text-brand-primary" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <GlassCard className="p-4 space-y-3 bg-foreground/[0.02]">
              <div className="space-y-2">
                {result.sets.map((set, idx) => {
                  const isVeryLight = set.weight < 5;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSet(idx)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg transition-all",
                        mode === 'LIVE_SESSION' ? "cursor-pointer hover:bg-foreground/5" : ""
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        {mode === 'LIVE_SESSION' && (
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            checkedSets[idx]
                              ? "bg-brand-primary border-brand-primary"
                              : "border-foreground/10 bg-transparent"
                          )}>
                            {checkedSets[idx] && <Check className="w-3 h-3 text-black" />}
                          </div>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-brand-primary/20 text-[9px] font-black text-brand-primary uppercase tracking-tighter">
                          {set.percentage}%
                        </span>
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-xs font-bold transition-all",
                            checkedSets[idx] ? "text-foreground/40 line-through" : "text-foreground"
                          )}>
                            {set.weight}{unit} × {set.reps} reps
                          </span>
                          {isVeryLight && (
                            <span className="text-[8px] font-bold text-brand-primary/60 uppercase">
                              Consider skipping — very light
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-foreground/5 flex items-center justify-between">
                <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">
                  {result.sets.length} sets · {result.scheme} scheme
                </span>
                {mode === 'PLAN_DESIGNER' && (
                  <span className="text-[9px] font-black text-brand-primary/60 uppercase tracking-widest">
                    Reference only
                  </span>
                )}
                {mode === 'MANUAL_LOG' && (
                  <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">
                    Read-only reference
                  </span>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
