import React from 'react';
import { Layers, CheckCircle2, TrendingUp } from 'lucide-react';
import { ActivePlanProgress, AdherenceScore, WeekScheduleDay } from '@/types/workout';
import { ActivePlansSummaryWidget } from './widgets/ActivePlansSummaryWidget';
import { AdherenceScoreWidget } from './widgets/AdherenceScoreWidget';
import { WeekScheduleWidget } from './widgets/WeekScheduleWidget';

interface PlansSidebarProps {
  activePlansSummary: ActivePlanProgress[];
  adherenceScore: AdherenceScore;
  weekSchedule: WeekScheduleDay[];
}

export const PlansSidebar: React.FC<PlansSidebarProps> = ({
  activePlansSummary,
  adherenceScore,
  weekSchedule,
}) => {
  return (
    <div className="flex flex-col gap-8">
      <ActivePlansSummaryWidget activePlansSummary={activePlansSummary} />
      <AdherenceScoreWidget adherenceScore={adherenceScore} />
      <WeekScheduleWidget weekSchedule={weekSchedule} />
    </div>
  );
};

export const PlansMobileWidgets: React.FC<PlansSidebarProps> = ({
  activePlansSummary,
  adherenceScore,
}) => {
  const totalPlanned = activePlansSummary.reduce((acc, curr) => acc + curr.sessionsPlannedThisWeek, 0);
  const totalCompleted = activePlansSummary.reduce((acc, curr) => acc + curr.sessionsCompletedThisWeek, 0);
  const hasActive = activePlansSummary.length > 0;

  const stats = [
    {
      label: "Active",
      value: `${activePlansSummary.length}`,
      unit: activePlansSummary.length === 1 ? "cycle" : "cycles",
      icon: Layers,
      accent: hasActive,
    },
    {
      label: "This week",
      value: hasActive ? `${totalCompleted}/${totalPlanned}` : "0/0",
      unit: "sessions",
      icon: CheckCircle2,
      accent: false,
    },
    {
      label: "Adherence",
      value: adherenceScore.hasActivePlans ? `${adherenceScore.percent}%` : "—",
      unit: "rate",
      icon: TrendingUp,
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
};
