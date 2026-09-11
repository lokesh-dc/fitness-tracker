"use client";

import { useState } from "react";
import { 
  Bar, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from "recharts";
import { WeeklyMuscleVolume } from "@/types/workout";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

import { useTheme } from "next-themes";
import { useEffect } from "react";

interface VolumeOverTimeChartProps {
  data: WeeklyMuscleVolume[];
}

type Metric = "totalVolume" | "totalSets" | "sessionCount";

export function VolumeOverTimeChart({ data }: VolumeOverTimeChartProps) {
  const [metric, setMetric] = useState<Metric>("totalVolume");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const tickColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.55)";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)";
  const avgLineColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.45)";

  const sortedData = [...data].sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  // Find peak 25% weeks for highlighting
  const metricValues = sortedData.map(d => d[metric] as number);
  const sortedValues = [...metricValues].sort((a, b) => b - a);
  const threshold = sortedValues[Math.floor(metricValues.length * 0.25)] || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-xl border border-foreground/10 p-3.5 rounded-2xl shadow-xl">
          <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider mb-2">
            Week of {format(parseISO(d.weekStart), 'MMM d, yyyy')}
          </p>
          <div className="space-y-1.5 min-w-[130px]">
            <div className="flex justify-between gap-6">
              <span className="text-[10px] font-medium text-foreground/60 uppercase">Volume</span>
              <span className="text-xs font-bold text-brand-primary">{d.totalVolume.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-[10px] font-medium text-foreground/60 uppercase">Sets</span>
              <span className="text-xs font-bold text-foreground">{d.totalSets}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-[10px] font-medium text-foreground/60 uppercase">Sessions</span>
              <span className="text-xs font-bold text-foreground">{d.sessionCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getMetricLabel = (m: Metric) => {
    if (m === "totalVolume") return "Volume";
    if (m === "totalSets") return "Sets";
    return "Sessions";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center gap-1 bg-foreground/[0.04] p-1 rounded-xl border border-foreground/[0.06] max-w-full overflow-x-auto no-scrollbar">
          {(["totalVolume", "totalSets", "sessionCount"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap",
                metric === m
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-foreground/50 hover:text-foreground/80 hover:bg-foreground/[0.04]"
              )}
            >
              {getMetricLabel(m)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[240px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-accent, #ff5722)" stopOpacity={0.85} />
                <stop offset="100%" stopColor="var(--brand-accent, #ff5722)" stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="weekStart" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
              tickFormatter={(val) => {
                const date = parseISO(val);
                return date.getDate() <= 7 ? format(date, 'MMM') : format(date, 'w');
              }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
              allowDecimals={metric === "sessionCount" ? false : true}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            
            {/* Top quartile highlights */}
            {threshold > 0 && sortedData.map((d, i) => (
              (d[metric] as number) >= threshold && (
                <ReferenceArea
                  key={i}
                  x1={d.weekStart}
                  x2={sortedData[i+1]?.weekStart || d.weekStart}
                  fill="var(--brand-accent, #ff5722)"
                  fillOpacity={isDark ? 0.05 : 0.08}
                  stroke="none"
                />
              )
            ))}

            <Bar 
              dataKey={metric} 
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            {metric === "totalVolume" && (
              <Line
                type="monotone"
                dataKey="rollingAvgVolume"
                stroke={avgLineColor}
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
