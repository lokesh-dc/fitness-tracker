import { getBodyWeightTrend, getRecentPRs, getUserExercises } from "@/app/actions/analytics";
import { getWorkoutHistory } from "@/app/actions/logs";
import WeightTrendChart from "@/components/WeightTrendChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Trophy, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Header } from "@/components/Header";
import ExerciseProgressSection from "@/components/ExerciseProgressSection";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
	const weightTrend = await getBodyWeightTrend();
	const prs = await getRecentPRs();
	const userExercises = await getUserExercises();
	
	const allLogs = await getWorkoutHistory();
	const recentHistory = allLogs
		.filter((log) => log.exercises && log.exercises.length > 0)
		.slice(0, 3)
		.map((log) => ({
			id: log.id,
			date: typeof log.date === "string" ? log.date : (log.date as Date).toISOString(),
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
						{prs.length > 0 ? prs.map((pr, idx) => (
							<GlassCard key={idx} className="relative overflow-hidden group">
								<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
									<Trophy className="w-12 h-12 text-orange-500" />
								</div>
								<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">
									{pr.name}
								</p>
								<div className="flex items-baseline space-x-1 mb-2">
									<span className="text-2xl font-black text-foreground">
										{pr.weight}
									</span>
									<span className="text-[10px] font-bold text-foreground/40 uppercase">
										KG
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center text-[10px] font-medium text-foreground/40">
										<Calendar className="w-3 h-3 mr-1" />
										{format(new Date(pr.date), "d MMM")}
									</div>
									{pr.increment > 0 && (
										<div className="flex items-center text-[10px] font-bold text-emerald-500 dark:text-emerald-400">
											<TrendingUp className="w-3 h-3 mr-1" />
											+{pr.increment}kg
										</div>
									)}
								</div>
							</GlassCard>
						)) : (
							<div className="col-span-3 text-center py-8">
								<p className="text-foreground/40 text-sm font-medium">Keep recording your workouts to see your PRs here!</p>
							</div>
						)}
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="text-lg font-bold text-foreground tracking-tight">
						Recent History
					</h2>
					<div className="space-y-3 flex flex-col gap-3">
						{recentHistory.length > 0 ? recentHistory.map((history) => (
							<Link key={history.id} href={`/workouts?date=${history.date.split("T")[0]}`} className="contents">
								<GlassCard
									className="flex items-center justify-between group cursor-pointer">
									<div className="flex items-center space-x-4">
										<div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
											<Calendar className="w-5 h-5 text-foreground/40" />
										</div>
										<div>
											<h3 className="text-lg font-bold text-foreground">
												{history.name}
											</h3>
											<p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
												{format(new Date(history.date), "MMMM d, yyyy")} • {history.exercisesCount} Exercises
											</p>
										</div>
									</div>
									<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
								</GlassCard>
							</Link>
						)) : (
							<div className="text-center py-8">
								<p className="text-foreground/40 text-sm font-medium">No recent workouts logged.</p>
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
