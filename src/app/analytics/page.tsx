import {
	getBodyWeightTrend,
	getRecentPRs,
	getUserExercises,
	getMostImprovedExercise,
	getWeeklyVolumeComparison,
} from "@/app/actions/analytics";
import { getWorkoutHistory } from "@/app/actions/logs";
import { WorkoutLog } from "@/types/workout";
import WeightTrendChart from "@/components/WeightTrendChart";
import { Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { Header } from "@/components/Header";
import { AnalyticsTabs } from "@/components/analytics/AnalyticsTabs";
import ExerciseProgressSection from "@/components/ExerciseProgressSection";
import { PRCard } from "@/components/ui/PRCard";
import { WorkoutHistoryItem } from "@/components/ui/WorkoutHistoryItem";
import { EmptyState } from "@/components/ui/EmptyState";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import {
	AnalyticsSidebar,
	AnalyticsMobileStrip,
} from "@/components/sidebar/AnalyticsSidebar";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
	const session = await getServerSession(authOptions);
	const userId = (session?.user as any)?.id;

	const [weightTrend, prs, userExercises, allLogs, mostImproved, weeklyVolume] =
		await Promise.all([
			getBodyWeightTrend(),
			getRecentPRs(),
			getUserExercises(),
			getWorkoutHistory(),
			userId ? getMostImprovedExercise(userId) : Promise.resolve(null),
			userId
				? getWeeklyVolumeComparison(userId)
				: Promise.resolve({
						thisWeekVolume: 0,
						lastWeekVolume: 0,
						differenceKg: 0,
						differencePercent: 0,
						trendDirection: "neutral" as const,
					}),
		]);

	const recentHistory = (allLogs || [])
		.filter((log: WorkoutLog) => log.exercises && log.exercises.length > 0)
		.slice(0, 3)
		.map((log: WorkoutLog) => ({
			id: log.id,
			date:
				typeof log.date === "string"
					? log.date
					: (log.date as Date).toISOString(),
			exercisesCount: log.exercises.length,
			name: log.name || log.splitName || "Workout Session",
		}));

	return (
		<div className="flex flex-col">
			<Header title="Analytics" subtitle="Insights & Progress" />

			<main className="px-6 pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<PageWithSidebar
					sidebar={
						<AnalyticsSidebar
							mostImproved={mostImproved}
							weeklyVolume={weeklyVolume}
						/>
					}
					mobileWidgets={
						<AnalyticsMobileStrip
							mostImproved={mostImproved}
							weeklyVolume={weeklyVolume}
						/>
					}>
					<div className="space-y-8">
						<AnalyticsTabs />
						<section className="space-y-4">
							<WeightTrendChart data={weightTrend as any} />
						</section>

						<ExerciseProgressSection exercises={userExercises} />

						<section className="space-y-4">
							<div className="flex justify-between items-end">
								<h2 className="text-lg font-bold text-foreground tracking-tight">
									Personal Records
								</h2>
								<Link
									href="#"
									className="text-xs font-bold text-orange-500 hover:underline">
									View All
								</Link>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{prs.length > 0 ? (
									prs.map((pr, idx) => (
										<PRCard
											key={idx}
											name={pr.name}
											weight={pr.weight}
											date={pr.date}
											increment={pr.increment}
										/>
									))
								) : (
									<div className="col-span-3">
										<EmptyState
											icon={<Trophy className="w-8 h-8" />}
											title="No PRs Yet"
											description="Keep recording your workouts to see your Personal Records here!"
										/>
									</div>
								)}
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="text-lg font-bold text-foreground tracking-tight">
								Recent History
							</h2>
							<div className="space-y-3 flex flex-col gap-3">
								{recentHistory.length > 0 ? (
									recentHistory.map((history) => (
										<WorkoutHistoryItem
											key={history.id}
											id={history.id}
											date={history.date}
											name={history.name}
											exercisesCount={history.exercisesCount}
											href={`/workouts?date=${history.date.split("T")[0]}`}
										/>
									))
								) : (
									<EmptyState
										icon={<Calendar className="w-8 h-8" />}
										title="No History"
										description="No recent workouts logged."
									/>
								)}
							</div>
						</section>
					</div>
				</PageWithSidebar>
			</main>
		</div>
	);
}
