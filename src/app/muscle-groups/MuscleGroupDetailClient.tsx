"use client";

import { useState, useMemo } from "react";
import {
	MuscleGroupDetailPageData,
	WeeklyMuscleVolume,
	ExerciseDetailData,
} from "@/types/workout";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import { MuscleGroupDetailSidebar } from "@/components/sidebar/MuscleGroupDetailSidebar";
import { VolumeOverTimeChart } from "@/components/analytics/VolumeOverTimeChart";
import { MuscleHeatmap } from "@/components/analytics/MuscleHeatmap";
import { RepRangeDonut } from "@/components/analytics/RepRangeDonut";
import { ExerciseDetailCard } from "@/components/analytics/ExerciseDetailCard";
import { GlassCard } from "@/components/ui/GlassCard";
import {
	Trophy,
	Calendar,
	Activity,
	TrendingUp,
	CheckCircle2,
	Layers,
	Flame,
	Dumbbell,
} from "lucide-react";
import {
	subDays,
	isAfter,
	parseISO,
	format,
	formatDistanceToNow,
} from "date-fns";
import { cn } from "@/lib/utils";

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface MuscleGroupDetailClientProps {
	data: MuscleGroupDetailPageData;
}

export default function MuscleGroupDetailClient({
	data,
}: MuscleGroupDetailClientProps) {
	const [timeRange, setTimeRange] = useState<TimeRange>("6M");
	const [openExercise, setOpenExercise] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<string>("Highest 1RM");

	const cutoff = useMemo(() => {
		const now = new Date();
		if (timeRange === "1M") return subDays(now, 30);
		if (timeRange === "3M") return subDays(now, 90);
		if (timeRange === "6M") return subDays(now, 180);
		if (timeRange === "1Y") return subDays(now, 365);
		return null;
	}, [timeRange]);

	const filteredWeeklyVolume = useMemo(() => {
		if (!cutoff) return data.weeklyVolume;
		return data.weeklyVolume.filter((w) =>
			isAfter(parseISO(w.weekStart), cutoff),
		);
	}, [data.weeklyVolume, cutoff]);

	const filteredExercises = useMemo(() => {
		return data.exercises.map((ex) => {
			if (!cutoff) return ex;
			return {
				...ex,
				dataPoints: ex.dataPoints.filter((dp) =>
					isAfter(parseISO(dp.date), cutoff),
				),
			};
		});
	}, [data.exercises, cutoff]);

	const filteredStats = useMemo(() => {
		return filteredWeeklyVolume.reduce(
			(acc, w) => ({
				sessions: acc.sessions + w.sessionCount,
				sets: acc.sets + w.totalSets,
				volume: acc.volume + w.totalVolume,
			}),
			{ sessions: 0, sets: 0, volume: 0 },
		);
	}, [filteredWeeklyVolume]);

	// Sorting
	const sortedExercises = useMemo(() => {
		return [...filteredExercises].sort((a, b) => {
			if (sortBy === "Highest 1RM")
				return b.currentEstimatedOneRM - a.currentEstimatedOneRM;
			if (sortBy === "Highest PR") return b.currentPR - a.currentPR;
			if (sortBy === "Most Recent")
				return b.lastLoggedDate.localeCompare(a.lastLoggedDate);
			if (sortBy === "Most Sets") return b.totalSets - a.totalSets;
			return 0;
		});
	}, [filteredExercises, sortBy]);

	// Frequency logic for sidebar
	const last4WeeksFreq = useMemo(() => {
		const last4 = data.weeklyVolume.slice(-4);
		return last4.reduce((acc, w) => acc + w.sessionCount, 0) / 4;
	}, [data.weeklyVolume]);

	const allTimeFreq = useMemo(() => {
		if (data.weeklyVolume.length === 0) return 0;
		return (
			data.weeklyVolume.reduce((acc, w) => acc + w.sessionCount, 0) /
			data.weeklyVolume.length
		);
	}, [data.weeklyVolume]);

	const timeRangeLabel = timeRange === "ALL" ? "All Time" : `Last ${timeRange}`;

	return (
		<div className="space-y-8">
			{/* Filter Strip */}
			<div className="flex items-center justify-between gap-4">
				<span className="text-[11px] font-semibold text-foreground/40 uppercase tracking-[0.15em]">
					Overview
				</span>

				<div className="flex items-center gap-1 bg-foreground/[0.04] p-1 rounded-xl border border-foreground/[0.06] shrink-0">
					{(["1M", "3M", "6M", "1Y", "ALL"] as TimeRange[]).map((range) => (
						<button
							key={range}
							onClick={() => setTimeRange(range)}
							className={cn(
								"px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
								timeRange === range
									? "bg-brand-primary text-white shadow-xs"
									: "text-foreground/50 hover:text-foreground/80 hover:bg-foreground/[0.04]"
							)}>
							{range}
						</button>
					))}
				</div>
			</div>

			{/* Top KPI Stat Grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
				{/* Volume */}
				<div className="flex flex-col gap-1.5 rounded-2xl p-3.5 bg-brand-primary/10 border border-brand-primary/20">
					<div className="flex items-center gap-1.5">
						<TrendingUp className="w-3.5 h-3.5 text-brand-primary shrink-0" />
						<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-primary/70">
							Total Volume
						</span>
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-xl font-bold tabular-nums text-brand-primary leading-none">
							{filteredStats.volume.toLocaleString()}
						</span>
						<span className="text-[10px] text-brand-primary/50 font-medium">kg</span>
					</div>
				</div>

				{/* Sets */}
				<div className="flex flex-col gap-1.5 rounded-2xl p-3.5 bg-foreground/[0.03] border border-foreground/[0.06]">
					<div className="flex items-center gap-1.5">
						<Layers className="w-3.5 h-3.5 text-foreground/35 shrink-0" />
						<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/35">
							Total Sets
						</span>
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-xl font-bold tabular-nums text-foreground leading-none">
							{filteredStats.sets.toLocaleString()}
						</span>
						<span className="text-[10px] text-foreground/30 font-medium">sets</span>
					</div>
				</div>

				{/* Sessions */}
				<div className="flex flex-col gap-1.5 rounded-2xl p-3.5 bg-foreground/[0.03] border border-foreground/[0.06]">
					<div className="flex items-center gap-1.5">
						<CheckCircle2 className="w-3.5 h-3.5 text-foreground/35 shrink-0" />
						<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/35">
							Sessions
						</span>
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-xl font-bold tabular-nums text-foreground leading-none">
							{filteredStats.sessions}
						</span>
						<span className="text-[10px] text-foreground/30 font-medium">logged</span>
					</div>
				</div>

				{/* Best Session */}
				<div className="flex flex-col gap-1.5 rounded-2xl p-3.5 bg-foreground/[0.03] border border-foreground/[0.06]">
					<div className="flex items-center gap-1.5">
						<Trophy className="w-3.5 h-3.5 text-foreground/35 shrink-0" />
						<span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/35">
							Peak Session
						</span>
					</div>
					<div className="flex items-baseline gap-1">
						<span className="text-xl font-bold tabular-nums text-foreground leading-none">
							{(data.bestSession?.totalVolume || 0).toLocaleString()}
						</span>
						<span className="text-[10px] text-foreground/30 font-medium">kg</span>
					</div>
				</div>
			</div>

			<PageWithSidebar
				sidebar={
					<MuscleGroupDetailSidebar
						data={data}
						timeRangeLabel={timeRangeLabel}
						filteredStats={filteredStats}
						last4WeeksFreq={last4WeeksFreq}
						allTimeFreq={allTimeFreq}
					/>
				}>
				<div className="space-y-8 pb-12">
					{/* Volume Over Time */}
					<section className="space-y-3">
						<div className="flex items-center gap-2">
							<TrendingUp className="w-4 h-4 text-brand-primary" />
							<h2 className="text-sm font-semibold text-foreground tracking-tight">
								Volume Over Time
							</h2>
						</div>
						<GlassCard className="p-4 md:p-5">
							<VolumeOverTimeChart data={filteredWeeklyVolume} />
						</GlassCard>
					</section>

					{/* Training Frequency Heatmap */}
					<section className="space-y-3">
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-brand-primary" />
								<h2 className="text-sm font-semibold text-foreground tracking-tight">
									Training Frequency
								</h2>
							</div>
							<span className="text-[10px] font-medium text-foreground/40">
								{timeRangeLabel}
							</span>
						</div>
						<GlassCard className="p-4 md:p-5">
							<MuscleHeatmap
								dates={data.heatmapDates}
								muscleGroup={data.muscleGroup}
								timeRange={timeRange}
							/>
						</GlassCard>
					</section>

					{/* Training Character & Peak Session */}
					<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Rep Range Distribution */}
						<GlassCard className="p-4 md:p-5 flex flex-col justify-between gap-4">
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<Activity className="w-4 h-4 text-brand-primary" />
									<h3 className="text-sm font-semibold text-foreground tracking-tight">
										Rep Range Focus
									</h3>
								</div>
								<span className="text-[10px] text-foreground/40 font-medium">
									{data.repRangeDistribution.total} sets
								</span>
							</div>

							<div className="flex items-center justify-center py-2">
								<RepRangeDonut distribution={data.repRangeDistribution} size="sm" />
							</div>

							{data.repRangeDistribution.interpretation && (
								<p className="text-xs text-foreground/50 leading-relaxed italic bg-foreground/[0.02] p-3 rounded-xl border border-foreground/[0.04]">
									&quot;{data.repRangeDistribution.interpretation}&quot;
								</p>
							)}
						</GlassCard>

						{/* Peak Session Highlight */}
						<GlassCard className="p-4 md:p-5 flex flex-col justify-between gap-4">
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<Trophy className="w-4 h-4 text-brand-primary" />
									<h3 className="text-sm font-semibold text-foreground tracking-tight">
										Best Session Ever
									</h3>
								</div>
								{data.bestSession && (
									<span className="text-[10px] text-brand-primary font-semibold">
										{format(parseISO(data.bestSession.date), "MMM d, yyyy")}
									</span>
								)}
							</div>

							{data.bestSession ? (
								<div className="space-y-4 py-2">
									<div>
										<p className="text-[10px] uppercase font-semibold text-foreground/30 tracking-wider">
											Workout Name
										</p>
										<p className="text-base font-bold text-foreground line-clamp-1 mt-0.5">
											{data.bestSession.workoutName}
										</p>
									</div>

									<div className="grid grid-cols-3 gap-2 pt-2 border-t border-foreground/[0.04]">
										<div>
											<p className="text-[9px] uppercase font-semibold text-foreground/30 tracking-wider">
												Volume
											</p>
											<p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
												{data.bestSession.totalVolume.toLocaleString()} kg
											</p>
										</div>
										<div>
											<p className="text-[9px] uppercase font-semibold text-foreground/30 tracking-wider">
												Sets
											</p>
											<p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
												{data.bestSession.totalSets}
											</p>
										</div>
										<div>
											<p className="text-[9px] uppercase font-semibold text-foreground/30 tracking-wider">
												Exercises
											</p>
											<p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
												{data.bestSession.exerciseCount}
											</p>
										</div>
									</div>
								</div>
							) : (
								<p className="text-xs text-foreground/30 py-8 text-center">
									No peak session recorded yet
								</p>
							)}

							<div className="text-[10px] text-foreground/30">
								All-time peak recorded for {data.muscleGroup}
							</div>
						</GlassCard>
					</section>

					{/* Exercise Roster with Integrated Leaderboard & Deep Dive */}
					<section className="space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<Dumbbell className="w-4 h-4 text-brand-primary" />
								<h2 className="text-sm font-semibold text-foreground tracking-tight">
									Exercises & Rankings
								</h2>
								<span className="text-xs text-foreground/30">
									({sortedExercises.length})
								</span>
							</div>

							<div className="flex items-center gap-1 bg-foreground/[0.04] p-1 rounded-xl border border-foreground/[0.06] overflow-x-auto no-scrollbar self-start sm:self-auto">
								{["Highest 1RM", "Highest PR", "Most Recent", "Most Sets"].map(
									(s) => (
										<button
											key={s}
											onClick={() => setSortBy(s)}
											className={cn(
												"px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap",
												sortBy === s
													? "bg-brand-primary text-white shadow-xs"
													: "text-foreground/50 hover:text-foreground/80 hover:bg-foreground/[0.04]"
											)}>
											{s}
										</button>
									),
								)}
							</div>
						</div>

						<div className="space-y-3">
							{sortedExercises.map((ex, idx) => (
								<ExerciseDetailCard
									key={ex.exerciseName}
									exercise={ex}
									isOpen={openExercise === ex.exerciseName}
									rank={idx + 1}
									onToggle={() =>
										setOpenExercise(
											openExercise === ex.exerciseName ? null : ex.exerciseName,
										)
									}
								/>
							))}
						</div>
					</section>
				</div>
			</PageWithSidebar>
		</div>
	);
}
