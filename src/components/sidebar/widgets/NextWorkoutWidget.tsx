"use client";

import { Play, Calendar, Dumbbell } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

interface NextWorkoutWidgetProps {
  data: {
    name: string;
    scheduledDay: string;
    exercises: string[];
    totalExercises: number;
  } | null;
}

export function NextWorkoutWidget({ data }: NextWorkoutWidgetProps) {
  if (!data) {
    return (
      <GlassCard className="p-4 space-y-4 border-dashed border-brand-primary/20 bg-brand-primary/[0.02]">
        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Next Workout</span>
        <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
           <Dumbbell className="w-8 h-8 text-foreground/10" />
           <div className="space-y-1">
             <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">No Active Plan</p>
             <Link href="/plan" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">
               Setup your week →
             </Link>
           </div>
        </div>
      </GlassCard>
    );
  }

  const { name, scheduledDay, exercises, totalExercises } = data;

  return (
    <GlassCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Next Workout</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
           <Calendar className="w-2.5 h-2.5" />
           <span className="text-[8px] font-black uppercase tracking-widest">{scheduledDay}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-black text-foreground uppercase tracking-tight truncate">{name}</h3>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{totalExercises} Exercises</p>
      </div>

      <div className="py-3 px-3 rounded-xl bg-foreground/[0.02] glass-card space-y-2">
        {exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-foreground/60 uppercase tracking-tight">
            <div className="w-1 h-1 rounded-full bg-brand-primary/40" />
            <span className="truncate">{ex}</span>
          </div>
        ))}
        {totalExercises > 3 && (
          <p className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.2em] pl-3">
            + {totalExercises - 3} more
          </p>
        )}
      </div>

      <Link href="/workout?mode=LIVE_SESSION" className="block">
        <button className="w-full py-3 rounded-xl bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(249,115,22,0.2)]">
          <Play className="w-3 h-3 fill-current" />
          Start Workout
        </button>
      </Link>
    </GlassCard>
  );
}
