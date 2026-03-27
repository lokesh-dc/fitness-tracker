"use client";

import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { BodyWeightTrend } from "@/types/workout";

interface BodyWeightWidgetProps {
  data: BodyWeightTrend;
}

export default function BodyWeightWidget({ data }: BodyWeightWidgetProps) {
  const { entries, currentWeight, changeKg, changeDirection } = data;

  if (entries.length === 0) {
    return (
      <GlassCard className="p-4">
        <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-3">
          Body Weight
        </h3>
        <p className="text-xs text-foreground/50 leading-relaxed">
          Log body weight during workouts to see trend
        </p>
      </GlassCard>
    );
  }

  const isUp = changeDirection === "up";
  const isDown = changeDirection === "down";

  // Get the first entry date for the XAxis tick
  const startDate = entries[0]?.date;

  return (
    <GlassCard className="p-5 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
            Body Weight
          </h3>
          <p className="text-[10px] text-foreground/30">Last {entries.length} sessions</p>
        </div>
      </div>

      <div className="h-[80px] w-full">
        <ResponsiveContainer width="100%" height={80}>
          <LineChart
            data={entries}
            margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
          >
            <XAxis 
              dataKey="date" 
              hide={false} 
              axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
              tickLine={false}
              ticks={startDate ? [startDate instanceof Date ? startDate.toISOString() : startDate] : undefined}
              tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.4 }}
              height={15}
            />
            <YAxis 
              hide={false} 
              axisLine={{ stroke: 'currentColor', opacity: 0.1 }}
              tickLine={false} 
              tick={false} 
              domain={['dataMin - 1', 'dataMax + 1']}
              width={1}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--brand-accent)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "var(--brand-accent)" }}
              animationDuration={1500}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass px-2 py-1 border-foreground/10 rounded-lg shadow-xl translate-y-[-10px]">
                    <p className="text-[10px] font-bold text-foreground">
                      {payload[0].value} <span className="text-[8px] text-foreground/60">KG</span>
                    </p>
                  </div>
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">Current</p>
          <p className="text-xl font-bold text-foreground">{currentWeight} <span className="text-xs font-medium text-foreground/40">kg</span></p>
        </div>
        
        {changeKg !== null && entries.length > 1 && (
          <div className="text-right">
            <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">Change</p>
            <p className={`text-sm font-bold flex items-center justify-end gap-1 ${
              isUp ? "text-orange-400" : isDown ? "text-blue-400" : "text-foreground/60"
            }`}>
              {isUp ? "▲" : isDown ? "▼" : "•"}
              <span>{Math.abs(changeKg)} kg</span>
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
