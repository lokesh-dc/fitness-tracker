"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RepRangeDistribution } from "@/types/workout";

interface RepRangeDonutProps {
  distribution: RepRangeDistribution;
  size?: "sm" | "lg";
}

const COLORS = {
  strength: "#f87171",      // red-400
  strengthHyper: "#f97316", // orange-500
  hypertrophy: "#818cf8",   // indigo-400
  endurance: "#4ade80"      // green-400
};

export function RepRangeDonut({ distribution, size = "lg" }: RepRangeDonutProps) {
  const data = [
    { name: "Strength (1-5)", value: distribution.strength, color: COLORS.strength, key: "strength" },
    { name: "Power/Size (6-10)", value: distribution.strengthHyper, color: COLORS.strengthHyper, key: "strengthHyper" },
    { name: "Hypertrophy (11-15)", value: distribution.hypertrophy, color: COLORS.hypertrophy, key: "hypertrophy" },
    { name: "Endurance (16+)", value: distribution.endurance, color: COLORS.endurance, key: "endurance" }
  ].filter(d => d.value > 0);

  const dominant = data.length > 0 ? data.reduce((a, b) => (a.value > b.value ? a : b)) : null;

  const innerRadius = size === "lg" ? 60 : 35;
  const outerRadius = size === "lg" ? 90 : 55;

  return (
    <div className={size === "lg" ? "h-[220px] w-full" : "h-[140px] w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-black border border-white/10 p-2 rounded-xl">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{d.name}</p>
                    <p className="text-[10px] font-bold text-brand-primary mt-0.5 uppercase">
                      {d.value} Sets ({Math.round((d.value / distribution.total) * 100)}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {dominant && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest leading-none mb-1">
            Dominant
          </p>
          <p className={size === "lg" ? "text-xs font-black text-foreground uppercase tracking-tight max-w-[80px]" : "text-[10px] font-black text-foreground uppercase tracking-tight max-w-[60px]"}>
            {dominant.name.split(' (')[0]}
          </p>
        </div>
      )}
    </div>
  );
}
