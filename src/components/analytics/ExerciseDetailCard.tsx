"use client";

import { useState } from "react";
import { ExerciseDetailData } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ComposedChart,
	ReferenceLine,
} from "recharts";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
	ChevronDown,
	ChevronUp,
	TrendingUp,
	History,
	Star,
	ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";

interface ExerciseDetailCardProps {
	exercise: ExerciseDetailData;
	isOpen: boolean;
	onToggle: () => void;
	rank?: number;
}

export function ExerciseDetailCard({
	exercise,
	isOpen,
	onToggle,
	rank,
}: ExerciseDetailCardProps) {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme !== "light";
	const tickColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.55)";
	const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)";

	const chartData = [...exercise.dataPoints].sort((a, b) =>
		a.date.localeCompare(b.date),
	);

	const lastSession = chartData[chartData.length - 1];
	const firstSession = chartData[0];

	return (
		<div
			id={`exercise-${exercise.exerciseName.toLowerCase().replace(/\s+/g, "-")}`}>
			<GlassCard className="overflow-hidden">
				{/* Header */}
				<div
					className="p-4 md:p-5 cursor-pointer hover:bg-foreground/[0.02] transition-colors"
					onClick={onToggle}>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
						<div className="flex items-center gap-3 min-w-0">
							{rank !== undefined && (
								<div className={cn(
									"w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0",
									rank === 1 ? "bg-brand-primary text-white" :
									rank === 2 ? "bg-foreground/15 text-foreground" :
									rank === 3 ? "bg-foreground/10 text-foreground/80" :
									"bg-foreground/[0.04] text-foreground/40 border border-foreground/[0.06]"
								)}>
									{rank}
								</div>
							)}
							<div className="space-y-0.5 min-w-0">
								<h3 className="text-sm md:text-base font-bold text-foreground tracking-tight truncate">
									{exercise.exerciseName}
								</h3>
								<div className="flex items-center gap-2 text-[10px] font-medium text-foreground/40 tracking-wide">
									<span>{exercise.totalSessions} {exercise.totalSessions === 1 ? "session" : "sessions"}</span>
									<span className="text-foreground/15">•</span>
									<span>{exercise.totalSets} sets</span>
									<span className="hidden md:inline text-foreground/15">•</span>
									<span className="hidden md:inline">
										{formatDistanceToNow(parseISO(exercise.firstLoggedDate))} ago
									</span>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pl-10 sm:pl-0">
							<div>
								<p className="text-[9px] font-semibold text-foreground/30 uppercase tracking-widest mb-0.5">
									PR
								</p>
								<p className="text-xs md:text-sm font-bold text-foreground">
									{exercise.currentPR}kg{" "}
									<span className="text-[10px] text-foreground/40 font-normal">
										×{exercise.currentPRReps}
									</span>
								</p>
							</div>

							<div className="text-right">
								<p className="text-[9px] font-semibold text-brand-primary uppercase tracking-widest mb-0.5">
									Est. 1RM
								</p>
								<div className="flex items-center gap-1 justify-end">
									<TrendingUp className="w-3 h-3 text-brand-primary" />
									<p className="text-sm md:text-base font-bold text-brand-primary tabular-nums">
										{exercise.currentEstimatedOneRM}{" "}
										<span className="text-[10px] text-brand-primary/60 font-medium">
											kg
										</span>
									</p>
								</div>
							</div>

							<div className="w-8 h-8 rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center text-foreground/30 hover:text-foreground transition-colors shrink-0">
								{isOpen ? (
									<ChevronUp className="w-4 h-4" />
								) : (
									<ChevronDown className="w-4 h-4" />
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Expandable Chart Section */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.25, ease: "easeInOut" }}>
							<div className="px-4 md:px-6 pb-5 pt-2 border-t border-foreground/[0.04]">
								<div className="h-[220px] md:h-[260px] w-full mt-3">
									{chartData.length < 3 && (
										<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-xl pointer-events-none">
											<p className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/80 px-3 py-1.5 rounded-lg border border-white/10">
												Log more sessions to see a meaningful trend
											</p>
										</div>
									)}

									<ResponsiveContainer width="100%" height="100%">
										<ComposedChart data={chartData}>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke={gridColor}
												vertical={false}
											/>
											<XAxis
												dataKey="date"
												axisLine={false}
												tickLine={false}
												tick={{
													fill: tickColor,
													fontSize: 10,
													fontWeight: 600,
												}}
												tickFormatter={(val) => format(parseISO(val), "MMM d")}
												minTickGap={30}
											/>
											<YAxis
												axisLine={false}
												tickLine={false}
												tick={{
													fill: tickColor,
													fontSize: 10,
													fontWeight: 600,
												}}
												domain={["dataMin - 10", "dataMax + 10"]}
											/>
											<Tooltip
												content={({ active, payload }) => {
													if (active && payload && payload.length) {
														const d = payload[0].payload;
														return (
															<div className="bg-background/95 backdrop-blur-xl border border-foreground/10 p-3.5 rounded-2xl shadow-xl">
																<p className="text-[10px] font-semibold text-foreground/50 uppercase mb-2">
																	{format(parseISO(d.date), "MMMM d, yyyy")}
																</p>
																<div className="space-y-1.5 min-w-[130px]">
																	<div className="flex justify-between gap-6">
																		<span className="text-[10px] font-medium text-brand-primary uppercase">
																			Max Weight
																		</span>
																		<span className="text-xs font-bold text-foreground">
																			{d.maxWeight} kg
																		</span>
																	</div>
																	<div className="flex justify-between gap-6">
																		<span className="text-[10px] font-medium text-indigo-400 uppercase">
																			Est. 1RM
																		</span>
																		<span className="text-xs font-bold text-foreground">
																			{d.estimatedOneRM} kg
																		</span>
																	</div>
																</div>
															</div>
														);
													}
													return null;
												}}
											/>

											{/* Max Weight Line */}
											<Line
												type="monotone"
												dataKey="maxWeight"
												stroke="var(--brand-accent, #ff5722)"
												strokeWidth={2.5}
												dot={{ r: 3.5, fill: "var(--brand-accent, #ff5722)", strokeWidth: 0 }}
												activeDot={{ r: 5, strokeWidth: 0 }}
											/>

											{/* Estimated 1RM Line */}
											<Line
												type="monotone"
												dataKey="estimatedOneRM"
												stroke="#818cf8"
												strokeWidth={2}
												strokeDasharray="4 4"
												dot={false}
											/>

											{/* PR Marker */}
											{exercise.prDate && (
												<ReferenceLine
													x={exercise.prDate.split("T")[0]}
													stroke="var(--brand-accent, #ff5722)"
													strokeDasharray="3 3"
													label={{
														value: "★ PR",
														position: "top",
														fill: "var(--brand-accent, #ff5722)",
														fontSize: 10,
														fontWeight: 700,
													}}
												/>
											)}
										</ComposedChart>
									</ResponsiveContainer>
								</div>

								<div className="flex items-center justify-between mt-6">
									<div className="flex items-center gap-2">
										<History className="w-3.5 h-3.5 text-foreground/20" />
										<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
											Last trained{" "}
											{formatDistanceToNow(parseISO(exercise.lastLoggedDate))}{" "}
											ago
										</p>
									</div>

									<Link
										href={`/analytics?exercise=${encodeURIComponent(exercise.exerciseName)}`}
										className="flex items-center gap-1.5 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
										View Full Timeline <ArrowUpRight className="w-3 h-3" />
									</Link>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</GlassCard>
		</div>
	);
}
