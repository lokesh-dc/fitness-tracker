import { getWorkoutByDate, getExercisePRStatus } from "@/app/actions/logs";
import {
	getMostTrainedMuscleGroups,
	getMonthlyVolumeTrend,
	getMissedWorkoutsThisMonth,
} from "@/app/actions/analytics";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import { Header } from "@/components/Header";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { format } from "date-fns";
import {
	Trophy,
	Activity,
	Info,
	Plus,
	Edit2,
	Scale,
	Timer,
	ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteWorkoutButton } from "@/components/DeleteWorkoutButton";
import { cn } from "@/lib/utils";
import {
	HistorySidebar,
} from "@/components/sidebar/HistorySidebar";

export const dynamic = "force-dynamic";

function SectionHeading({
	index,
	title,
	action,
}: {
	index: string;
	title: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<h2 className="flex items-baseline gap-3 text-lg font-bold tracking-tight text-foreground md:text-xl">
				<span className="text-[10px] font-bold tabular-nums tracking-[0.2em] text-foreground/30">
					{index}
				</span>
				{title}
			</h2>
			{action && <div className="flex items-center gap-2">{action}</div>}
		</div>
	);
}

export default async function WorkoutsPage({
	searchParams,
}: {
	searchParams: Promise<{ date?: string }>;
}) {
	const resolvedParams = await searchParams;

	const targetDateStr =
		resolvedParams.date || format(new Date(), "yyyy-MM-dd");

	const session = await getServerSession(authOptions);
	const userId = (session?.user as { id?: string } | undefined)?.id;

	const [log, muscleGroups, volumeTrend, missedWorkouts] = await Promise.all([
		getWorkoutByDate(targetDateStr),
		userId ? getMostTrainedMuscleGroups(userId) : Promise.resolve([]),
		userId
			? getMonthlyVolumeTrend(userId)
			: Promise.resolve({ months: [], trendPercent: null }),
		userId
			? getMissedWorkoutsThisMonth(userId)
			: Promise.resolve({
					sessionsLogged: 0,
					sessionsPlanned: 0,
					sessionsMissed: 0,
					completionPercent: 0,
					hasActivePlan: false,
				}),
	]);

	const prStatus =
		log && userId
			? await getExercisePRStatus(log.exercises || [], log.date, userId)
			: {};

	const exercises = log?.exercises || [];
	const totalPRs = exercises.reduce(
		(acc, ex) => (prStatus[ex.name]?.isPR ? acc + 1 : acc),
		0,
	);
	const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0);

	const heroDate = new Date(`${targetDateStr}T00:00:00`);

	return (
		<div className="flex flex-col min-h-screen">
			<Header title="Workout History" subtitle="Your journey, day by day" />

			<main className="flex-1 px-4 md:px-6 w-full pb-32">
				<PageWithSidebar
					sidebar={
						<HistorySidebar
							muscleGroups={muscleGroups}
							volumeTrend={volumeTrend}
							missedWorkouts={missedWorkouts}
						/>
					}
				>
					<div className="space-y-10">
						<section className="space-y-5">
							<span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.02] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
								<span className="h-1 w-1 rounded-full bg-brand-primary" />
								Session history
							</span>

							<h1 className="text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-foreground md:text-5xl">
								{format(heroDate, "EEEE, MMM d")}
							</h1>

							<p className="max-w-[46ch] text-sm leading-relaxed text-foreground/55 md:text-[15px]">
								Every set, weight, and record broken on this day.
							</p>
						</section>

						<WeeklyCalendar selectedDateStr={targetDateStr} />

						{!log ? (
							<EmptyState
								icon={<Info className="w-8 h-8" />}
								title="No Workouts"
								description="No exercises were logged on this date."
								action={
									<Link
										href={`/workout?date=${targetDateStr}&mode=MANUAL_LOG`}
										className="flex items-center space-x-2 px-8 py-4 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(249,115,22,0.3)]">
										<Plus className="w-4 h-4" />
										<span>Log Workout</span>
									</Link>
								}
							/>
						) : (
							<div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
								{/* Metric strip */}
								<div className="overflow-hidden rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02]">
									<div className="grid grid-cols-3 divide-x divide-foreground/[0.08]">
										<div className="px-5 py-6 md:px-8">
											<Activity className="h-4 w-4 text-brand-primary" />
											<p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-foreground md:text-3xl">
												{exercises.length}
											</p>
											<p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
												Exercises
											</p>
										</div>
										<div className="px-5 py-6 md:px-8">
											<Trophy className="h-4 w-4 text-brand-primary" />
											<p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-foreground md:text-3xl">
												{totalPRs.toLocaleString()}
											</p>
											<p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
												PRs set
											</p>
										</div>
										<div className="px-5 py-6 md:px-8">
											{log.bodyWeight ? (
												<>
													<Scale className="h-4 w-4 text-brand-primary" />
													<p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-foreground md:text-3xl">
														{log.bodyWeight}
														<span className="text-sm font-bold text-foreground/40"> kg</span>
													</p>
													<p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
														Body weight
													</p>
												</>
											) : (
												<>
													<Timer className="h-4 w-4 text-brand-primary" />
													<p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-foreground md:text-3xl">
														{totalSets}
													</p>
													<p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
														Sets logged
													</p>
												</>
											)}
										</div>
									</div>
								</div>

								{/* Session breakdown */}
								<section className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
									<SectionHeading
										index="01"
										title="Session breakdown"
										action={
											<>
												<Link
													href={`/workout?date=${targetDateStr}&mode=MANUAL_LOG`}
													className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/50 transition-all hover:border-brand-primary/40 hover:text-brand-primary">
													<Edit2 className="h-3 w-3" />
													Edit session
												</Link>
												<DeleteWorkoutButton logId={log.id} />
											</>
										}
									/>

									{exercises.length === 0 ? (
										<div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-foreground/10 px-6 py-14 text-center">
											<p className="text-sm font-medium text-foreground/40">
												No exercises logged for this day.
											</p>
										</div>
									) : (
										<div className="space-y-5">
											{exercises.map((ex, idx) => {
												const pr = prStatus[ex.name];
												const maxWeight = ex.sets?.length
													? Math.max(...ex.sets.map((s) => s.weight))
													: 0;
												return (
													<div
														key={ex.exerciseId || idx}
														className={cn(
															"overflow-hidden rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02] transition-colors",
															pr?.isPR && "border-brand-primary/25",
															ex.isSkipped && "opacity-60",
														)}>
														<div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
															<div className="flex items-center gap-3">
																<span className="text-[10px] font-bold tabular-nums tracking-[0.2em] text-foreground/30">
																	{(idx + 1).toString().padStart(2, "0")}
																</span>
																<h4 className="text-base font-bold tracking-tight text-foreground">
																	{ex.name}
																	{ex.isSkipped && (
																		<span className="ml-2 rounded-md bg-foreground/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-foreground/50">
																			Skipped
																		</span>
																	)}
																</h4>
															</div>

															<div className="flex flex-wrap items-center gap-3">
																{!ex.isSkipped && pr?.isPR ? (
																	<div className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black">
																		<Trophy className="h-3 w-3" />
																		<span>PR {pr.weight}kg</span>
																	</div>
																) : !ex.isSkipped && maxWeight > 0 ? (
																	<span className="text-[11px] font-semibold text-foreground/40">
																		Top set {maxWeight}kg
																	</span>
																) : null}

																{!ex.isSkipped && (
																	<Link
																		href={`/analytics/exercise-timeline?exercise=${encodeURIComponent(ex.name)}`}
																		className="group inline-flex items-center gap-1 rounded-lg border border-foreground/[0.08] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/40 transition-all hover:border-brand-primary/40 hover:text-brand-primary">
																		Full timeline
																		<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
																	</Link>
																)}
															</div>
														</div>

														{!ex.isSkipped && ex.sets?.length ? (
															<div className="border-t border-foreground/[0.06] px-4 py-3 md:px-5">
																<div className="grid grid-cols-12 gap-2 px-2 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground/30">
																	<div className="col-span-2">Set</div>
																	<div className="col-span-5 text-center">Weight</div>
																	<div className="col-span-5 text-center">Reps</div>
																</div>
																<div className="space-y-1.5">
																	{ex.sets.map((set, setIdx) => (
																		<div
																			key={setIdx}
																			className="grid grid-cols-12 gap-2 items-center rounded-xl px-2 py-2.5 transition-colors hover:bg-foreground/[0.03]">
																			<div className="col-span-2 text-xs font-bold text-foreground/50">
																				{setIdx + 1}
																			</div>
																			<div className="col-span-5 text-center text-sm font-extrabold tabular-nums text-foreground font-mono">
																				{set.weight}
																				<span className="pl-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/30">
																					kg
																				</span>
																			</div>
																			<div className="col-span-5 text-center text-sm font-extrabold tabular-nums text-foreground font-mono">
																				{set.reps}
																				<span className="pl-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/30">
																					reps
																				</span>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														) : null}
													</div>
												);
											})}
										</div>
									)}
								</section>
							</div>
						)}
					</div>
				</PageWithSidebar>
			</main>
		</div>
	);
}