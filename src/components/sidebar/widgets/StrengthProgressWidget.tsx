"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { StrengthProgressItem } from "@/types/workout";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StrengthProgressWidgetProps {
  data: StrengthProgressItem[] | null;
  variant?: 'sidebar' | 'mobile';
}

export function StrengthProgressWidget({ data, variant = 'sidebar' }: StrengthProgressWidgetProps) {
  if (!data || data.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-8 text-white/40">
        <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
        <span className="text-xs">No strength data yet</span>
      </GlassCard>
    );
  }

  const items = variant === 'mobile' ? data.slice(0, 2) : data;

  return (
    <GlassCard className={cn("flex flex-col gap-4", variant === 'mobile' && "min-w-[240px] flex-shrink-0 p-4")}>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1 font-medium">Strength Progress</p>
        <p className="text-[10px] text-zinc-500 mb-4 tracking-tight uppercase">Vs. plan start</p>
        
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.exerciseName}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold text-white">{item.currentMaxWeight}</span>
                  <span className="text-[10px] uppercase text-white/40">{item.unit}</span>
                </div>
              </div>
              
              <div className={cn(
                "px-2 py-1 rounded flex items-center gap-1 min-w-[65px] justify-center",
                item.delta > 0 ? "bg-green-500/15 text-green-400" : 
                item.delta < 0 ? "bg-red-500/15 text-red-400" : 
                "bg-white/5 text-white/40"
              )}>
                {item.delta > 0 ? <TrendingUp className="w-3 h-3" /> : 
                 item.delta < 0 ? <TrendingDown className="w-3 h-3" /> : 
                 <Minus className="w-3 h-3" />}
                <span className="text-[11px] font-bold">
                  {item.delta > 0 ? `+${item.delta}` : item.delta} {item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {variant === 'sidebar' && (
        <>
          <div className="h-[1px] bg-white/10 w-full" />
          <p className="text-[11px] text-white/40 italic">
            Showing top 4 exercises by frequency in this plan
          </p>
        </>
      )}
    </GlassCard>
  );
}
