"use client";

import { useMemo } from "react";
import { format, subWeeks, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface MuscleHeatmapProps {
  dates: string[];
  muscleGroup: string;
}

export function MuscleHeatmap({ dates, muscleGroup }: MuscleHeatmapProps) {
  const trainedDates = useMemo(() => new Set(dates.map(d => d.split('T')[0])), [dates]);

  const grid = useMemo(() => {
    const weeks = [];
    const today = new Date();
    // Start from the Monday of the week 51 weeks ago
    let current = startOfWeek(subWeeks(today, 51), { weekStartsOn: 1 });

    for (let w = 0; w < 52; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(current, d);
        const dateStr = format(date, 'yyyy-MM-dd');
        days.push({
          date,
          dateStr,
          isTrained: trainedDates.has(dateStr),
          isFuture: date > today
        });
      }
      weeks.push(days);
      current = addDays(current, 7);
    }
    return weeks;
  }, [trainedDates]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; index: number }[] = [];
    grid.forEach((week, i) => {
      const firstDay = week[0].date;
      if (firstDay.getDate() <= 7) {
        labels.push({ label: format(firstDay, 'MMM'), index: i });
      }
    });
    return labels;
  }, [grid]);

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-4">
      <div className="min-w-[700px]">
        {/* Month Labels */}
        <div className="flex mb-2 ml-8 h-4 relative">
          {monthLabels.map((m, i) => (
            <span 
              key={i} 
              className="text-[10px] font-black text-foreground/20 absolute uppercase tracking-widest"
              style={{ left: `${m.index * 13.5}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Day Labels */}
          <div className="flex flex-col justify-between pr-2 py-0.5 text-[8px] font-black text-foreground/10 uppercase">
            <span>Mon</span>
            <span className="invisible">Tue</span>
            <span>Wed</span>
            <span className="invisible">Thu</span>
            <span>Fri</span>
            <span className="invisible">Sat</span>
            <span className="invisible">Sun</span>
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.isTrained ? `Trained ${muscleGroup}` : "Rest day"}`}
                    className={cn(
                      "w-3 h-3 rounded-[2px] transition-all duration-300",
                      day.isFuture ? "opacity-0" : 
                      day.isTrained 
                        ? "bg-brand-primary shadow-[0_0_10px_rgba(249,115,22,0.3)] scale-110" 
                        : "bg-white/5 hover:bg-white/10"
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
