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

interface ExerciseDetailCardProps {
	exercise: ExerciseDetailData;
	isOpen: boolean;
	onToggle: () => void;
}

export function ExerciseDetailCard({
	exercise,
	isOpen,
	onToggle,
}: ExerciseDetailCardProps) {
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
					className="md:p-5 cursor-pointer hover:bg-white/[0.01] transition-colors"
					onClick={onToggle}>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="space-y-1">
							<h3 className="text-xl font-black text-foreground uppercase tracking-tight">
								{exercise.exerciseName}
							</h3>
							<div className="flex items-center gap-3 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
								<span>{exercise.totalSessions} Sessions</span>
								<span className="text-foreground/10">•</span>
								<span>{exercise.totalSets} Sets</span>
								<span className="text-foreground/10">•</span>
								<span>
									First logged{" "}
									{formatDistanceToNow(parseISO(exercise.firstLoggedDate))} ago
								</span>
							</div>
						</div>

						<div className="flex items-center gap-6">
							<div className="">
								<p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-0.5">
									Current PR
								</p>
								<p className="text-sm font-black text-foreground">
									{exercise.currentPR}kg{" "}
									<span className="text-[10px] text-foreground/40 font-bold uppercase">
										× {exercise.currentPRReps}
									</span>
								</p>
							</div>

							<div className="text-right">
								<p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-0.5">
									Est. 1RM
								</p>
								<div className="flex items-center gap-1.5 justify-end">
									<TrendingUp className="w-3.5 h-3.5 text-brand-primary" />
									<p className="text-xl font-black text-foreground">
										{exercise.currentEstimatedOneRM}{" "}
										<span className="text-[10px] text-foreground/40 font-bold uppercase">
											kg
										</span>
									</p>
								</div>
							</div>

							<div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-foreground/20 group-hover:text-foreground transition-colors">
								{isOpen ? (
									<ChevronUp className="w-5 h-5" />
								) : (
									<ChevronDown className="w-5 h-5" />
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
							transition={{ duration: 0.3, ease: "easeInOut" }}>
							<div className="px-6 pb-6 pt-2 border-t border-white/5">
								<div className="h-[300px] w-full mt-4">
									{chartData.length < 3 && (
										<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-xl pointer-events-none">
											<p className="text-[10px] font-black text-white uppercase tracking-widest bg-black/80 px-4 py-2 rounded-lg border border-white/10">
												Log more sessions to see a meaningful trend
											</p>
										</div>
									)}

									<ResponsiveContainer width="100%" height="100%">
										<ComposedChart data={chartData}>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="rgba(255,255,255,0.05)"
												vertical={false}
											/>
											<XAxis
												dataKey="date"
												axisLine={false}
												tickLine={false}
												tick={{
													fill: "rgba(255,255,255,0.3)",
													fontSize: 10,
													fontWeight: 900,
												}}
												tickFormatter={(val) => format(parseISO(val), "MMM d")}
												minTickGap={30}
											/>
											<YAxis
												axisLine={false}
												tickLine={false}
												tick={{
													fill: "rgba(255,255,255,0.3)",
													fontSize: 10,
													fontWeight: 900,
												}}
												domain={["dataMin - 10", "dataMax + 10"]}
											/>
											<Tooltip
												content={({ active, payload }) => {
													if (active && payload && payload.length) {
														const d = payload[0].payload;
														return (
															<div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl">
																<p className="text-[10px] font-black text-white/40 uppercase mb-2">
																	{format(parseISO(d.date), "MMMM d, yyyy")}
																</p>
																<div className="space-y-1">
																	<div className="flex justify-between gap-6">
																		<span className="text-[10px] font-bold text-brand-primary uppercase">
																			Max Weight
																		</span>
																		<span className="text-xs font-black text-white">
																			{d.maxWeight} kg
																		</span>
																	</div>
																	<div className="flex justify-between gap-6">
																		<span className="text-[10px] font-bold text-indigo-400 uppercase">
																			Est. 1RM
																		</span>
																		<span className="text-xs font-black text-white">
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
												stroke="#f97316"
												strokeWidth={3}
												dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
												activeDot={{ r: 6, strokeWidth: 0 }}
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
													stroke="#f97316"
													strokeDasharray="3 3"
													label={{
														value: "★ PR",
														position: "top",
														fill: "#f97316",
														fontSize: 10,
														fontWeight: 900,
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
