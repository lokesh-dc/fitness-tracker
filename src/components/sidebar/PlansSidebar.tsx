import React from 'react';
import { ActivePlanProgress, AdherenceScore, WeekScheduleDay } from '@/types/workout';
import { ActivePlansSummaryWidget } from './widgets/ActivePlansSummaryWidget';
import { AdherenceScoreWidget } from './widgets/AdherenceScoreWidget';
import { WeekScheduleWidget } from './widgets/WeekScheduleWidget';
import { GlassCard } from '@/components/ui/GlassCard';

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

  return (
    <>
      {/* Active Plans Mobile Card */}
      <GlassCard className="min-w-[200px] h-[100px] flex flex-col justify-center p-4 snap-center shrink-0">
        <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest mb-1">
          Weekly Progress
        </p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-black text-foreground">
            {totalCompleted}/{totalPlanned}
          </span>
          <span className="text-[10px] font-black text-orange-500 mb-1 uppercase">
            Sessions
          </span>
        </div>
      </GlassCard>

      {/* Adherence Mobile Card */}
      {adherenceScore.hasActivePlans && (
        <GlassCard className="min-w-[200px] h-[100px] flex flex-col justify-center p-4 snap-center shrink-0">
          <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest mb-1">
            Adherence
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-emerald-500">
              {adherenceScore.percent}%
            </span>
            <span className="text-[10px] font-black text-foreground/40 mb-1 uppercase">
              Last 4w
            </span>
          </div>
        </GlassCard>
      )}

      {/* Quick Schedule Mobile Card */}
      <GlassCard className="min-w-[200px] h-[100px] flex flex-col justify-center p-4 snap-center shrink-0">
        <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest mb-1">
          Today's Plan
        </p>
        <div className="truncate">
          <span className="text-sm font-bold text-foreground">
            {activePlansSummary.length > 0 ? "Check Schedule" : "No Plan Active"}
          </span>
        </div>
      </GlassCard>
    </>
  );
};
