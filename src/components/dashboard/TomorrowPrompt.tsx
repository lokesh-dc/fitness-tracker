"use client";

import { useEffect, useState } from "react";
import { Sun, Dumbbell, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

const TOMORROW_PROMPT_HOUR = 20;

interface TomorrowPlanData {
  planName: string;
  splitName: string;
  totalExercises: number;
}

interface TomorrowPromptProps {
  tomorrowPlan: TomorrowPlanData | null;
  isTodayDone: boolean;
  isRestDay: boolean;
}

export function TomorrowPrompt({ tomorrowPlan, isTodayDone, isRestDay }: TomorrowPromptProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!tomorrowPlan) {
      setShow(false);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const isLateEnough = currentHour >= TOMORROW_PROMPT_HOUR;
    const isTodayComplete = isTodayDone || isRestDay;

    setShow(isTodayComplete || isLateEnough);
  }, [tomorrowPlan, isTodayDone, isRestDay]);

  if (!show || !tomorrowPlan) return null;

  return (
    <GlassCard className="p-4 flex items-center justify-between group border-brand-primary/20 bg-gradient-to-r from-brand-primary/5 to-transparent">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
          <Sun className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
            Tomorrow: {tomorrowPlan.splitName}
          </p>
          <p className="text-xs font-bold text-foreground/60">
            {tomorrowPlan.totalExercises} exercises planned
          </p>
        </div>
      </div>
      <Link
        href={`/workout?mode=LIVE_SESSION&date=${(() => {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          return d.toISOString().split("T")[0];
        })()}`}
        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
      >
        Prep Now
        <ChevronRight className="w-3 h-3" />
      </Link>
    </GlassCard>
  );
}
