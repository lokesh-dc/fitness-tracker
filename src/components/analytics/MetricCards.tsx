"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from "recharts";
import { ExerciseTimelineEntry } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { format } from "date-fns";

interface MetricCardsProps {
  data: ExerciseTimelineEntry[];
}

export function MetricCards({ data }: MetricCardsProps) {
  if (data.length === 0) return null;

  const lastEntry = data[data.length - 1];

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Reps Card */}
      <GlassCard className="p-6 space-y-4 bg-brand-primary/[0.02]">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Avg Reps / Set</h4>
            <p className="text-2xl font-black text-foreground">{lastEntry.avgRepsPerSet}</p>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-bold text-brand-primary/60 uppercase">Targeting Hyp.</span>
          </div>
        </div>
        
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar 
                dataKey="avgRepsPerSet" 
                fill="#fb923c" 
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              <XAxis dataKey="date" hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <GlassCard className="p-2 text-[8px] font-black uppercase text-foreground border-white/10">
                      {payload[0].value} Reps
                    </GlassCard>
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Volume Card */}
      <GlassCard className="p-6 space-y-4 bg-brand-primary/[0.02]">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Session Volume</h4>
            <p className="text-2xl font-black text-foreground">{lastEntry.totalVolume.toLocaleString()}kg</p>
          </div>
           <div className="text-right">
             <span className="text-[10px] font-bold text-brand-primary/60 uppercase">Tonnage Trend</span>
          </div>
        </div>

        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="totalVolume" 
                stroke="var(--brand-accent)" 
                fill="url(#areaGrad)" 
                strokeWidth={2}
              />
              <XAxis dataKey="date" hide />
               <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <GlassCard className="p-2 text-[8px] font-black uppercase text-foreground border-white/10">
                      {payload[0].value?.toLocaleString()}kg
                    </GlassCard>
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
