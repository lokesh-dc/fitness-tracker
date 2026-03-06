import { ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  status?: "Good" | "Average" | "Poor";
  trend?: "up" | "down" | "neutral";
  color?: string;
}

export function StatCard({ label, value, unit, icon, status, color }: StatCardProps) {
  const statusColors = {
    Good: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Average: "bg-white/5 text-white/60 border-white/10",
    Poor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  };

  return (
    <GlassCard className="flex flex-col justify-between h-full min-h-[140px]">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-white/60 tracking-wide uppercase">{label}</span>
        <div className={cn("p-2 rounded-xl bg-white/5", color)}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl md:text-3xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-white/40">{unit}</span>}
      </div>

      {status && (
        <div className="mt-4">
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
            statusColors[status]
          )}>
            {status}
          </span>
        </div>
      )}
    </GlassCard>
  );
}
