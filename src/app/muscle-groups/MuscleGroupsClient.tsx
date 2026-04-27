"use client";

import { useState, useMemo } from "react";
import { MuscleGroupPageData, ExerciseProgressMap } from "@/types/workout";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import { MuscleGroupGrid } from "@/components/analytics/MuscleGroupGrid";
import { MuscleGroupDrilldown } from "@/components/analytics/MuscleGroupDrilldown";
import { MuscleGroupSidebar } from "@/components/sidebar/MuscleGroupSidebar";
import { AnimatePresence, motion } from "framer-motion";
import { subDays, isAfter, parseISO, startOfYear, addWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { Trophy, Info, AlertCircle } from "lucide-react";
import Link from "next/link";

type TimeRange = "1W" | "4W" | "1M" | "3M" | "6M" | "ALL";

interface MuscleGroupsClientProps {
	data: MuscleGroupPageData;
}

export default function MuscleGroupsClient({ data }: MuscleGroupsClientProps) {
	const [timeRange, setTimeRange] = useState<TimeRange>("1M");
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

	const cutoff = useMemo(() => {
		const now = new Date();
		if (timeRange === "1W") return subDays(now, 7);
		if (timeRange === "4W") return subDays(now, 28);
		if (timeRange === "1M") return subDays(now, 30);
		if (timeRange === "3M") return subDays(now, 90);
		if (timeRange === "6M") return subDays(now, 180);
		return null;
	}, [timeRange]);

	const filteredSummaries = useMemo(() => {
		const now = new Date();

		return data.muscleGroups.map((mg) => {
			if (!cutoff) return mg;

			// Filter weeklyData by date
			const filteredWeeks = mg.weeklyData.filter((wd) => {
				const [year, week] = wd.week.split("-").map(Number);
				const weekDate = addWeeks(startOfYear(new Date(year, 0, 1)), week);
				return isAfter(weekDate, cutoff!) || wd.week === formatWeek(now);
			});

			if (filteredWeeks.length === 0) {
				return {
					...mg,
					totalSets: 0,
					totalVolume: 0,
					sessionCount: 0,
					topExercise: "None",
					weeklyData: [],
				};
			}

			// Sum up the filtered weeks
			const totalSets = filteredWeeks.reduce((acc, w) => acc + w.totalSets, 0);
			const totalVolume = filteredWeeks.reduce(
				(acc, w) => acc + w.totalVolume,
				0,
			);
			const sessionCount = filteredWeeks.reduce(
				(acc, w) => acc + (w.sessionCount || 0),
				0,
			);

			// Calculate top exercise in range
			const exerciseVolumeMap: Record<string, number> = {};
			filteredWeeks.forEach((w) => {
				w.exerciseVolumes?.forEach((ev) => {
					exerciseVolumeMap[ev.name] =
						(exerciseVolumeMap[ev.name] || 0) + ev.volume;
				});
			});
			const topExercise =
				Object.entries(exerciseVolumeMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
				mg.topExercise;

			return {
				...mg,
				totalSets,
				totalVolume,
				sessionCount,
				topExercise,
				weeklyData: filteredWeeks,
			};
		});
	}, [data.muscleGroups, cutoff]);

	const filteredProgress = useMemo(() => {
		if (!cutoff) return data.exerciseProgress;

		const filtered: ExerciseProgressMap = {};
		Object.entries(data.exerciseProgress).forEach(([name, info]) => {
			filtered[name] = {
				...info,
				dataPoints: info.dataPoints.filter((dp) =>
					isAfter(parseISO(dp.date), cutoff!),
				),
			};
		});
		return filtered;
	}, [data.exerciseProgress, cutoff]);

	function formatWeek(date: Date) {
		const year = date.getFullYear();
		const oneJan = new Date(year, 0, 1);
		const numberOfDays = Math.floor(
			(date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000),
		);
		const week = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
		return `${year}-${String(week).padStart(2, "0")}`;
	}

	if (data.muscleGroups.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
				<div className="bg-white/5 p-6 rounded-3xl mb-6">
					<Info className="w-12 h-12 text-foreground/20" />
				</div>
				<h2 className="text-2xl font-black text-foreground mb-2">
					No Training Data Yet
				</h2>
				<p className="text-foreground/40 max-w-md mb-8">
					Start logging workouts to see your muscle group breakdown and
					performance trends.
				</p>
				<Link
					href="/workout"
					className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
					Start a Workout
				</Link>
			</div>
		);
	}

	const activeSummary = filteredSummaries.find(
		(m) => m.muscleGroup === selectedGroup,
	);

	return (
		<PageWithSidebar
			sidebar={
				<MuscleGroupSidebar
					trainingBalance={data.trainingBalance}
					mostImproved={data.mostImproved}
					neglectedMuscles={data.neglectedMuscles}
				/>
			}>
			<div className="space-y-8 pb-20">

				{/* Mobile Widget Strip Placeholder */}
				<div className="lg:hidden flex overflow-x-auto gap-4 pb-4 no-scrollbar">
					<div className="flex-shrink-0 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[200px]">
						<p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">
							Balance
						</p>
						<div className="flex gap-2">
							{data.trainingBalance.slice(0, 2).map((b) => (
								<span
									key={b.muscleGroup}
									className="text-[10px] font-black bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg">
									{b.muscleGroup} {b.volumePercent}%
								</span>
							))}
						</div>
					</div>
					{data.mostImproved && (
						<div className="flex-shrink-0 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[200px]">
							<p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">
								Improved
							</p>
							<p className="text-sm font-black text-foreground">
								{data.mostImproved.muscleGroup} (+
								{data.mostImproved.percentChange}%)
							</p>
						</div>
					)}
					<div className="flex-shrink-0 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[150px]">
						<p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">
							Needs Focus
						</p>
						<p className="text-sm font-black text-foreground">
							{data.neglectedMuscles.length} Muscles
						</p>
					</div>
				</div>

				<section className="space-y-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div>
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
								Muscle Groups
							</h2>
							<p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">
								Select a group for deep dive
							</p>
						</div>

						<div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 whitespace-nowrap self-start md:self-auto overflow-x-auto no-scrollbar">
							{(["1W", "4W", "1M", "3M", "6M", "ALL"] as TimeRange[]).map(
								(range) => (
									<button
										key={range}
										onClick={() => setTimeRange(range)}
										className={cn(
											"px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
											timeRange === range
												? "bg-brand-primary text-white"
												: "text-white/40 hover:text-white",
										)}>
										{range}
									</button>
								),
							)}
						</div>
					</div>

					<MuscleGroupGrid
						summaries={filteredSummaries}
						selectedGroup={selectedGroup}
						onSelect={setSelectedGroup}
					/>
				</section>

				<AnimatePresence mode="wait">
					{selectedGroup && activeSummary && (
						<MuscleGroupDrilldown
							key={selectedGroup}
							summary={activeSummary}
							progressMap={filteredProgress}
							onClose={() => setSelectedGroup(null)}
						/>
					)}
				</AnimatePresence>
			</div>
		</PageWithSidebar>
	);
}
