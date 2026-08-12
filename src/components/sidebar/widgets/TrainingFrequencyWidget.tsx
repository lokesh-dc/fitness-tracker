"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface TrainingFrequencyWidgetProps {
  last4WeeksFreq: number;
  allTimeFreq: number;
}

export function TrainingFrequencyWidget({ last4WeeksFreq, allTimeFreq }: TrainingFrequencyWidgetProps) {
  const diff = last4WeeksFreq - allTimeFreq;
  const percentDiff = allTimeFreq > 0 ? (diff / allTimeFreq) : 0;

  let statusLabel = "→ On pace";
  let statusColor = "text-foreground/40";

  if (percentDiff > 0.1) {
    statusLabel = "↑ Above your average";
    statusColor = "text-emerald-400";
  } else if (percentDiff < -0.1) {
    statusLabel = "↓ Below your average";
    statusColor = "text-red-400";
  }

  return (
    <GlassCard className="p-4">
      <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-4">
        Training Frequency
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
            Last 4 weeks
          </span>
          <span className="text-sm font-black text-foreground">
            {last4WeeksFreq.toFixed(1)}× / week
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
            All time
          </span>
          <span className="text-sm font-black text-foreground/60">
            {allTimeFreq.toFixed(1)}× / week
          </span>
        </div>

        <div className={cn("pt-2 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-center", statusColor)}>
          {statusLabel}
        </div>
      </div>
    </GlassCard>
  );
}
