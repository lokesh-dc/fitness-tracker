"use client";

import { MostImprovedExercise, WeeklyVolumeComparison, MuscleRecovery } from "@/types/workout";
import { MostImprovedWidget } from "./widgets/MostImprovedWidget";
import { WeeklyVolumeComparisonWidget } from "./widgets/WeeklyVolumeComparisonWidget";
import { MuscleReadinessWidget } from "./widgets/MuscleReadinessWidget";

interface AnalyticsSidebarProps {
	mostImproved: MostImprovedExercise | null;
	weeklyVolume: WeeklyVolumeComparison;
	muscleRecovery: MuscleRecovery[];
}

export function AnalyticsSidebar({
	mostImproved,
	weeklyVolume,
	muscleRecovery,
}: AnalyticsSidebarProps) {
	return (
		<>
			<MuscleReadinessWidget recovery={muscleRecovery} />
			<MostImprovedWidget mostImproved={mostImproved} />
			<WeeklyVolumeComparisonWidget data={weeklyVolume} />
		</>
	);
}

export function AnalyticsMobileStrip({
	mostImproved,
	weeklyVolume,
	muscleRecovery,
}: AnalyticsSidebarProps) {
	return (
		<div className="flex lg:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none mb-4">
			<MuscleReadinessWidget recovery={muscleRecovery} variant="mobile" />
			<MostImprovedWidget mostImproved={mostImproved} variant="mobile" />
			<WeeklyVolumeComparisonWidget data={weeklyVolume} variant="mobile" />
		</div>
	);
}
