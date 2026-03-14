"use client";

import { cn } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface WeeklyCalendarProps {
	selectedDateStr: string;
}

export function WeeklyCalendar({ selectedDateStr }: WeeklyCalendarProps) {
	const router = useRouter();

	// We use the provided YYYY-MM-DD string as local time base
	const selectedDate = new Date(`${selectedDateStr}T00:00:00`);
	const today = new Date();

	// Generate 7 days ending on today so the visible calendar doesn't shift when selecting older days
	const weekDays = Array.from({ length: 7 }).map((_, i) =>
		addDays(today, i - 6),
	);

	return (
		<div className="flex items-center py-4 w-full mx-auto overflow-x-auto no-scrollbar gap-2 snap-x snap-mandatory relative">
			{/* Sticky Month Dropdown */}
			<div className="sticky left-0 z-20 flex-shrink-0 bg-background py-1 pr-2 -ml-2 pl-2">
				<label className="flex flex-col items-center justify-center p-3 rounded-[1.25rem] min-w-[4rem] glass-card hover:bg-foreground/[0.03] transition-all cursor-pointer border border-foreground/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
					<span className="text-[10px] uppercase font-black tracking-widest text-orange-500 mb-0.5 pointer-events-none">
						{format(selectedDate, "MMM")}
					</span>
					<span className="text-sm font-black text-foreground pointer-events-none">
						{format(selectedDate, "yy")}
					</span>
					<ChevronDown className="w-3 h-3 text-foreground/40 mt-1 pointer-events-none" />
					<input
						type="date"
						value={selectedDateStr}
						max={format(today, "yyyy-MM-dd")}
						onChange={(e) => {
							if (e.target.value) {
								router.push(`/workouts?date=${e.target.value}`);
							}
						}}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none"
					/>
				</label>
			</div>

			{/* Calendar Days */}
			{weekDays.map((day) => {
				const dateStr = format(day, "yyyy-MM-dd");
				const isSelected = isSameDay(day, selectedDate);
				const isToday = isSameDay(day, new Date());

				return (
					<Link
						key={dateStr}
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
	);
}
