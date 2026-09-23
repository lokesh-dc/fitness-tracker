"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import { ExerciseTimelineEntry } from "@/types/workout";

interface TimelineChartProps {
  data: ExerciseTimelineEntry[];
}

interface PRDotProps {
  cx?: number;
  cy?: number;
  payload?: ExerciseTimelineEntry;
}

const CustomPRDot = ({ cx, cy, payload }: PRDotProps) => {
  if (cx == null || cy == null) return null;
  if (!payload?.isPR) {
    return <circle cx={cx} cy={cy} r={3} fill="var(--brand-accent)" />;
  }
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6.5}
        fill="var(--brand-accent)"
        stroke="rgba(249,115,22,0.35)"
        strokeWidth={5}
        strokeOpacity={0.35}
      />
      <circle cx={cx} cy={cy} r={2.5} fill="#0a0a0a" />
    </g>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ExerciseTimelineEntry }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="glass min-w-[170px] rounded-2xl border border-foreground/10 p-3 shadow-2xl">
      <p className="border-b border-foreground/10 pb-1.5 text-[11px] font-bold text-foreground">
        {format(new Date(d.date), "MMM d, yyyy")}
      </p>
      <div className="mt-1.5 space-y-1 text-[11px]">
        <p className="flex justify-between gap-4">
          <span className="text-foreground/50">Max weight</span>
          <span className="font-bold text-brand-primary">{d.maxWeight}kg</span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-foreground/50">Est. 1RM</span>
          <span className="font-bold text-indigo-400">
            {d.estimatedOneRM}kg
          </span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-foreground/50">Sets × avg reps</span>
          <span className="font-semibold text-foreground">
            {d.totalSets} × {d.avgRepsPerSet}
          </span>
        </p>
        <p className="flex justify-between gap-4">
          <span className="text-foreground/50">Volume</span>
          <span className="font-semibold text-foreground">
            {d.totalVolume.toLocaleString()}kg
          </span>
        </p>
      </div>
      {d.isPR && (
        <div className="mt-2 border-t border-brand-primary/20 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
            Personal record
          </span>
        </div>
      )}
    </div>
  );
};

export function TimelineChart({ data }: TimelineChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        date: d.date instanceof Date ? d.date.toISOString() : d.date,
      })),
    [data],
  );

  const prDates = useMemo(
    () => chartData.filter((d) => d.isPR).map((d) => d.date as string),
    [chartData],
  );

  const tickFill = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)";
  const gridStroke = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const cursorStroke = isDark
    ? "rgba(249,115,22,0.2)"
    : "rgba(249,115,22,0.3)";

  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-foreground/10">
        <p className="text-sm font-medium text-foreground/40">
          No sessions in this period.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--brand-accent)"
                stopOpacity={0.18}
              />
              <stop
                offset="95%"
                stopColor="var(--brand-accent)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickFormatter={(d) => format(new Date(d), "MMM d")}
            tick={{ fill: tickFill, fontSize: 10, fontWeight: 600 }}
            minTickGap={30}
          />
          <YAxis
            yAxisId="weight"
            axisLine={false}
            tickLine={false}
            tick={{ fill: tickFill, fontSize: 10, fontWeight: 600 }}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            axisLine={false}
            tickLine={false}
            hide
          />

          <CartesianGrid vertical={false} stroke={gridStroke} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: cursorStroke, strokeWidth: 2 }}
          />

          {prDates.map((date) => (
            <ReferenceLine
              key={date}
              x={date}
              yAxisId="weight"
              stroke="var(--brand-accent)"
              strokeDasharray="3 3"
              strokeOpacity={0.35}
              label={{
                position: "top",
                value: "PR",
                fill: "var(--brand-accent)",
                fontSize: 9,
                fontWeight: 700,
              }}
            />
          ))}

          <Bar
            yAxisId="volume"
            dataKey="totalVolume"
            fill="url(#volumeGradient)"
            radius={[4, 4, 0, 0]}
            barSize={30}
          />

          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="maxWeight"
            stroke="var(--brand-accent)"
            strokeWidth={2.5}
            dot={<CustomPRDot />}
            activeDot={{ r: 5, fill: "var(--brand-accent)" }}
            animationDuration={1200}
          />

          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="estimatedOneRM"
            stroke="#818cf8"
            strokeWidth={1.75}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: "#818cf8" }}
            animationDuration={1600}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}