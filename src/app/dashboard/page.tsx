import { getPlanByDate, getActivePlanInfo } from "../actions/plan";
import { getTodayWorkoutLog, getThisWeekWeightData } from "../actions/logs";
import { WeightTimelineWidget } from "@/components/dashboard/WeightTimelineWidget";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkoutListItem } from "@/components/ui/WorkoutListItem";
import { GlassCard } from "@/components/ui/GlassCard";
import {
	Plus,
	ChevronRight,
	Coffee,
	Trophy,
	CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Header } from "@/components/Header";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import { HomeSidebar } from "@/components/sidebar/HomeSidebar";
import { MobileWidgetStrip } from "@/components/sidebar/MobileWidgetStrip";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import {
	getStreakData,
	getMonthWorkoutDates,
	getWeekSnapshot,
	getNextPlannedWorkout,
	getTomorrowPlanDetail,
} from "@/app/actions/analytics";
import { getOnboardingProfile } from "@/app/actions/profile";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import { TomorrowPrompt } from "@/components/dashboard/TomorrowPrompt";
import { CoolDownStretches } from "@/components/CoolDownStretches";
import { WorkoutMergePrompt } from "@/components/dashboard/WorkoutMergePrompt";
import { getYesterdayMissedWorkout } from "@/app/actions/merge";

export const dynamic = "force-dynamic";

const QUOTES = [
	"The only bad workout is the one that didn't happen.",
	"Rest and recovery are just as important as the work you put in.",
	"Your body can stand almost anything. It's your mind you have to convince.",
	"Growth happens outside your comfort zone.",
	"Strength comes from overcoming the things you once thought you couldn't.",
	"Train hard, recover harder. Growth is in the balance.",
	"It never gets easier, you just get stronger.",
	"Strive for progress, not perfection.",
];

async function getDailyQuote() {
	try {
		const res = await fetch("https://zenquotes.io/api/random", {
			next: { revalidate: 3600 },
		});
		if (!res.ok) throw new Error("Failed to fetch quote");
		const data = await res.json();
		return data[0]?.q || QUOTES[Math.floor(Math.random() * QUOTES.length)];
	} catch (error) {
		return QUOTES[Math.floor(Math.random() * QUOTES.length)];
	}
}

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/auth/signin");
	}

	const userId = (session.user as any).id;
	const userName = session?.user?.name?.split(" ")[0] || "there";

	// Fetch all data in parallel
	const [
		plan,
		activePlanInfo,
		todayWorkoutLog,
		streakData,
		monthDates,
		weekSnapshot,
		nextWorkout,
		randomQuote,
		userProfile,
		tomorrowPlan,
		yesterdayMissed,
		thisWeekWeight,
	] = await Promise.all([
		getPlanByDate().catch(() => null),
		getActivePlanInfo().catch(() => null),
		getTodayWorkoutLog().catch(() => null),
		getStreakData().catch(() => ({
			currentStreak: 0,
			longestStreak: 0,
			lastWorkoutDate: null,
		})),
		getMonthWorkoutDates(new Date().getFullYear(), new Date().getMonth()).catch(
			() => [],
		),
		getWeekSnapshot().catch(() => ({
			sessionsCompleted: 0,
			sessionsPlanned: 0,
			completedDays: [],
			plannedDays: [],
		})),
		getNextPlannedWorkout().catch(() => null),
		getDailyQuote(),
		getOnboardingProfile().catch(() => null),
		getTomorrowPlanDetail().catch(() => null),
		getYesterdayMissedWorkout().catch(() => ({
			hasMissed: false,
			splitName: "",
			exerciseCount: 0,
		})),
		getThisWeekWeightData().catch(() => ({
			days: [],
			currentWeight: null,
			startWeight: null,
			changeKg: null,
			changeDirection: null,
			loggedCountThisWeek: 0,
		})),
	]);

	const today = new Date();

	// Check if today's workout is done (has at least one exercise)
	const isTodayDone =
		todayWorkoutLog &&
		todayWorkoutLog.exercises &&
		todayWorkoutLog.exercises.length > 0;

	const showOnboardingBanner =
		userProfile?.onboardingComplete !== true &&
		userProfile?.bannerDismissed !== true;

	const isRestDay = !plan || (plan as any)?.dayOfWeek === 0;

	return (
		<div className="flex flex-col">
			<Header
				title={`Hi, ${userName}`}
				subtitle={format(today, "EEEE, d MMMM")}
			/>

			<main className="flex-1 px-4 md:px-6 pb-28 md:pb-12 w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<PageWithSidebar
					sidebar={
						<HomeSidebar
							streakData={streakData}
							monthDates={monthDates}
							weekSnapshot={weekSnapshot}
							nextWorkout={nextWorkout}
						/>
					}>
					<div className="space-y-5">
						{/* Inline stats strip — mobile only, integrated above content */}
						<div className="lg:hidden">
							<MobileWidgetStrip
								streak={streakData?.currentStreak || 0}
								workoutsThisMonth={monthDates.length}
								sessionsDone={`${weekSnapshot?.sessionsCompleted || 0}/${weekSnapshot?.sessionsPlanned || "?"}`}
								nextWorkout={nextWorkout?.name || "No Plan"}
							/>
						</div>

						{/* ── PRIMARY: Today's Workout ── */}
						<section>
							<div className="flex justify-between items-center mb-3">
								<h2 className="text-[11px] font-semibold text-foreground/40 uppercase tracking-[0.15em]">
									Today
								</h2>
								<Link
									href="/plan"
									className="text-[11px] font-medium text-brand-primary/70 hover:text-brand-primary transition-colors">
									View plan
								</Link>
							</div>

							{isTodayDone ? (
								<Link href="/workout?mode=MANUAL_LOG" className="block">
									<GlassCard className="relative overflow-hidden flex items-center justify-between group border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-transparent">
										<div className="flex items-center gap-4">
											<div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
												<CheckCircle2 className="w-5 h-5 text-emerald-500" />
											</div>
											<div>
												<p className="text-sm font-semibold text-foreground">
													Workout logged
												</p>
												<p className="text-xs text-foreground/40 mt-0.5">
													Tap to update today&apos;s log
												</p>
											</div>
										</div>
										<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 group-hover:translate-x-0.5 transition-all shrink-0" />
									</GlassCard>
								</Link>
							) : plan && (plan as any).dayOfWeek !== 0 ? (
								<Link href="/workout?mode=LIVE_SESSION" className="block">
									<WorkoutListItem
										title={`${(plan as any).splitName || `Day ${(plan as any).dayOfWeek}`} training`}
										subtitle={`Week ${(plan as any).weekNumber} · Master Plan`}
										duration={`${(plan as any).exercises.length * 10} min`}
										exercisesCount={(plan as any).exercises.length}
										active
									/>
								</Link>
							) : activePlanInfo?.isCompleted ? (
								<Link
									href={`/plan/${activePlanInfo.id}/report`}
									className="block">
									<GlassCard className="relative overflow-hidden flex items-center justify-between group border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-transparent">
										<div className="flex items-center gap-4">
											<div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
												<Trophy className="w-5 h-5 text-emerald-500" />
											</div>
											<div>
												<p className="text-sm font-semibold text-foreground">
													Cycle complete
												</p>
												<p className="text-xs text-foreground/40 mt-0.5">
													View your full report
												</p>
											</div>
										</div>
										<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 group-hover:translate-x-0.5 transition-all shrink-0" />
									</GlassCard>
								</Link>
							) : (
								<GlassCard className="flex items-center gap-4 border-foreground/5 bg-foreground/[0.02]">
									<div className="w-11 h-11 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
										{isRestDay ? (
											<Coffee className="w-5 h-5 text-foreground/30" />
										) : (
											<Plus className="w-5 h-5 text-foreground/30" />
										)}
									</div>
									<div>
										<p className="text-sm font-medium text-foreground/60">
											{isRestDay
												? "Rest day"
												: "No workout scheduled"}
										</p>
										<p className="text-xs text-foreground/30 mt-0.5">
											{isRestDay
												? "Take time to recover and stretch."
												: "Set up a plan to get started."}
										</p>
									</div>
								</GlassCard>
							)}
						</section>

						{/* ── Contextual Prompts ── */}
						{(showOnboardingBanner || yesterdayMissed?.hasMissed) && (
							<section className="space-y-3">
								{showOnboardingBanner && <OnboardingBanner />}
								{yesterdayMissed?.hasMissed && !isTodayDone && (
									<WorkoutMergePrompt
										yesterdaySplitName={yesterdayMissed.splitName}
										yesterdayExerciseCount={yesterdayMissed.exerciseCount}
									/>
								)}
							</section>
						)}

						<NotificationPrompt />

						{/* ── AI Cooldown (shown after workout) ── */}
						{todayWorkoutLog?.aiSummary && (
							<section>
								<CoolDownStretches summary={todayWorkoutLog.aiSummary} />
							</section>
						)}

						{/* ── Tomorrow preview ── */}
						<TomorrowPrompt
							tomorrowPlan={
								tomorrowPlan
									? {
											planName: tomorrowPlan.planName,
											splitName: tomorrowPlan.splitName,
											totalExercises: tomorrowPlan.totalExercises,
										}
									: null
							}
							isTodayDone={!!isTodayDone}
							isRestDay={isRestDay}
						/>

						{/* ── Daily quote — minimal, text-only ── */}
						<section className="px-1">
							<p className="text-sm leading-relaxed text-foreground/40 italic border-l-2 border-brand-primary/30 pl-4">
								{randomQuote}
							</p>
						</section>

						{/* ── Weight Timeline Widget ── */}
						<WeightTimelineWidget data={thisWeekWeight} />
					</div>
				</PageWithSidebar>
			</main>
		</div>
	);
}
