"use client";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { CalendarRange } from "lucide-react";

interface WeeklyVolumeChartProps {
	data: { week: number; volume: number }[];
}

interface TooltipPayloadItem {
	value: number;
	payload: { week: number; volume: number };
}

function ChartTooltip({
	active,
	payload,
}: {
	active?: boolean;
	payload?: TooltipPayloadItem[];
}) {
	if (!active || !payload?.length) return null;
	return (
		<div className="glass px-3 py-2 rounded-xl shadow-xl border border-white/10">
			<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-0.5">
				Week {payload[0].payload.week}
			</p>
			<p className="text-sm font-black text-brand-primary tabular-nums">
				{(payload[0].value / 1000).toFixed(1)}
				<span className="text-[10px] font-bold text-foreground/50 ml-1">
					TONNES
				</span>
			</p>
		</div>
	);
}

export default function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
	const totalVolume = data.reduce((acc, d) => acc + d.volume, 0);
	const hasData = totalVolume > 0;

	return (
		<GlassCard className="h-full flex flex-col">
			<div className="flex justify-between items-start mb-6">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
						<CalendarRange className="w-5 h-5 text-brand-primary" />
					</div>
					<div>
						<h3 className="text-sm font-black text-foreground tracking-tight">
							Volume by Week
						</h3>
						<p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
							{(totalVolume / 1000).toFixed(1)}t lifted across{" "}
							{data.length} weeks
						</p>
					</div>
				</div>
			</div>

			{hasData ? (
				<div className="flex-1 min-h-[220px] w-full -ml-2">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="color-mix(in srgb, var(--foreground) 7%, transparent)"
								vertical={false}
							/>
							<XAxis
								dataKey="week"
								axisLine={false}
								tickLine={false}
								tick={{
									fill: "color-mix(in srgb, var(--foreground) 40%, transparent)",
									fontSize: 10,
									fontWeight: 800,
								}}
								tickFormatter={(w) => `W${w}`}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								width={44}
								tick={{
									fill: "color-mix(in srgb, var(--foreground) 40%, transparent)",
									fontSize: 10,
									fontWeight: 800,
								}}
								tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
							/>
							<Tooltip
								content={<ChartTooltip />}
								cursor={{ fill: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}
							/>
							<Bar
								dataKey="volume"
								fill="var(--brand-accent)"
								radius={[6, 6, 0, 0]}
								maxBarSize={34}
								animationDuration={900}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			) : (
				<div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center px-6">
					<p className="text-sm font-bold text-foreground/60 mb-1">
						No volume logged yet
					</p>
					<p className="text-xs text-foreground/40 leading-relaxed max-w-[240px]">
						Complete your first session and weekly tonnage will chart here.
					</p>
				</div>
			)}
		</GlassCard>
	);
}
