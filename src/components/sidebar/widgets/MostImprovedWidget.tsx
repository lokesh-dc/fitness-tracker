"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { MostImprovedExercise } from "@/types/workout";
import { Rocket, TrendingUp } from "lucide-react";

export function MostImprovedWidget({
	mostImproved,
	variant = "sidebar",
}: {
	mostImproved: MostImprovedExercise | null;
	variant?: "sidebar" | "mobile";
}) {
	if (variant === "mobile") {
		return (
			<GlassCard className="min-w-[200px] p-3 border-foreground/5 bg-foreground/[0.02]">
				<p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">
					Most Improved
				</p>
				{mostImproved ? (
					<>
						<p className="text-sm font-bold text-foreground mt-1 truncate">
							{mostImproved.exerciseName}
						</p>
						<p className="text-xs font-bold text-green-400">
							+{mostImproved.improvementPercent}% in 30 days
						</p>
					</>
				) : (
					<p className="text-xs text-foreground/30 mt-1 italic">No data yet</p>
				)}
			</GlassCard>
		);
	}

	return (
		<GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02]">
			<div className="mb-4">
				<h3 className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">
					MOST IMPROVED
				</h3>
				<p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5">
					Last 30 days
				</p>
			</div>

			{!mostImproved ? (
				<div className="flex flex-col items-center justify-center py-6 text-center">
					<TrendingUp className="w-8 h-8 text-foreground/10 mb-3" />
					<p className="text-xs text-foreground/40 px-2 line-clamp-3">
						No weight increases logged in the last 30 days — keep pushing!
					</p>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Rocket className="w-5 h-5 text-brand-primary shrink-0" />
						<span className="text-lg font-bold text-foreground truncate">
							{mostImproved.exerciseName}
						</span>
					</div>

					<div className="flex items-center justify-between gap-2 py-1">
						<span className="text-sm font-medium text-foreground/60">
							{mostImproved.startWeight}kg
						</span>
						<div className="flex-1 flex items-center justify-center px-2">
							<div className="w-full h-px bg-brand-primary/20 relative">
								<div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-transparent text-[10px] text-brand-primary">
									──→
								</div>
							</div>
						</div>
						<span className="text-lg font-bold text-brand-primary">
							{mostImproved.endWeight}kg
						</span>
					</div>

					<div className="space-y-0.5">
						<div className="flex items-center gap-2">
							<span className="text-sm font-bold text-green-400">
								+{mostImproved.improvementKg}kg
							</span>
							<span className="text-foreground/20 text-xs">·</span>
							<span className="text-sm font-bold text-green-400">
								+{mostImproved.improvementPercent}%
							</span>
						</div>
						<p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
							{mostImproved.sessionCount} sessions
						</p>
					</div>
				</div>
			)}
		</GlassCard>
	);
}
