"use client";

import { MuscleGroupSummary } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface MuscleGroupCardProps {
  summary: MuscleGroupSummary;
  isSelected: boolean;
  onClick: () => void;
  isUnderTrained?: boolean;
}

export function MuscleGroupCard({ summary, isSelected, onClick, isUnderTrained }: MuscleGroupCardProps) {
  const daysAgo = summary.lastTrainedDate 
    ? Math.floor((new Date().getTime() - new Date(summary.lastTrainedDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <GlassCard 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden group",
        isSelected && "ring-2 ring-brand-primary shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.3)]"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight group-hover:text-brand-primary transition-colors">
            {summary.muscleGroup}
          </h3>
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">
            Top: {summary.topExercise}
          </p>
        </div>
        {isUnderTrained && (
          <div className="bg-orange-500/10 text-orange-500 p-1.5 rounded-lg border border-orange-500/20" title="Significantly less volume than others">
            <span className="text-[10px] font-black uppercase tracking-widest">Low Volume</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Sets / Volume</p>
          <p className="text-lg font-black text-foreground">
            {summary.totalSets} <span className="text-[10px] text-foreground/40 uppercase">sets</span>
          </p>
          <p className="text-xs font-bold text-foreground/60">
            {summary.totalVolume.toLocaleString()} <span className="text-[10px] uppercase">kg</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Frequency</p>
          <p className="text-lg font-black text-foreground">
            {summary.sessionCount} <span className="text-[10px] text-foreground/40 uppercase">times</span>
          </p>
          <p className={cn(
            "text-xs font-bold uppercase",
            daysAgo !== null && daysAgo > 14 ? "text-red-500" : daysAgo !== null && daysAgo > 7 ? "text-orange-500" : "text-foreground/60"
          )}>
            {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : daysAgo === null ? "Never" : `${daysAgo} days ago`}
          </p>
        </div>
      </div>

      <div className="h-10 w-full mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summary.weeklyData}>
            <Bar 
              dataKey="totalVolume" 
              fill="var(--brand-accent)" 
              radius={[2, 2, 0, 0]}
              opacity={0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">
          12 Week Volume Trend
        </span>
        <ChevronRight className={cn(
          "w-4 h-4 transition-transform duration-300",
          isSelected ? "text-brand-primary translate-x-1" : "text-foreground/20"
        )} />
      </div>
    </GlassCard>
  );
}
