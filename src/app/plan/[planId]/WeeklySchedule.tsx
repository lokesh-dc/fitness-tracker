"use client";

import { useState } from "react";
import { Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { WorkoutTemplate } from "@/types/workout";

interface WeeklyScheduleProps {
	templates: WorkoutTemplate[];
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklySchedule({ templates }: WeeklyScheduleProps) {
	const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

	// Sort by day of week
	const sortedTemplates = [...templates].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
			{sortedTemplates.map((day) => {
				const isRestDay = day.exercises.length === 0;
				const isExpanded = expandedDayId === day.id;

				if (isRestDay) return null; // Hiding rest days as per user request (hide/disable)

				return (
					<div key={day.id} className="space-y-2">
						<GlassCard
							className={cn(
								"p-4 flex items-center justify-between group cursor-pointer transition-all duration-300",
								isExpanded ? "border-orange-500/30 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "hover:bg-foreground/5"
							)}
							onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
						>
							<div className="flex items-center space-x-4">
								<div className={cn(
									"w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
									isExpanded ? "bg-orange-500 text-black" : "bg-foreground/5 text-foreground/40 group-hover:text-orange-500"
								)}>
									<Dumbbell className="w-5 h-5" />
								</div>
								<div>
									<p className="text-xs font-black text-foreground uppercase tracking-widest">
										{DAYS_SHORT[day.dayOfWeek]}
									</p>
									<p className="text-sm font-bold text-foreground/60">
										{day.splitName || "Workout"}
									</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<div className="text-right">
									<p className="text-[10px] font-black text-orange-500 uppercase">
										{day.exercises.length} Exercises
									</p>
								</div>
								{isExpanded ? (
									<ChevronUp className="w-4 h-4 text-foreground/20" />
								) : (
									<ChevronDown className="w-4 h-4 text-foreground/20" />
								)}
							</div>
						</GlassCard>

						{/* Expanded Exercises Detail */}
						{isExpanded && (
							<div className="px-2 animate-in fade-in slide-in-from-top-2 duration-300">
								<GlassCard className="p-4 bg-foreground/5 border-foreground/5 space-y-3">
									{day.exercises.map((ex, idx) => (
										<div key={idx} className="flex justify-between items-center py-2 border-b border-foreground/5 last:border-0">
											<div>
												<p className="text-sm font-black text-foreground">{ex.name}</p>
											</div>
											<div className="text-right">
												<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
													{ex.targetSets} Sets • {ex.targetReps} {ex.unit || 'Reps'}
												</p>
											</div>
										</div>
									))}
								</GlassCard>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
