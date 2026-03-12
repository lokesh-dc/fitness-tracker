import { getBodyWeightTrend } from "@/app/actions/analytics";
import WeightTrendChart from "@/components/WeightTrendChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Trophy, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
	const weightTrend = await getBodyWeightTrend();

	const prs = [
		{ name: "Bench Press", weight: 100, date: "2024-02-15" },
		{ name: "Squat", weight: 140, date: "2024-02-10" },
		{ name: "Deadlift", weight: 180, date: "2024-02-20" },
	];

	return (
		<div className="flex flex-col">
			<Header title="Analytics" subtitle="Insights & Progress" />

			<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-12">
				<section className="space-y-4">
					<WeightTrendChart data={weightTrend as any} />
				</section>

				<section className="space-y-4">
					<div className="flex justify-between items-end">
						<h2 className="text-lg font-bold text-foreground tracking-tight">
							Personal Records
						</h2>
						<Link
							href="#"
							className="text-xs font-bold text-orange-500 hover:underline">
							View All
						</Link>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{prs.map((pr, idx) => (
							<GlassCard key={idx} className="relative overflow-hidden group">
								<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
									<Trophy className="w-12 h-12 text-orange-500" />
								</div>
								<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">
									{pr.name}
								</p>
								<div className="flex items-baseline space-x-1 mb-2">
									<span className="text-2xl font-black text-foreground">
										{pr.weight}
									</span>
									<span className="text-[10px] font-bold text-foreground/40 uppercase">
										KG
									</span>
								</div>
								<div className="flex items-center text-[10px] font-medium text-emerald-500 dark:text-emerald-400">
									<TrendingUp className="w-3 h-3 mr-1" />
									+2.5kg vs last
								</div>
							</GlassCard>
						))}
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="text-lg font-bold text-foreground tracking-tight">
						Recent History
					</h2>
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<GlassCard
								key={i}
								className="flex items-center justify-between group cursor-pointer">
								<div className="flex items-center space-x-4">
									<div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
										<Calendar className="w-5 h-5 text-foreground/40" />
									</div>
									<div>
										<h3 className="text-sm font-bold text-foreground">
											Strength Session
										</h3>
										<p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
											March {10 - i}, 2024 • 65 min
										</p>
									</div>
								</div>
								<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
							</GlassCard>
						))}
					</div>
				</section>
			</main>
		</div>
	);
}
