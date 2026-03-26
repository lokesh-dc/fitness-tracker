import { getPlanByDate, getActivePlanInfo } from "../actions/plan";
import { getTodayWorkoutLog } from "../actions/logs";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkoutListItem } from "@/components/ui/WorkoutListItem";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, ChevronRight, BarChart2, Quote, Coffee, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Header } from "@/components/Header";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import { HomeSidebar } from "@/components/sidebar/HomeSidebar";
import { MobileWidgetStrip } from "@/components/sidebar/MobileWidgetStrip";
import { 
  getStreakData, 
  getMonthWorkoutDates, 
  getWeekSnapshot, 
  getNextPlannedWorkout 
} from "@/app/actions/analytics";

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
		nextWorkout
	] = await Promise.all([
		getPlanByDate().catch(() => null),
		getActivePlanInfo().catch(() => null),
		getTodayWorkoutLog().catch(() => null),
		getStreakData().catch(() => ({ currentStreak: 0, longestStreak: 0, lastWorkoutDate: null })),
		getMonthWorkoutDates(new Date().getFullYear(), new Date().getMonth()).catch(() => []),
		getWeekSnapshot().catch(() => ({ sessionsCompleted: 0, sessionsPlanned: 0, completedDays: [], plannedDays: [] })),
		getNextPlannedWorkout().catch(() => null)
	]);

	const today = new Date();
	const randomQuote = await getDailyQuote();

	// Check if today's workout is done (has at least one exercise)
	const isTodayDone = todayWorkoutLog && todayWorkoutLog.exercises && todayWorkoutLog.exercises.length > 0;

	return (
		<div className="flex flex-col">
			<Header title={`Hi, ${userName}! 👋`} subtitle={format(today, "d MMMM ''yy")} />

			<main className="flex-1 px-6 pb-12 w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<PageWithSidebar
					mobileWidgets={
						<MobileWidgetStrip 
							streak={streakData?.currentStreak || 0}
							workoutsThisMonth={monthDates.length}
							sessionsDone={`${weekSnapshot?.sessionsCompleted || 0}/${weekSnapshot?.sessionsPlanned || "?"}`}
							nextWorkout={nextWorkout?.name || "No Plan"}
						/>
					}
					sidebar={
						<HomeSidebar 
							streakData={streakData}
							monthDates={monthDates}
							weekSnapshot={weekSnapshot}
							nextWorkout={nextWorkout}
						/>
					}
				>
					<div className="space-y-8">
						<section>
							<GlassCard className="relative overflow-hidden p-6 border-foreground/5 bg-gradient-to-br from-brand-primary/10 to-transparent">
								<Quote className="absolute -bottom-4 -right-4 w-24 h-24 text-brand-primary/10 -rotate-12" />
								<div className="relative z-10">
									<div className="flex items-center space-x-2 mb-3">
										<div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
											<Quote className="w-4 h-4 text-brand-primary" />
										</div>
										<h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">
											Daily Motivation
										</h3>
									</div>
									<p className="text-2xl font-black text-foreground leading-tight tracking-tight">
										&quot; {randomQuote} &quot;
									</p>
								</div>
							</GlassCard>
						</section>

						<section className="space-y-4">
							<div className="flex justify-between items-end">
								<h2 className="text-lg font-bold text-foreground tracking-tight">
									Your Plan
								</h2>
								<Link
									href="/plan"
									className="text-xs font-bold text-brand-primary hover:underline">
									View Plan
								</Link>
							</div>

							{isTodayDone ? (
								<Link href="/workout?mode=MANUAL_LOG" className="block">
									<GlassCard className="border-emerald-500/30 bg-emerald-500/5 p-6 flex items-center justify-between group overflow-hidden relative">
										<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
											<CheckCircle2 className="w-16 h-16 text-emerald-500" />
										</div>
										<div className="flex items-center space-x-4 relative z-10">
											<div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
												<CheckCircle2 className="w-6 h-6 text-black" />
											</div>
											<div>
												<h3 className="text-base font-black text-foreground uppercase tracking-tight">Today's done! 🎉</h3>
												<p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Do you want to change the log?</p>
											</div>
										</div>
										<ChevronRight className="w-5 h-5 text-emerald-500 relative z-10 group-hover:translate-x-1 transition-transform" />
									</GlassCard>
								</Link>
							) : plan && (plan as any).dayOfWeek !== 0 ? (
								<Link href="/workout?mode=LIVE_SESSION" className="block">
									<WorkoutListItem
										title={`${(plan as any).splitName || `Day ${(plan as any).dayOfWeek}`} Training`}
										subtitle={`Week ${(plan as any).weekNumber} • Master Plan`}
										duration={`${(plan as any).exercises.length * 10} min`}
										exercisesCount={(plan as any).exercises.length}
										active
									/>
								</Link>
							) : activePlanInfo?.isCompleted ? (
								<Link href={`/plan/${activePlanInfo.id}/report`} className="block">
									<GlassCard className="border-emerald-500/30 bg-emerald-500/5 p-6 flex items-center justify-between group overflow-hidden relative">
										<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
											<Trophy className="w-16 h-16 text-emerald-500" />
										</div>
										<div className="flex items-center space-x-4 relative z-10">
											<div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
												<Trophy className="w-6 h-6 text-black" />
											</div>
											<div>
												<h3 className="text-base font-black text-foreground uppercase tracking-tight">Cycle Completed!</h3>
												<p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Tap to view your report</p>
											</div>
										</div>
										<ChevronRight className="w-5 h-5 text-emerald-500 relative z-10 group-hover:translate-x-1 transition-transform" />
									</GlassCard>
								</Link>
							) : (
								<div className="glass-card border-dashed border-foreground/10 flex flex-col items-center justify-center py-12 text-center">
									<div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
										{(plan as any)?.dayOfWeek === 0 ? (
											<Coffee className="w-6 h-6 text-foreground/40" />
										) : (
											<Plus className="w-6 h-6 text-foreground/40" />
										)}
									</div>
									<p className="text-foreground/60 text-sm font-medium mb-1">
										{(plan as any)?.dayOfWeek === 0 ? "It's a Rest Day! 🧘‍♂️" : "No workout scheduled for today"}
									</p>
									<p className="text-foreground/40 text-xs">
										{(plan as any)?.dayOfWeek === 0 ? "Take some time to recover and prep for tomorrow." : "Tap to create a new session or set up a plan."}
									</p>
								</div>
							)}
						</section>

						<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<GlassCard className="flex items-center justify-between group cursor-pointer">
								<div className="flex items-center space-x-4">
									<div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
										<Plus className="w-5 h-5 text-brand-primary" />
									</div>
									<div>
										<h3 className="text-sm font-bold text-foreground">
											Log Weight
										</h3>
										<p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
											Update trend
										</p>
									</div>
								</div>
								<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
							</GlassCard>

							<Link href="/analytics" className="contents">
								<GlassCard className="flex items-center justify-between group cursor-pointer">
									<div className="flex items-center space-x-4">
										<div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
											<BarChart2 className="w-5 h-5 text-brand-primary" />
										</div>
										<div>
											<h3 className="text-sm font-bold text-foreground">
												View Progress
											</h3>
											<p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
												All-time PRs
											</p>
										</div>
									</div>
									<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
								</GlassCard>
							</Link>
						</section>
					</div>
				</PageWithSidebar>
			</main>
		</div>
	);
}
