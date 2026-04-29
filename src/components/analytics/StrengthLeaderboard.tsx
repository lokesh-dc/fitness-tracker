"use client";

import { ExerciseDetailData } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trophy, Medal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrengthLeaderboardProps {
  exercises: ExerciseDetailData[];
}

export function StrengthLeaderboard({ exercises }: StrengthLeaderboardProps) {
  const sorted = [...exercises].sort((a, b) => b.currentEstimatedOneRM - a.currentEstimatedOneRM);

  const scrollToExercise = (id: string) => {
    const element = document.getElementById(`exercise-${id.toLowerCase().replace(/\s+/g, '-')}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-3">
      {sorted.map((ex, idx) => {
        const rank = idx + 1;
        const isTop3 = rank <= 3;
        
        return (
          <GlassCard 
            key={ex.exerciseName}
            className="group cursor-pointer hover:bg-white/[0.02] transition-colors p-4"
            onClick={() => scrollToExercise(ex.exerciseName)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
                  rank === 1 ? "bg-yellow-400 text-black" :
                  rank === 2 ? "bg-slate-300 text-black" :
                  rank === 3 ? "bg-amber-600 text-black" :
                  "bg-white/5 text-foreground/40"
                )}>
                  {rank}
                </div>
                
                <div className="min-w-0">
                  <h3 className="text-xs md:text-sm font-black text-foreground uppercase tracking-tight truncate">
                    {ex.exerciseName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 md:hidden">
                    <span className="text-[9px] font-bold text-foreground/40 uppercase">
                      PR: {ex.currentPR}kg
                    </span>
                    <span className="text-foreground/20">•</span>
                    <span className="text-[9px] font-bold text-foreground/40 uppercase">
                      {ex.totalSessions} Ssh
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-0.5">
                    Sessions
                  </p>
                  <p className="text-sm font-black text-foreground">
                    {ex.totalSessions}
                  </p>
                </div>

                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-0.5">
                    Current PR
                  </p>
                  <p className="text-sm font-black text-foreground/60">
                    {ex.currentPR}kg <span className="text-[10px] text-foreground/30">× {ex.currentPRReps}</span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-widest mb-0.5">
                    Est. 1RM
                  </p>
                  <p className="text-lg md:text-xl font-black text-foreground">
                    {ex.currentEstimatedOneRM}<span className="text-[9px] md:text-[10px] text-foreground/40 font-bold uppercase ml-0.5">kg</span>
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-foreground/10 group-hover:text-brand-primary transition-colors" />
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
