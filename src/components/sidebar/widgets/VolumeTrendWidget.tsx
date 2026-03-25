"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { MonthlyVolumeTrend } from "@/types/workout";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export function VolumeTrendWidget({ volumeData }: { volumeData: MonthlyVolumeTrend }) {
  const { months, trendPercent } = volumeData;
  const noData = !months || months.every(m => m.totalVolume === 0);

  if (noData) {
    return (
      <GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02] flex flex-col justify-center min-h-[160px]">
        <h3 className="text-[10px] font-black tracking-widest text-foreground/40 uppercase mb-3 text-center">Volume Trend</h3>
        <p className="text-xs text-foreground/40 text-center italic">No volume data yet</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02]">
      <div className="mb-4">
        <h3 className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">Volume Trend</h3>
        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5">Last 6 months</p>
      </div>

      <div className="h-[60px] w-full mt-2 mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={months} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="totalVolume"
              stroke="#f97316"
              strokeWidth={3}
              fill="url(#volumeGrad)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-4">
        {months.map((m, i) => (
          <span key={i}>{m.month}</span>
        ))}
      </div>

      {trendPercent !== null && (
        <div className="flex items-center space-x-1.5">
          {trendPercent > 0 ? (
            <span className="text-green-500 font-bold text-sm">↑</span>
          ) : trendPercent < 0 ? (
            <span className="text-red-500 font-bold text-sm">↓</span>
          ) : (
            <span className="text-foreground/40 font-bold text-sm">→</span>
          )}
          <span className="text-xs font-bold text-foreground/60">
            {Math.abs(trendPercent)}% vs last month
          </span>
        </div>
      )}
    </GlassCard>
  );
}
