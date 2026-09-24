"use client";

import { useMemo, useState } from "react";
import {
	NotImprovedExercise,
	ExerciseProgressDataPoint,
} from "@/types/workout";
import { AnalyticsTabs } from "./AnalyticsTabs";
import {
	ChevronDown,
	Clock3,
	TrendingUp,
	ArrowUpRight,
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
	ResponsiveContainer,
	ComposedChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ReferenceLine,
} from "recharts";
import { useTheme } from "next-themes";
import Link from "next/link";

interface NotImprovedExerciseListProps {
	data: {
		windowDays: number;
		exercises: NotImprovedExercise[];
		improvedInWindow: number;
		mostStuck: NotImprovedExercise | null;
	};
}

type SortKey = "flat" | "stale" | "recent" | "alpha";

const SORTS: { key: SortKey; label: string }[] = [
	{ key: "flat", label: "Stuck" },
	{ key: "stale", label: "Longest flat" },
	{ key: "recent", label: "Recently trained" },
	{ key: "alpha", label: "A–Z" },
];

/** Compact "3w2d" style readout of how long something has been stalled. */
function fmtStuck(days: number): string {
	if (days <= 0) return "0d";
	const w = Math.floor(days / 7);
	const d = days % 7;
	if (w === 0) return `${d}d`;
	if (d === 0) return `${w}w`;
	return `${w}w ${d}d`;
}

/** Difference between current best and all-time best, as a kg label. */
function fmtDeltaKg(current: number, best: number): string {
	const diff = Math.round((current - best) * 10) / 10;
	if (Math.abs(diff) < 0.05) return "tied your best";
	return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg`;
}

/** Severity colour driven by how long the exercise has been flat. */
function stuckTone(days: number) {
	if (days >= 42) return { text: "text-rose-400", dot: "bg-rose-400" };
	if (days >= 28) return { text: "text-amber-400", dot: "bg-amber-400" };
	return { text: "text-foreground/70", dot: "bg-foreground/40" };
}

function Sparkline({
	values,
	className,
}: {
	values: number[];
	className?: string;
}) {
	const w = 132;
	const h = 40;
	const px = 3;
	const py = 4;

	if (values.length < 2) {
		return (
			<div className={cn("flex h-10 w-[132px] items-center justify-end", className)}>
				<span className="text-[10px] font-semibold tabular-nums text-foreground/25">
					no trend
				</span>
			</div>
		);
	}

	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const step = (w - px * 2) / (values.length - 1);
	const pts = values.map((v, i) => {
		const x = px + i * step;
		const y = h - py - ((v - min) / range) * (h - py * 2);
		return [x, y] as const;
	});

	const line = pts
		.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`)
		.join(" ");
	const last = pts[pts.length - 1];
	const area = `${line} L${last[0].toFixed(1)},${(h - py).toFixed(1)} L${px},${(h - py).toFixed(1)} Z`;

	return (
		<svg
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			className={cn("shrink-0", className)}
			aria-hidden>
			<path d={area} fill="currentColor" opacity="0.12" />
			<path
				d={line}
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function NotImprovedExerciseList({
	data,
}: NotImprovedExerciseListProps) {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme !== "light";
	const tickColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.55)";
	const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)";

	const [sortBy, setSortBy] = useState<SortKey>("flat");
	const [openExercise, setOpenExercise] = useState<string | null>(null);

	const stalled = useMemo(
		() => data.exercises.filter((e) => e.status === "stalled"),
		[data.exercises],
	);
	const unpracticed = useMemo(
		() => data.exercises.filter((e) => e.status === "unpracticed"),
		[data.exercises],
	);

	const trainedInWindow = stalled.length + data.improvedInWindow;
	const stuckPct =
		trainedInWindow > 0
			? Math.round((stalled.length / trainedInWindow) * 100)
			: 0;

	const avgStagnation = useMemo(() => {
		if (stalled.length === 0) return 0;
		return Math.round(
			stalled.reduce((acc, e) => acc + e.daysSinceLastImprovement, 0) /
			stalled.length,
		);
	}, [stalled]);

	const sorted = useMemo(() => {
		const list = [...data.exercises];
		switch (sortBy) {
			case "flat":
				return list.sort((a, b) => {
					if (a.status !== b.status) return a.status === "stalled" ? -1 : 1;
					return (
						a.deltaPercent - b.deltaPercent ||
						b.daysSinceLastImprovement - a.daysSinceLastImprovement
					);
				});
			case "stale":
				return list.sort(
					(a, b) => b.daysSinceLastImprovement - a.daysSinceLastImprovement,
				);
			case "recent":
				return list.sort((a, b) =>
					b.lastLoggedDate.localeCompare(a.lastLoggedDate),
				);
			case "alpha":
				return list.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
			default:
				return list;
		}
	}, [data.exercises, sortBy]);

	const grouped = useMemo(() => {
		const map = new Map<string, NotImprovedExercise[]>();
		for (const ex of sorted) {
			const items = map.get(ex.muscleGroup) || [];
			items.push(ex);
			map.set(ex.muscleGroup, items);
		}
		return Array.from(map.entries())
			.map(([muscleGroup, items]) => ({ muscleGroup, items }))
			.sort((a, b) => {
				const stalledDiff =
					b.items.filter((i) => i.status === "stalled").length -
					a.items.filter((i) => i.status === "stalled").length;
				return stalledDiff || a.muscleGroup.localeCompare(b.muscleGroup);
			});
	}, [sorted]);

	return (
		<div className="mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<AnalyticsTabs />

			{/* Hero */}
			<section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
				<div className="flex flex-col justify-between gap-10">
					<div className="space-y-5">
						<span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.02] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
							<span className="h-1 w-1 rounded-full bg-brand-primary" />
							3-week check-in
						</span>

						<h1 className="text-4xl font-extrabold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl md:text-6xl">
							Exercises that
							<br />
							<span className="text-brand-primary">aren&apos;t moving.</span>
						</h1>

						<p className="max-w-[46ch] text-sm leading-relaxed text-foreground/55 md:text-[15px]">
							Weight exercises you trained in the last {data.windowDays} days
							without setting a new best 1RM — plus planned movements you
							haven&apos;t touched.
						</p>
					</div>

					{/* Metrics strip */}
					<div className="flex items-stretch divide-x divide-foreground/[0.08]">
						<div className="pr-6">
							<p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
								{stalled.length}
							</p>
							<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/40">
								stalled
							</p>
						</div>
						<div className="px-6">
							<p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
								{unpracticed.length}
							</p>
							<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/40">
								unpracticed
							</p>
						</div>
						<div className="pl-6">
							<p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
								{fmtStuck(avgStagnation)}
							</p>
							<p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/40">
								avg stuck
							</p>
						</div>
					</div>
				</div>

				{/* Signal panel */}
				<div className="relative flex flex-col justify-between gap-9 overflow-hidden rounded-[1.75rem] border border-foreground/[0.07] bg-gradient-to-b from-foreground/[0.03] to-transparent p-6 md:p-7">
					<div
						aria-hidden
						className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-primary/15 blur-3xl"
					/>

					<div>
						<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
							Weight sessions · last {data.windowDays} days
						</p>
						<div className="mt-3 flex items-baseline gap-2">
							<span className="text-5xl font-extrabold tabular-nums tracking-tighter text-foreground md:text-6xl">
								{trainedInWindow}
							</span>
							<span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/45">
								<Clock3 className="h-3.5 w-3.5" />
								exercises trained
							</span>
						</div>

						{trainedInWindow > 0 ? (
							<>
								<div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
									<div
										className="h-full rounded-l-full bg-rose-400/80 transition-all duration-700"
										style={{ width: `${stuckPct}%` }}
									/>
									<div
										className="h-full flex-1 bg-brand-primary/70 transition-all duration-700"
									/>
								</div>
								<div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest">
									<span className="inline-flex items-center gap-1.5 text-rose-400/80">
										<span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
										{stalled.length} stuck
									</span>
									<span className="inline-flex items-center gap-1.5 text-foreground/45">
										<span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
										{data.improvedInWindow} improved
									</span>
								</div>
							</>
						) : (
							<p className="mt-6 text-xs leading-relaxed text-foreground/45">
								No loaded sessions detected in this window.
							</p>
						)}
					</div>

					<div className="border-t border-foreground/[0.06] pt-5">
						<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
							Longest without a new best
						</p>
						<div className="mt-2 flex items-end justify-between gap-4">
							<p className="truncate text-lg font-bold tracking-tight text-foreground">
								{data.mostStuck?.exerciseName ?? "—"}
							</p>
							<span className="shrink-0 text-lg font-extrabold tabular-nums text-amber-400">
								{data.mostStuck ? fmtStuck(data.mostStuck.daysSinceLastImprovement) : ""}
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Toolbar */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<p className="text-[11px] font-medium text-foreground/40">
					{data.exercises.length} exercise{data.exercises.length === 1 ? "" : "s"}{" "}
					flagged · grouped by muscle
				</p>
				<div className="group-tabs" role="tablist" aria-label="Sort exercises">
					{SORTS.map((s) => (
						<button
							key={s.key}
							role="tab"
							aria-selected={sortBy === s.key}
							onClick={() => setSortBy(s.key)}
							className={cn("tab-item cursor-pointer", sortBy === s.key && "tab-item-active")}>
							{s.label}
						</button>
					))}
				</div>
			</div>

			{/* Muscle-group ledgers */}
			{sorted.length === 0 ? (
				<EmptyHero windowDays={data.windowDays} />
			) : (
				<div className="space-y-14">
					{grouped.map((group, gi) => (
						<motion.section
							key={group.muscleGroup}
							initial={{ opacity: 0, y: 18 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.05 * gi, duration: 0.4, ease: "easeOut" }}>
							<header className="flex items-baseline justify-between gap-4">
								<div className="flex items-baseline gap-3">
									<span className="text-[10px] font-bold tabular-nums tracking-[0.2em] text-foreground/30">
										{String(gi + 1).padStart(2, "0")}
									</span>
									<h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
										{group.muscleGroup}
									</h2>
								</div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/35">
									{group.items.filter((i) => i.status === "stalled").length}
									{" stuck · "}
									{group.items.filter((i) => i.status === "unpracticed").length}
									{" planned"}
								</p>
							</header>

							<div className="mt-4 overflow-hidden rounded-[1.5rem] border  bg-foreground/[0.02]">
								{group.items.map((ex) => (
									<LedgerRow
										key={ex.exerciseName}
										exercise={ex}
										isOpen={openExercise === ex.exerciseName}
										onToggle={() =>
											setOpenExercise(
												openExercise === ex.exerciseName ? null : ex.exerciseName,
											)
										}
										tickColor={tickColor}
										gridColor={gridColor}
									/>
								))}
							</div>
						</motion.section>
					))}
				</div>
			)}

			{/* Legend */}
			<div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-foreground/[0.06] pt-6">
				<LegendItem dot="bg-rose-400" text="Stalled — trained but never beat your best 1RM" />
				<LegendItem
					dot="border border-foreground/40 bg-transparent"
					text="Planned in your program but not trained in the window"
				/>
				<LegendItem
					dot="bg-brand-primary"
					text="1RM progress = max weight × (1 + reps ÷ 30)"
				/>
			</div>
		</div>
	);
}

function LegendItem({ dot, text }: { dot: string; text: string }) {
	return (
		<span className="inline-flex items-center gap-2 text-[11px] font-medium text-foreground/45">
			<span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
			{text}
		</span>
	);
}

function EmptyHero({ windowDays }: { windowDays: number }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-foreground/10 bg-foreground/[0.015] px-6 py-20 text-center">
			<div className="relative">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
					<TrendingUp className="h-7 w-7 text-brand-primary" />
				</div>
			</div>
			<h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">
				Everything is moving
			</h3>
			<p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-foreground/55">
				No planned or recently trained exercise has gone flat in the last{" "}
				{windowDays} days. Keep logging to keep this page honest.
			</p>
		</motion.div>
	);
}

interface LedgerRowProps {
	exercise: NotImprovedExercise;
	isOpen: boolean;
	onToggle: () => void;
	tickColor: string;
	gridColor: string;
}

function LedgerRow({ exercise, isOpen, onToggle, tickColor, gridColor }: LedgerRowProps) {
	const chartData = useMemo(
		() =>
			[...exercise.dataPoints].sort((a, b) => a.date.localeCompare(b.date)),
		[exercise.dataPoints],
	);
	const isStalled = exercise.status === "stalled";
	const tone = stuckTone(exercise.daysSinceLastImprovement);
	const deltaLabel = fmtDeltaKg(exercise.currentBestOneRM, exercise.bestOneRM);
	const chartValues = chartData.map((d) => d.estimatedOneRM);
	const rowId = exercise.exerciseName.toLowerCase().replace(/\s+/g, "-");

	return (
		<div>
			{/* Row header */}
			<button
				type="button"
				aria-expanded={isOpen}
				aria-controls={`detail-${rowId}`}
				onClick={onToggle}
				className={`group flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.03] focus-visible:outline-none md:gap-6 md:px-7 md:py-5`}>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						{isStalled && (
							<span
								className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)}
							/>
						)}
						<h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
							{exercise.exerciseName}
						</h3>
						{exercise.isPlanned && (
							<span className="inline-flex shrink-0 items-center rounded-md border border-foreground/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-foreground/45">
								plan
							</span>
						)}
					</div>
					<div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-foreground/40">
						{isStalled ? (
							<>
								<span>
									{exercise.sessionsInWindow || 0} session
									{exercise.sessionsInWindow === 1 ? "" : "s"} in window
								</span>
								<span className="text-foreground/20">·</span>
								<span>{exercise.totalSessions} all-time</span>
							</>
						) : (
							<span>Scheduled, not trained</span>
						)}
					</div>
				</div>

				<Sparkline
					values={chartValues}
					className="hidden text-brand-primary/60 sm:block"
				/>

				<div className="shrink-0 text-right">
					<p
						className={cn(
							"text-sm font-bold tabular-nums leading-none",
							tone.text,
						)}>
						{isStalled ? `${fmtStuck(exercise.daysSinceLastImprovement)} stuck` : "—"}
					</p>
					<p className="mt-1 text-[10px] font-medium tabular-nums text-foreground/35">
						{isStalled
							? `${deltaLabel} · best ${exercise.bestOneRM}kg`
							: "0 sessions logged"}
					</p>
				</div>

				<ChevronDown
					className={cn(
						"h-4 w-4 shrink-0 text-foreground/30 transition-transform duration-300 group-hover:text-foreground/60",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{/* Expandable detail */}
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						id={`detail-${rowId}`}
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ height: { duration: 0.3, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
						className="overflow-hidden">
						<div className="glass m-3 rounded-2xl px-5 pb-6 pt-5 md:m-4 md:px-7">
							<div className="grid grid-cols-2 gap-y-4 md:grid-cols-4 md:divide-x md:divide-foreground/[0.06]">
								<MiniStat
									label="All-time best 1RM"
									value={`${exercise.bestOneRM}kg`}
									className="md:pr-5"
								/>
								<MiniStat
									label="Current best 1RM"
									value={`${exercise.currentBestOneRM}kg`}
									accent={isStalled}
									className="md:pl-5"
								/>
								<MiniStat label="Sessions in window" value={`${exercise.sessionsInWindow}`} className="md:pr-5" />
								<MiniStat
									label="Flat since"
									value={fmtStuck(exercise.daysSinceLastImprovement)}
									className="md:pl-5"
								/>
							</div>

							<div className="mt-5 h-[200px] w-full md:h-[240px]">
								<ResponsiveContainer width="100%" height="100%">
									<ComposedChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
										<XAxis
											dataKey="date"
											axisLine={false}
											tickLine={false}
											tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
											tickFormatter={(v) => format(parseISO(v), "MMM d")}
											minTickGap={30}
										/>
										<YAxis
											axisLine={false}
											tickLine={false}
											tick={{ fill: tickColor, fontSize: 10, fontWeight: 600 }}
											domain={["dataMin - 5", "dataMax + 5"]}
										/>
										<Tooltip
											content={({ active, payload }) => {
												if (active && payload && payload.length) {
													const d = payload[0].payload as ExerciseProgressDataPoint;
													return (
														<div className="rounded-2xl border border-foreground/10 bg-background/95 p-3.5 shadow-xl backdrop-blur-xl">
															<p className="mb-2 text-[10px] font-semibold uppercase text-foreground/50">
																{format(parseISO(d.date), "MMMM d, yyyy")}
															</p>
															<div className="space-y-1.5 min-w-[130px]">
																<div className="flex justify-between gap-6">
																	<span className="text-[10px] font-medium uppercase text-brand-primary">Max</span>
																	<span className="text-xs font-bold tabular-nums text-foreground">{d.maxWeight} kg</span>
																</div>
																<div className="flex justify-between gap-6">
																	<span className="text-[10px] font-medium uppercase text-indigo-400">Est. 1RM</span>
																	<span className="text-xs font-bold tabular-nums text-foreground">{d.estimatedOneRM} kg</span>
																</div>
															</div>
														</div>
													);
												}
												return null;
											}}
										/>
										<Line
											type="monotone"
											dataKey="estimatedOneRM"
											stroke="#818cf8"
											strokeWidth={2.5}
											dot={{ r: 3.5, fill: "#818cf8", strokeWidth: 0 }}
											activeDot={{ r: 5, strokeWidth: 0 }}
										/>
										<Line
											type="monotone"
											dataKey="maxWeight"
											stroke="var(--brand-accent, #ff5722)"
											strokeWidth={2}
											strokeDasharray="4 4"
											dot={false}
										/>
										<ReferenceLine
											y={exercise.bestOneRM}
											stroke="var(--brand-accent, #ff5722)"
											strokeDasharray="3 3"
											label={{
												value: "All-time best",
												position: "insideTopRight",
												fill: "var(--brand-accent, #ff5722)",
												fontSize: 10,
												fontWeight: 700,
											}}
										/>
									</ComposedChart>
								</ResponsiveContainer>
							</div>

							<div className="mt-5 flex items-center justify-between">
								<p className="text-[11px] font-medium text-foreground/40">
									Last PR{" "}
									{formatDistanceToNow(parseISO(exercise.lastImprovementDate))} ago
									{exercise.lastLoggedDate !== exercise.lastImprovementDate &&
										` · last logged ${formatDistanceToNow(parseISO(exercise.lastLoggedDate))} ago`}
								</p>
								<Link
									href={`/analytics?exercise=${encodeURIComponent(exercise.exerciseName)}`}
									className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-primary transition-all hover:bg-brand-primary/10 active:scale-95">
									Full timeline
									<ArrowUpRight className="h-3 w-3" />
								</Link>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function MiniStat({
	label,
	value,
	accent,
	className,
}: {
	label: string;
	value: string;
	accent?: boolean;
	className?: string;
}) {
	return (
		<div className={cn("min-w-0", className)}>
			<p className="text-[9px] font-semibold uppercase tracking-wider text-foreground/35">
				{label}
			</p>
			<p
				className={cn(
					"mt-1 text-sm font-bold tabular-nums leading-none",
					accent ? "text-amber-400" : "text-foreground",
				)}>
				{value}
			</p>
		</div>
	);
}