"use client";

import { Flame, CheckCircle2, Calendar } from "lucide-react";

interface MobileWidgetStripProps {
  streak: number;
  workoutsThisMonth: number;
  sessionsDone: string;
  nextWorkout: string;
}

export function MobileWidgetStrip({
  streak,
  workoutsThisMonth,
  sessionsDone,
}: MobileWidgetStripProps) {
  const stats = [
    {
      label: "Streak",
      value: `${streak}`,
      unit: streak === 1 ? "day" : "days",
      icon: Flame,
      accent: true,
    },
    {
      label: "This week",
      value: sessionsDone,
      unit: "sessions",
      icon: CheckCircle2,
      accent: false,
    },
    {
      label: "This month",
      value: `${workoutsThisMonth}`,
      unit: "workouts",
      icon: Calendar,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex flex-col gap-1.5 rounded-2xl px-3 py-3 ${
              stat.accent
                ? "bg-brand-primary/12 border border-brand-primary/20"
                : "bg-foreground/[0.04] border border-foreground/[0.06]"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Icon
                className={`w-3 h-3 shrink-0 ${
                  stat.accent ? "text-brand-primary" : "text-foreground/35"
                }`}
              />
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  stat.accent ? "text-brand-primary/70" : "text-foreground/35"
                }`}
              >
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-bold tabular-nums leading-none ${
                  stat.accent ? "text-brand-primary" : "text-foreground"
                }`}
              >
                {stat.value}
              </span>
              <span className="text-[10px] text-foreground/30 font-medium">
                {stat.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
