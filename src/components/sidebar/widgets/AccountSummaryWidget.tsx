"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { AccountSummary } from "@/types/workout";

interface AccountSummaryWidgetProps {
  data: AccountSummary;
}

export default function AccountSummaryWidget({ data }: AccountSummaryWidgetProps) {
  const { memberSinceLabel, monthsTraining } = data;

  const formatTrainingTime = (months: number) => {
    if (months === 0) return "Just getting started! 💪";
    if (months === 1) return "1 month of training";
    
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      let label = `${years} year${years > 1 ? "s" : ""}`;
      if (remainingMonths > 0) {
        label += `, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
      }
      return `${label} of training`;
    }
    
    return `${months} months of training`;
  };

  return (
    <GlassCard className="p-5">
      <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-4">
        Member Since
      </h3>
      
      <div className="space-y-1">
        <p className="text-xl font-bold text-foreground leading-tight">
          {memberSinceLabel}
        </p>
        <p className="text-sm text-foreground/50 font-medium">
          {formatTrainingTime(monthsTraining)}
        </p>
      </div>
    </GlassCard>
  );
}
