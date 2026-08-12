"use client";

import { ExerciseDetailData } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PRBoardWidgetProps {
  exercises: ExerciseDetailData[];
}

export function PRBoardWidget({ exercises }: PRBoardWidgetProps) {
  const topPRs = [...exercises]
    .filter(ex => ex.currentPR > 0)
    .sort((a, b) => b.currentPR - a.currentPR)
    .slice(0, 3);

  if (topPRs.length === 0) return null;

  return (
    <GlassCard className="p-4">
      <div className="mb-4">
        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-1">
          Top Lifts
        </h3>
        <p className="text-[9px] font-bold text-brand-primary/60 uppercase tracking-widest">
          By current PR
        </p>
      </div>

      <div className="space-y-4">
        {topPRs.map((ex, i) => (
          <div key={ex.exerciseName} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                i === 0 ? "bg-yellow-400/20 text-yellow-400" :
                i === 1 ? "bg-slate-300/20 text-slate-300" :
                "bg-amber-600/20 text-amber-600"
              )}>
                <Medal className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] font-black text-foreground uppercase tracking-tight truncate">
                {ex.exerciseName}
              </p>
            </div>
            <p className="text-sm font-black text-foreground shrink-0">
              {ex.currentPR} <span className="text-[10px] text-foreground/40 font-bold uppercase">kg</span>
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
