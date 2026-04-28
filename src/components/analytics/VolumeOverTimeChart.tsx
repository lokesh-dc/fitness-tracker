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

interface VolumeOverTimeChartProps {
  data: WeeklyMuscleVolume[];
}

type Metric = "totalVolume" | "totalSets" | "sessionCount";

export function VolumeOverTimeChart({ data }: VolumeOverTimeChartProps) {
  const [metric, setMetric] = useState<Metric>("totalVolume");

  const sortedData = [...data].sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  // Find peak 25% weeks for highlighting
  const metricValues = sortedData.map(d => d[metric] as number);
  const sortedValues = [...metricValues].sort((a, b) => b - a);
  const threshold = sortedValues[Math.floor(metricValues.length * 0.25)] || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2">
            Week of {format(parseISO(d.weekStart), 'MMM d, yyyy')}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between gap-8">
              <span className="text-[10px] font-bold text-white/60 uppercase">Volume</span>
              <span className="text-xs font-black text-brand-primary">{d.totalVolume.toLocaleString()} kg</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-[10px] font-bold text-white/60 uppercase">Sets</span>
              <span className="text-xs font-black text-white">{d.totalSets}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-[10px] font-bold text-white/60 uppercase">Sessions</span>
              <span className="text-xs font-black text-white">{d.sessionCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getMetricLabel = (m: Metric) => {
    if (m === "totalVolume") return "Volume (kg)";
    if (m === "totalSets") return "Sets";
    return "Sessions/wk";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="group-tabs no-scrollbar max-w-full">
          {(["totalVolume", "totalSets", "sessionCount"] as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                "tab-item px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[9px] md:text-[10px] whitespace-nowrap",
                metric === m && "tab-item-active"
              )}
            >
              {getMetricLabel(m).split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="weekStart" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
              tickFormatter={(val) => {
                const date = parseISO(val);
                return date.getDate() <= 7 ? format(date, 'MMM') : format(date, 'w');
              }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            
            {/* Top quartile highlights */}
            {threshold > 0 && sortedData.map((d, i) => (
              (d[metric] as number) >= threshold && (
                <ReferenceArea
                  key={i}
                  x1={d.weekStart}
                  x2={sortedData[i+1]?.weekStart || d.weekStart}
                  fill="rgba(249,115,22,0.03)"
                  stroke="none"
                />
              )
            ))}

            <Bar 
              dataKey={metric} 
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            {metric === "totalVolume" && (
              <Line
                type="monotone"
                dataKey="rollingAvgVolume"
                stroke="rgba(255,255,255,0.4)"
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
