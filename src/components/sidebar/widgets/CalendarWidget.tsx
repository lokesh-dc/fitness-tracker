"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isSameDay, 
  parseISO,
  addMonths,
  subMonths,
  isFuture
} from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarWidgetProps {
  initialDates: string[];
}

export function CalendarWidget({ initialDates }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // In a real app, we'd fetch dates for the new month here. 
  // For now we'll just use the initialDates as a mock.
  const workoutDates = useMemo(() => initialDates.map(d => parseISO(d)), [initialDates]);

  const daysArr = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Padding for first day of week
    const firstDay = getDay(start);
    const padding = Array(firstDay).fill(null);
    
    return [...padding, ...days];
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const workoutsThisMonth = useMemo(() => {
    return daysArr.filter(d => d && workoutDates.some(wd => isSameDay(wd, d))).length;
  }, [daysArr, workoutDates]);

  return (
    <GlassCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-foreground/5 rounded-md transition-colors">
            <ChevronLeft className="w-3 h-3 text-foreground/40" />
          </button>
          <button onClick={nextMonth} className="p-1 hover:bg-foreground/5 rounded-md transition-colors">
            <ChevronRight className="w-3 h-3 text-foreground/40" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <span key={day} className="text-[8px] font-black text-foreground/20 uppercase pb-1">{day}</span>
        ))}
        
        {daysArr.map((day, idx) => {
          if (!day) return <div key={`padding-${idx}`} className="aspect-square" />;
          
          const isWorkout = workoutDates.some(wd => isSameDay(wd, day));
          const isToday = isSameDay(day, new Date());
          const isFut = isFuture(day) && !isToday;

          return (
            <div 
              key={day.toISOString()} 
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center relative text-[10px] font-bold transition-all",
                isFut ? "opacity-20" : "opacity-100",
                isWorkout ? "bg-brand-primary text-black shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "text-foreground/40 hover:bg-foreground/5"
              )}
            >
              {format(day, "d")}
              {isToday && !isWorkout && (
                <div className="absolute inset-0 border border-brand-primary/40 rounded-lg" />
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-foreground/5">
        <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-tight text-center">
          <span className="text-brand-primary">{workoutsThisMonth}</span> Workouts this month
        </p>
      </div>
    </GlassCard>
  );
}
