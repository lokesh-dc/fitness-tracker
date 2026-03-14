"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { format, isSameDay, startOfMonth, endOfMonth, isSameMonth, eachDayOfInterval, subMonths } from "date-fns";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface WeeklyCalendarProps {
	selectedDateStr: string;
}

export function WeeklyCalendar({ selectedDateStr }: WeeklyCalendarProps) {
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	// We use the provided YYYY-MM-DD string as local time base
	const selectedDate = new Date(`${selectedDateStr}T00:00:00`);
	const today = new Date();

	// Generate all days of the selected month (capping at "today" if it's the current month)
	const monthStart = startOfMonth(selectedDate);
	const monthEnd = isSameMonth(selectedDate, today) ? today : endOfMonth(selectedDate);

	const weekDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

	// Generate dropdown months (last 12 months)
	const pastMonths = Array.from({ length: 12 }).map((_, i) => subMonths(today, i));

	// Automatically scroll the calendar strip to the active date when loaded
	useEffect(() => {
		if (containerRef.current) {
			const activeEl = containerRef.current.querySelector('[data-selected="true"]');
			if (activeEl) {
				activeEl.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
			} else {
				containerRef.current.scrollLeft = containerRef.current.scrollWidth;
			}
		}
	}, [selectedDateStr]);

	const handleMonthSelect = (month: Date) => {
		setIsDropdownOpen(false);
		// Route to the 1st of the selected month, unless it's the current month, then route to today.
		let targetDay = startOfMonth(month);
		if (isSameMonth(month, today)) {
			targetDay = today;
		}
		router.push(`/workouts?date=${format(targetDay, "yyyy-MM-dd")}`);
	};

	return (
		<div className="relative">
			<div 
				ref={containerRef}
				className="flex items-center py-4 w-full mx-auto overflow-x-auto no-scrollbar gap-2 snap-x snap-mandatory relative"
			>
				{/* Sticky Month Dropdown */}
				<div className="sticky left-0 z-20 flex-shrink-0 bg-background py-1 pr-2 -ml-2 pl-2">
					<div 
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className="flex flex-col items-center justify-center p-3 rounded-[1.25rem] min-w-[4rem] glass-card hover:bg-foreground/[0.03] transition-all cursor-pointer border border-foreground/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
					>
						<span className="text-[10px] uppercase font-black tracking-widest text-orange-500 mb-0.5">
							{format(selectedDate, "MMM")}
						</span>
						<span className="text-sm font-black text-foreground">
							{format(selectedDate, "yy")}
						</span>
						<ChevronDown className={cn("w-3 h-3 text-foreground/40 mt-1 transition-transform", isDropdownOpen && "rotate-180")} />
					</div>
				</div>

			{/* Calendar Days */}
			{weekDays.map((day) => {
				const dateStr = format(day, "yyyy-MM-dd");
				const isSelected = isSameDay(day, selectedDate);
				const isToday = isSameDay(day, new Date());

				return (
					<Link
						key={dateStr}
						data-selected={isSelected}
						href={`/workouts?date=${dateStr}`}
						prefetch={true}
						className={cn(
							"flex flex-col items-center justify-center p-3 rounded-[1.25rem] min-w-[3.5rem] transition-all duration-300 snap-end",
							"border border-foreground/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex-shrink-0",
							isSelected
								? "bg-orange-500 text-black shadow-[0_10px_30px_-10px_rgba(249,115,22,0.4)] scale-105"
								: "glass-card hover:bg-foreground/[0.03] text-foreground/60 active:scale-95",
						)}>
						<span
							className={cn(
								"text-[10px] uppercase font-black tracking-widest mb-1",
								isSelected ? "text-black/60" : "text-foreground/40",
							)}>
							{format(day, "EEE")}
						</span>
						<span
							className={cn(
								"text-lg font-black font-mono",
								isSelected ? "text-black" : "text-foreground",
							)}>
							{format(day, "d")}
						</span>

						{/* Tiny dot indicator for "Today" */}
						<div
							className={cn(
								"w-1 h-1 rounded-full mt-1.5 transition-colors",
								isToday && isSelected
									? "bg-black"
									: isToday
										? "bg-orange-500"
										: "bg-transparent",
							)}
						/>
					</Link>
				);
			})}
			</div>

			{/* Custom Month Dropdown Menu */}
			{isDropdownOpen && (
				<>
					{/* Overlay to close when clicking outside */}
					<div 
						className="fixed inset-0 z-30" 
						onClick={() => setIsDropdownOpen(false)} 
					/>
					
					{/* Dropdown Box */}
					<div className="absolute left-0 top-[5.5rem] z-50 glass rounded-2xl overflow-hidden min-w-[180px] animate-in fade-in slide-in-from-top-2">
						<div className="max-h-[250px] overflow-y-auto no-scrollbar py-2">
							{pastMonths.map((month, idx) => {
								const isSelectedMonth = isSameMonth(month, selectedDate);
								return (
									<button
										key={idx}
										onClick={() => handleMonthSelect(month)}
										className={cn(
											"w-full text-left px-5 py-3 text-sm font-bold transition-colors flex items-center justify-between",
											isSelectedMonth 
												? "bg-orange-500/10 text-orange-500" 
												: "text-foreground hover:bg-foreground/5"
										)}
									>
										<span>{format(month, "MMMM yyyy")}</span>
										{isSelectedMonth && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
									</button>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
