import { getPlanByDate } from "./actions/plan";
import { getUserStats } from "./actions/logs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkoutListItem } from "@/components/ui/WorkoutListItem";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, ChevronRight, BarChart2, Quote, Coffee } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Header } from "@/components/Header";

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
		// Cache the quote for 1 hour to avoid hitting API rate limits
		const res = await fetch("https://zenquotes.io/api/random", {
			next: { revalidate: 3600 },
		});
		if (!res.ok) throw new Error("Failed to fetch quote");
		const data = await res.json();
		return data[0]?.q || QUOTES[Math.floor(Math.random() * QUOTES.length)];
	} catch (error) {
		// Fallback to our hardcoded fitness quotes if offline or rate limited
		return QUOTES[Math.floor(Math.random() * QUOTES.length)];
	}
}

export default async function Home() {
	let plan = null;
	let error = null;
	let stats = null;

	const session = await getServerSession(authOptions);
	const userName = session?.user?.name?.split(" ")[0] || "there";

	try {
		plan = await getPlanByDate();
		stats = await getUserStats();
	} catch (e) {
		console.error("Error loading home page data:", e);
		error = "Failed to load workout data.";
	}

	const today = new Date();
	const randomQuote = await getDailyQuote();

	return (
		<div className="flex flex-col">
			<Header title={`Hi, ${userName}! 👋`} subtitle={format(today, "EEEE, MMMM d")} />

			<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-12">
				<section>
					<GlassCard className="relative overflow-hidden p-6 border-foreground/5 bg-gradient-to-br from-orange-500/10 to-transparent">
						<Quote className="absolute -bottom-4 -right-4 w-24 h-24 text-orange-500/10 -rotate-12" />
						<div className="relative z-10">
							<div className="flex items-center space-x-2 mb-3">
								<div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
									<Quote className="w-4 h-4 text-orange-500" />
								</div>
								<h3 className="text-xs font-black uppercase tracking-widest text-orange-500">
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
							href="#"
							className="text-xs font-bold text-orange-500 hover:underline">
							Edit Plan
						</Link>
					</div>

					{plan && plan.dayOfWeek !== 0 ? (
						<Link href="/workout" className="block">
							<WorkoutListItem
								title={`${(plan as any).splitName || `Day ${plan.dayOfWeek}`} Training`}
								subtitle={`Week ${plan.weekNumber} • Master Plan`}
								duration={`${plan.exercises.length * 10} min`}
								exercisesCount={plan.exercises.length}
								active
							/>
						</Link>
					) : (
						<div className="glass-card border-dashed border-foreground/10 flex flex-col items-center justify-center py-12 text-center">
							<div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-4">
								{plan?.dayOfWeek === 0 ? (
									<Coffee className="w-6 h-6 text-foreground/40" />
								) : (
									<Plus className="w-6 h-6 text-foreground/40" />
								)}
							</div>
							<p className="text-foreground/60 text-sm font-medium mb-1">
								{plan?.dayOfWeek === 0 ? "It's a Rest Day! 🧘‍♂️" : "No workout scheduled for today"}
							</p>
							<p className="text-foreground/40 text-xs">
								{plan?.dayOfWeek === 0 ? "Take some time to recover and prep for tomorrow." : "Tap to create a new session or set up a plan."}
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
