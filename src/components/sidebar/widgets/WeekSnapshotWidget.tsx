"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface WeekSnapshotWidgetProps {
  data: {
    sessionsCompleted: number;
    sessionsPlanned: number;
    completedDays: number[];
    plannedDays: number[];
  } | null;
}

export function WeekSnapshotWidget({ data }: WeekSnapshotWidgetProps) {
  if (!data) return null;

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const { sessionsCompleted, sessionsPlanned, completedDays, plannedDays } = data;

  return (
    <GlassCard className="flex flex-col gap-3 p-4 space-y-4">
      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">This Week</span>

      <div className="flex justify-between items-center px-1">
        {days.map((day, idx) => {
          const isCompleted = completedDays.includes(idx);
          const isPlanned = plannedDays.includes(idx);
          
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-500",
                isCompleted 
                  ? "bg-brand-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                  : isPlanned 
                    ? "border-2 border-brand-primary/30" 
                    : "bg-foreground/5"
              )} />
              <span className="text-[8px] font-black text-foreground/20">{day}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-foreground/5 text-center">
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tight">
          <span className="text-foreground">{sessionsCompleted}</span> of <span className="text-foreground">{sessionsPlanned || "?"}</span> sessions done
        </p>
      </div>
    </GlassCard>
  );
}
