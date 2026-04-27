"use client";

import { MuscleGroupSummary } from "@/types/workout";
import { MuscleGroupCard } from "./MuscleGroupCard";

interface MuscleGroupGridProps {
  summaries: MuscleGroupSummary[];
  selectedGroup: string | null;
  onSelect: (group: string) => void;
}

export function MuscleGroupGrid({ summaries, selectedGroup, onSelect }: MuscleGroupGridProps) {
  // Calculate average session count to detect imbalances
  const avgSessions = summaries.length > 0 
    ? summaries.reduce((acc, s) => acc + s.sessionCount, 0) / summaries.length 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {summaries.map((summary) => (
        <MuscleGroupCard
          key={summary.muscleGroup}
          summary={summary}
          isSelected={selectedGroup === summary.muscleGroup}
          onClick={() => onSelect(summary.muscleGroup)}
          isUnderTrained={summary.sessionCount < avgSessions * 0.5}
        />
      ))}
    </div>
  );
}
