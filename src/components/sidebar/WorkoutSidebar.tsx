"use client";

import { SessionStats } from "@/hooks/useSessionStats";
import { GlassCard } from "../ui/GlassCard";
import { SessionTimerDisplay } from "../workout/SessionTimerDisplay";
import { LiveStatsDisplay } from "../workout/LiveStatsDisplay";
import { PRsFeedDisplay } from "../workout/PRsFeedDisplay";

interface WorkoutSidebarProps {
  stats: SessionStats;
}

export default function WorkoutSidebar({ stats }: WorkoutSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="p-6">
        <SessionTimerDisplay
          elapsedSeconds={stats.elapsedSeconds}
          startedAt={stats.startedAt}
          variant="sidebar"
        />
      </GlassCard>

      <GlassCard className="p-6">
        <LiveStatsDisplay stats={stats} variant="sidebar" />
      </GlassCard>

      <GlassCard className="p-6">
        <PRsFeedDisplay prsHit={stats.prsHit} variant="sidebar" />
      </GlassCard>
    </div>
  );
}
