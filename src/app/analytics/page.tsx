import {
	getBodyWeightTrend,
	getRecentPRs,
	getUserExercises,
} from "@/app/actions/analytics";
import { getWorkoutHistory } from "@/app/actions/logs";
import { WorkoutLog } from "@/types/workout";
import WeightTrendChart from "@/components/WeightTrendChart";
import { Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Header } from "@/components/Header";
import ExerciseProgressSection from "@/components/ExerciseProgressSection";
import { PRCard } from "@/components/ui/PRCard";
import { WorkoutHistoryItem } from "@/components/ui/WorkoutHistoryItem";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
	const weightTrend = await getBodyWeightTrend();
	const prs = await getRecentPRs();
	const userExercises = await getUserExercises();

	const allLogs = await getWorkoutHistory();
	const recentHistory = allLogs
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

			<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-12">
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
			</main>
		</div>
	);
}
