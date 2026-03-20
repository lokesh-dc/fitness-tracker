import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { WeekScheduleDay } from '@/types/workout';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, XCircle, Minus } from 'lucide-react';

interface WeekScheduleWidgetProps {
  weekSchedule: WeekScheduleDay[];
}

export const WeekScheduleWidget: React.FC<WeekScheduleWidgetProps> = ({
  weekSchedule,
}) => {
  const hasActivePlans = weekSchedule.some(day => day.sessions.length > 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'planned':
        return <Circle className="w-3.5 h-3.5 text-foreground/20" />;
      case 'missed':
        return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-foreground/10" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black uppercase text-foreground/40 tracking-widest px-1">
        This Week
      </h3>
      
      <GlassCard className="p-4 space-y-2">
        {!hasActivePlans ? (
          <p className="text-[10px] font-black text-foreground/30 uppercase text-center py-4">
            No active plans this week
          </p>
        ) : (
          <div className="space-y-1">
            {weekSchedule.map((day) => {
              const isToday = new Date().getDay() === (day.dayOfWeek === 6 ? 0 : day.dayOfWeek + 1);
              // Wait, the dayIndex in weekSchedule is 0=Mon, 6=Sun.
              // JS getDay() is 0=Sun, 1=Mon...
              // So for dayIndex 0 (Mon), JS getDay() is 1.
              // For dayIndex 6 (Sun), JS getDay() is 0.
              const isHighlight = isToday; 

              return (
                <div key={day.dayOfWeek} className={cn(
                  "flex flex-col rounded-lg p-2 transition-colors",
                  isHighlight ? "bg-white/5" : ""
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-black uppercase w-8",
                        isHighlight ? "text-orange-500" : "text-foreground/40"
                      )}>
                        {day.dayLabel}
                      </span>
                      
                      {day.sessions.length === 0 ? (
                        <span className="text-[10px] font-black text-foreground/20 uppercase">
                          Rest Day
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {day.sessions.map((session, sIdx) => (
                            <div key={sIdx} className="flex flex-col">
                              <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                                {session.workoutName}
                              </span>
                              <span className="text-[10px] font-black text-foreground/30 uppercase leading-none">
                                {session.planName}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center gap-1">
                      {day.sessions.length === 0 ? (
                        getStatusIcon('rest')
                      ) : (
                        day.sessions.map((session, sIdx) => (
                          <div key={sIdx}>
                            {getStatusIcon(session.status)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
