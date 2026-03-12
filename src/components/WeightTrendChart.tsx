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
import { GlassCard } from "./ui/GlassCard";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

import { WeightTrendData } from "@/types/workout";

interface WeightTrendChartProps {
  data: WeightTrendData[];
}

export default function WeightTrendChart({ data }: WeightTrendChartProps) {
  const [range, setRange] = useState<"7d" | "30d" | "all">("7d");

  const filteredData = data.filter((item) => {
    const date = parseISO(item.date);
    if (range === "7d") return isAfter(date, subDays(new Date(), 7));
    if (range === "30d") return isAfter(date, subDays(new Date(), 30));
    return true;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 border-white/10 rounded-xl shadow-xl">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
            {format(parseISO(label), "MMM d, yyyy")}
          </p>
          <p className="text-sm font-bold text-orange-500">
            {payload[0].value} <span className="text-[10px] text-white/60">KG</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black tracking-tight">Weight Trend</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Progress tracking</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {(["7d", "30d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
                range === r
                  ? "bg-orange-500 text-black shadow-lg"
                  : "text-white/40 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(str) => format(parseISO(str), "MMM d")}
              minTickGap={30}
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="bodyWeight"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWeight)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
