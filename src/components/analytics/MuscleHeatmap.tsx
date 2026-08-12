"use client";

import { useMemo, useRef, useEffect } from "react";
import {
	format,
	subWeeks,
	startOfWeek,
	addDays,
	isSameDay,
	parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";

interface MuscleHeatmapProps {
	dates: string[];
	muscleGroup: string;
	timeRange?: "1M" | "3M" | "6M" | "1Y" | "ALL";
}

export function MuscleHeatmap({
	dates,
	muscleGroup,
	timeRange = "1M",
}: MuscleHeatmapProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const trainedDates = useMemo(
		() => new Set(dates.map((d) => d.split("T")[0])),
		[dates],
	);

	// Scroll to right on mount
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
		}
	}, []);

	const activeWeekCount = useMemo(() => {
		if (timeRange === "1M") return 4;
		if (timeRange === "3M") return 13;
		if (timeRange === "6M") return 26;
		return 52;
	}, [timeRange]);

	const grid = useMemo(() => {
		const weeks = [];
		const today = new Date();
		// Always show 52 weeks for consistent sizing
		let current = startOfWeek(subWeeks(today, 51), { weekStartsOn: 1 });

		for (let w = 0; w < 52; w++) {
			const days = [];
			// Data is on the right, so we count back from the end
			const isActive = w >= 52 - activeWeekCount;

			for (let d = 0; d < 7; d++) {
				const date = addDays(current, d);
				const dateStr = format(date, "yyyy-MM-dd");
				days.push({
					date,
					dateStr,
					isTrained: trainedDates.has(dateStr),
					isFuture: date > today,
					isActive,
				});
			}
			weeks.push(days);
			current = addDays(current, 7);
		}
		return weeks;
	}, [trainedDates, activeWeekCount]);

	const monthLabels = useMemo(() => {
		const labels: { label: string; index: number }[] = [];
		grid.forEach((week, i) => {
			const firstDay = week[0].date;
			if (firstDay.getDate() <= 7) {
				labels.push({ label: format(firstDay, "MMM"), index: i });
			}
		});
		return labels;
	}, [grid]);

	return (
		<div
			ref={scrollRef}
			className="w-full overflow-x-auto no-scrollbar pb-6 animate-in fade-in duration-700 scroll-smooth">
			<div className="min-w-fit">
				{/* Month Labels */}
				<div className="flex mb-4 ml-12 h-4 relative">
					{monthLabels.map((m, i) => {
						const isActiveMonth = m.index >= 52 - activeWeekCount;
						return (
							<span
								key={i}
								className={cn(
									"text-[10px] font-black absolute uppercase tracking-widest transition-opacity duration-500",
									isActiveMonth ? "text-foreground/40" : "text-foreground/5",
								)}
								style={{ left: `${m.index * 52}px` }}>
								{m.label}
							</span>
						);
					})}
				</div>

				<div className="flex">
					{/* Day Labels */}
					<div className="flex flex-col justify-between px-4 py-2 text-[10px] font-black text-foreground/10 uppercase sticky left-0 z-20 bg-transparent backdrop-blur-sm">
						<span>Mon</span>
						<span className="">Tue</span>
						<span>Wed</span>
						<span className="">Thu</span>
						<span>Fri</span>
						<span className="">Sat</span>
						<span>Sun</span>
					</div>

					{/* Grid */}
					<div className="flex gap-[5px]">
						{grid.map((week, wi) => (
							<div key={wi} className="flex flex-col gap-[5px]">
								{week.map((day, di) => (
									<div
										key={di}
										title={`${format(day.date, "MMM d, yyyy")}: ${day.isTrained ? `Trained ${muscleGroup}` : "Rest day"}`}
										className={cn(
											"w-[50px] h-[50px] rounded-lg transition-all duration-500 flex items-center justify-center relative overflow-hidden",
											day.isFuture
												? "opacity-0"
												: !day.isActive
													? "bg-white/[0.02] border border-white/[0.02]"
													: day.isTrained
														? "bg-brand-primary shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-100 z-10"
														: "bg-white/5 hover:bg-white/10 border border-white/5",
										)}>
										<span
											className={cn(
												"text-[10px] font-bold transition-opacity duration-500",
												!day.isActive ? "opacity-0" : "opacity-100",
												day.isTrained ? "text-black" : "text-foreground/20",
											)}>
											{format(day.date, "d")}
										</span>

										{day.isActive && day.isTrained && (
											<div className="absolute top-0 right-0 w-4 h-4 bg-white/20 rounded-bl-lg" />
										)}
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
