import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import {
	Calendar,
	ChevronLeft,
	Dumbbell,
	LayoutGrid,
	Trophy,
	Info,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getPlanDetails } from "@/app/actions/plan";
import { WeeklySchedule } from "./WeeklySchedule";
import { PlanActionButtons } from "./PlanActionButtons";
import { Header } from "@/components/Header";
import { WorkoutTemplate } from "@/types/workout";

export default async function PlanDetailPage({
	params,
}: {
	params: Promise<{ planId: string }>;
}) {
	const { planId } = await params;


	const data = await getPlanDetails(planId);

	if (!data) {
		redirect("/plan");
	}

	const { plan, templates } = data;

	// We only show the daily structure for the first week, since it repeats.
	// Filter out the rest days (0 exercises)
	const baseWeek = templates
		.filter((t: WorkoutTemplate) => t.weekNumber === 1 && t.exercises.length > 0)
		.sort((a: WorkoutTemplate, b: WorkoutTemplate) => a.dayOfWeek - b.dayOfWeek);

	const start = new Date(plan.startDate + "T00:00:00");
	const end = new Date(start);
	end.setDate(end.getDate() + plan.numWeeks * 7);
	const now = new Date();
	const isCompleted = now > end;

	const titleNode = (
		<div className="flex items-center space-x-4 h-full">
			<Link
				href="/plan"
				className="glass-button w-10 h-10 rounded-xl border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors">
				<ChevronLeft className="w-5 h-5 text-foreground" />
			</Link>
			<h1 className="text-xl font-black text-foreground tracking-tight line-clamp-1">
				{plan.name?.startsWith("Plan starting ")
					? `Plan starting (${format(new Date(plan.startDate + "T00:00:00"), "d MMMM ''yy")})`
					: plan.name}
			</h1>
		</div>
	);

	return (
		<div className="flex flex-col  pb-32">
			<Header title={titleNode} subtitle={`${plan.numWeeks} Week Cycle`} />

			<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full">
				{isCompleted && (
					<GlassCard className="border-emerald-500/30 bg-emerald-500/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
						<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
							<Trophy className="w-16 h-16 text-emerald-500" />
						</div>
						<div className="flex items-center space-x-5 relative z-10">
							<div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
								<Trophy className="w-8 h-8 text-black" />
							</div>
							<div>
								<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
									Cycle Completed!
								</h2>
								<p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em]">
									Congratulations on finishing this plan
								</p>
							</div>
						</div>
						<Link
							href={`/plan/${plan.id}/report`}
							className="relative z-10 w-full md:w-auto px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.3)] text-center">
							View Performance Report
						</Link>
					</GlassCard>
				)}

				{!isCompleted && now < start && (
					<GlassCard className="border-brand-primary/30 bg-brand-primary/5 p-4 flex items-center space-x-4">
						<div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center">
							<Calendar className="w-4 h-4 text-brand-primary" />
						</div>
						<p className="text-xs font-bold text-foreground/60">
							This plan is scheduled to start on{" "}
							{format(new Date(plan.startDate + "T00:00:00"), "d MMMM ''yy")}.
						</p>
					</GlassCard>
				)}

				{/* Client side interactive buttons */}
				<PlanActionButtons planId={plan.id} currentWeeks={plan.numWeeks} />

				{/* Templates Tree */}
				<section className="space-y-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 bg-foreground/[0.02] p-4 rounded-2xl">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
								<Calendar className="w-5 h-5 text-brand-primary" />
							</div>
							<div>
								<p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
									Started On
								</p>
								<p className="text-sm font-bold text-foreground">
									{format(start, "d MMMM ''yy")}
								</p>
							</div>
						</div>

						<div className="hidden md:block w-px h-8 bg-foreground/10" />

						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
								<Trophy className="w-5 h-5 text-brand-primary" />
							</div>
							<div>
								<p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
									Ends On
								</p>
								<p className="text-sm font-bold text-foreground">
									{format(end, "d MMMM ''yy")}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center space-x-2 ml-2">
							<LayoutGrid className="w-4 h-4 text-brand-primary" />
							<h3 className="text-xs font-black text-foreground uppercase tracking-widest">
								Weekly Schedule
							</h3>
						</div>

						<WeeklySchedule templates={baseWeek} />
					</div>
				</section>
			</main>
		</div>
	);
}
