"use client";

import { ExerciseProgressDataPoint } from "@/types/workout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from "recharts";
import { format, parseISO } from "date-fns";
import { Star } from "lucide-react";

interface ExerciseProgressInlineProps {
  data: ExerciseProgressDataPoint[];
  prDate?: string;
  exerciseName: string;
}

export function ExerciseProgressInline({ data, prDate, exerciseName }: ExerciseProgressInlineProps) {
  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = parseISO(label);
      return (
        <div className="glass p-3 border-white/10 rounded-xl shadow-xl">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
            {format(date, "MMM d, yyyy")}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-brand-primary flex justify-between gap-4">
              <span>Max Weight:</span>
              <span>{payload.find((p: any) => p.dataKey === 'maxWeight')?.value} kg</span>
            </p>
            <p className="text-sm font-bold text-indigo-400 flex justify-between gap-4">
              <span>Est. 1RM:</span>
              <span>{payload.find((p: any) => p.dataKey === 'estimatedOneRM')?.value} kg</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const prMarkerDate = prDate ? prDate.split('T')[0] : null;

  return (
    <div className="w-full h-64 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
          Progress for {exerciseName}
        </span>
        {data.length < 3 && (
          <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">
            Log more sessions for better trends
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 9, fontWeight: 700, className: "text-foreground/20" }}
            tickFormatter={(str) => format(parseISO(str), "MMM d")}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="weight"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 9, fontWeight: 700, className: "text-foreground/20" }}
            width={30}
          />
          <YAxis 
            yAxisId="sets"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={false}
            width={0}
          />
          <Tooltip content={<CustomTooltip />} />
          

          
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="maxWeight"
            stroke="var(--brand-accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--brand-accent)", strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="estimatedOneRM"
            stroke="#818cf8"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
          />

          {prMarkerDate && (
            <ReferenceLine
              yAxisId="weight"
              x={data.find(d => d.date.startsWith(prMarkerDate))?.date}
              stroke="var(--brand-accent)"
              strokeDasharray="3 3"
              label={{
                position: 'top',
                value: '⭐',
                fill: 'var(--brand-accent)',
                fontSize: 12
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
