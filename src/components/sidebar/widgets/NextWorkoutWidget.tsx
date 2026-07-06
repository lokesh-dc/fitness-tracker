"use client";

import { useState } from "react";
import { Play, Calendar, Dumbbell, X, Eye, List, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExerciseDetail {
  name: string;
  targetSets: number;
  targetReps: number;
  unit?: string;
}

interface NextWorkoutWidgetProps {
  data: {
    name: string;
    scheduledDay: string;
    exercises: string[];
    totalExercises: number;
    detail?: ExerciseDetail[];
  } | null;
}

export function NextWorkoutWidget({ data }: NextWorkoutWidgetProps) {
  const [showDetail, setShowDetail] = useState(false);

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

  const { name, scheduledDay, exercises, totalExercises, detail } = data;

  return (
    <>
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

        <button
          onClick={() => setShowDetail(true)}
          className="w-full py-2.5 rounded-xl border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/20 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Eye className="w-3 h-3" />
          View Full Workout
        </button>

        <Link href="/workout?mode=LIVE_SESSION" className="block">
          <button className="w-full py-3 rounded-xl bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(249,115,22,0.2)]">
            <Play className="w-3 h-3 fill-current" />
            Start Workout
          </button>
        </Link>
      </GlassCard>

      {showDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowDetail(false)} />
          <GlassCard className="w-full max-w-lg max-h-[80vh] overflow-y-auto relative z-[101] border-brand-primary/20 p-0">
            <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-background/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <List className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-tight">{name}</h2>
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{scheduledDay}</p>
                </div>
              </div>
              <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-foreground/5 rounded-full -mr-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {(detail || exercises.map((n) => ({ name: n, targetSets: 0, targetReps: 0 }))).map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 px-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-xs font-black text-brand-primary">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-bold text-foreground">{ex.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 text-[10px] text-foreground/40">
                      <Target className="w-3 h-3" />
                      <span className="font-bold">
                        {ex.targetSets}×{ex.targetReps}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 pt-0">
              <Link href="/workout?mode=LIVE_SESSION" onClick={() => setShowDetail(false)}>
                <button className="w-full py-4 rounded-2xl bg-brand-primary text-black font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  Start Workout
                </button>
              </Link>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
