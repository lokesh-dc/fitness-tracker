"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface NeglectedMusclesWidgetProps {
  data: { muscleGroup: string; daysSinceLastTrained: number }[];
}

export function MuscleGroupNeglectedWidget({ data }: NeglectedMusclesWidgetProps) {
  return (
    <GlassCard>
      <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">
        Needs Attention
      </h3>
      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6">
        Muscles needing focus
      </p>

      {data.length === 0 ? (
        <p className="text-xs font-bold text-foreground/40 leading-relaxed py-4 text-center italic">
          All muscle groups trained recently. Great balance! 💪
        </p>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 5).map((m) => (
            <div key={m.muscleGroup} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="text-sm font-black text-foreground">{m.muscleGroup}</p>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                  Last trained {m.daysSinceLastTrained} days ago
                </p>
              </div>
              <div className={cn(
                "w-2 h-2 rounded-full",
                m.daysSinceLastTrained > 14 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
              )} />
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
