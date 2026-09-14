"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface NeglectedMusclesWidgetProps {
  data: { muscleGroup: string; daysSinceLastTrained: number }[];
}

export function MuscleGroupNeglectedWidget({ data }: NeglectedMusclesWidgetProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-foreground tracking-tight mb-0.5">
        Needs Attention
      </h3>
      <p className="text-[11px] font-medium text-foreground/40 mb-4">
        Muscles needing focus
      </p>

      {data.length === 0 ? (
        <p className="text-xs font-medium text-foreground/40 leading-relaxed py-4 text-center italic">
          All muscle groups trained recently. Great balance! 💪
        </p>
      ) : (
        <div className="space-y-2.5">
          {data.slice(0, 5).map((m) => (
            <div key={m.muscleGroup} className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06]">
              <div>
                <p className="text-sm font-bold text-foreground">{m.muscleGroup}</p>
                <p className="text-[10px] font-medium text-foreground/40 mt-0.5">
                  Last trained {m.daysSinceLastTrained} days ago
                </p>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                m.daysSinceLastTrained > 14 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              )} />
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
