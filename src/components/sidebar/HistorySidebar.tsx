"use client";

import {
	MuscleGroupStat,
	MonthlyVolumeTrend,
	MissedWorkoutsStat,
} from "@/types/workout";
import { MuscleGroupWidget } from "./widgets/MuscleGroupWidget";
import { VolumeTrendWidget } from "./widgets/VolumeTrendWidget";
import { MissedWorkoutsWidget } from "./widgets/MissedWorkoutsWidget";

interface HistorySidebarProps {
	muscleGroups: MuscleGroupStat[];
	volumeTrend: MonthlyVolumeTrend;
	missedWorkouts: MissedWorkoutsStat;
}

export function HistorySidebar({
	muscleGroups,
	volumeTrend,
	missedWorkouts,
}: HistorySidebarProps) {
	return (
		<>
			<MuscleGroupWidget muscleGroups={muscleGroups} />
			<VolumeTrendWidget volumeData={volumeTrend} />
			<MissedWorkoutsWidget stats={missedWorkouts} />
		</>
	);
}

export function HistoryMobileStrip({
	muscleGroups,
	volumeTrend,
	missedWorkouts,
}: HistorySidebarProps) {
	return (
		<div className="flex lg:hidden gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none h-[120px] mb-0">
			{/* Muscle Groups card */}
			<div className="min-w-[180px] p-4 rounded-2xl border border-foreground/5 bg-foreground/[0.02] snap-start flex flex-col justify-center">
				<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
					Top Muscle
				</p>
				<p className="text-xl font-black text-foreground mt-1 capitalize truncate">
					{muscleGroups && muscleGroups.length > 0
						? muscleGroups[0].muscleGroup
						: "—"}
				</p>
				<p className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-widest">
					{muscleGroups && muscleGroups.length > 0
						? `${muscleGroups[0].percentageOfTotal}% of vol`
						: "No data"}
				</p>
			</div>

			{/* Volume trend card */}
			<div className="min-w-[180px] p-4 rounded-2xl border border-foreground/5 bg-foreground/[0.02] snap-start flex flex-col justify-center">
				<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
					Volume Trend
				</p>
				<p className="text-xl font-black text-foreground mt-1 flex items-center">
					{volumeTrend.trendPercent !== null ? (
						<>
							<span
								className={
									volumeTrend.trendPercent > 0
										? "text-green-500 mr-1"
										: volumeTrend.trendPercent < 0
											? "text-red-500 mr-1"
											: "text-foreground/40 mr-1"
								}>
								{volumeTrend.trendPercent > 0
									? "↑"
									: volumeTrend.trendPercent < 0
										? "↓"
										: "→"}
							</span>
							{Math.abs(volumeTrend.trendPercent)}%
						</>
					) : (
						"—"
					)}
				</p>
				<p className="text-[10px] font-bold text-foreground/40 mt-1 uppercase tracking-widest">
					vs last month
				</p>
			</div>

			{/* Missed workouts card */}
			<div className="min-w-[180px] p-4 rounded-2xl border border-foreground/5 bg-foreground/[0.02] snap-start flex flex-col justify-center">
				<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
					This Month
				</p>
				<p className="text-xl font-black text-foreground mt-1">
					{missedWorkouts.hasActivePlan
						? `${missedWorkouts.completionPercent}%`
						: "—"}
				</p>
				<p className="text-[10px] font-bold text-foreground/40 mt-1 truncate uppercase tracking-widest">
					{missedWorkouts.sessionsLogged} logged{" "}
					{missedWorkouts.hasActivePlan
						? `· ${missedWorkouts.sessionsMissed} missed`
						: ""}
				</p>
			</div>
		</div>
	);
}
