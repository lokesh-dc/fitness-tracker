"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { ThisWeekWeightSummary } from "@/types/workout";
import { LogWeightModal } from "@/components/LogWeightModal";

export { LogWeightModal, AppleWeightWheelPicker } from "@/components/LogWeightModal";

interface WeightTimelineWidgetProps {
	data: ThisWeekWeightSummary;
}

export function WeightTimelineWidget({ data }: WeightTimelineWidgetProps) {
	const [mounted, setMounted] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
		const today = data.days.find((d) => d.isToday);
		return today ? today.dateStr : format(new Date(), "yyyy-MM-dd");
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	const openModalForDate = (dateStr?: string) => {
		const targetDate = dateStr || format(new Date(), "yyyy-MM-dd");
		setSelectedDateStr(targetDate);
		setIsModalOpen(true);
	};

	// Prepare data for the 7-day timeline area chart
	let lastKnownVal = data.startWeight || data.currentWeight || null;
	const chartData = data.days.map((day) => {
		if (day.weight !== null) {
			lastKnownVal = day.weight;
		}
		return {
			dayName: day.dayName,
			dateStr: day.dateStr,
			actualWeight: day.weight,
			renderedWeight:
				day.weight !== null ? day.weight : !day.isFuture ? lastKnownVal : null,
			isToday: day.isToday,
			isFuture: day.isFuture,
		};
	});

	// Calculate Y domain with sensible padding
	const weightsWithValues = data.days
		.map((d) => d.weight)
		.filter((w): w is number => w !== null);

	const minVal =
		weightsWithValues.length > 0
			? Math.min(...weightsWithValues)
			: data.currentWeight || 70;
	const maxVal =
		weightsWithValues.length > 0
			? Math.max(...weightsWithValues)
			: data.currentWeight || 70;
	const yMin = Math.max(0, Math.floor(minVal - 1));
	const yMax = Math.ceil(maxVal + 1);

	return (
		<section className="space-y-2.5">
			{/* Widget Header — soft, muted and non-distracting */}
			<div className="flex items-center justify-between">
				<h2 className="text-[11px] font-medium text-foreground/25 uppercase tracking-[0.15em]">
					Body Weight
				</h2>
				<button
					type="button"
					onClick={() => openModalForDate()}
					className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-foreground/[0.03] hover:bg-foreground/[0.07] border border-foreground/[0.06] text-foreground/35 hover:text-foreground text-xs font-medium transition-all cursor-pointer">
					<Plus className="w-3 h-3 text-foreground/30" />
					<span>Log weight</span>
				</button>
			</div>

			<GlassCard className="p-4 md:p-5 relative overflow-hidden">
				{/* Top stats row */}
				<div className="flex items-start justify-between gap-4 mb-2">
					<div>
						<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-foreground/20 block mb-0.5">
							This week
						</span>
						{/* Active Weight is the high-contrast hero */}
						<div className="flex items-baseline gap-1.5">
							<span className="text-3xl md:text-4xl font-black tabular-nums text-foreground tracking-tight">
								{data.currentWeight !== null
									? data.currentWeight.toFixed(1)
									: "—"}
							</span>
							<span className="text-xs text-foreground/25 font-normal">kg</span>
						</div>
					</div>

					{/* This week change badge — light, soft and understated */}
					<div className="flex flex-col items-end">
						<span className="text-[10px] font-normal uppercase tracking-[0.15em] text-foreground/20 block mb-1">
							Weekly change
						</span>
						{data.changeDirection === "up" && data.changeKg !== null ? (
							<div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/15 text-amber-500/65 font-medium text-xs tabular-nums">
								<TrendingUp className="w-3 h-3 text-amber-500/65" />
								<span>+{data.changeKg.toFixed(1)} kg</span>
							</div>
						) : data.changeDirection === "down" && data.changeKg !== null ? (
							<div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-500/65 font-medium text-xs tabular-nums">
								<TrendingDown className="w-3 h-3 text-emerald-500/65" />
								<span>{data.changeKg.toFixed(1)} kg</span>
							</div>
						) : data.changeDirection === "neutral" ? (
							<div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-foreground/[0.02] border border-foreground/[0.05] text-foreground/25 font-medium text-xs tabular-nums">
								<Minus className="w-3 h-3 text-foreground/20" />
								<span>0.0 kg</span>
							</div>
						) : (
							<div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-foreground/[0.02] text-foreground/20 font-normal text-xs">
								<span>No baseline</span>
							</div>
						)}
					</div>
				</div>

				{/* ── Graph Widget: This Week Timeline ── */}
				<div className="w-full h-[140px] -mx-2 relative">
					{mounted ? (
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={chartData}
								margin={{ top: 10, right: 12, left: -25, bottom: 0 }}>
								<defs>
									<linearGradient
										id="weightTimelineGrad"
										x1="0"
										y1="0"
										x2="0"
										y2="1">
										<stop
											offset="0%"
											stopColor="var(--brand-accent)"
											stopOpacity={0.16}
										/>
										<stop
											offset="95%"
											stopColor="var(--brand-accent)"
											stopOpacity={0.0}
										/>
									</linearGradient>
								</defs>

								<YAxis domain={[yMin, yMax]} hide={true} />

								<XAxis
									dataKey="dayName"
									axisLine={false}
									tickLine={false}
									tick={({ x, y, payload }: any) => {
										const dayItem = chartData.find(
											(d) => d.dayName === payload.value,
										);
										const isToday = dayItem?.isToday;
										return (
											<text
												x={x}
												y={y + 12}
												textAnchor="middle"
												fill="currentColor"
												className={
													isToday
														? "font-medium text-[10px] opacity-45"
														: "font-normal text-[10px] opacity-20"
												}>
												{payload.value}
											</text>
										);
									}}
								/>

								<Tooltip
									content={({ active, payload }: any) => {
										if (!active || !payload || !payload.length) return null;
										const item = payload[0]?.payload;
										if (!item) return null;

										return (
											<div className="rounded-xl px-2.5 py-1.5 bg-background/95 border border-foreground/10 shadow-lg text-xs backdrop-blur-md">
												<p className="text-[10px] font-medium text-foreground/35 uppercase tracking-wider">
													{format(parseISO(item.dateStr), "EEEE, MMM d")}
												</p>
												<p className="font-bold text-foreground mt-0.5 tabular-nums">
													{item.actualWeight !== null ? (
														<>
															<span className="text-brand-primary">
																{item.actualWeight}
															</span>{" "}
															kg
														</>
													) : (
														<span className="text-foreground/30 font-normal">
															Not logged
														</span>
													)}
												</p>
											</div>
										);
									}}
								/>

								<Area
									type="monotone"
									dataKey="renderedWeight"
									stroke="var(--brand-accent)"
									strokeWidth={1.75}
									strokeOpacity={0.55}
									fill="url(#weightTimelineGrad)"
									connectNulls={true}
									dot={(props: any) => {
										const { cx, cy, payload } = props;
										if (
											payload.actualWeight === null ||
											cx === undefined ||
											cy === undefined
										) {
											return null;
										}
										const isToday = payload.isToday;
										return (
											<g key={`dot-${payload.dateStr}`}>
												{isToday && (
													<circle
														cx={cx}
														cy={cy}
														r={6}
														fill="var(--brand-accent)"
														fillOpacity={0.15}
													/>
												)}
												<circle
													cx={cx}
													cy={cy}
													r={isToday ? 3.5 : 2.5}
													fill="var(--brand-accent)"
													fillOpacity={isToday ? 0.9 : 0.6}
													stroke="var(--background)"
													strokeWidth={1.5}
												/>
											</g>
										);
									}}
									activeDot={{
										r: 4.5,
										fill: "var(--brand-accent)",
										stroke: "var(--background)",
										strokeWidth: 2,
									}}
								/>
							</AreaChart>
						</ResponsiveContainer>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<div className="w-full h-[60%] bg-foreground/[0.03] animate-pulse rounded-lg" />
						</div>
					)}
				</div>
			</GlassCard>

			{/* ── Standalone Full Page Log Weight Modal ── */}
			<LogWeightModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				initialWeight={data.currentWeight}
				initialDateStr={selectedDateStr}
				days={data.days}
			/>
		</section>
	);
}
