"use client";

import { useState, useMemo } from "react";
import { MuscleGroupPageData, ExerciseProgressMap } from "@/types/workout";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import { MuscleGroupGrid } from "@/components/analytics/MuscleGroupGrid";
import { MuscleGroupSidebar } from "@/components/sidebar/MuscleGroupSidebar";
import { subDays, isAfter, parseISO, startOfYear, addWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { PieChart, TrendingUp, Target, Info } from "lucide-react";
import Link from "next/link";

type TimeRange = "1W" | "4W" | "1M" | "3M" | "6M" | "ALL";

interface MuscleGroupsClientProps {
	data: MuscleGroupPageData;
}

export default function MuscleGroupsClient({ data }: MuscleGroupsClientProps) {
	const [timeRange, setTimeRange] = useState<TimeRange>("1M");

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
			<div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-16">
				<div className="bg-foreground/[0.04] p-5 rounded-2xl mb-4 border border-foreground/[0.06]">
					<Info className="w-8 h-8 text-foreground/25" />
				</div>
				<h2 className="text-lg font-bold text-foreground mb-1.5">
					No Training Data Yet
				</h2>
				<p className="text-xs text-foreground/40 max-w-sm mb-6">
					Start logging workouts to see your muscle group breakdown, volume distribution, and strength milestones.
				</p>
				<Link
					href="/workout"
					className="bg-brand-primary text-white text-xs px-6 py-2.5 rounded-xl font-semibold tracking-wide hover:opacity-95 active:scale-95 transition-all">
					Start a Workout
				</Link>
			</div>
		);
	}

	return (
		<PageWithSidebar
			sidebar={
				<MuscleGroupSidebar
					trainingBalance={data.trainingBalance}
					mostImproved={data.mostImproved}
					neglectedMuscles={data.neglectedMuscles}
				/>
			}>
			<div className="space-y-6 md:space-y-8 pb-12">
				{/* ── Mobile stats strip ── */}
				<div className="lg:hidden grid grid-cols-3 gap-2.5">
					{/* Balance */}
					<div className="flex flex-col gap-1.5 rounded-2xl px-3 py-3 bg-brand-primary/10 border border-brand-primary/20">
						<div className="flex items-center gap-1.5">
							<PieChart className="w-3 h-3 text-brand-primary shrink-0" />
							<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-primary/70">
								Top Volume
							</span>
						</div>
						<div className="flex items-baseline gap-1">
							<span className="text-sm font-bold text-brand-primary truncate">
								{data.trainingBalance[0]?.muscleGroup || "—"}
							</span>
							{data.trainingBalance[0] && (
								<span className="text-[10px] text-brand-primary/60 font-medium">
									{data.trainingBalance[0].volumePercent}%
								</span>
							)}
						</div>
					</div>

					{/* Most Improved */}
					<div className="flex flex-col gap-1.5 rounded-2xl px-3 py-3 bg-foreground/[0.04] border border-foreground/[0.06]">
						<div className="flex items-center gap-1.5">
							<TrendingUp className="w-3 h-3 text-foreground/35 shrink-0" />
							<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/35">
								Improved
							</span>
						</div>
						<div className="flex items-baseline gap-1">
							<span className="text-sm font-bold text-foreground truncate">
								{data.mostImproved?.muscleGroup || "—"}
							</span>
							{data.mostImproved && (
								<span className="text-[10px] text-emerald-500 font-semibold">
									+{data.mostImproved.percentChange}%
								</span>
							)}
						</div>
					</div>

					{/* Needs Focus */}
					<div className="flex flex-col gap-1.5 rounded-2xl px-3 py-3 bg-foreground/[0.04] border border-foreground/[0.06]">
						<div className="flex items-center gap-1.5">
							<Target className="w-3 h-3 text-foreground/35 shrink-0" />
							<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/35">
								Needs Focus
							</span>
						</div>
						<div className="flex items-baseline gap-1">
							<span className="text-xl font-bold tabular-nums text-foreground leading-none">
								{data.neglectedMuscles.length}
							</span>
							<span className="text-[10px] text-foreground/30 font-medium">
								{data.neglectedMuscles.length === 1 ? "group" : "groups"}
							</span>
						</div>
					</div>
				</div>

				{/* ── Section Header & Filter ── */}
				<section className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div>
							<h2 className="text-base md:text-lg font-bold text-foreground tracking-tight">
								Muscle Groups
							</h2>
							<p className="text-[11px] font-medium text-foreground/40 mt-0.5">
								Select a muscle group to view deep dive analytics
							</p>
						</div>

						<div className="flex items-center gap-1 bg-foreground/[0.04] p-1 rounded-xl border border-foreground/[0.06] overflow-x-auto no-scrollbar self-start sm:self-auto">
							{(["1W", "4W", "1M", "3M", "6M", "ALL"] as TimeRange[]).map(
								(range) => (
									<button
										key={range}
										onClick={() => setTimeRange(range)}
										className={cn(
											"px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap",
											timeRange === range
												? "bg-brand-primary text-white shadow-xs"
												: "text-foreground/50 hover:text-foreground/80 hover:bg-foreground/[0.04]",
										)}>
										{range}
									</button>
								),
							)}
						</div>
					</div>

					<MuscleGroupGrid summaries={filteredSummaries} />
				</section>
			</div>
		</PageWithSidebar>
	);
}
