"use client";

import { GlassCard } from "@/components/ui/GlassCard";

interface MuscleQuickStatsWidgetProps {
  muscleGroup: string;
  totalSessions: number;
  totalSets: number;
  totalVolume: number;
  timeRangeLabel: string;
}

export function MuscleQuickStatsWidget({ 
  muscleGroup, 
  totalSessions, 
  totalSets, 
  totalVolume,
  timeRangeLabel 
}: MuscleQuickStatsWidgetProps) {
  const avgSets = totalSessions > 0 ? (totalSets / totalSessions).toFixed(1) : "0";

  return (
    <GlassCard className="p-4">
      <div className="mb-4">
        <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-1">
          {muscleGroup} Stats
        </h3>
        <p className="text-[9px] font-bold text-brand-primary/60 uppercase tracking-widest">
          {timeRangeLabel}
        </p>
      </div>

      <div className="space-y-4">
        {[
          { label: "Sessions", value: totalSessions },
          { label: "Total Sets", value: totalSets.toLocaleString() },
          { label: "Total Volume", value: `${totalVolume.toLocaleString()} kg` },
          { label: "Avg Sets/Session", value: avgSets },
        ].map((stat, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
              {stat.label}
            </span>
            <span className="text-sm font-black text-foreground">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
