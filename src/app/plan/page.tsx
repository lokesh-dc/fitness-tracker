import {
	getUserPlanSummary,
	getActivePlansSummary,
	getPlanAdherenceScore,
	getWeekPlanSchedule,
} from "@/app/actions/plan";
import { getOnboardingProfile } from "@/app/actions/profile";
import PlanDesignerNudge from "@/components/onboarding/PlanDesignerNudge";
import { GlassCard } from "@/components/ui/GlassCard";

import { Plus, Calendar, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { Header } from "@/components/Header";
import { format } from "date-fns";
import { PlanDocument } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import {
	PlansSidebar,
	PlansMobileWidgets,
} from "@/components/sidebar/PlansSidebar";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
	const session = await getServerSession(authOptions);
	const userId = (session?.user as any).id;

	const [
		{ plans, templatesMap },
		activePlansSummary,
		adherenceScore,
		weekSchedule,
		userProfile,
	] = await Promise.all([
		getUserPlanSummary() || { plans: [], templatesMap: {} },
		getActivePlansSummary(userId),
		getPlanAdherenceScore(userId),
		getWeekPlanSchedule(userId),
		getOnboardingProfile().catch(() => null),
	]);

	const showNudge =
		!userProfile?.preferredTrainingDays ||
		userProfile.preferredTrainingDays.length === 0;

	const getPlanStatus = (plan: PlanDocument) => {
		if (plan.status === "draft")
			return {
				label: "Draft",
				color: "text-amber-500",
				bg: "bg-amber-500/10",
				dot: "bg-amber-500",
			};
		if (plan.status === "completed")
			return {
				label: "Completed",
				color: "text-emerald-500",
				bg: "bg-emerald-500/10",
				dot: "bg-emerald-500",
			};
		if (plan.status === "active")
			return {
				label: "Active",
				color: "text-brand-primary",
				bg: "bg-brand-primary/10",
				dot: "bg-brand-primary",
			};

		const start = new Date(plan.startDate);
		const end = new Date(start);
		end.setDate(end.getDate() + plan.numWeeks * 7);

		const now = new Date();

		if (now < start)
			return {
				label: "Upcoming",
				color: "text-foreground/40",
				bg: "bg-foreground/5",
				dot: "bg-foreground/20",
			};
		if (now > end)
			return {
				label: "Completed",
				color: "text-emerald-500",
				bg: "bg-emerald-500/10",
				dot: "bg-emerald-500",
			};
		return {
			label: "Active",
			color: "text-brand-primary",
			bg: "bg-brand-primary/10",
			dot: "bg-brand-primary",
		};
	};

	return (
		<div className="flex flex-col">
			<Header title="Plans" subtitle="Your training cycles" />

			<main className="flex-1 px-4 md:px-6 pb-28 md:pb-12 w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<PageWithSidebar
					sidebar={
						<PlansSidebar
							activePlansSummary={activePlansSummary}
							adherenceScore={adherenceScore}
							weekSchedule={weekSchedule}
						/>
					}
					>
					<div className="space-y-6">
						{showNudge && <PlanDesignerNudge />}

						{/* ── Mobile stats strip ── */}
						<div className="lg:hidden -mt-1">
							<PlansMobileWidgets
								activePlansSummary={activePlansSummary}
								adherenceScore={adherenceScore}
								weekSchedule={weekSchedule}
							/>
						</div>

						{/* ── Create new plan CTA ── */}
						<Link href="/plan/designer" className="block">
							<div className="relative overflow-hidden rounded-2xl bg-brand-primary p-5 flex items-center justify-between group transition-all hover:opacity-95 active:scale-[0.98]">
								{/* Background shimmer */}
								<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
								<div className="relative flex items-center gap-4">
									<div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
										<Sparkles className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-semibold text-black/90">
											Design a new plan
										</p>
										<p className="text-[11px] text-black/50 mt-0.5">
											AI-generated or build it yourself
										</p>
									</div>
								</div>
								<ChevronRight className="relative w-4 h-4 text-black/50 group-hover:translate-x-0.5 transition-transform shrink-0" />
							</div>
						</Link>

						{/* ── Plan list ── */}
						<section className="space-y-4">
							<h2 className="text-[11px] font-semibold text-foreground/40 uppercase tracking-[0.15em]">
								Training cycles
							</h2>

							{!plans || plans.length === 0 ? (
								<GlassCard className="flex flex-col items-center justify-center py-16 text-center border-foreground/5">
									<Calendar className="w-8 h-8 text-foreground/20 mb-3" />
									<p className="text-sm font-medium text-foreground/30">
										No plans yet
									</p>
									<p className="text-xs text-foreground/20 mt-1">
										Create your first training cycle above.
									</p>
								</GlassCard>
							) : (
								<div className="space-y-3">
									{plans.map((plan: PlanDocument) => {
										const status = getPlanStatus(plan);
										const uniqueDays = templatesMap[plan.id] || 0;
										const isActive = status.label === "Active";

										return (
											<Link
												key={plan.id}
												href={`/plan/${plan.id}`}
												className="block">
												<GlassCard
													className={cn(
														"flex items-center justify-between gap-4 group transition-all hover:border-brand-primary/25 py-4",
														isActive && "border-brand-primary/20",
													)}>
													{/* Left accent bar for active */}
													<div className="flex items-center gap-4 min-w-0 flex-1">
														{isActive && (
															<div className="w-0.5 h-10 bg-brand-primary rounded-full shrink-0 -ml-1.5" />
														)}
														<div className="min-w-0 flex-1">
															<h3
																className={cn(
																	"text-sm font-semibold truncate transition-colors",
																	isActive
																		? "text-foreground"
																		: "text-foreground/70 group-hover:text-foreground",
																)}>
																{plan.name?.startsWith("Plan starting ")
																	? `Started ${format(new Date(plan.startDate + "T00:00:00"), "d MMM ''yy")}`
																	: plan.name ||
																		`Started ${format(new Date(plan.startDate + "T00:00:00"), "d MMM ''yy")}`}
															</h3>
															<div className="flex items-center gap-3 mt-1.5">
																<span className="text-[11px] text-foreground/35 tabular-nums">
																	{format(
																		new Date(plan.startDate + "T00:00:00"),
																		"d MMM ''yy",
																	)}
																</span>
																<span className="text-foreground/15 text-xs">·</span>
																<span className="text-[11px] text-foreground/35">
																	{plan.numWeeks}w
																</span>
																<span className="text-foreground/15 text-xs">·</span>
																<span className="text-[11px] text-foreground/35">
																	{uniqueDays}d/wk
																</span>
															</div>
														</div>
													</div>

													<div className="flex items-center gap-2.5 shrink-0">
														<div
															className={cn(
																"flex items-center gap-1.5 px-2.5 py-1 rounded-full",
																status.bg,
															)}>
															<div
																className={cn(
																	"w-1.5 h-1.5 rounded-full",
																	status.dot,
																)}
															/>
															<span
																className={cn(
																	"text-[10px] font-semibold",
																	status.color,
																)}>
																{status.label}
															</span>
														</div>
														<ChevronRight className="w-3.5 h-3.5 text-foreground/20 group-hover:text-foreground/40 group-hover:translate-x-0.5 transition-all" />
													</div>
												</GlassCard>
											</Link>
										);
									})}
								</div>
							)}
						</section>
					</div>
				</PageWithSidebar>
			</main>
		</div>
	);
}
