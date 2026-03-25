"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { MissedWorkoutsStat } from "@/types/workout";

export function MissedWorkoutsWidget({ stats }: { stats: MissedWorkoutsStat }) {
  if (!stats.hasActivePlan) {
    return (
      <GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02]">
        <div className="mb-4">
          <h3 className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">This Month</h3>
        </div>
        <p className="text-xl font-black text-foreground">{stats.sessionsLogged} <span className="text-[10px] tracking-widest text-foreground/40 uppercase">sessions logged</span></p>
        <p className="text-xs text-foreground/40 italic mt-3">No active plan to track completion against.</p>
      </GlassCard>
    );
  }

  let barColor = "bg-green-500";
  if (stats.completionPercent < 80) barColor = "bg-orange-500";
  if (stats.completionPercent < 50) barColor = "bg-red-500";

  return (
    <GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02]">
      <div className="mb-4">
        <h3 className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">This Month</h3>
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground/60">Logged</span>
          <span className="text-xs font-black text-foreground">{stats.sessionsLogged} sessions</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground/60">Planned</span>
          <span className="text-xs font-black text-foreground">{stats.sessionsPlanned} sessions</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground/60">Missed</span>
          <span className={`text-xs font-black ${stats.sessionsMissed > 0 ? 'text-red-500' : 'text-foreground'}`}>
            {stats.sessionsMissed} sessions
          </span>
        </div>
      </div>

      <div className="space-y-1.5 mt-4 pt-4 border-t border-foreground/5">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Completion</span>
          <span className="text-lg font-black text-foreground">{stats.completionPercent}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
          <div 
            className={`h-full ${barColor} rounded-full`}
            style={{ width: `${stats.completionPercent}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
