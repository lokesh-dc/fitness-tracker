import { getTodayPlan } from "./actions/plan";
import { StatCard } from "@/components/ui/StatCard";
import { WorkoutListItem } from "@/components/ui/WorkoutListItem";
import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footprints, Flame, Plus, ChevronRight, BarChart2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function Home() {
	let plan = null;
	let error = null;

	try {
		plan = await getTodayPlan();
	} catch (e) {
		console.error("Error loading home page data:", e);
		error = "Failed to load workout data.";
	}

	const today = new Date();

	return (
		<div className="flex flex-col">
			<Header title="Hi, Lokesh! 👋" subtitle={format(today, "EEEE, MMMM d")} />

			<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-12">
				<section>
					<div className="flex justify-between items-end mb-4">
						<h2 className="text-lg font-bold text-foreground tracking-tight">
							Today&apos;s Stats
						</h2>
						<Link
							href="#"
							className="text-xs font-bold text-orange-500 hover:underline flex items-center">
							Details <ChevronRight className="w-3 h-3 ml-0.5" />
						</Link>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<StatCard
							label="Steps"
							value="8,432"
							unit="steps"
							status="Good"
							icon={<Footprints className="w-5 h-5 text-orange-500" />}
						/>
						<StatCard
							label="Calories"
							value="1,240"
							unit="kcal"
							status="Average"
							icon={<Flame className="w-5 h-5 text-foreground/40" />}
						/>
					</div>
				</section>

				<section className="space-y-4">
					<div className="flex justify-between items-end">
						<h2 className="text-lg font-bold text-foreground tracking-tight">
							Your Plan
						</h2>
						<Link
							href="#"
							className="text-xs font-bold text-orange-500 hover:underline">
							Edit Plan
						</Link>
					</div>

					{plan ? (
						<Link href="/workout" className="block">
							<WorkoutListItem
								title={
									plan.dayOfWeek === 0
										? "Rest Day"
										: `Day ${plan.dayOfWeek}: Strength Training`
								}
								subtitle={`Week ${plan.weekNumber} • Master Plan`}
								duration="60 min"
								exercisesCount={plan.exercises.length}
								active
							/>
						</Link>
					) : (
						<div className="glass-card border-dashed border-foreground/10 flex flex-col items-center justify-center py-12 text-center">
							<div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
								<Plus className="w-6 h-6 text-foreground/40" />
							</div>
							<p className="text-foreground/60 text-sm font-medium mb-1">
								No workout scheduled for today
							</p>
							<p className="text-foreground/40 text-xs">
								Tap to create a new session or set up a plan.
							</p>
						</div>
					)}
				</section>

				<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<GlassCard className="flex items-center justify-between group cursor-pointer">
						<div className="flex items-center space-x-4">
							<div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
								<Plus className="w-5 h-5 text-orange-500" />
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
								<div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
									<BarChart2 className="w-5 h-5 text-orange-500" />
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
			</main>
		</div>
	);
}
