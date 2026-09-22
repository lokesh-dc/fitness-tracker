"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, parseISO, subDays, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { WeightTrendData } from "@/types/workout";
import { RangeSelector, TimeRange } from "./ui/RangeSelector";
import { useTheme } from "next-themes";

interface WeightTrendChartProps {
  data: WeightTrendData[];
}

function fmtKg(n: number) {
  return String(Math.round(n * 10) / 10);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (active && payload && payload.length && label) {
    return (
      <div className="glass rounded-2xl border-foreground/10 p-3.5 shadow-xl">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
          {format(parseISO(label), "MMMM d, yyyy")}
        </p>
        <p className="text-sm font-bold tabular-nums text-brand-primary">
          {payload[0].value}
          <span className="text-[10px] font-medium text-foreground/40"> kg</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function WeightTrendChart({ data }: WeightTrendChartProps) {
  const [range, setRange] = useState<TimeRange>("7d");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const tickColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.55)";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)";

  const filteredData = data.filter((item) => {
    const date = parseISO(item.date);
    if (range === "7d") return isAfter(date, subDays(new Date(), 7));
    if (range === "30d") return isAfter(date, subDays(new Date(), 30));
    return true;
  });

  const sortedData = [...filteredData].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const latest = sortedData[sortedData.length - 1] ?? null;
  const first = sortedData[0] ?? null;
  const delta = latest && first ? latest.bodyWeight - first.bodyWeight : null;

  return (
    <div className="rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02] p-5 md:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          {latest ? (
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
                {fmtKg(latest.bodyWeight)}
              </span>
              <span className="text-sm font-medium text-foreground/40">kg</span>
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "text-[11px] font-bold tabular-nums",
                    delta > 0 ? "text-emerald-500" : "text-rose-400",
                  )}>
                  {delta > 0 ? "+" : ""}
                  {fmtKg(delta)} kg
                  <span className="ml-1 font-medium text-foreground/35">
                    in range
                  </span>
                </span>
              )}
            </div>
          ) : (
            <span className="text-base font-semibold text-foreground/50">
              No weight logged yet
            </span>
          )}
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
            Body weight
          </p>
        </div>

        <RangeSelector range={range} setRange={setRange} />
      </div>

      {sortedData.length === 0 ? (
        <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-foreground/10 text-center md:h-[320px]">
          <p className="text-base font-bold text-foreground">No weigh-ins yet</p>
          <p className="mt-1 max-w-[38ch] text-sm leading-relaxed text-foreground/50">
            Log your body weight with a workout and the trend will show up here.
          </p>
        </div>
      ) : (
        <div className="h-[280px] w-full md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sortedData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                tickFormatter={(str) => format(parseISO(str), "MMM d")}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor }} />
              <Area
                type="monotone"
                dataKey="bodyWeight"
                stroke="var(--brand-accent)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}