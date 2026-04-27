"use client";

import { MuscleGroupBalanceWidget } from "./widgets/MuscleGroupBalanceWidget";
import { MuscleGroupImprovedWidget } from "./widgets/MuscleGroupImprovedWidget";
import { MuscleGroupNeglectedWidget } from "./widgets/MuscleGroupNeglectedWidget";

interface MuscleGroupSidebarProps {
  trainingBalance: { muscleGroup: string; volumePercent: number }[];
  mostImproved: { muscleGroup: string; percentChange: number; topExercise: string } | null;
  neglectedMuscles: { muscleGroup: string; daysSinceLastTrained: number }[];
}

export function MuscleGroupSidebar({ 
  trainingBalance, 
  mostImproved, 
  neglectedMuscles 
}: MuscleGroupSidebarProps) {
  return (
    <div className="flex flex-col gap-6 sticky top-24">
      <MuscleGroupBalanceWidget data={trainingBalance} />
      <MuscleGroupImprovedWidget data={mostImproved} />
      <MuscleGroupNeglectedWidget data={neglectedMuscles} />
    </div>
  );
}
