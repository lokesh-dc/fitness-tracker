"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { MostImprovedExercise } from "@/types/workout";
import { TrendingUp, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MostImprovedWidgetProps {
  mostImproved: MostImprovedExercise | null;
  variant?: 'sidebar' | 'mobile';
}

export function MostImprovedWidget({ mostImproved, variant = 'sidebar' }: MostImprovedWidgetProps) {
  if (!mostImproved) {
    if (variant === 'mobile') return null;
    return (
      <GlassCard className="flex flex-col items-center justify-center py-8 text-foreground/20">
        <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
        <span className="text-xs font-bold uppercase tracking-widest">No improvement data yet</span>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn(
      "flex flex-col gap-4",
      variant === 'mobile' && "min-w-[240px] flex-shrink-0 p-4"
    )}>
      <div>
        <p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase mb-1">Most Improved</p>
        <p className="text-[10px] text-foreground/20 mb-4 font-bold uppercase tracking-tight">Last 30 Days</p>

        <div className="flex items-center gap-4">
          <div className="bg-green-500/10 p-3 rounded-2xl border border-green-500/20">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-black text-foreground truncate uppercase tracking-tight">
              {mostImproved.exerciseName}
            </p>
            <div className="flex items-center gap-1.5 text-green-400">
              <ArrowUp className="w-3 h-3" />
              <span className="text-xs font-black">+{mostImproved.improvementPercent}%</span>
              <span className="text-[10px] font-bold text-foreground/40 ml-1">
                (+{mostImproved.improvementKg}kg)
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
