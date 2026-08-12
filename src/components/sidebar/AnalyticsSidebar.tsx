"use client";

import { MostImprovedExercise, WeeklyVolumeComparison } from "@/types/workout";
import { MostImprovedWidget } from "./widgets/MostImprovedWidget";
import { WeeklyVolumeComparisonWidget } from "./widgets/WeeklyVolumeComparisonWidget";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface AnalyticsSidebarProps {
	mostImproved: MostImprovedExercise | null;
	weeklyVolume: WeeklyVolumeComparison;
}

export function AnalyticsSidebar({
	mostImproved,
	weeklyVolume,
}: AnalyticsSidebarProps) {
	return (
		<>
			<MostImprovedWidget mostImproved={mostImproved} />
			<WeeklyVolumeComparisonWidget data={weeklyVolume} />
		</>
	);
}

export function AnalyticsMobileStrip({
	mostImproved,
	weeklyVolume,
}: AnalyticsSidebarProps) {
	return (
		<div className="flex lg:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none mb-4">
			<MostImprovedWidget mostImproved={mostImproved} variant="mobile" />
			<WeeklyVolumeComparisonWidget data={weeklyVolume} variant="mobile" />
		</div>
	);
}
