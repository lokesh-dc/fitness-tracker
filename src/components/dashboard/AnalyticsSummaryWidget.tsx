import {
	ChevronRight,
	Dumbbell,
	Flame,
	Trophy,
	TrendingUp,
	TrendingDown,
	Minus,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AnalyticsSummaryWidgetProps {
	stats: {
		workoutsThisMonth: number;
		volumeThisMonth: number;
		prsThisMonth: number;
	};
	weeklyVolume?: {
		thisWeekVolume: number;
		lastWeekVolume: number;
		differenceKg: number;
		differencePercent: number;
		trendDirection: "up" | "down" | "neutral";
	};
}

function formatVolume(kg: number): string {
	if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
	return `${kg.toLocaleString()} kg`;
}

export function AnalyticsSummaryWidget({
	stats,
	weeklyVolume,
}: AnalyticsSummaryWidgetProps) {
	const tiles = [
		{
			icon: Dumbbell,
			label: "Workouts",
			value: String(stats.workoutsThisMonth),
			iconClass: "bg-brand-primary/10 text-brand-primary",
		},
		{
			icon: Flame,
			label: "Volume",
			value: formatVolume(stats.volumeThisMonth),
			iconClass: "bg-orange-500/10 text-orange-400",
		},
		{
			icon: Trophy,
			label: "PRs",
			value: String(stats.prsThisMonth),
			iconClass: "bg-amber-500/10 text-amber-400",
		},
	];

	return (
		<section className="space-y-2.5">
			<div className="flex items-center justify-between">
				<h2 className="text-[11px] font-medium text-foreground/25 uppercase tracking-[0.15em]">
					Analytics
				</h2>
				<Link
					href="/analytics"
					className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.07] border border-foreground/[0.06] text-foreground/35 hover:text-foreground text-xs font-medium transition-all">
					<span>View all</span>
					<ChevronRight className="w-3 h-3" />
				</Link>
			</div>

			<div className="rounded-2xl p-4 md:p-5 bg-[var(--glass-bg)] backdrop-blur-md shadow-lg shadow-slate-400/20 dark:shadow-black/40">
				<span className="text-[9px] font-black uppercase tracking-widest text-foreground/30 block mb-3">
					This month
				</span>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					{tiles.map((tile) => (
						<div
							key={tile.label}
							className="flex items-center gap-3 rounded-xl border border-white/10 bg-foreground/[0.02] p-3">
							<div
								className={cn(
									"w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
									tile.iconClass,
								)}>
								<tile.icon className="w-4 h-4" />
							</div>
							<div>
								<p className="text-lg font-black tabular-nums text-foreground leading-none">
									{tile.value}
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mt-1">
									{tile.label}
								</p>
							</div>
						</div>
					))}
				</div>

				{weeklyVolume && (
					<div className="mt-3 pt-3 border-t border-foreground/[0.06]">
						<div className="flex items-center justify-between">
							<span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
								This week vs last week
							</span>
							{weeklyVolume.trendDirection === "up" &&
							weeklyVolume.differencePercent > 0 ? (
								<span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 tabular-nums">
									<TrendingUp className="w-3 h-3" />+
									{weeklyVolume.differencePercent}%
								</span>
							) : weeklyVolume.trendDirection === "down" &&
							  weeklyVolume.differencePercent < 0 ? (
								<span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500/70 tabular-nums">
									<TrendingDown className="w-3 h-3" />
									{weeklyVolume.differencePercent}%
								</span>
							) : (
								<span className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground/30 tabular-nums">
									<Minus className="w-3 h-3" />
									Flat
								</span>
							)}
						</div>
						<div className="mt-2 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
							<div
								className={cn(
									"h-full rounded-full transition-all",
									weeklyVolume.trendDirection === "up"
										? "bg-emerald-400/70"
										: weeklyVolume.trendDirection === "down"
											? "bg-amber-500/60"
											: "bg-foreground/20",
								)}
								style={{
									width: `${Math.max(
										4,
										Math.min(
											100,
											weeklyVolume.lastWeekVolume > 0
												? (weeklyVolume.thisWeekVolume /
														weeklyVolume.lastWeekVolume) *
														100
												: weeklyVolume.thisWeekVolume > 0
													? 100
													: 4,
										),
									)}%`,
								}}
							/>
						</div>
						<div className="mt-1.5 flex items-center justify-between">
							<span className="text-[10px] font-medium text-foreground/25 tabular-nums">
								{formatVolume(weeklyVolume.lastWeekVolume)} →{" "}
								{formatVolume(weeklyVolume.thisWeekVolume)}
							</span>
							<span className="text-[9px] font-bold text-foreground/20 uppercase tracking-wider">
								volume
							</span>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
