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
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { format } from "date-fns";
import { ExerciseTimelineEntry } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";

interface TimelineChartProps {
  data: ExerciseTimelineEntry[];
}

const CustomPRDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.isPR) {
    return <circle cx={cx} cy={cy} r={3} fill="#f97316" stroke="none" />;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill="#f97316" filter="drop-shadow(0 0 4px rgba(249,115,22,0.5))" />
      <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={10}>🏆</text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ExerciseTimelineEntry;

  return (
    <GlassCard className="p-3 text-[10px] space-y-1.5 min-w-[160px] border-orange-500/20 shadow-2xl backdrop-blur-xl">
      <p className="font-black text-white uppercase tracking-widest pb-1 border-b border-white/5">
        {format(new Date(d.date), 'MMM d, yyyy')}
      </p>
      <div className="space-y-1">
        <p className="flex justify-between">
          <span className="text-foreground/40 uppercase font-bold">Max Weight:</span>
          <span className="text-orange-500 font-black">{d.maxWeight}kg</span>
        </p>
        <p className="flex justify-between">
          <span className="text-foreground/40 uppercase font-bold">Est. 1RM:</span>
          <span className="text-indigo-400 font-black">{d.estimatedOneRM}kg</span>
        </p>
        <p className="flex justify-between">
          <span className="text-foreground/40 uppercase font-bold">Sets × Avg Reps:</span>
          <span className="text-white font-bold">{d.totalSets} × {d.avgRepsPerSet}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-foreground/40 uppercase font-bold">Volume:</span>
          <span className="text-white font-bold">{d.totalVolume.toLocaleString()}kg</span>
        </p>
      </div>
      {d.isPR && (
        <div className="pt-1 mt-1 border-t border-orange-500/20 flex items-center space-x-2">
          <span className="text-xs">🏆</span>
          <span className="text-orange-400 font-black uppercase tracking-tighter">Personal Record</span>
        </div>
      )}
    </GlassCard>
  );
};

export function TimelineChart({ data }: TimelineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">No data for this period</p>
      </div>
    );
  }

  const prDates = useMemo(() => data.filter(d => d.isPR).map(d => d.date), [data]);

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickFormatter={(d) => format(new Date(d), 'MMM d')}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }}
            minTickGap={30}
          />
          <YAxis
            yAxisId="weight"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            axisLine={false}
            tickLine={false}
            hide
          />
          
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(249,115,22,0.2)', strokeWidth: 2 }} />
          
          {prDates.map((date, idx) => (
            <ReferenceLine
              key={idx}
              x={date}
              yAxisId="weight"
              stroke="#f97316"
              strokeDasharray="3 3"
              strokeOpacity={0.3}
              label={{ position: 'top', value: 'PR', fill: '#f97316', fontSize: 9, fontWeight: 900 }}
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
            stroke="#f97316"
            strokeWidth={3}
            dot={<CustomPRDot />}
            activeDot={{ r: 6, fill: '#f97316', stroke: '#000', strokeWidth: 2 }}
            animationDuration={1500}
          />
          
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="estimatedOneRM"
            stroke="#818cf8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4, fill: '#818cf8' }}
            animationDuration={2000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
