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
	Calendar,
	Dumbbell,
} from "lucide-react";
import { PlanCalendar } from "./PlanCalendar";

export default async function PlanReportPage({
	params,
}: {
	params: Promise<{ planId: string }> | { planId: string };
}) {
	const resolvedParams = await Promise.resolve(params);
	const planId = resolvedParams.planId;
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

	return (
		<div className="flex flex-col pb-32">
			<Header
				title={titleNode}
				subtitle={
					report.planName?.startsWith("Plan starting ")
						? `Plan starting (${format(new Date(report.startDate + "T00:00:00"), "d MMMM ''yy")})`
						: report.planName
				}
			/>

			<main className="flex-1 px-6 space-y-8 max-w-6xl mx-auto w-full">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Content: Stats & PRs */}
					<div className="lg:col-span-8 space-y-12">
						{/* Summary Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2">
								<Activity className="w-5 h-5 text-brand-primary" />
								<p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">
									Sessions
								</p>
								<p className="text-2xl font-black text-foreground">
									{report.totalSessions}
								</p>
							</GlassCard>

							<GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2">
								<Calendar className="w-5 h-5 text-brand-primary" />
								<p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">
									Weeks
								</p>
								<p className="text-2xl font-black text-foreground">
									{report.numWeeks}
								</p>
							</GlassCard>

							<GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2">
								<Dumbbell className="w-5 h-5 text-brand-primary" />
								<p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">
									Volume
								</p>
								<p className="text-xl font-black text-foreground">
									{(report.totalVolume / 1000).toFixed(1)}t
								</p>
							</GlassCard>

							<GlassCard className="p-4 flex flex-col items-center justify-center text-center space-y-2">
								{report.weightChange >= 0 ? (
									<TrendingUp className="w-5 h-5 text-emerald-500" />
								) : (
									<TrendingDown className="w-5 h-5 text-brand-primary" />
								)}
								<p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">
									Weight Change
								</p>
								<p className="text-xl font-black text-foreground">
									{report.weightChange > 0 ? "+" : ""}
									{report.weightChange.toFixed(1)} kg
								</p>
							</GlassCard>
						</div>

						{/* PRs Broken */}
						<section className="space-y-6">
							<h2 className="text-sm font-black text-foreground uppercase tracking-widest ml-1">
								Top Best Lifts During Plan
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{report.topPRs.map((pr, idx) => (
									<GlassCard
										key={idx}
										className="p-4 flex items-center justify-between group overflow-hidden relative">
										<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
											<Trophy className="w-12 h-12 text-brand-primary" />
										</div>
										<div className="flex items-center space-x-4">
											<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
												<Trophy className="w-5 h-5 text-brand-primary" />
											</div>
											<div>
												<h4 className="text-sm font-bold text-foreground">
													{pr.name}
												</h4>
												<p className="text-[10px] text-foreground/40 font-black uppercase">
													Personal Best
												</p>
											</div>
										</div>
										<div className="text-right">
											<span className="text-xl font-black text-foreground">
												{pr.weight}
											</span>
											<span className="text-[10px] font-bold text-foreground/40 ml-1 uppercase">
												kg
											</span>
										</div>
									</GlassCard>
								))}
							</div>
						</section>

						{/* Closing card */}
						<GlassCard className="p-8 text-center bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20">
							<Trophy className="w-12 h-12 text-brand-primary mx-auto mb-4" />
							<h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
								Cycle Completed!
							</h3>
							<p className="text-sm text-foreground/60 max-w-sm mx-auto mb-6">
								You&apos;ve successfully finished your {report.numWeeks} week
								training block. Take a deload or start your next challenge!
							</p>
							<Link
								href="/plan/designer"
								className="inline-flex items-center space-x-2 px-8 py-4 bg-brand-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(249,115,22,0.3)]">
								Start New Plan
							</Link>
						</GlassCard>
					</div>

					{/* Sidebar: Calendar */}
					<div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
						<PlanCalendar
							startDate={report.startDate}
							numWeeks={report.numWeeks}
							loggedDates={report.loggedDates}
							trainingDays={report.trainingDays || []}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
