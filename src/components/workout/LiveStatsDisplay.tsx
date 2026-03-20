"use client";

import { SessionStats } from "@/hooks/useSessionStats";
import { cn } from "@/lib/utils";
import { GlassCard } from "../ui/GlassCard";
import { Activity, Dumbbell, LayoutGrid, Timer } from "lucide-react";

interface LiveStatsDisplayProps {
  stats: Pick<SessionStats,
    'totalSetsCompleted' | 'totalSetsPlanned' |
    'totalExercisesDone' | 'totalExercisesPlanned' |
    'totalVolumeKg' | 'estimatedSecondsRemaining'
  >;
  variant: 'sidebar' | 'mobile';
}

function formatVolume(kg: number): string {
  return new Intl.NumberFormat().format(kg);
}

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "Almost done!";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  if (h > 0) return `~${h}h ${m}m`;
  return `~${m} min`;
}

export function LiveStatsDisplay({ stats, variant }: LiveStatsDisplayProps) {
  const items = [
    {
      label: "Volume",
      value: `${formatVolume(stats.totalVolumeKg)} kg`,
      icon: <Dumbbell className="w-3 h-3" />,
    },
    {
      label: "Sets Done",
      value: `${stats.totalSetsCompleted} / ${stats.totalSetsPlanned}`,
      icon: <Activity className="w-3 h-3" />,
    },
    {
      label: "Exercises",
      value: `${stats.totalExercisesDone} / ${stats.totalExercisesPlanned}`,
      icon: <LayoutGrid className="w-3 h-3" />,
    },
    {
      label: "Est. Remaining",
      value: formatRemaining(stats.estimatedSecondsRemaining),
      icon: <Timer className="w-3 h-3" />,
    },
  ];

  if (variant === 'mobile') {
    return (
      <div className="flex overflow-x-auto pb-4 pt-2 -mx-4 px-4 gap-3 no-scrollbar">
        {items.map((item, i) => (
          <GlassCard key={i} className="flex-none min-w-[100px] border-orange-500/10 bg-orange-500/5 p-3 flex flex-col items-center">
            <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest mb-1">
              {item.label}
            </span>
            <span className="text-xs font-black text-foreground">
              {item.value}
            </span>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
        <Activity className="w-3 h-3" />
        <span>Session Stats</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-foreground/40">{item.icon}</span>
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-black text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
