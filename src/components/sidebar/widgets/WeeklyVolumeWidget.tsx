"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { WeeklyVolumeComparison } from "@/types/workout";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function WeeklyVolumeWidget({
	weeklyVolume,
}: {
	weeklyVolume: WeeklyVolumeComparison;
}) {
	const {
		thisWeekVolume,
		lastWeekVolume,
		differenceKg,
		differencePercent,
		trendDirection,
	} = weeklyVolume;

	const isFirstWeek = lastWeekVolume === 0;

	return (
		<GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02]">
			<div className="mb-4">
				<h3 className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">
					WEEKLY VOLUME
				</h3>
			</div>

			<div className="space-y-4">
				<div className="space-y-2.5">
					<div className="flex items-center justify-between">
						<span className="text-xs text-foreground/60 font-medium">
							This week
						</span>
						<div className="flex items-center gap-1.5">
							<span className="text-sm font-bold text-foreground">
								{thisWeekVolume.toLocaleString()} kg
							</span>
							{!isFirstWeek && (
								<div
									className={cn(
										"flex items-center",
										trendDirection === "up"
											? "text-green-400"
											: trendDirection === "down"
												? "text-red-400"
												: "text-foreground/40",
									)}>
									{trendDirection === "up" && (
										<TrendingUp className="w-3.5 h-3.5" />
									)}
									{trendDirection === "down" && (
										<TrendingDown className="w-3.5 h-3.5" />
									)}
									{trendDirection === "neutral" && (
										<Minus className="w-3.5 h-3.5" />
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs text-foreground/40 font-medium">
							Last week
						</span>
						<span className="text-xs font-bold text-foreground/40">
							{lastWeekVolume.toLocaleString()} kg
						</span>
					</div>
				</div>

				<div className="pt-3 border-t border-foreground/5">
					{isFirstWeek ? (
						<p className="text-xs text-orange-500 font-bold uppercase tracking-wider">
							First week of training logged! 🚀
						</p>
					) : thisWeekVolume === 0 ? (
						<p className="text-xs text-foreground/40 italic">
							No sessions yet this week
						</p>
					) : (
						<div
							className={cn(
								"flex items-center gap-2 text-xs font-black",
								trendDirection === "up"
									? "text-green-400"
									: trendDirection === "down"
										? "text-red-400"
										: "text-foreground/40",
							)}>
							<span>
								{differenceKg > 0 ? "+" : ""}
								{differenceKg.toLocaleString()} kg
							</span>
							<span className="text-foreground/20 text-[10px]">·</span>
							<span>
								{differenceKg > 0 ? "+" : ""}
								{differencePercent}%
							</span>
						</div>
					)}
				</div>
			</div>
		</GlassCard>
	);
}
