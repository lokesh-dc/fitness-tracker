import { getPlanReport } from "@/app/actions/plan";
import { Header } from "@/components/Header";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
	ChevronLeft,
	Trophy,
	Activity,
	TrendingUp,
	TrendingDown,
	Dumbbell,
	Flame,
	Timer,
	Repeat2,
	Calendar,
	CalendarRange,
	PieChart,
	Medal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PlanCalendar } from "./PlanCalendar";
import { AdherenceRing } from "./AdherenceRing";
import WeeklyVolumeChart from "./WeeklyVolumeChart";
import { MiniSparkline } from "./MiniSparkline";

const fmtCompact = (n: number) =>
	n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

function StatTile({
	icon: Icon,
	label,
	value,
	unit,
	children,
	className,
}: {
	icon: LucideIcon;
	label: string;
	value: string;
	unit?: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<GlassCard className={`p-4 md:p-5 flex flex-col ${className ?? ""}`}>
			<div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-3">
				<Icon className="w-4.5 h-4.5 text-brand-primary" />
			</div>
			<p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">
				{label}
			</p>
			<div className="mt-1 flex items-baseline gap-1">
				<span className="text-2xl font-black text-foreground tabular-nums leading-none">
					{value}
				</span>
				{unit && (
					<span className="text-[10px] font-bold text-foreground/40 uppercase">
						{unit}
					</span>
				)}
			</div>
			{children}
		</GlassCard>
	);
}

export default async function PlanReportPage({
	params,
}: {
	params: Promise<{ planId: string }>;
}) {
	const { planId } = await params;

	const report = await getPlanReport(planId);

	if (!report) {
		redirect("/plan");
	}

	const titleNode = (
		<div className="flex items-center space-x-4 h-full">
			<Link
				href={`/plan/${planId}`}
				className="glass-button w-10 h-10 rounded-xl border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors">
				<ChevronLeft className="w-5 h-5 text-foreground" />
			</Link>
			<h1 className="text-xl font-black text-foreground tracking-tight line-clamp-1">
				Plan Report
			</h1>
		</div>
	);

	const subtitle =
		report.planName?.startsWith("Plan starting ")
			? `Plan starting (${format(new Date(report.startDate + "T00:00:00"), "d MMMM ''yy")})`
			: report.planName;

	const isEmpty = report.totalSessions === 0;

	return (
		<div className="flex flex-col pb-32">
			<Header title={titleNode} subtitle={subtitle} />

			<main className="flex-1 px-6 space-y-6 max-w-6xl mx-auto w-full">
				{isEmpty ? (
					/* Empty state */
					<GlassCard className="p-10 text-center mt-4">
						<div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-5">
							<Dumbbell className="w-7 h-7 text-brand-primary" />
						</div>
						<h2 className="text-lg font-black text-foreground tracking-tight mb-2">
							No sessions logged yet
						</h2>
						<p className="text-sm text-foreground/50 max-w-sm mx-auto mb-6 leading-relaxed">
							This report fills in as you train. Finish your first session of
							the plan and your stats will appear here.
						</p>
						<Link
							href="/"
							className="inline-flex items-center px-8 py-4 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(249,115,22,0.25)]">
							Go to Today
						</Link>
					</GlassCard>
				) : (
					<>
						{/* Band 1: Adherence hero + stat tiles */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
							<GlassCard className="lg:col-span-5 p-6 md:p-7 relative overflow-hidden">
								<div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-brand-primary/10 blur-2xl pointer-events-none" />
								<h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-6">
									Plan Adherence
								</h2>
								<div className="flex items-center gap-6">
									<AdherenceRing
										percent={report.adherence.percent}
										completed={report.adherence.completed}
										scheduled={report.adherence.scheduled}
									/>
									<div className="space-y-4 min-w-0">
										<div>
											<p className="text-2xl font-black text-foreground tabular-nums leading-none">
												{report.adherence.completed}
												<span className="text-sm font-bold text-foreground/35">
													{" "}
													/ {report.adherence.scheduled}
												</span>
											</p>
											<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-1.5">
												Sessions completed
											</p>
										</div>
										<div className="flex flex-wrap gap-2">
											<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
												<Flame className="w-3.5 h-3.5 text-brand-primary" />
												<span className="text-[10px] font-black text-foreground/70 uppercase tracking-wide tabular-nums">
													{report.longestStreak}d streak
												</span>
											</span>
											<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10">
												<CalendarRange className="w-3.5 h-3.5 text-foreground/50" />
												<span className="text-[10px] font-black text-foreground/70 uppercase tracking-wide tabular-nums">
													{report.sessionsPerWeek}/wk avg
												</span>
											</span>
										</div>
									</div>
								</div>
							</GlassCard>

							<div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
								<StatTile
									icon={Activity}
									label="Sessions"
									value={String(report.totalSessions)}
								/>
								<StatTile
									icon={Dumbbell}
									label="Volume"
									value={(report.totalVolume / 1000).toFixed(1)}
									unit="t"
								/>
								<StatTile
									icon={Repeat2}
									label="Reps Lifted"
									value={fmtCompact(report.totalReps)}
								/>
								<StatTile
									icon={Timer}
									label="Avg Session"
									value={
										report.avgDurationMinutes !== null
											? String(report.avgDurationMinutes)
											: "—"
									}
									unit={report.avgDurationMinutes !== null ? "min" : undefined}
								/>
								<StatTile
									icon={Calendar}
									label="Weeks"
									value={String(report.numWeeks)}
								/>
								<StatTile
									icon={report.weightChange >= 0 ? TrendingUp : TrendingDown}
									label="Weight Change"
									value={`${report.weightChange > 0 ? "+" : ""}${report.weightChange.toFixed(1)}`}
									unit="kg"
									className="col-span-2 sm:col-span-1"
								>
									<div className="mt-auto pt-2">
										<MiniSparkline data={report.bodyWeightSeries} />
									</div>
								</StatTile>
							</div>
						</div>

						{/* Band 2: Weekly volume chart + muscle split */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
							<div className="lg:col-span-8">
								<WeeklyVolumeChart data={report.weeklyVolume} />
							</div>

							<GlassCard className="lg:col-span-4 p-6 flex flex-col">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
										<PieChart className="w-5 h-5 text-brand-primary" />
									</div>
									<div>
										<h3 className="text-sm font-black text-foreground tracking-tight">
											Volume by Muscle Group
										</h3>
										<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
											Top {report.muscleSplit.length || 0}
										</p>
									</div>
								</div>

								{report.muscleSplit.length > 0 ? (
									<div className="flex-1 flex flex-col justify-center gap-4">
										{report.muscleSplit.map((m) => (
											<div key={m.muscleGroup}>
												<div className="flex justify-between items-baseline mb-1.5">
													<span className="text-xs font-bold text-foreground capitalize">
														{m.muscleGroup}
													</span>
													<span className="text-[10px] font-black text-foreground/40 uppercase tabular-nums">
														{(m.totalVolume / 1000).toFixed(1)}t ·{" "}
														{m.percentageOfTotal}%
													</span>
												</div>
												<div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
													<div
														className="h-full rounded-full bg-brand-primary transition-all duration-700"
														style={{ width: `${Math.max(m.percentageOfTotal, 2)}%` }}
													/>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="flex-1 flex items-center">
										<p className="text-xs text-foreground/40 leading-relaxed">
											Muscle group breakdown appears once exercises are matched
											to the library.
										</p>
									</div>
								)}
							</GlassCard>
						</div>

						{/* Band 3: PRs + calendar */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
							<section className="lg:col-span-8 space-y-4">
								<h2 className="text-sm font-black text-foreground uppercase tracking-widest ml-1">
									Top Best Lifts During Plan
								</h2>
								{report.topPRs.length > 0 ? (
									<div className="space-y-3">
										{report.topPRs.map((pr, idx) => (
											<GlassCard
												key={idx}
												className="p-4 md:p-4 flex items-center gap-4 group overflow-hidden relative">
												{idx === 0 && (
													<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
														<Trophy className="w-14 h-14 text-brand-primary" />
													</div>
												)}
												<div
													className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
														idx === 0
															? "bg-brand-primary text-black"
															: "bg-foreground/5 text-foreground/50"
													}`}>
													<span className="text-xs font-black tabular-nums">
														#{idx + 1}
													</span>
												</div>
												<div className="min-w-0 flex-1">
													<h4 className="text-sm font-bold text-foreground truncate">
														{pr.name}
													</h4>
													<p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">
														{idx === 0 ? "Heaviest lift" : `Rank ${idx + 1}`}
													</p>
												</div>
												<div className="text-right shrink-0">
													<span className="text-xl font-black text-foreground tabular-nums">
														{pr.weight}
													</span>
													<span className="text-[10px] font-bold text-foreground/40 ml-1 uppercase">
														kg
													</span>
												</div>
											</GlassCard>
										))}
									</div>
								) : (
									<GlassCard className="p-6 flex items-center gap-4">
										<Medal className="w-5 h-5 text-foreground/30 shrink-0" />
										<p className="text-xs text-foreground/40 leading-relaxed">
											No lifts recorded yet. Your heaviest sets will rank here.
										</p>
									</GlassCard>
								)}
							</section>

							<div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
								<PlanCalendar
									startDate={report.startDate}
									numWeeks={report.numWeeks}
									loggedDates={report.loggedDates}
									trainingDays={report.trainingDays || []}
								/>
							</div>
						</div>

						{/* Closing CTA */}
						<GlassCard className="p-8 text-center bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20">
							<Trophy className="w-12 h-12 text-brand-primary mx-auto mb-4" />
							<h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
								Block Complete
							</h3>
							<p className="text-sm text-foreground/60 max-w-sm mx-auto mb-6 leading-relaxed">
								You finished your {report.numWeeks} week training block. Take
								a deload week, then start your next challenge.
							</p>
							<Link
								href="/plan/designer"
								className="inline-flex items-center px-8 py-4 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(249,115,22,0.3)]">
								Start New Plan
							</Link>
						</GlassCard>
					</>
				)}
			</main>
		</div>
	);
}
