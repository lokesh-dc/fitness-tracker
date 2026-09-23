"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { format } from "date-fns";
import { ExerciseTimelineEntry } from "@/types/workout";

interface MetricCardsProps {
  data: ExerciseTimelineEntry[];
}

interface SessionTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ExerciseTimelineEntry }>;
}

const SessionTooltip = ({ active, payload }: SessionTooltipProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/95 px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-[11px] font-semibold text-foreground">
        {format(new Date(d.date), "MMM d, yyyy")}
      </p>
      <p className="text-[11px] text-foreground/50">
        {d.totalSets} sets · {d.avgRepsPerSet} avg reps
      </p>
    </div>
  );
};

function MiniArea({
  data,
  dataKey,
  color,
}: {
  data: ExerciseTimelineEntry[];
  dataKey: keyof ExerciseTimelineEntry;
  color: string;
}) {
  const empty = useMemo(
    () => data.every((d) => Number(d[dataKey]) === 0),
    [data, dataKey],
  );

  if (empty) {
    return (
      <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-foreground/10 text-[11px] font-medium text-foreground/40">
        Not enough sessions to plot.
      </div>
    );
  }

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <Tooltip
            content={<SessionTooltip />}
            cursor={{ stroke: "rgba(249,115,22,0.25)", strokeWidth: 1.5 }}
          />
          <Area
            type="monotone"
            dataKey={dataKey as string}
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#fill-${dataKey})`}
            dot={false}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatPanel({
  label,
  value,
  sub,
  data,
  dataKey,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  data: ExerciseTimelineEntry[];
  dataKey: keyof ExerciseTimelineEntry;
  color: string;
}) {
  return (
    <div className="space-y-4 rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02] p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
          {label}
        </span>
        <span className="text-[11px] font-medium text-foreground/40">{sub}</span>
      </div>
      <div className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
        {value}
      </div>
      <MiniArea data={data} dataKey={dataKey} color={color} />
    </div>
  );
}

export function MetricCards({ data }: MetricCardsProps) {
  if (data.length === 0) return null;

  const ascending = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const latest = ascending[ascending.length - 1];
  const avgReps = (
    ascending.reduce((sum, d) => sum + d.avgRepsPerSet, 0) / ascending.length
  ).toFixed(1);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <StatPanel
        label="Avg reps"
        value={avgReps}
        sub={`Last session · ${format(new Date(latest.date), "MMM d")}`}
        data={ascending}
        dataKey="avgRepsPerSet"
        color="#f97316"
      />
      <StatPanel
        label="Session volume"
        value={`${latest.totalVolume.toLocaleString()}kg`}
        sub="Most recent"
        data={ascending}
        dataKey="totalVolume"
        color="#818cf8"
      />
    </div>
  );
}