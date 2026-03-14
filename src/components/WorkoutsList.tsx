"use client";

import { WorkoutLog } from "@/types/workout";
import { GlassCard } from "./ui/GlassCard";
import { format } from "date-fns";
import { Calendar, Activity, Trophy, Dumbbell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WorkoutsListProps {
  logs: WorkoutLog[];
}

export function WorkoutsList({ logs }: WorkoutsListProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
        <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-6">
          <Dumbbell className="w-8 h-8 text-foreground/40" />
        </div>
        <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
          No Workouts Yet
        </h3>
        <p className="text-sm font-medium text-foreground/60 max-w-[250px]">
          Your logged workouts will appear here. Time to hit the gym!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const totalVolume = log.exercises?.reduce((acc, ex) => {
          return acc + (ex.sets?.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0) || 0);
        }, 0) || 0;

        return (
          <Link href={`/workouts/${log.id}`} key={log.id} className="block group">
            <GlassCard
              className={cn(
                "overflow-hidden transition-all duration-300",
                "hover:border-orange-500/30 hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.15)] group-active:scale-[0.98]"
              )}
            >
              {/* Header / Summary row */}
              <div className="p-5 cursor-pointer flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300",
                    "bg-foreground/5 group-hover:bg-orange-500/20"
                  )}>
                    <Calendar className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      "text-foreground/60 group-hover:text-orange-500"
                    )} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-base font-bold text-foreground">
                      {format(new Date(log.date), "EEEE, MMM d")}
                    </h3>
                    <div className="flex flex-col gap-2 mt-1 text-xs font-medium text-foreground/50">
                      <span className="flex items-center">
                        <Activity className="w-3 h-3 mr-1" />
                        {log.exercises?.length || 0} Exercises
                      </span>
                      {totalVolume > 0 && (
                        <span className="flex items-center text-orange-500/70">
                          <Trophy className="w-3 h-3 mr-1" />
                          {totalVolume.toLocaleString()} kg max volume
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {log.bodyWeight && (
                    <div className="hidden sm:block text-right pr-4 border-r border-foreground/10">
                      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Weight</p>
                      <p className="text-sm font-black text-foreground">{log.bodyWeight} kg</p>
                    </div>
                  )}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300",
                    "bg-transparent text-foreground/40 group-hover:translate-x-1 group-hover:text-orange-500"
                  )}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        );
      })}
    </div>
  );
}

