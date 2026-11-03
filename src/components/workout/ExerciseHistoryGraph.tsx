"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from "recharts";
import { type ExerciseHistorySession } from "@/app/actions/exercise-history";
import { TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ExerciseHistoryGraphProps {
  sessions: ExerciseHistorySession[];
  exerciseName: string;
}

export function ExerciseHistoryGraph({
  sessions,
  exerciseName,
}: ExerciseHistoryGraphProps) {
  // Chronological order: oldest to newest
  const chartData = useMemo(() => {
    return [...sessions].reverse().map((s) => ({
      date: s.date,
      weight: s.topSetWeight,
      reps: s.topSetReps,
      estimated1RM: s.estimated1RM,
      totalSets: s.totalSets,
    }));
  }, [sessions]);

  if (chartData.length === 0) return null;

  const minWeight = Math.min(...chartData.map((d) => d.weight));
  const maxWeight = Math.max(...chartData.map((d) => d.weight));
  const yDomainMin = Math.max(0, Math.floor(minWeight - 5));
  const yDomainMax = Math.ceil(maxWeight + 5);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-2.5 rounded-xl border border-foreground/10 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1.5">
            {data.date}
          </p>
          <div className="space-y-1 text-xs font-bold">
            <div className="flex items-center justify-between gap-4 text-brand-primary">
              <span className="font-semibold text-[11px] text-foreground/60">Top Set:</span>
              <span>{data.weight}kg × {data.reps}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-indigo-400">
              <span className="font-semibold text-[11px] text-foreground/60">Est. 1RM:</span>
              <span>~{data.estimated1RM}kg</span>
            </div>
            <div className="text-[10px] text-foreground/40 font-medium pt-0.5 border-t border-foreground/5">
              {data.totalSets} {data.totalSets === 1 ? "set" : "sets"} logged
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
          <h3 className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
            History Trend
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-bold">
          <span className="flex items-center gap-1.5 text-foreground/70">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)] inline-block" />
            Top Weight (kg)
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400/80">
            <span className="w-2 h-0.5 bg-indigo-400 inline-block" />
            Est. 1RM
          </span>
        </div>
      </div>

      <GlassCard className="p-3">
        {chartData.length === 1 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-xs font-bold text-foreground">
              {chartData[0].weight}kg × {chartData[0].reps} reps
            </p>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
              1 session recorded on {chartData[0].date}. Complete another to visualize progression.
            </p>
          </div>
        ) : (
          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="historyWeightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-foreground/[0.04]"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "currentColor",
                    fontSize: 9,
                    fontWeight: 700,
                    className: "text-foreground/40",
                  }}
                  minTickGap={20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  domain={[yDomainMin, yDomainMax]}
                  tick={{
                    fill: "currentColor",
                    fontSize: 9,
                    fontWeight: 700,
                    className: "text-foreground/40",
                  }}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--brand-accent)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#historyWeightGrad)"
                  dot={{
                    r: 3,
                    fill: "var(--brand-accent)",
                    stroke: "currentColor",
                    className: "text-background",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 5,
                    fill: "var(--brand-accent)",
                    stroke: "currentColor",
                    className: "text-foreground",
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="estimated1RM"
                  stroke="#818cf8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

