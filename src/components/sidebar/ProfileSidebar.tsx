"use client";

import { BodyWeightTrend, AllTimeStats, AccountSummary } from "@/types/workout";
import BodyWeightWidget from "./widgets/BodyWeightWidget";
import AllTimeStatsWidget from "./widgets/AllTimeStatsWidget";
import AccountSummaryWidget from "./widgets/AccountSummaryWidget";
import { GlassCard } from "@/components/ui/GlassCard";

interface ProfileSidebarProps {
  bodyWeightTrend: BodyWeightTrend;
  allTimeStats: AllTimeStats;
  accountSummary: AccountSummary;
}

export function ProfileSidebar({
  bodyWeightTrend,
  allTimeStats,
  accountSummary,
}: ProfileSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <BodyWeightWidget data={bodyWeightTrend} />
      <AllTimeStatsWidget data={allTimeStats} />
      <AccountSummaryWidget data={accountSummary} />
    </div>
  );
}

export function ProfileMobileStrip({
  bodyWeightTrend,
  allTimeStats,
  accountSummary,
}: ProfileSidebarProps) {
  return (
    <div className="flex lg:hidden gap-3 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
      {/* Body Weight card */}
      <GlassCard className="min-w-[160px] p-3 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Body Weight
          </p>
          <p className="text-lg font-bold text-foreground mt-1">
            {bodyWeightTrend.currentWeight
              ? `${bodyWeightTrend.currentWeight} kg`
              : "—"}
          </p>
        </div>
        {bodyWeightTrend.changeKg !== null && bodyWeightTrend.entries.length > 1 && (
          <p className={`text-[10px] font-bold ${
            bodyWeightTrend.changeDirection === "up" ? "text-orange-400" : 
            bodyWeightTrend.changeDirection === "down" ? "text-blue-400" : "text-foreground/40"
          }`}>
            {bodyWeightTrend.changeDirection === "up" ? "▲" : 
             bodyWeightTrend.changeDirection === "down" ? "▼" : "•"}{" "}
            {Math.abs(bodyWeightTrend.changeKg)} kg
          </p>
        )}
      </GlassCard>

      {/* Workouts card */}
      <GlassCard className="min-w-[160px] p-3 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Total Workouts
          </p>
          <p className="text-lg font-bold text-foreground mt-1">
            {allTimeStats.totalWorkouts}
          </p>
        </div>
        <p className="text-[10px] text-foreground/30 font-medium">all time</p>
      </GlassCard>

      {/* PRs card */}
      <GlassCard className="min-w-[160px] p-3 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            PRs Broken
          </p>
          <p className="text-lg font-bold text-foreground mt-1">
            🏆 {allTimeStats.totalPRsBroken}
          </p>
        </div>
        <p className="text-[10px] text-foreground/30 font-medium">all time</p>
      </GlassCard>

      {/* Member Since card */}
      <GlassCard className="min-w-[160px] p-3 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Training For
          </p>
          <p className="text-lg font-bold text-foreground mt-1">
            {allTimeStats.totalWorkouts > 0 ? `${accountSummary.monthsTraining}mo` : "—"}
          </p>
        </div>
        <p className="text-[10px] text-foreground/30 font-medium">
          since {accountSummary.memberSinceLabel}
        </p>
      </GlassCard>
    </div>
  );
}
