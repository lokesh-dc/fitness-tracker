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
import { StrengthLeaderboard } from "@/components/analytics/StrengthLeaderboard";
import { RepRangeDonut } from "@/components/analytics/RepRangeDonut";
import { ExerciseDetailCard } from "@/components/analytics/ExerciseDetailCard";
import { GlassCard } from "@/components/ui/GlassCard";
import {
	Trophy,
	ArrowLeft,
	Calendar,
	LayoutGrid,
	ListFilter,
	TrendingUp,
	Star,
} from "lucide-react";
import Link from "next/link";
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
	const [sortBy, setSortBy] = useState<string>("Most Recent");

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
			if (sortBy === "Most Recent")
				return b.lastLoggedDate.localeCompare(a.lastLoggedDate);
			if (sortBy === "Most Sets") return b.totalSets - a.totalSets;
			if (sortBy === "Highest PR") return b.currentPR - a.currentPR;
			if (sortBy === "Highest 1RM")
				return b.currentEstimatedOneRM - a.currentEstimatedOneRM;
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
		<div className="space-y-12">
			{/* Page Header */}
			<div className="space-y-6">
				<Link
					href="/muscle-groups"
					className="flex items-center gap-2 text-xs font-black text-foreground/40 uppercase tracking-widest hover:text-foreground transition-colors group">
					<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
					Muscle Groups
				</Link>

				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="space-y-1">
						<h1 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight">
							{data.muscleGroup}
						</h1>
						<div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-foreground/40 uppercase tracking-widest">
							<span>{data.totalExercises} tracked</span>
							<span className="text-foreground/10">•</span>
							<span>{data.totalSessions} sessions</span>
						</div>
					</div>

					<div className="group-tabs no-scrollbar self-start md:self-auto">
						{(["1M", "3M", "6M", "1Y", "ALL"] as TimeRange[]).map((range) => (
							<button
								key={range}
								onClick={() => setTimeRange(range)}
								className={cn(
									"tab-item px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px]",
									timeRange === range && "tab-item-active"
								)}
							>
								{range}
							</button>
						))}
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
				<div className="space-y-12 pb-20">
					{/* Section 1: Key Stats Bar */}
					<section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
						{[
							{
								label: "Sessions",
								value: filteredStats.sessions,
								sub: "In this period",
							},
							{
								label: "Total Sets",
								value: filteredStats.sets.toLocaleString(),
								sub: "In this period",
							},
							{
								label: "Total Volume",
								value: `${filteredStats.volume.toLocaleString()} kg`,
								sub: "In this period",
							},
							{
								label: "Best Session",
								value: `${data.bestSession?.totalVolume.toLocaleString() || 0} kg`,
								sub: "All time peak",
							},
						].map((stat, i) => (
							<GlassCard key={i} className="p-4 border-white/5">
								<p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">
									{stat.label}
								</p>
								<p className="text-xl font-black text-foreground">
									{stat.value}
								</p>
								<p className="text-[9px] font-bold text-foreground/10 uppercase tracking-widest mt-0.5">
									{stat.sub}
								</p>
							</GlassCard>
						))}
					</section>

					{/* Section 2: Volume Over Time */}
					<section className="space-y-6">
						<h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
							<TrendingUp className="w-5 h-5 text-brand-primary" />
							Volume Over Time
						</h2>
						<GlassCard className="p-6">
							<VolumeOverTimeChart data={filteredWeeklyVolume} />
						</GlassCard>
					</section>

					{/* Section 3: Training Frequency Heatmap */}
					<section className="space-y-6">
						<h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
							<Calendar className="w-5 h-5 text-brand-primary" />
							Training Frequency — {timeRangeLabel}
						</h2>
						<GlassCard className="p-6">
							<MuscleHeatmap
								dates={data.heatmapDates}
								muscleGroup={data.muscleGroup}
								timeRange={timeRange}
							/>
						</GlassCard>
					</section>


					{/* Section 4: Strength Leaderboard */}
					<section className="space-y-6">
						<h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
							<Trophy className="w-5 h-5 text-brand-primary" />
							Strength Leaderboard
						</h2>
						<StrengthLeaderboard exercises={data.exercises} />
					</section>

					{/* Section 5: Rep Range Distribution */}
					<section className="space-y-6">
						<h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
							<LayoutGrid className="w-5 h-5 text-brand-primary" />
							How You Train {data.muscleGroup}
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<GlassCard className="p-6 flex items-center justify-center relative">
								<RepRangeDonut distribution={data.repRangeDistribution} />
							</GlassCard>
							<GlassCard className="p-6 flex flex-col justify-center">
								<h3 className="text-sm font-black text-foreground/40 uppercase tracking-[0.2em] mb-4">
									Interpretation
								</h3>
								<p className="text-lg font-bold text-foreground leading-relaxed italic">
									&quot;{data.repRangeDistribution.interpretation}&quot;
								</p>
							</GlassCard>
						</div>
					</section>

					{/* Section 6: Best Session Card */}
					{data.bestSession && (
						<section className="space-y-6">
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
								<Star className="w-5 h-5 text-brand-primary" />
								Best Session Ever
							</h2>
							<GlassCard className="p-6 relative group overflow-hidden">
								<Trophy className="absolute -top-4 -right-4 w-24 h-24 text-brand-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
									<div className="space-y-1">
										<p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
											{format(parseISO(data.bestSession.date), "MMMM d, yyyy")}
										</p>
										<h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
											{data.bestSession.workoutName}
										</h3>
									</div>
									<div className="flex items-center gap-8">
										<div className="text-right">
											<p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">
												Volume
											</p>
											<p className="text-xl font-black text-foreground">
												{data.bestSession.totalVolume.toLocaleString()} kg
											</p>
										</div>
										<div className="text-right">
											<p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">
												Sets
											</p>
											<p className="text-xl font-black text-foreground">
												{data.bestSession.totalSets}
											</p>
										</div>
										<div className="text-right">
											<p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">
												Exercises
											</p>
											<p className="text-xl font-black text-foreground">
												{data.bestSession.exerciseCount}
											</p>
										</div>
									</div>
								</div>
							</GlassCard>
						</section>
					)}

					{/* Section 7: Exercise Deep-Dive Cards */}
					<section className="space-y-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
								<ListFilter className="w-5 h-5 text-brand-primary" />
								All {data.muscleGroup} Exercises
							</h2>

							<div className="group-tabs no-scrollbar self-start md:self-auto max-w-full">
								{["Most Recent", "Most Sets", "Highest PR", "Highest 1RM"].map(
									(s) => (
										<button
											key={s}
											onClick={() => setSortBy(s)}
											className={cn(
												"tab-item px-2 md:px-3 py-1.5 rounded-lg text-[8px] md:text-[9px] whitespace-nowrap",
												sortBy === s && "tab-item-active"
											)}>
											{s}
										</button>
									),
								)}
							</div>
						</div>

						<div className="space-y-4">
							{sortedExercises.map((ex) => (
								<ExerciseDetailCard
									key={ex.exerciseName}
									exercise={ex}
									isOpen={openExercise === ex.exerciseName}
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
