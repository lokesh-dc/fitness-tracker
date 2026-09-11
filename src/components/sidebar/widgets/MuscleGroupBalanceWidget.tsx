"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface TrainingBalanceWidgetProps {
  data: { muscleGroup: string; volumePercent: number }[];
}

export function MuscleGroupBalanceWidget({ data }: TrainingBalanceWidgetProps) {
  if (data.length === 0) return null;

  const topMuscle = data[0];

  return (
    <GlassCard>
      <h3 className="text-sm font-semibold text-foreground tracking-tight mb-0.5">
        Training Balance
      </h3>
      <p className="text-[11px] font-medium text-foreground/40 mb-4">
        Last 4 weeks
      </p>

      <div className="h-48 w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="var(--foreground)" strokeOpacity={0.08} />
            <PolarAngleAxis 
              dataKey="muscleGroup" 
              tick={{ fill: "currentColor", fontSize: 9, fontWeight: 600, className: "text-foreground/50" }}
            />
            <Radar
              name="Volume %"
              dataKey="volumePercent"
              stroke="var(--brand-accent)"
              fill="var(--brand-accent)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs font-bold text-foreground/60 leading-relaxed mt-4">
        {topMuscle.muscleGroup} accounts for <span className="text-brand-primary">{topMuscle.volumePercent}%</span> of your training volume.
      </p>
    </GlassCard>
  );
}
