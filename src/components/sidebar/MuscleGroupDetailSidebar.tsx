"use client";

import { MuscleGroupDetailPageData } from "@/types/workout";
import { MuscleQuickStatsWidget } from "./widgets/MuscleQuickStatsWidget";
import { TrainingFrequencyWidget } from "./widgets/TrainingFrequencyWidget";
import { RepRangeBreakdownWidget } from "./widgets/RepRangeBreakdownWidget";
import { PRBoardWidget } from "./widgets/PRBoardWidget";

interface MuscleGroupDetailSidebarProps {
  data: MuscleGroupDetailPageData;
  timeRangeLabel: string;
  filteredStats: {
    sessions: number;
    sets: number;
    volume: number;
  };
  last4WeeksFreq: number;
  allTimeFreq: number;
}

export function MuscleGroupDetailSidebar({ 
  data, 
  timeRangeLabel, 
  filteredStats,
  last4WeeksFreq,
  allTimeFreq
}: MuscleGroupDetailSidebarProps) {
  return (
    <div className="flex flex-col gap-6 sticky top-24">
      <MuscleQuickStatsWidget 
        muscleGroup={data.muscleGroup}
        totalSessions={filteredStats.sessions}
        totalSets={filteredStats.sets}
        totalVolume={filteredStats.volume}
        timeRangeLabel={timeRangeLabel}
      />
      
      <TrainingFrequencyWidget 
        last4WeeksFreq={last4WeeksFreq}
        allTimeFreq={allTimeFreq}
      />

      <RepRangeBreakdownWidget 
        distribution={data.repRangeDistribution}
      />

      <PRBoardWidget 
        exercises={data.exercises}
      />
    </div>
  );
}
