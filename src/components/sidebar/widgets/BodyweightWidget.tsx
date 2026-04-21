"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { BodyweightData } from "@/types/workout";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { MoveUpRight, MoveDownRight, Minus, Scale } from "lucide-react";

interface BodyweightWidgetProps {
	data: any; // Using any to handle both BodyweightData and BodyWeightTrend
	variant?: "sidebar" | "mobile";
}

export function BodyweightWidget({
	data,
	variant = "sidebar",
}: BodyweightWidgetProps) {
	if (!data || data.currentWeight === null) {
		return (
			<GlassCard className="flex flex-col items-center justify-center py-8 text-zinc-500/50">
				<Scale className="w-8 h-8 mb-2 opacity-20" />
				<span className="text-xs uppercase tracking-tight font-medium">
					No bodyweight logged yet
				</span>
			</GlassCard>
		);
	}

	const { currentWeight } = data;

	// Adapt to both types
	const delta =
		data.delta !== undefined
			? data.delta
			: data.changeKg !== undefined
				? data.changeDirection === "down"
					? -data.changeKg
					: data.changeKg
				: null;
	const chartPoints =
		data.chartPoints ||
		(data.entries
			? data.entries.map((e: any) => ({ weight: e.weight, date: e.date }))
			: []);

	const absDelta = delta !== null ? Math.abs(delta) : 0;

	if (variant === "mobile") {
		return (
			<GlassCard className="min-w-[200px] flex-shrink-0 p-4">
				<div className="flex justify-between items-start mb-3">
					<div>
						<p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
							Bodyweight
						</p>
						<p className="text-xl font-bold text-white tracking-tight">
							{currentWeight}{" "}
							<span className="text-[10px] text-zinc-500 font-medium">kg</span>
						</p>
					</div>
					<div
						className={cn(
							"px-1.5 py-0.5 rounded text-[10px] font-bold",
							delta !== null && delta > 0
								? "bg-red-500/10 text-red-400"
								: delta !== null && delta < 0
									? "bg-green-500/10 text-green-400"
									: "bg-white/5 text-white/40",
						)}>
						{delta !== null && delta !== 0
							? delta > 0
								? `+${delta.toFixed(1)}`
								: delta.toFixed(1)
							: "0.0"}{" "}
						kg
					</div>
				</div>
				<p className="text-[10px] text-zinc-500/80 mt-1 uppercase tracking-tight">
					Tracked in sessions
				</p>
			</GlassCard>
		);
	}

	return (
		<GlassCard className="flex flex-col gap-4">
			<div>
				<p className="text-[11px] uppercase tracking-wider text-white/40 mb-4 font-medium">
					Bodyweight
				</p>

				<div className="flex items-baseline justify-between mb-4">
					<div className="flex items-baseline gap-1.5">
						<span className="text-2xl font-bold text-white">
							{currentWeight}
						</span>
						<span className="text-xs text-white/40 uppercase font-medium">
							kg
						</span>
					</div>
					<div
						className={cn(
							"px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm",
							delta !== null && delta > 0
								? "bg-red-500/15 text-red-400"
								: delta !== null && delta < 0
									? "bg-green-500/15 text-green-400"
									: "bg-white/5 text-white/40",
						)}>
						{delta !== null && delta > 0 ? (
							<MoveUpRight className="w-3 h-3" />
						) : delta !== null && delta < 0 ? (
							<MoveDownRight className="w-3 h-3" />
						) : (
							<Minus className="w-3 h-3" />
						)}
						{absDelta.toFixed(1)} kg since start
					</div>
				</div>

				<p className="text-[10px] text-zinc-500 mb-4 italic tracking-tight font-medium uppercase underline underline-offset-4 decoration-zinc-800">
					Since plan start
				</p>

				<div className="h-16 w-full mb-1">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartPoints}>
							<YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
							<Line
								type="monotone"
								dataKey="weight"
								stroke="#f97316"
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-600 px-1">
					<span>Plan Start</span>
					<span>Today</span>
				</div>
			</div>

			<div className="h-[1px] bg-white/10 w-full" />
			<p className="text-[10px] text-white/40 italic">
				Pulled from most recent session per week
			</p>
		</GlassCard>
	);
}
