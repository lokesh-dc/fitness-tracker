import { GlassCard } from "@/components/ui/GlassCard";
import { BodyWeightTrend, AllTimeStats, AccountSummary } from "@/types/workout";
import { Dumbbell, Trophy, Scale, Calendar } from "lucide-react";

interface ProfileStatsGridProps {
  bodyWeightTrend: BodyWeightTrend;
  allTimeStats: AllTimeStats;
  accountSummary: AccountSummary;
}

export function ProfileStatsGrid({
  bodyWeightTrend,
  allTimeStats,
  accountSummary,
}: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:hidden">
      {/* 1. Body Weight Card */}
      <GlassCard className="p-4 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Body Weight
          </span>
          <Scale className="w-3.5 h-3.5 text-brand-primary/70" />
        </div>
        <div>
          <p className="text-xl font-black text-foreground tabular-nums">
            {bodyWeightTrend.currentWeight ? `${bodyWeightTrend.currentWeight} kg` : "—"}
          </p>
          {bodyWeightTrend.changeKg !== null && bodyWeightTrend.entries.length > 1 && (
            <p
              className={`text-[10px] font-bold mt-0.5 tabular-nums ${
                bodyWeightTrend.changeDirection === "up"
                  ? "text-orange-400"
                  : bodyWeightTrend.changeDirection === "down"
                  ? "text-blue-400"
                  : "text-foreground/40"
              }`}
            >
              {bodyWeightTrend.changeDirection === "up"
                ? "▲"
                : bodyWeightTrend.changeDirection === "down"
                ? "▼"
                : "•"}{" "}
              {Math.abs(bodyWeightTrend.changeKg)} kg
            </p>
          )}
        </div>
      </GlassCard>

      {/* 2. Total Workouts Card */}
      <GlassCard className="p-4 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Workouts
          </span>
          <Dumbbell className="w-3.5 h-3.5 text-brand-primary/70" />
        </div>
        <div>
          <p className="text-xl font-black text-foreground tabular-nums">
            {allTimeStats.totalWorkouts}
          </p>
          <p className="text-[10px] text-foreground/40 font-medium mt-0.5">
            Total sessions logged
          </p>
        </div>
      </GlassCard>

      {/* 3. PRs Broken Card */}
      <GlassCard className="p-4 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            PRs Broken
          </span>
          <Trophy className="w-3.5 h-3.5 text-amber-500/80" />
        </div>
        <div>
          <p className="text-xl font-black text-foreground tabular-nums">
            {allTimeStats.totalPRsBroken}
          </p>
          <p className="text-[10px] text-foreground/40 font-medium mt-0.5">
            Records shattered
          </p>
        </div>
      </GlassCard>

      {/* 4. Training Duration Card */}
      <GlassCard className="p-4 flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            Tenure
          </span>
          <Calendar className="w-3.5 h-3.5 text-indigo-400/80" />
        </div>
        <div>
          <p className="text-xl font-black text-foreground">
            {accountSummary.memberSinceLabel || `${accountSummary.monthsTraining} mo`}
          </p>
          <p className="text-[10px] text-foreground/40 font-medium mt-0.5">
            Consistent dedication
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

