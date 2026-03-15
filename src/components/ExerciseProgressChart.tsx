"use client";

import { useState } from "react";
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { RangeSelector, TimeRange } from "./ui/RangeSelector";

interface ExerciseProgressChartProps {
	data: { date: string; weight: number }[];
	exerciseName: string;
}

export default function ExerciseProgressChart({
	data,
	exerciseName,
}: ExerciseProgressChartProps) {
	const [range, setRange] = useState<TimeRange>("all");

	const filteredData = data.filter((item) => {
		const date = parseISO(item.date);
		if (range === "7d") return isAfter(date, subDays(new Date(), 7));
		if (range === "30d") return isAfter(date, subDays(new Date(), 30));
		return true;
	});

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="glass p-3 border-white/10 rounded-xl shadow-xl">
					<p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
						{format(parseISO(label), "MMM d, yyyy")}
					</p>
					<p className="text-sm font-bold text-orange-500">
						{payload[0].value}{" "}
						<span className="text-[10px] text-white/60">KG</span>
					</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="h-[300px] flex flex-col">
			<div className="flex justify-between items-center mb-6 px-2">
				<div>
					<h3 className="text-sm font-black text-foreground uppercase tracking-widest">
						{exerciseName}
					</h3>
					<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
						Progress over time
					</p>
				</div>
				<RangeSelector range={range} setRange={setRange} />
			</div>

			<div className="flex-1 w-full -ml-4">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient id="colorExercise" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#f97316" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#ffffff05"
							vertical={false}
						/>
						<XAxis
							dataKey="date"
							axisLine={false}
							tickLine={false}
							tick={{
								fill: "currentColor",
								fontSize: 9,
								fontWeight: 700,
								className: "text-foreground/20",
							}}
							tickFormatter={(str) => format(parseISO(str), "MMM d")}
							minTickGap={30}
						/>
						<YAxis
							domain={["dataMin - 5", "dataMax + 5"]}
							axisLine={false}
							tickLine={false}
							tick={{
								fill: "currentColor",
								fontSize: 9,
								fontWeight: 700,
								className: "text-foreground/20",
							}}
							width={30}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Area
							type="monotone"
							dataKey="weight"
							stroke="#f97316"
							strokeWidth={3}
							fillOpacity={1}
							fill="url(#colorExercise)"
							animationDuration={1000}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
