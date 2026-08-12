"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { WeeklyVolumeData } from "@/types/workout";
import { cn } from "@/lib/utils";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { MoveUpRight, MoveDownRight, Minus } from "lucide-react";

interface WeeklyVolumeWidgetProps {
  data: WeeklyVolumeData | null;
  variant?: 'sidebar' | 'mobile';
}

export function WeeklyVolumeWidget({ data, variant = 'sidebar' }: WeeklyVolumeWidgetProps) {
  if (!data || data.weeks.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-8 text-white/40">
        <Minus className="w-8 h-8 mb-2 opacity-20" />
        <span className="text-xs">No volume data yet</span>
      </GlassCard>
    );
  }

  const { weeks, currentWeekVolume, averageWeeklyVolume, trend } = data;
  const lastWeekVolume = weeks.length > 1 ? weeks[weeks.length - 2].totalVolume : currentWeekVolume;
  const volumeDeltaPercent = lastWeekVolume > 0 
    ? Math.round(((currentWeekVolume - lastWeekVolume) / lastWeekVolume) * 100) 
    : 0;

  if (variant === 'mobile') {
      return (
        <GlassCard className="min-w-[220px] flex-shrink-0 p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Weekly Volume</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{currentWeekVolume.toLocaleString()}</span>
                <span className="text-[10px] text-white/40 font-medium">kg</span>
              </div>
            </div>
            <div className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5",
              volumeDeltaPercent > 0 ? "bg-green-500/10 text-green-400" : 
              volumeDeltaPercent < 0 ? "bg-red-500/10 text-red-400" : 
              "bg-white/5 text-white/40"
            )}>
              {volumeDeltaPercent > 0 ? <MoveUpRight className="w-2.5 h-2.5" /> : 
               volumeDeltaPercent < 0 ? <MoveDownRight className="w-2.5 h-2.5" /> : 
               <Minus className="w-2.5 h-2.5" />}
              {Math.abs(volumeDeltaPercent)}%
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-tight">Avg: {averageWeeklyVolume.toLocaleString()} kg</p>
        </GlassCard>
      );
  }

  return (
    <GlassCard className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-4 font-medium">Weekly Volume</p>
        
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{currentWeekVolume.toLocaleString()}</span>
            <span className="text-xs text-white/40 uppercase font-medium">kg</span>
          </div>
          <div className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all",
            volumeDeltaPercent > 0 ? "bg-green-500/15 text-green-400" : 
            volumeDeltaPercent < 0 ? "bg-red-500/15 text-red-400" : 
            "bg-white/5 text-white/40"
          )}>
            {volumeDeltaPercent > 0 ? <MoveUpRight className="w-3 h-3" /> : 
             volumeDeltaPercent < 0 ? <MoveDownRight className="w-3 h-3" /> : 
             <Minus className="w-3 h-3" />}
            {Math.abs(volumeDeltaPercent)}% vs last week
          </div>
        </div>

        <div className="h-20 w-full mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks}>
              <Bar 
                dataKey="totalVolume" 
                radius={[4, 4, 0, 0]}
              >
                {weeks.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === weeks.length - 1 ? "#f97316" : "#f9731640"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-600 px-1">
          <span>Week 1</span>
          <span>This Week</span>
        </div>
      </div>

      <div className="h-[1px] bg-white/10 w-full" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-zinc-500 mb-1 font-medium uppercase tracking-tight">Avg / Week</p>
          <p className="text-sm font-bold text-white/90">
            {Math.round(averageWeeklyVolume).toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal">kg</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 mb-1 font-medium uppercase tracking-tight">Trend</p>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-sm font-bold capitalize",
              trend === 'increasing' ? "text-green-400" : 
              trend === 'declining' ? "text-red-400" : 
              "text-white/40"
            )}>
              {trend}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
