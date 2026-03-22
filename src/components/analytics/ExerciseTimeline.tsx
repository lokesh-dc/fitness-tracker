"use client";

import { useState, useEffect, useMemo } from "react";
import { format, subMonths, subYears, isWithinInterval, startOfDay } from "date-fns";
import { Loader2, TrendingUp, Calendar, Filter } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ExerciseSelector } from "./ExerciseSelector";
import { RangeSelector, type TimeRange } from "./RangeSelector";
import { AnalyticsTabs } from "./AnalyticsTabs";
import { TimelineChart } from "./TimelineChart";
import { MetricCards } from "./MetricCards";
import { getExerciseTimeline } from "@/app/actions/analytics";
import { ExerciseTimelineEntry } from "@/types/workout";

interface ExerciseTimelineProps {
  exerciseNames: string[];
  initialExercise: string;
}

export function ExerciseTimeline({ exerciseNames, initialExercise }: ExerciseTimelineProps) {
  const [selectedExercise, setSelectedExercise] = useState(initialExercise);
  const [range, setRange] = useState<TimeRange>("All");
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});
  
  const [timelineData, setTimelineData] = useState<ExerciseTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all history for the selected exercise once
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await getExerciseTimeline(selectedExercise);
        setTimelineData(data);
      } catch (error) {
        console.error("Failed to fetch timeline:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (selectedExercise) {
      fetchData();
    }
  }, [selectedExercise]);

  // Client-side filtering based on range
  const filteredData = useMemo(() => {
    if (range === "All") return timelineData;
    
    let from: Date;
    let to = startOfDay(new Date());

    if (range === "Custom") {
      if (!customRange.from || !customRange.to) return timelineData;
      from = customRange.from;
      to = customRange.to;
    } else {
      switch (range) {
        case "1M": from = subMonths(to, 1); break;
        case "3M": from = subMonths(to, 3); break;
        case "6M": from = subMonths(to, 6); break;
        case "1Y": from = subYears(to, 1); break;
        default: return timelineData;
      }
    }

    return timelineData.filter(d => {
      const dDate = new Date(d.date);
      return isWithinInterval(dDate, { start: from, end: to });
    });
  }, [timelineData, range, customRange]);

  const handleRangeChange = (newRange: TimeRange, from?: Date, to?: Date) => {
    setRange(newRange);
    if (newRange === "Custom" && from && to) {
      setCustomRange({ from, to });
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsTabs />
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Progress Timeline</h2>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Visualize your strength journey</p>
            </div>
          </div>
          <ExerciseSelector 
            exerciseNames={exerciseNames} 
            selectedExercise={selectedExercise} 
            onSelect={setSelectedExercise} 
          />
        </div>

        <RangeSelector 
          selectedRange={range} 
          onRangeChange={handleRangeChange} 
          customFrom={customRange.from}
          customTo={customRange.to}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <GlassCard className="p-8 space-y-8 min-h-[500px] relative overflow-hidden flex-[3]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Analyzing your data...</p>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Selected Period</span>
                <span className="text-sm font-bold text-foreground flex items-center">
                  <Calendar className="w-3 h-3 mr-2 text-orange-500/60" />
                  {range === "All" ? "Full History" : range}
                </span>
              </div>
               <div className="flex flex-col">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Sessions</span>
                <span className="text-sm font-bold text-foreground flex items-center">
                  <Filter className="w-3 h-3 mr-2 text-indigo-500/60" />
                  {filteredData.length} entries
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-1 bg-orange-500 rounded-full" />
                  <span className="text-[8px] font-black text-foreground/60 uppercase">Max Weight</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-3 h-1 bg-indigo-400 rounded-full border border-dashed border-indigo-400" />
                  <span className="text-[8px] font-black text-foreground/60 uppercase">Est. 1RM</span>
               </div>
            </div>
          </div>

          <TimelineChart data={filteredData} />
        </GlassCard>

        <div className="flex-1">
          <MetricCards data={filteredData} />
        </div>
      </div>
      
      {filteredData.length < 2 && !isLoading && (
        <div className="p-12 rounded-3xl border-2 border-dashed border-orange-500/10 bg-orange-500/5 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-orange-500/40" />
           </div>
           <div className="max-w-xs space-y-1">
             <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Need More Data</h3>
             <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
               Log at least 2 sessions for <span className="text-orange-500">{selectedExercise}</span> to see a clear trend.
             </p>
           </div>
        </div>
      )}
    </div>
  );
}
