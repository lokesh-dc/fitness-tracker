"use client";

import {
	format,
	addDays,
	startOfWeek,
	endOfWeek,
	eachDayOfInterval,
	isSameDay,
	isWithinInterval,
	startOfMonth,
	endOfMonth,
	isSameMonth,
	isBefore,
	startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

interface PlanCalendarProps {
	startDate: string;
	numWeeks: number;
	loggedDates: string[];
	trainingDays: number[];
}

export function PlanCalendar({
	startDate,
	numWeeks,
	loggedDates,
	trainingDays,
}: PlanCalendarProps) {
	const start = new Date(startDate + "T00:00:00");
	const end = addDays(start, numWeeks * 7 - 1);

	// We want to show a continuous calendar from start to end
	const days = eachDayOfInterval({ start, end });

	// Group days by week for a better grid layout, or just a large grid
	// Let's do a continuous grid but padded to the first day of the week
	const calendarStart = startOfWeek(start, { weekStartsOn: 1 }); // Monday
	const calendarEnd = endOfWeek(end, { weekStartsOn: 1 });

	const allCalendarDays = eachDayOfInterval({
		start: calendarStart,
		end: calendarEnd,
	});

	const isLogged = (date: Date) => {
		const dateStr = format(date, "yyyy-MM-dd");
		return loggedDates.includes(dateStr);
	};

	const isWithinPlan = (date: Date) => {
		return isWithinInterval(date, { start, end });
	};

	return (
		<section className="space-y-4 glass-card">
			<div className="flex flex-col gap-2 justify-between px-1">
				<h2 className="text-sm font-black text-foreground uppercase tracking-widest">
					Training Consistency
				</h2>
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-1.5">
						<div className="w-2.5 h-2.5 rounded-sm bg-brand-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
						<span className="text-[10px] font-black text-foreground/40 uppercase tracking-tight">
							Logged
						</span>
					</div>
					<div className="flex items-center space-x-1.5">
						<div className="w-2.5 h-2.5 rounded-sm bg-rose-500/20 border border-rose-500/30" />
						<span className="text-[10px] font-black text-foreground/40 uppercase tracking-tight">
							Missed
						</span>
					</div>
					<div className="flex items-center space-x-1.5">
						<div className="w-2.5 h-2.5 rounded-sm bg-foreground/5 border border-foreground/10" />
						<span className="text-[10px] font-black text-foreground/40 uppercase tracking-tight">
							Rest
						</span>
					</div>
				</div>
			</div>

			<GlassCard className="p-6">
				<div className="grid grid-cols-7 gap-2 mb-8">
					{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
						<div
							key={i}
							className="text-center text-[9px] font-black text-foreground/20 uppercase tracking-tighter">
							{day}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-3">
					{allCalendarDays.map((date, i) => {
						const inPlan = isWithinPlan(date);
						const isToday = isSameDay(date, new Date());
						const isFirstOfMonth = date.getDate() === 1 || i === 0;
						const isPast = isBefore(date, startOfDay(new Date()));
						const isTrainingDay = trainingDays.includes(date.getDay());

						const hasLogged = isLogged(date);
						const isMissed = inPlan && !hasLogged && isTrainingDay && isPast;
						const isRest = inPlan && !hasLogged && !isTrainingDay;
						const isScheduled = inPlan && !hasLogged && isTrainingDay && !isPast;

						return (
							<div
								key={i}
								className={cn(
									"aspect-square rounded-sm flex flex-col items-center justify-center relative transition-all duration-300 group",
									!inPlan && "opacity-0 pointer-events-none",
									isMissed && "bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20",
									isRest && "bg-foreground/[0.02] border border-foreground/[0.03] hover:bg-foreground/[0.05]",
									isScheduled && "bg-foreground/[0.05] border border-foreground/[0.1] hover:bg-foreground/[0.08]",
									hasLogged && "bg-emerald-500 border border-emerald-400 shadow-[0_5px_15px_rgba(16,185,129,0.2)] hover:scale-110 z-10",
								)}>
								{inPlan && isFirstOfMonth && (
									<span className="absolute -top-4 left-0 text-[8px] font-black text-foreground/30 uppercase whitespace-nowrap">
										{format(date, "MMM")}
									</span>
								)}

								<span
									className={cn(
										"text-[10px] font-black",
										hasLogged ? "text-white" : "text-foreground/40",
									)}>
									{format(date, "d")}
								</span>

								{isRest && (
									<span className="text-[6px] font-black text-foreground/20 uppercase tracking-tighter mt-0.5">
										Rest
									</span>
								)}
								{isScheduled && !isToday && (
									<span className="text-[6px] font-black text-emerald-500/40 uppercase tracking-tighter mt-0.5">
										Lift
									</span>
								)}

								{isToday && inPlan && (
									<div
										className={cn(
											"absolute bottom-1 w-1 h-1 rounded-full",
											hasLogged ? "bg-white" : "bg-emerald-500",
										)}
									/>
								)}
							</div>
						);
					})}
				</div>
			</GlassCard>
		</section>
	);
}
