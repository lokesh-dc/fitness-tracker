"use client";

import { useState, useEffect, useMemo } from "react";
import { subMonths, subYears, isWithinInterval, startOfDay } from "date-fns";
import { TrendingUp } from "lucide-react";
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

const RANGE_LABELS: Record<TimeRange, string> = {
  "1M": "Last month",
  "3M": "Last 3 months",
  "6M": "Last 6 months",
  "1Y": "Last year",
  All: "Full history",
  Custom: "Custom range",
};

function SectionHeading({
  index,
  title,
  meta,
}: {
  index: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4">
      <h2 className="flex items-baseline gap-3 text-lg font-bold tracking-tight text-foreground md:text-xl">
        <span className="text-[10px] font-bold tabular-nums tracking-[0.2em] text-foreground/30">
          {index}
        </span>
        {title}
      </h2>
      {meta && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
          {meta}
        </p>
      )}
    </div>
  );
}

export function ExerciseTimeline({
  exerciseNames,
  initialExercise,
}: ExerciseTimelineProps) {
  const [selectedExercise, setSelectedExercise] = useState(initialExercise);
  const [range, setRange] = useState<TimeRange>("All");
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  const [timelineData, setTimelineData] = useState<ExerciseTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredData = useMemo(() => {
    if (range === "All") return timelineData;

    let from: Date;
    let to = startOfDay(new Date());

    if (range === "Custom") {
      if (!customRange.from || !customRange.to) return timelineData;
      from = startOfDay(customRange.from);
      to = startOfDay(customRange.to);
    } else {
      switch (range) {
        case "1M":
          from = subMonths(to, 1);
          break;
        case "3M":
          from = subMonths(to, 3);
          break;
        case "6M":
          from = subMonths(to, 6);
          break;
        case "1Y":
          from = subYears(to, 1);
          break;
        default:
          return timelineData;
      }
    }

    return timelineData.filter((d) => {
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

  const rangeLabel = RANGE_LABELS[range];

  return (
    <div className="w-full mx-auto space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsTabs />

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.02] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            <span className="h-1 w-1 rounded-full bg-brand-primary" />
            Session timeline
          </span>

          <h1 className="break-words text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl">
            {selectedExercise || "Choose a lift"}
          </h1>

          <p className="max-w-[46ch] text-sm leading-relaxed text-foreground/55 md:text-[15px]">
            Every logged session for this lift — top weight, estimated 1RM, and
            tonnage plotted together.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <ExerciseSelector
            exerciseNames={exerciseNames}
            selectedExercise={selectedExercise}
            onSelect={setSelectedExercise}
          />
          <RangeSelector
            selectedRange={range}
            onRangeChange={handleRangeChange}
            customFrom={customRange.from}
            customTo={customRange.to}
          />
        </div>
      </section>

      <section
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: "80ms" }}>
        <SectionHeading
          index="01"
          title="Timeline"
          meta={`${filteredData.length} session${filteredData.length === 1 ? "" : "s"} · ${rangeLabel}`}
        />
        <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02] p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                <span className="h-0.5 w-5 rounded-full bg-brand-primary" />
                Max weight
              </span>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                <span className="h-0.5 w-5 rounded-full border-t-2 border-dashed border-indigo-400" />
                Est. 1RM
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-[400px] flex-col justify-center gap-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-lg bg-foreground/[0.04]"
                  style={{ width: `${94 - i * 6}%` }}
                />
              ))}
            </div>
          ) : (
            <TimelineChart data={filteredData} />
          )}
        </div>
      </section>

      {!isLoading && filteredData.length > 0 && (
        <section
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: "140ms" }}>
          <SectionHeading index="02" title="Session stats" />
          <div className="mt-4">
            <MetricCards data={filteredData} />
          </div>
        </section>
      )}

      {!isLoading && filteredData.length < 2 && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-foreground/10 bg-foreground/[0.015] px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10">
            <TrendingUp className="h-5 w-5 text-brand-primary" />
          </div>
          <p className="mt-4 text-base font-bold tracking-tight text-foreground">
            Not enough sessions yet
          </p>
          <p className="mt-1 max-w-[40ch] text-sm leading-relaxed text-foreground/55">
            Log at least 2 sessions for{" "}
            <span className="font-semibold text-brand-primary">
              {selectedExercise}
            </span>{" "}
            to see a clear trend.
          </p>
        </div>
      )}
    </div>
  );
}