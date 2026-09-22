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
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format, parseISO } from "date-fns";
import type { WeightTrendData } from "@/types/workout";

import { Header } from "@/components/Header";
import { AnalyticsTabs } from "@/components/analytics/AnalyticsTabs";
import ExerciseProgressSection from "@/components/ExerciseProgressSection";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import {
	AnalyticsSidebar,
	AnalyticsMobileStrip,
} from "@/components/sidebar/AnalyticsSidebar";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function thirtyDayCutoff(): number {
	return Date.now() - 30 * DAY_MS;
}

function fmtKg(n: number): string {
	return String(Math.round(n * 10) / 10);
}

function SectionHeading({
	index,
	title,
	meta,
}: {
	index: string;
	title: string;
	meta?: string;
}) {
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-4">
			<h2 className="flex items-baseline gap-3 text-lg font-bold tracking-tight text-foreground md:text-xl">
				<span className="text-[10px] font-bold tabular-nums tracking-[0.2em] text-foreground/30">
					{index}
				</span>
				{title}
			</h2>
			{meta && (
				<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
					{meta}
				</p>
			)}
		</div>
	);
}

interface HeroProps {
	latestWeight: WeightTrendData | null;
	weightDelta: number | null;
	prCount: number;
	exerciseCount: number;
	latestPR: { name: string; weight: number; date: string; increment: number } | null;
}

function Hero({
	latestWeight,
	weightDelta,
	prCount,
	exerciseCount,
	latestPR,
}: HeroProps) {
	return (
		<section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
			<div className="flex flex-col justify-between gap-10">
				<div className="space-y-5">
					<span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.02] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
						<span className="h-1 w-1 rounded-full bg-brand-primary" />
						Overview
					</span>

					<h1 className="text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl md:text-6xl">
						Where your training
						<br />
						<span className="text-brand-primary">stands right now.</span>
					</h1>

					<p className="max-w-[46ch] text-sm leading-relaxed text-foreground/55 md:text-[15px]">
						Body weight, records, and volume — the numbers that show whether
						the work is actually working.
					</p>
				</div>

				<div className="flex items-stretch divide-x divide-foreground/[0.08]">
					<div className="pr-6">
						<p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
							{latestWeight ? fmtKg(latestWeight.bodyWeight) : "—"}
						</p>
						<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/40">
							body weight
						</p>
						{weightDelta !== null && (
							<p className="mt-1.5 text-[10px] font-semibold tabular-nums text-foreground/45">
								{weightDelta > 0 ? "+" : ""}
								{fmtKg(weightDelta)} kg / 30d
							</p>
						)}
					</div>
					<div className="px-6">
						<p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
							{prCount}
						</p>
						<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/40">
							records
						</p>
					</div>
					<div className="pl-6">
						<p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
							{exerciseCount}
						</p>
						<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/40">
							lifts tracked
						</p>
					</div>
				</div>
			</div>

			<div className="relative flex flex-col justify-between gap-9 overflow-hidden rounded-[1.75rem] border border-foreground/[0.07] bg-gradient-to-b from-foreground/[0.03] to-transparent p-6 md:p-7">
				<div
					aria-hidden
					className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-primary/15 blur-3xl"
				/>

				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
						Latest record
					</p>
					{latestPR ? (
						<>
							<h2 className="mt-3 truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">
								{latestPR.name}
							</h2>
							<div className="mt-3 flex items-baseline gap-2">
								<span className="text-5xl font-extrabold tabular-nums tracking-tighter text-foreground md:text-6xl">
									{fmtKg(latestPR.weight)}
								</span>
								<span className="text-sm font-medium text-foreground/45">kg</span>
							</div>
							{latestPR.increment > 0 && (
								<span className="mt-3 inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold tabular-nums text-emerald-500">
									+{fmtKg(latestPR.increment)} kg over previous best
								</span>
							)}
						</>
					) : (
						<>
							<p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
								No records yet
							</p>
							<p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-foreground/50">
								Your heaviest set per lift gets recorded the first time you
								log one.
							</p>
						</>
					)}
				</div>

				<div className="border-t border-foreground/[0.06] pt-5 text-[11px] font-medium text-foreground/40">
					{latestPR ? (
						<>
							Set on{" "}
							<span className="font-semibold text-foreground/70">
								{format(new Date(latestPR.date), "MMMM d, yyyy")}
							</span>
							{latestPR.increment > 0 && (
								<> · +{fmtKg(latestPR.increment)}kg for the period</>
							)}
						</>
					) : (
						"Start with a single weighted set."
					)}
				</div>
			</div>
		</section>
	);
}

export default async function AnalyticsPage() {
	const session = await getServerSession(authOptions);
	const userId = (session?.user as { id?: string } | undefined)?.id;

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

	const weightSeries = [...(weightTrend || [])].sort((a, b) =>
		a.date.localeCompare(b.date),
	);
	const latestWeight = weightSeries[weightSeries.length - 1] ?? null;
	const refWeight = weightSeries.find(
		(d) => parseISO(d.date).getTime() >= thirtyDayCutoff(),
	);
	const weightDelta =
		latestWeight && refWeight && refWeight.id !== latestWeight.id
			? latestWeight.bodyWeight - refWeight.bodyWeight
			: null;

	const latestPR = prs[0] ?? null;
	const prCount = prs.length;
	const exerciseCount = (userExercises || []).length;

	return (
		<div className="flex flex-col">
			<Header title="Analytics" subtitle="Where your training stands" />

			<main className="flex-1 px-6 w-full pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<div className="mx-auto w-full space-y-14">
					<AnalyticsTabs />

					<Hero
						latestWeight={latestWeight}
						weightDelta={weightDelta}
						prCount={prCount}
						exerciseCount={exerciseCount}
						latestPR={latestPR}
					/>

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
						<section
							className="animate-in fade-in slide-in-from-bottom-4 duration-500"
							style={{ animationDelay: "80ms" }}>
							<SectionHeading index="01" title="Body weight" />
							<div className="mt-4">
								<WeightTrendChart data={weightTrend as WeightTrendData[]} />
							</div>
						</section>

						<section
							className="animate-in fade-in slide-in-from-bottom-4 duration-500"
							style={{ animationDelay: "140ms" }}>
							<SectionHeading index="02" title="Exercise progress" />
							<div className="mt-4">
								<ExerciseProgressSection exercises={userExercises} />
							</div>
						</section>

						<section
							className="animate-in fade-in slide-in-from-bottom-4 duration-500"
							style={{ animationDelay: "200ms" }}>
							<SectionHeading
								index="03"
								title="Records"
								meta={`${prCount} all-time`}
							/>
							{prCount > 0 ? (
								<div className="mt-4 overflow-hidden rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02]">
									{prs.map((pr, idx) => (
										<Link
											key={`${pr.name}-${idx}`}
											href={`/analytics/exercise-timeline?exercise=${encodeURIComponent(pr.name)}`}
											className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-foreground/[0.03] md:px-6">
											<div className="min-w-0 flex-1">
												<p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
													{pr.name}
												</p>
												<p className="mt-0.5 text-[11px] font-medium text-foreground/40">
													{format(new Date(pr.date), "MMMM d, yyyy")}
												</p>
											</div>

											{pr.increment > 0 && (
												<span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold tabular-nums text-emerald-500">
													+{fmtKg(pr.increment)} kg
												</span>
											)}

											<div className="shrink-0 text-right">
												<p className="text-lg font-extrabold tabular-nums tracking-tight text-foreground">
													{fmtKg(pr.weight)}
												</p>
												<p className="text-[9px] font-semibold uppercase tracking-widest text-foreground/30">
													kg
												</p>
											</div>

											<ChevronRight className="h-4 w-4 shrink-0 text-foreground/25 transition-colors group-hover:text-foreground/60" />
										</Link>
									))}
								</div>
							) : (
								<div className="mt-4 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-foreground/10 bg-foreground/[0.015] px-6 py-14 text-center">
									<p className="text-base font-bold tracking-tight text-foreground">
										No records yet
									</p>
									<p className="mt-1 max-w-[40ch] text-sm leading-relaxed text-foreground/55">
										Log your heaviest set for any lift and it gets recorded
										here.
									</p>
								</div>
							)}
						</section>

						<section
							className="animate-in fade-in slide-in-from-bottom-4 duration-500"
							style={{ animationDelay: "260ms" }}>
							<SectionHeading index="04" title="Recent history" />
							{recentHistory.length > 0 ? (
								<div className="mt-4 overflow-hidden rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02]">
									{recentHistory.map((history) => (
										<Link
											key={history.id}
											href={`/workouts?date=${history.date.split("T")[0]}`}
											className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-foreground/[0.03] md:px-6">
											<div className="min-w-0 flex-1">
												<p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
													{history.name}
												</p>
												<p className="mt-0.5 text-[11px] font-medium text-foreground/40">
													{format(new Date(history.date), "MMMM d, yyyy")}
												</p>
											</div>
											<span className="shrink-0 text-[11px] font-semibold tabular-nums text-foreground/40">
												{history.exercisesCount} exercise
												{history.exercisesCount === 1 ? "" : "s"}
											</span>
											<ChevronRight className="h-4 w-4 shrink-0 text-foreground/25 transition-colors group-hover:text-foreground/60" />
										</Link>
									))}
								</div>
							) : (
								<div className="mt-4 flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-foreground/10 bg-foreground/[0.015] px-6 py-14 text-center">
									<p className="text-base font-bold tracking-tight text-foreground">
										Nothing logged yet
									</p>
									<p className="mt-1 max-w-[40ch] text-sm leading-relaxed text-foreground/55">
										Your most recent sessions will line up here once you start
										logging.
									</p>
								</div>
							)}
						</section>
					</PageWithSidebar>
				</div>
			</main>
		</div>
	);
}