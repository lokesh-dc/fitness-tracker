"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Timer } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { type MobilityMovement } from "@/lib/mobility-warmup-data";

interface MobilityWarmupPanelProps {
  movements: MobilityMovement[];
  currentIndex: number;
  completedMovements: Set<string>;
  onSelectMovement: (index: number) => void;
}

export function MobilityWarmupPanel({ movements, currentIndex, completedMovements, onSelectMovement }: MobilityWarmupPanelProps) {
  const current = movements[currentIndex];

  return (
    <div className="space-y-6 px-1">
      {/* Movement grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {movements.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => onSelectMovement(idx)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-left transition-all",
              completedMovements.has(m.id)
                ? "border-brand-primary/30 bg-brand-primary/10"
                : idx === currentIndex
                  ? "border-brand-primary/20 bg-brand-primary/5"
                  : "border-foreground/5 bg-foreground/5 opacity-50",
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                completedMovements.has(m.id) ? "bg-brand-primary" : "bg-foreground/10",
              )}
            >
              {completedMovements.has(m.id) ? (
                <CheckCircle2 className="w-2.5 h-2.5 text-black" />
              ) : (
                <span className="text-[7px] font-black text-foreground/40">{idx + 1}</span>
              )}
            </div>
            <span className="text-[9px] font-bold text-foreground/70 truncate">
              {m.name}
            </span>
          </button>
        ))}
      </div>

      {/* Current movement card */}
      <div className="flex items-center justify-center min-h-[30vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <GlassCard className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                <Timer className="w-8 h-8 text-brand-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                  {current?.name}
                </h2>
                <p className="text-sm font-bold text-foreground/40">
                  Hold for {current?.durationSeconds} seconds
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
