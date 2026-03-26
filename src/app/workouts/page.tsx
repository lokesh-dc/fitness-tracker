import { getWorkoutByDate } from "@/app/actions/logs";
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
import { GlassCard } from "@/components/ui/GlassCard";
import { format } from "date-fns";
import { Trophy, Activity, Calendar, Info, Plus, Edit2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
	HistoryMobileStrip,
	HistorySidebar,
} from "@/components/sidebar/HistorySidebar";

export const dynamic = "force-dynamic";

export default async function WorkoutsPage({
	searchParams,
}: {
	searchParams: { date?: string };
}) {
	// Await the entire searchParams object to satisfy Next.js 16 requirements for dynamic resolution
	const resolvedParams = await searchParams;

	// Default to today if no date is provided
	const targetDateStr = resolvedParams.date || format(new Date(), "yyyy-MM-dd");

	const session = await getServerSession(authOptions);
	const userId = (session?.user as any)?.id;

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

	const totalPRs =
		log?.exercises?.reduce((acc, ex) => {
			return (
				acc +
				((ex as { pr?: number }).pr && (ex as { pr?: number }).pr! > 0 ? 1 : 0)
			);
		}, 0) || 0;

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
					// mobileWidgets={
					// 	<HistoryMobileStrip
					// 		muscleGroups={muscleGroups}
					// 		volumeTrend={volumeTrend}
					// 		missedWorkouts={missedWorkouts}
					// 	/>
					// }
				>
					<div className="space-y-6">
						{/* Weekly Calendar Navigation */}
						<WeeklyCalendar selectedDateStr={targetDateStr} />

						{!log ? (
							<EmptyState
								icon={<Info className="w-8 h-8" />}
								title="No Workouts"
								description="No exercises were logged on this date."
								action={
									<Link
										href={`/workout?date=${targetDateStr}&mode=MANUAL_LOG`}
										className="flex items-center space-x-2 px-8 py-4 bg-orange-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(249,115,22,0.3)]">
										<Plus className="w-4 h-4" />
										<span>Log Workout</span>
									</Link>
								}
							/>
						) : (
							<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
								{/* Summary Details */}
								<div className="grid grid-cols-2 gap-4">
									<GlassCard className="p-4 flex items-center space-x-4 border-foreground/5 bg-foreground/[0.02]">
										<div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
											<Activity className="w-5 h-5 text-orange-500" />
										</div>
										<div>
											<p className="text-[10px] uppercase tracking-widest font-black text-foreground/40">
												Exercises
											</p>
											<p className="text-xl font-black text-foreground">
												{log.exercises?.length || 0}
											</p>
										</div>
									</GlassCard>

									<GlassCard className="p-4 flex items-center space-x-4 border-foreground/5 bg-foreground/[0.02]">
										<div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
											<Trophy className="w-5 h-5 text-orange-500" />
										</div>
										<div>
											<p className="text-[10px] uppercase tracking-widest font-black text-foreground/40">
												PRs Broken
											</p>
											<p className="text-xl font-black text-foreground">
												{totalPRs.toLocaleString()}
											</p>
										</div>
									</GlassCard>
								</div>

								{log.bodyWeight && (
									<GlassCard className="p-4 flex items-center justify-between border-foreground/5 bg-foreground/[0.02]">
										<span className="text-sm font-bold text-foreground/60 uppercase tracking-widest">
											Recorded Body Weight
										</span>
										<span className="text-xl font-black text-foreground">
											{log.bodyWeight}{" "}
											<span className="text-sm font-bold text-foreground/40">
												kg
											</span>
										</span>
									</GlassCard>
								)}

								{/* Exercises List */}
								<div className="space-y-4 pt-4 border-t border-foreground/10">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center">
											<Calendar className="w-4 h-4 text-orange-500 mr-2" />{" "}
											Session Breakdown
										</h3>
										<Link
											href={`/workout?date=${targetDateStr}&mode=MANUAL_LOG`}
											className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-orange-500/10 hover:text-orange-500 transition-all text-[10px] font-black uppercase tracking-widest text-foreground/40">
											<Edit2 className="w-3 h-3" />
											<span>Edit Session</span>
										</Link>
									</div>

									{log.exercises?.length === 0 ? (
										<div className="text-center py-10 opacity-50">
											<p className="text-sm italic text-foreground/60">
												No exercises logged for this day.
											</p>
										</div>
									) : (
										log.exercises?.map((ex, idx) => (
											<GlassCard
												key={idx}
												className="overflow-hidden border-foreground/5">
												<div className="bg-foreground/[0.03] p-4 flex justify-between items-center border-b border-foreground/5">
													<div className="flex items-center space-x-3">
														<span className="text-sm font-black text-orange-500/50">
															{(idx + 1).toString().padStart(2, "0")}
														</span>
														<h4 className="text-base font-bold text-foreground tracking-tight">
															{ex.name}
														</h4>
													</div>
													{(ex as { pr?: number }).pr &&
													(ex as { pr?: number }).pr! > 0 ? (
														<div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] font-black tracking-widest text-orange-500 uppercase">
															<Trophy className="w-3 h-3" />
															<span>PR {(ex as { pr?: number }).pr}</span>
														</div>
													) : null}
												</div>

												<div className="p-4">
													<div className="grid grid-cols-12 gap-2 text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] px-2 mb-3">
														<div className="col-span-2">Set</div>
														<div className="col-span-5 text-center">Weight</div>
														<div className="col-span-5 text-center">Reps</div>
													</div>

													<div className="space-y-2">
														{ex.sets?.map((set, setIdx) => (
															<div
																key={setIdx}
																className="grid grid-cols-12 gap-2 items-center bg-background/30 rounded-xl p-3 transition-colors glass-card">
																<div className="col-span-2 text-xs font-bold text-foreground/50">
																	{setIdx + 1}
																</div>
																<div className="col-span-5 text-center text-sm font-black text-foreground font-mono">
																	{set.weight}{" "}
																	<span className="text-[10px] text-foreground/30 uppercase tracking-widest pl-1">
																		kg
																	</span>
																</div>
																<div className="col-span-5 text-center text-sm font-black text-foreground font-mono">
																	{set.reps}{" "}
																	<span className="text-[10px] text-foreground/30 uppercase tracking-widest pl-1">
																		reps
																	</span>
																</div>
															</div>
														))}
													</div>
												</div>
											</GlassCard>
										))
									)}
								</div>
							</div>
						)}
					</div>
				</PageWithSidebar>
			</main>
		</div>
	);
}
