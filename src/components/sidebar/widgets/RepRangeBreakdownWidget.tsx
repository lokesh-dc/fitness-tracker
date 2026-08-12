"use client";

import { RepRangeDistribution } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { RepRangeDonut } from "@/components/analytics/RepRangeDonut";

interface RepRangeBreakdownWidgetProps {
  distribution: RepRangeDistribution;
}

export function RepRangeBreakdownWidget({ distribution }: RepRangeBreakdownWidgetProps) {
  const getPercent = (val: number) => {
    return distribution.total > 0 ? Math.round((val / distribution.total) * 100) : 0;
  };

  return (
    <GlassCard className="p-4">
      <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-2">
        Rep Range Breakdown
      </h3>

      <div className="relative mb-2">
        <RepRangeDonut distribution={distribution} size="sm" />
      </div>

      <div className="space-y-2 mt-2">
        {[
          { label: "Strength (1-5)", value: distribution.strength, color: "text-red-400" },
          { label: "Power/Size (6-10)", value: distribution.strengthHyper, color: "text-orange-500" },
          { label: "Hypertrophy (11-15)", value: distribution.hypertrophy, color: "text-indigo-400" },
          { label: "Endurance (16+)", value: distribution.endurance, color: "text-emerald-400" },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-foreground/30">{item.label}</span>
            <span className={item.color}>
              {item.value} <span className="text-foreground/20 ml-1">({getPercent(item.value)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
