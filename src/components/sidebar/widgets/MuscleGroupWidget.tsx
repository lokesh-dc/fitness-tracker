"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { MuscleGroupStat } from "@/types/workout";

export function MuscleGroupWidget({ muscleGroups }: { muscleGroups: MuscleGroupStat[] }) {
  if (!muscleGroups || muscleGroups.length === 0) {
    return (
      <GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02] flex flex-col justify-center min-h-[160px]">
        <h3 className="text-[10px] font-black tracking-widest text-foreground/40 uppercase mb-3 text-center">Top Muscle Groups</h3>
        <p className="text-xs text-foreground/40 text-center italic">Log some workouts to see muscle breakdown</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02]">
      <div className="mb-4">
        <h3 className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">Top Muscle Groups</h3>
        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5">All time</p>
      </div>

      <div className="space-y-3">
        {muscleGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-foreground capitalize">{group.muscleGroup}</span>
              <span className="text-[10px] font-black text-foreground/60">{group.percentageOfTotal}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
              <div 
                className="h-full bg-brand-primary rounded-full"
                style={{ width: `${group.percentageOfTotal}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
