"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { AllTimeStats } from "@/types/workout";
import { Dumbbell, Package, Trophy, Flame } from "lucide-react";

interface AllTimeStatsWidgetProps {
  data: AllTimeStats;
}

export function AllTimeStatsWidget({ data }: AllTimeStatsWidgetProps) {
  const { totalWorkouts, totalVolumeKg, totalPRsBroken, longestStreakDays } = data;

  if (totalWorkouts === 0) {
    return (
      <GlassCard className="p-5">
        <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-4">
          All-Time
        </h3>
        <p className="text-xs text-foreground/50 leading-relaxed">
          Start logging to build your stats
        </p>
      </GlassCard>
    );
  }

  const stats = [
    { 
      label: "Total Workouts", 
      value: totalWorkouts.toLocaleString(), 
      icon: <Dumbbell className="w-4 h-4 text-orange-400" /> 
    },
    { 
      label: "Total Volume", 
      value: `${totalVolumeKg.toLocaleString()} kg`, 
      icon: <Package className="w-4 h-4 text-blue-400" /> 
    },
    { 
      label: "PRs Broken", 
      value: totalPRsBroken.toLocaleString(), 
      icon: <Trophy className="w-4 h-4 text-yellow-400" /> 
    },
    { 
      label: "Longest Streak", 
      value: `${longestStreakDays} days`, 
      icon: <Flame className="w-4 h-4 text-red-400" /> 
    },
  ];

  return (
    <GlassCard className="p-5">
      <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-4">
        All-Time
      </h3>
      
      <div className="space-y-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-foreground/50">{stat.label}</span>
            </div>
            <span className="text-sm font-bold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
