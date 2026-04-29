"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, ArrowUp } from "lucide-react";

interface MostImprovedWidgetProps {
  data: { muscleGroup: string; percentChange: number; topExercise: string } | null;
}

export function MuscleGroupImprovedWidget({ data }: MostImprovedWidgetProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">
        Most Improved
      </h3>
      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">
        This month vs last month
      </p>

      {!data ? (
        <p className="text-xs font-bold text-foreground/30 leading-relaxed py-4 text-center">
          Log at least 2 months of training to see improvements.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-2xl border border-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground uppercase tracking-tight">
                {data.muscleGroup}
              </p>
              <div className="flex items-center gap-1.5 text-green-400">
                <ArrowUp className="w-3 h-3" />
                <span className="text-xs font-black">+{data.percentChange}% avg strength</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Key Driver</p>
            <p className="text-xs font-bold text-foreground/80">{data.topExercise}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
