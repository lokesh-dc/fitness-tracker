"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Flame, Calendar, CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileWidgetStripProps {
  streak: number;
  workoutsThisMonth: number;
  sessionsDone: string;
  nextWorkout: string;
}

export function MobileWidgetStrip({ streak, workoutsThisMonth, sessionsDone, nextWorkout }: MobileWidgetStripProps) {
  const cards = [
    { title: "Streak", value: `${streak} Days`, icon: Flame, color: "text-brand-primary" },
    { title: "This Month", value: `${workoutsThisMonth} Workouts`, icon: Calendar, color: "text-indigo-400" },
    { title: "Weekly", value: sessionsDone, icon: CheckCircle2, color: "text-emerald-500" },
    { title: "Next", value: nextWorkout, icon: Play, color: "text-brand-primary" },
  ];

  return (
    <>
      {cards.map((card, i) => {
        const isStreak = card.title === "Streak";
        const Container = isStreak ? "div" : GlassCard;
        
        return (
          <Container 
            key={i} 
            className={cn(
              "min-w-[180px] h-[100px] p-4 flex flex-col justify-between snap-center shrink-0 transition-all rounded-2xl",
              isStreak 
                ? "bg-gradient-to-br from-brand-primary to-brand-secondary border-none shadow-[0_10px_20px_rgba(249,115,22,0.2)]" 
                : "border-brand-primary/5"
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest",
                isStreak ? "text-black/40" : "text-foreground/40"
              )}>{card.title}</span>
              <card.icon className={cn(
                "w-3 h-3",
                isStreak ? "text-black/80" : card.color
              )} />
            </div>
            <span className={cn(
              "text-sm font-black uppercase truncate",
              isStreak ? "text-black" : "text-foreground"
            )}>{card.value}</span>
          </Container>
        );
      })}
    </>
  );
}
