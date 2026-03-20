"use client";

import { Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { format, parseISO } from "date-fns";

interface StreakWidgetProps {
  data: {
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
  } | null;
}

export function StreakWidget({ data }: StreakWidgetProps) {
  if (!data) return null;

  const { currentStreak, longestStreak, lastWorkoutDate } = data;
  const isToday = lastWorkoutDate === new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 rounded-2xl space-y-4 bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-[0_10px_30px_rgba(249,115,22,0.3)] transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Streak Tracker</span>
        <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-black/80 fill-black/20' : 'text-black/20'}`} />
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-4xl font-black text-black tabular-nums">
          {currentStreak}
        </span>
        <span className="text-[10px] font-bold text-black/60 uppercase tracking-tight mt-1">
          Days Burning
        </span>
      </div>

      <div className="pt-4 border-t border-black/10 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold text-black/40 uppercase">Longest</span>
          <span className="font-black text-black uppercase">{longestStreak} Days</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold text-black/40 uppercase">Last Log</span>
          <span className="font-black text-black uppercase">
            {lastWorkoutDate ? (isToday ? "Today" : format(parseISO(lastWorkoutDate), "MMM d")) : "Never"}
          </span>
        </div>
      </div>
    </div>
  );
}
