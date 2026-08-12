"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PlanProgressData } from "@/types/workout";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, Clock } from "lucide-react";

interface PlanProgressWidgetProps {
  data: PlanProgressData | null;
  variant?: 'sidebar' | 'mobile';
}

export function PlanProgressWidget({ data, variant = 'sidebar' }: PlanProgressWidgetProps) {
  if (!data) {
    return (
      <GlassCard className={cn(variant === 'mobile' && "min-w-[240px] flex-shrink-0")}>
        <div className="flex flex-col items-center justify-center py-4 text-white/40">
          <Clock className="w-8 h-8 mb-2 opacity-20" />
          <span className="text-xs">Couldn't load progress</span>
        </div>
      </GlassCard>
    );
  }

  const { currentWeek, totalWeeks, sessionsCompleted, totalSessionsPlanned, daysRemaining, percentComplete, weekStrip } = data;

  if (variant === 'mobile') {
    return (
      <GlassCard className="min-w-[220px] flex-shrink-0 p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Plan Progress</p>
            <p className="text-xl font-semibold text-white">{percentComplete}%</p>
          </div>
          <div className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-2 py-1 rounded">
            Week {currentWeek}
          </div>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary transition-all duration-500" 
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <p className="text-[10px] text-white/40 mt-2">
          {sessionsCompleted}/{totalSessionsPlanned} sessions done
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-3 font-medium">Plan Progress</p>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] text-white/40 mb-1">Duration</p>
            <p className="text-sm font-medium text-white">Week {currentWeek} <span className="text-white/40">/ {totalWeeks}</span></p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[10px] text-white/40 mb-1">Sessions</p>
            <p className="text-sm font-medium text-white">{sessionsCompleted} <span className="text-white/40">/ {totalSessionsPlanned}</span></p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary transition-all duration-500" 
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-brand-primary font-medium">{percentComplete}% complete</span>
            <span className="text-white/40">~{daysRemaining} days left</span>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-white/10 w-full" />

      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] text-white/40 uppercase tracking-tight">This Week</p>
          <Calendar className="w-3 h-3 text-white/20" />
        </div>
        <div className="flex justify-between gap-1">
          {weekStrip.map((day, i) => {
            let statusClasses = "bg-white/5 text-white/40";
            
            if (day.status === 'done') statusClasses = "bg-brand-primary/20 text-brand-primary border border-brand-primary/20";
            if (day.status === 'today') statusClasses = "bg-brand-primary text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]";
            if (day.status === 'missed') statusClasses = "bg-red-500/10 text-red-400 border border-red-500/10";
            if (day.status === 'rest') statusClasses = "bg-white/5 text-white/20";

            return (
              <div 
                key={i}
                className={cn(
                  "flex-1 aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all",
                  statusClasses
                )}
              >
                {day.label}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
