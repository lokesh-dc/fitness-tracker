"use client";

import { MostImprovedExercise, WeeklyVolumeComparison } from "@/types/workout";
import { MostImprovedWidget } from "./widgets/MostImprovedWidget";
import { WeeklyVolumeWidget } from "./widgets/WeeklyVolumeWidget";
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
			<WeeklyVolumeWidget weeklyVolume={weeklyVolume} />
		</>
	);
}

export function AnalyticsMobileStrip({
	mostImproved,
	weeklyVolume,
}: AnalyticsSidebarProps) {
	return (
		<div className="flex lg:hidden gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none mb-4">
			{/* Most Improved card */}
			<GlassCard className="min-w-[200px] p-3 border-foreground/5 bg-foreground/[0.02]">
				<p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">
					Most Improved
				</p>
				{mostImproved ? (
					<>
						<p className="text-sm font-bold text-foreground mt-1 truncate">
							{mostImproved.exerciseName}
						</p>
						<p className="text-xs font-bold text-green-400">
							+{mostImproved.improvementPercent}% in 30 days
						</p>
					</>
				) : (
					<p className="text-xs text-foreground/30 mt-1 italic">No data yet</p>
				)}
			</GlassCard>

			{/* Weekly Volume card */}
			<GlassCard className="min-w-[200px] p-3 border-foreground/5 bg-foreground/[0.02]">
				<p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">
					Weekly Volume
				</p>
				<p className="text-sm font-bold text-foreground mt-1">
					{weeklyVolume.thisWeekVolume.toLocaleString()} kg
				</p>
				<p
					className={cn(
						"text-xs font-bold",
						weeklyVolume.trendDirection === "up"
							? "text-green-400"
							: weeklyVolume.trendDirection === "down"
								? "text-red-400"
								: "text-foreground/40",
					)}>
					{weeklyVolume.trendDirection === "up"
						? "↑"
						: weeklyVolume.trendDirection === "down"
							? "↓"
							: "→"}{" "}
					{Math.abs(weeklyVolume.differencePercent)}% vs last week
				</p>
			</GlassCard>
		</div>
	);
}
