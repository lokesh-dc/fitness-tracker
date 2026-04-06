"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { WeeklyVolumeComparison } from "@/types/workout";
import { cn } from "@/lib/utils";
import { MoveUpRight, MoveDownRight, Minus, BarChart3 } from "lucide-react";

interface WeeklyVolumeComparisonWidgetProps {
	data: WeeklyVolumeComparison;
	variant?: "sidebar" | "mobile";
}

export function WeeklyVolumeComparisonWidget({
	data,
	variant = "sidebar",
}: WeeklyVolumeComparisonWidgetProps) {
	const {
		thisWeekVolume,
		lastWeekVolume,
		differencePercent,
		trendDirection,
	} = data;

	if (variant === "mobile") {
		return (
			<GlassCard className="min-w-[200px] p-3 border-foreground/5 bg-foreground/[0.02]">
				<p className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">
					Weekly Volume
				</p>
				<p className="text-sm font-bold text-foreground mt-1">
					{thisWeekVolume.toLocaleString()} kg
				</p>
				<p
					className={cn(
						"text-xs font-bold",
						trendDirection === "up"
							? "text-green-400"
							: trendDirection === "down"
								? "text-red-400"
								: "text-foreground/40",
					)}>
					{trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→"}{" "}
					{Math.abs(differencePercent)}% vs last week
				</p>
			</GlassCard>
		);
	}

	return (
		<GlassCard className="p-4 border-foreground/5 bg-foreground/[0.02]">
			<div className="mb-4">
				<h3 className="text-[10px] font-black tracking-widest text-foreground/60 uppercase">
					WEEKLY VOLUME
				</h3>
				<p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-0.5">
					Current vs Last Week
				</p>
			</div>

			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<BarChart3 className="w-5 h-5 text-brand-primary shrink-0" />
					<div className="flex items-baseline gap-1">
						<span className="text-xl font-bold text-foreground">
							{thisWeekVolume.toLocaleString()}
						</span>
						<span className="text-xs text-foreground/40 font-bold uppercase tracking-widest">
							kg
						</span>
					</div>
				</div>

				<div className="flex items-center justify-between gap-2 py-1">
					<div className="flex flex-col">
						<span className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight">
							Last Week
						</span>
						<span className="text-sm font-medium text-foreground/60">
							{lastWeekVolume.toLocaleString()} kg
						</span>
					</div>
					<div className={cn(
						"px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-xs",
						trendDirection === 'up' ? "bg-green-500/10 text-green-400" : 
						trendDirection === 'down' ? "bg-red-500/10 text-red-400" : 
						"bg-foreground/5 text-foreground/40"
					)}>
						{trendDirection === 'up' ? <MoveUpRight className="w-3 h-3" /> : 
						 trendDirection === 'down' ? <MoveDownRight className="w-3 h-3" /> : 
						 <Minus className="w-3 h-3" />}
						{Math.abs(differencePercent)}%
					</div>
				</div>

				<div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
					<div 
						className="h-full bg-brand-primary" 
						style={{ width: `${Math.min(100, (thisWeekVolume / (Math.max(thisWeekVolume, lastWeekVolume) || 1)) * 100)}%` }} 
					/>
				</div>
			</div>
		</GlassCard>
	);
}
