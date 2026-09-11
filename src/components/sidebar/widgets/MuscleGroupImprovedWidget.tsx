"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, ArrowUp } from "lucide-react";

interface MostImprovedWidgetProps {
  data: { muscleGroup: string; percentChange: number; topExercise: string } | null;
}

export function MuscleGroupImprovedWidget({ data }: MostImprovedWidgetProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-foreground tracking-tight mb-0.5">
        Most Improved
      </h3>
      <p className="text-[11px] font-medium text-foreground/40 mb-4">
        This month vs last month
      </p>

      {!data ? (
        <p className="text-xs font-medium text-foreground/30 leading-relaxed py-4 text-center">
          Log at least 2 months of training to see improvements.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">
                {data.muscleGroup}
              </p>
              <div className="flex items-center gap-1 text-emerald-500">
                <ArrowUp className="w-3 h-3" />
                <span className="text-xs font-semibold">+{data.percentChange}% avg strength</span>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t border-foreground/[0.04]">
            <p className="text-[10px] font-semibold text-foreground/35 uppercase tracking-wider mb-0.5">Key Driver</p>
            <p className="text-xs font-medium text-foreground/80">{data.topExercise}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
