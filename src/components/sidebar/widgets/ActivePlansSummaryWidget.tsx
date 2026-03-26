import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ActivePlanProgress } from '@/types/workout';
import { cn } from '@/lib/utils';

interface ActivePlansSummaryWidgetProps {
  activePlansSummary: ActivePlanProgress[];
}

export const ActivePlansSummaryWidget: React.FC<ActivePlansSummaryWidgetProps> = ({
  activePlansSummary,
}) => {
  const displayPlans = activePlansSummary.slice(0, 4);
  const remainingCount = activePlansSummary.length - 4;

  const getPercentColor = (percent: number) => {
    if (percent >= 80) return 'text-emerald-500';
    if (percent >= 50) return 'text-brand-primary';
    return 'text-rose-500';
  };

  const isWeekStarting = activePlansSummary.length > 0 && activePlansSummary.every(p => p.progressPercent === 0);

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black uppercase text-foreground/40 tracking-widest px-1">
        Active Plans
      </h3>
      
      <GlassCard className="p-4 space-y-5">
        {activePlansSummary.length === 0 ? (
          <div className="py-2 text-center space-y-1">
            <p className="text-sm font-bold text-foreground/80">0 active plans</p>
            <p className="text-[10px] text-foreground/40 leading-relaxed uppercase font-black">
              Start a plan to track<br />your weekly progress
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayPlans.map((plan) => (
                <div key={plan.planId} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                      {plan.planName}
                    </span>
                    <span className="text-[10px] font-black text-foreground/40 uppercase">
                      {plan.sessionsCompletedThisWeek}/{plan.sessionsPlannedThisWeek}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${plan.progressPercent}%` }}
                      />
                    </div>
                    <span className={cn("text-[10px] font-black min-w-[30px] text-right", getPercentColor(plan.progressPercent))}>
                      {plan.progressPercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {remainingCount > 0 && (
              <p className="text-[10px] font-black text-foreground/30 uppercase text-center pt-1">
                + {remainingCount} more active {remainingCount === 1 ? 'plan' : 'plans'}
              </p>
            )}

            {isWeekStarting && (
              <p className="text-[10px] font-black text-brand-primary/60 uppercase text-center pt-1 animate-pulse">
                Week starts Monday
              </p>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
};
