"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSlider } from "@/components/ui/GlassSlider";
import {
	Sparkles,
	Loader2,
	ArrowLeft,
	RefreshCcw,
	AlertTriangle,
	Dumbbell,
	Flame,
	Activity,
	Wand2,
	Check,
	CalendarRange,
	GripVertical,
} from "lucide-react";
import {
	DndContext,
	DragOverlay,
	useDraggable,
	useDroppable,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	closestCorners,
	type DragStartEvent,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	generateProgram,
	matchGeneratedExercises,
	getGenerationQuota,
} from "@/app/actions/plan";
import { PlanDesigner } from "@/components/PlanDesigner";
import {
	Goal,
	ExperienceLevel,
	Equipment,
	SplitStyle,
	DayAssignments,
	EQUIPMENT_OPTIONS,
	SPLIT_OPTIONS,
	SPLIT_FOR_DAYS,
	getDefaultDayLabels,
	GeneratedProgram,
	MatchedDay,
	ExerciseDefinition,
	ExerciseReview,
} from "@/types/workout";
import { cn } from "@/lib/utils";

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
	{ value: "strength", label: "Strength" },
	{ value: "hypertrophy", label: "Hypertrophy" },
	{ value: "endurance", label: "Endurance" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
	{ value: "beginner", label: "Beginner" },
	{ value: "intermediate", label: "Intermediate" },
	{ value: "advanced", label: "Advanced" },
];

const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const STEP_LABELS = [
	"Goal & Experience",
	"Frequency & Days",
	"Training Split",
	"Day Assignment",
	"Duration",
	"Equipment",
];

const GEN_STATUS_LINES = [
	"Analyzing your goals & experience...",
	"Building your weekly split...",
	"Matching exercises to your equipment...",
	"Calibrating reps, sets & rest...",
	"Polishing your program...",
];

// Preferred order used to auto-fill weekdays when the frequency grows.
const PREFERRED_ORDER = [1, 2, 3, 4, 5, 6, 0];

function normalizeTrainingDays(selected: number[], count: number): number[] {
	const unique = Array.from(
		new Set(selected.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)),
	);
	const result = unique.slice(0, count);
	for (const d of PREFERRED_ORDER) {
		if (result.length >= count) break;
		if (!result.includes(d)) result.push(d);
	}
	return result;
}

function makeTempId(dayOfWeek: number, name: string) {
	return `ai-preview-${dayOfWeek}-${name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40)}`;
}

// ---- Drag & drop primitives for the Day Assignment step ----

const SESSION_COLORS: Record<string, string> = {
	Push: "bg-orange-500/15 border-orange-500/40 text-orange-400",
	Pull: "bg-blue-500/15 border-blue-500/40 text-blue-400",
	Legs: "bg-green-500/15 border-green-500/40 text-green-400",
	Upper: "bg-purple-500/15 border-purple-500/40 text-purple-400",
	Lower: "bg-yellow-500/15 border-yellow-500/40 text-yellow-400",
	"Full Body": "bg-brand-primary/15 border-brand-primary/40 text-brand-primary",
	Chest: "bg-red-500/15 border-red-500/40 text-red-400",
	Back: "bg-cyan-500/15 border-cyan-500/40 text-cyan-400",
	Shoulders: "bg-indigo-500/15 border-indigo-500/40 text-indigo-400",
	Arms: "bg-pink-500/15 border-pink-500/40 text-pink-400",
	Core: "bg-teal-500/15 border-teal-500/40 text-teal-400",
};

function SessionChip({
	label,
	className,
	children,
}: {
	label: string;
	className?: string;
	children?: ReactNode;
}) {
	const c =
		SESSION_COLORS[label] ??
		"bg-foreground/10 border-foreground/20 text-foreground/60";
	return (
		<div
			className={cn(
				"rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-wider whitespace-nowrap select-none",
				c,
				className,
			)}>
			{children ?? label}
		</div>
	);
}

/* eslint-disable react-hooks/refs --
   @dnd-kit's drag & drop API relies on callback refs (setNodeRef) and
   listener/attribute spreads attached during render; the built-in
   react-hooks/refs rule flags this documented pattern as a false positive. */
function DayChip({ dayNumber, label }: { dayNumber: number; label: string }) {
	const draggable = useDraggable({
		id: `chip-${dayNumber}-${label}`,
		data: { kind: "day", label, fromDay: dayNumber },
	});
	return (
		<div
			ref={draggable.setNodeRef}
			{...draggable.listeners}
			{...draggable.attributes}
			className={cn(
				"cursor-grab active:cursor-grabbing touch-none",
				draggable.isDragging && "opacity-30",
			)}>
			<SessionChip
				label={label}
				className="w-full text-center transition-transform hover:scale-[1.02] hover:shadow-sm"
			/>
		</div>
	);
}

function DaySlot({
	dayNumber,
	abbr,
	labels,
}: {
	dayNumber: number;
	abbr: string;
	labels: string[];
}) {
	const droppable = useDroppable({ id: `day-${dayNumber}` });
	return (
		<div
			ref={droppable.setNodeRef}
			className={cn(
				"flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition-all",
				droppable.isOver
					? "border-brand-primary bg-brand-primary/10"
					: "border-foreground/8 bg-foreground/3",
			)}>
			<p className="text-xs font-black text-foreground uppercase tracking-wide w-12 shrink-0">
				{abbr}
			</p>
			{labels.length > 0 ? (
				<div className="flex-1 flex flex-col gap-1.5 min-w-0">
					{labels.map((label) => (
						<DayChip key={label} dayNumber={dayNumber} label={label} />
					))}
				</div>
			) : (
				<div
					className={cn(
						"flex-1 rounded-xl border border-dashed text-[10px] font-bold uppercase tracking-widest text-center py-2.5 transition-all",
						droppable.isOver
							? "border-brand-primary/60 text-brand-primary"
							: "border-foreground/15 text-foreground/30",
					)}>
					{droppable.isOver ? "Drop here" : "Empty · drag a session"}
				</div>
			)}
		</div>
	);
}

function PoolChip({ label }: { label: string }) {
	const draggable = useDraggable({
		id: `pool-${label}`,
		data: { kind: "pool", label },
	});
	return (
		<div
			ref={draggable.setNodeRef}
			{...draggable.listeners}
			{...draggable.attributes}
			className={cn(
				"cursor-grab active:cursor-grabbing touch-none transition-transform hover:scale-[1.03]",
				draggable.isDragging && "opacity-30",
			)}>
			<SessionChip label={label} className="flex items-center gap-1.5 ring-1 ring-white/5">
				<GripVertical className="w-3 h-3 opacity-60" />
				{label}
			</SessionChip>
		</div>
	);
}

function PoolSection({
	labels,
	allowStacking,
}: {
	labels: string[];
	allowStacking: boolean;
}) {
	const droppable = useDroppable({ id: "pool" });
	return (
		<div
			ref={droppable.setNodeRef}
			className={cn(
				"rounded-2xl px-4 py-4 border-2 border-dashed transition-all",
				droppable.isOver
					? "border-brand-primary/60 bg-brand-primary/5"
					: "border-foreground/8 bg-foreground/3",
			)}>
			<p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-3">
				{allowStacking
					? "Not placed yet · drop on a day to add it (stack several on one day)"
					: "Not placed yet · drop on a day to place it (one session per day)"}
			</p>
			<div className="flex flex-wrap gap-2">
				{labels.length === 0 ? (
					<div className="text-xs text-foreground/40 font-medium leading-relaxed">
						All sessions are placed — drag one back here to free it up.
						{allowStacking && (
							<>
								<br />
								<span className="text-foreground/30">
									Tip: fewer days than sessions? Drop two sessions onto the same
									day to cover everything.
								</span>
							</>
						)}
					</div>
				) : (
					labels.map((label) => <PoolChip key={label} label={label} />)
				)}
			</div>
		</div>
	);
}
/* eslint-enable react-hooks/refs */

export function GenerateProgramForm({
	initialExercises,
}: {
	initialExercises: ExerciseDefinition[];
}) {
	const [goal, setGoal] = useState<Goal>("hypertrophy");
	const [daysPerWeek, setDaysPerWeek] = useState(4);
	const [trainingDays, setTrainingDays] = useState<number[]>([1, 2, 3, 4]);
	const [equipment, setEquipment] = useState<Equipment[]>([
		"dumbbell",
		"barbell",
	]);
	const [experienceLevel, setExperienceLevel] =
		useState<ExperienceLevel>("intermediate");
	const [weeksCount, setWeeksCount] = useState(4);
	const [splitStyle, setSplitStyle] = useState<SplitStyle>("upper-lower");
	const [dayAssignments, setDayAssignments] = useState<DayAssignments>({});
	const splitLabel =
		SPLIT_OPTIONS.find((s) => s.value === splitStyle)?.label || splitStyle;

	const [formStep, setFormStep] = useState(0);
	const [phase, setPhase] = useState<"form" | "preview">("form");
	const [isGenerating, setIsGenerating] = useState(false);
	const [genStatusIdx, setGenStatusIdx] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [matchedDays, setMatchedDays] = useState<MatchedDay[]>([]);
	const [generatedProgram, setGeneratedProgram] =
		useState<GeneratedProgram | null>(null);
	const [previewDirty, setPreviewDirty] = useState(false);
	const [quota, setQuota] = useState<{
		used: number;
		limit: number;
		remaining: number;
	} | null>(null);

	type DragSource =
		| { kind: "pool"; label: string }
		| { kind: "day"; fromDay: number; label: string };
	const [activeDrag, setActiveDrag] = useState<DragSource | null>(null);

	const dndSensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 200, tolerance: 6 },
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		const data = event.active.data.current as
			| { kind?: "day" | "pool"; label?: string; fromDay?: number }
			| undefined;
		if (data?.kind === "day") {
			setActiveDrag({
				kind: "day",
				fromDay: data.fromDay ?? 0,
				label: data.label ?? "",
			});
		} else if (data?.kind === "pool") {
			setActiveDrag({ kind: "pool", label: data.label ?? "" });
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const source = activeDrag;
		setActiveDrag(null);
		if (!source) return;

		const targetId = event.over ? String(event.over.id) : "";
		if (!targetId) return;

		// Dropped back onto the pool → remove that session from the day
		if (targetId === "pool") {
			if (source.kind === "day") {
				setDayAssignments((prev) => {
					const next = { ...prev };
					next[source.fromDay] = (next[source.fromDay] ?? []).filter(
						(l) => l !== source.label,
					);
					if (next[source.fromDay].length === 0) delete next[source.fromDay];
					return next;
				});
			}
			return;
		}

		if (!targetId.startsWith("day-")) return;

		const targetDay = Number(targetId.replace("day-", ""));

		if (source.kind === "pool") {
			// Drop the session onto the day. Without stacking available (equal or
			// fewer sessions than days), an occupied day is replaced so every day
			// keeps a single session.
			setDayAssignments((prev) => {
				const current = prev[targetDay] ?? [];
				if (current.includes(source.label)) return prev;
				if (!allowStacking && current.length > 0) {
					return { ...prev, [targetDay]: [source.label] };
				}
				return { ...prev, [targetDay]: [...current, source.label] };
			});
			return;
		}

		// Dragging from one day to another → move the session (removes it from
		// the source day, adds it to the target day). Without stacking this
		// becomes a swap so no day ends up with two sessions.
		const fromDay = source.fromDay;
		if (fromDay === targetDay) return;
		setDayAssignments((prev) => {
			const next = { ...prev };
			const fromLabels = (next[fromDay] ?? []).filter(
				(l) => l !== source.label,
			);
			const targetLabels = next[targetDay] ?? [];
			if (targetLabels.includes(source.label)) {
				next[fromDay] = fromLabels;
				if (fromLabels.length === 0) delete next[fromDay];
				return next;
			}
			if (!allowStacking && targetLabels.length > 0) {
				// Swap the two single sessions to keep one per day.
				next[fromDay] = targetLabels;
				next[targetDay] = [source.label, ...fromLabels];
				return next;
			}
			next[fromDay] = fromLabels;
			if (fromLabels.length === 0) delete next[fromDay];
			next[targetDay] = [...targetLabels, source.label];
			return next;
		});
	};

	const handleDirty = useCallback(() => setPreviewDirty(true), []);

	useEffect(() => {
		getGenerationQuota()
			.then(setQuota)
			.catch(() => {});
	}, []);

	// Auto-select the recommended split and reset day assignments whenever days change
	useEffect(() => {
		const recommended = SPLIT_FOR_DAYS[daysPerWeek] ?? "full-body";
		setSplitStyle(recommended);
		const sorted = normalizeTrainingDays(trainingDays, daysPerWeek).sort((a, b) => a - b);
		const labels = getDefaultDayLabels(recommended, sorted.length);
		const assignments: DayAssignments = {};
		sorted.forEach((dow, i) => { assignments[dow] = [labels[i]]; });
		setDayAssignments(assignments);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [daysPerWeek]);

	useEffect(() => {
		if (!isGenerating) {
			setGenStatusIdx(0);
			return;
		}
		const id = setInterval(() => {
			setGenStatusIdx((i) => (i + 1) % GEN_STATUS_LINES.length);
		}, 2000);
		return () => clearInterval(id);
	}, [isGenerating]);

	const toggleEquipment = (value: Equipment) => {
		setEquipment((prev) =>
			prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value],
		);
	};

	const toggleWeekday = (dow: number) => {
		setTrainingDays((prev) => {
			if (prev.includes(dow)) return prev.filter((d) => d !== dow);
			if (prev.length >= daysPerWeek) return [...prev.slice(1), dow];
			return [...prev, dow];
		});
	};

	const adjustDays = (delta: number) => {
		const next = Math.max(1, Math.min(7, daysPerWeek + delta));
		setDaysPerWeek(next);
		setTrainingDays((prev) => normalizeTrainingDays(prev, next));
	};

	const effectiveTrainingDays = normalizeTrainingDays(
		trainingDays,
		daysPerWeek,
	);

	// Day Assignment — stacking multiple sessions on one day is only allowed when
	// there are more session types than training days (otherwise the grid stays
	// one-session-per-day).
	const sessionTypeCount = new Set(getDefaultDayLabels(splitStyle, 7)).size;
	const allowStacking = sessionTypeCount > effectiveTrainingDays.length;

	const runGeneration = async () => {
		setIsGenerating(true);
		setError(null);
		try {
			const result = await generateProgram({
				goal,
				daysPerWeek,
				trainingDays: effectiveTrainingDays,
				splitStyle,
				equipment,
				experienceLevel,
				weeksCount,
				dayAssignments,
			});
			if (!result.success) {
				setError(result.error);
				return;
			}
			setGeneratedProgram(result.program);

			const matched = await matchGeneratedExercises(result.program.days);
			if (!matched || matched.length === 0) {
				setError(
					"Exercise library is empty — no matches could be found. Please add exercises first.",
				);
				return;
			}
			setMatchedDays(matched);
			setPreviewDirty(false);
			setPhase("preview");
			getGenerationQuota()
				.then(setQuota)
				.catch(() => {});
		} catch {
			setError("Failed to generate program. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const quotaReached = quota !== null && quota.remaining <= 0;

	const handleGenerate = () => {
		if (equipment.length === 0) {
			setError("Select at least one equipment option.");
			return;
		}
		if (quotaReached) {
			setError(
				"Daily limit reached — you've generated your programs for today. Come back tomorrow.",
			);
			return;
		}
		runGeneration();
	};

	const handleRegenerate = () => {
		if (quotaReached) {
			setError(
				"Daily limit reached — you've generated your programs for today. Come back tomorrow.",
			);
			return;
		}
		if (
			previewDirty &&
			!window.confirm(
				"You've made manual edits to this preview. Regenerating will discard them. Continue?",
			)
		) {
			return;
		}
		runGeneration();
	};

	// ---- Build PlanDesigner inputs from matched days ----

	const planData = (() => {
		const templates: {
			id: string;
			userId: string;
			planId: string;
			weekNumber: number;
			dayOfWeek: number;
			splitName: string;
			exercises: {
				exerciseId: string;
				name: string;
				targetSets: number;
				targetReps: number;
				unit: "reps";
				restDuration: number;
				lastWeight: number;
				pr: number;
				prReps: number;
				sets: { weight: number; reps: number }[];
			}[];
		}[] = [];

		for (let d = 0; d < 7; d++) {
			const matched = matchedDays.find((m) => m.dayOfWeek === d);
			if (!matched) {
				templates.push({
					id: `preview-${d}`,
					userId: "",
					planId: "",
					weekNumber: 1,
					dayOfWeek: d,
					splitName: "Rest Day",
					exercises: [],
				});
				continue;
			}
			templates.push({
				id: `preview-${d}`,
				userId: "",
				planId: "",
				weekNumber: 1,
				dayOfWeek: d,
				splitName: matched.name,
				exercises: matched.exercises.map((ex) => ({
					exerciseId: ex.exerciseId || makeTempId(d, ex.aiName),
					name: ex.exerciseName || ex.aiName,
					targetSets: ex.targetSets,
					targetReps: ex.targetReps,
					unit: "reps",
					restDuration: ex.restDuration,
					lastWeight: ex.lastWeight || 0,
					pr: 0,
					prReps: 0,
					sets: [],
				})),
			});
		}

		const splitLabel =
			SPLIT_OPTIONS.find((s) => s.value === splitStyle)?.label || splitStyle;

		const plan = {
			id: "",
			userId: "",
			name: `AI Program · ${splitLabel} · ${daysPerWeek} days`,
			startDate: new Date().toISOString().split("T")[0],
			numWeeks: weeksCount,
			createdAt: new Date(),
		};

		return {
			plan: { ...plan, mobilityWarmupIds: [], customMobilityWarmups: [] },
			templates,
		};
	})();

	const exerciseReviews = (() => {
		const reviews: Record<string, ExerciseReview> = {};
		for (const day of matchedDays) {
			for (const ex of day.exercises) {
				if (ex.exerciseId) continue;
				const tempId = makeTempId(day.dayOfWeek, ex.aiName);
				if (ex.needsUserReview) {
					reviews[tempId] = {
						kind: "review",
						candidates: ex.reviewCandidates || [],
						aiName: ex.aiName,
						muscleGroup: ex.muscleGroup,
					};
				} else if (ex.isNew) {
					reviews[tempId] = {
						kind: "new",
						aiName: ex.aiName,
						muscleGroup: ex.muscleGroup,
					};
				}
			}
		}
		return reviews;
	})();

	const dayRationales = (() => {
		const rationales: Record<number, string> = {};
		for (const day of matchedDays) {
			if (day.rationale) rationales[day.dayOfWeek] = day.rationale;
		}
		return rationales;
	})();

	const generationOverlay = isGenerating && (
		<div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/85 backdrop-blur-2xl">
			<div className="relative flex items-center justify-center mb-10">
				<span className="absolute w-52 h-52 rounded-full border border-brand-primary/15 animate-[breath_2.6s_ease-in-out_infinite]" />
				<span className="absolute w-36 h-36 rounded-full border border-brand-primary/25 animate-[breath_2.6s_ease-in-out_infinite_0.6s]" />
				<div className="relative w-24 h-24 rounded-3xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.35)]">
					<Sparkles className="w-11 h-11 text-brand-primary animate-pulse" />
				</div>
			</div>
			<h2 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight mb-3 text-center px-6">
				Designing your program
			</h2>
			<p className="text-sm font-bold text-brand-primary uppercase tracking-widest h-5 text-center px-6 mb-8 transition-all">
				{GEN_STATUS_LINES[genStatusIdx]}
			</p>
			<div className="w-64 max-w-[70vw] h-1.5 rounded-full bg-foreground/10 overflow-hidden relative">
				<div className="absolute inset-y-0 w-1/3 rounded-full bg-brand-primary animate-[genBar_1.4s_ease-in-out_infinite]" />
			</div>
		</div>
	);

	// ---- Form phase ----

	if (phase === "form") {
		const isLastStep = formStep === STEP_LABELS.length - 1;
		const canContinue = formStep !== 1 || trainingDays.length === daysPerWeek;

		const handleContinue = () => {
			setFormStep((s) => Math.min(STEP_LABELS.length - 1, s + 1));
		};

		const stepContent = (() => {
			switch (formStep) {
				case 0: {
					const GOAL_ICONS = {
						strength: Dumbbell,
						hypertrophy: Flame,
						endurance: Activity,
					} as const;
					const GOAL_DESCRIPTIONS: Record<Goal, string> = {
						strength: "Heavier lifts & maximum raw power",
						hypertrophy: "Leaner, fuller muscle growth",
						endurance: "Stamina, work capacity & conditioning",
					};
					const EXPERIENCE_INDEX: Record<ExperienceLevel, number> = {
						beginner: 0,
						intermediate: 1,
						advanced: 2,
					};
					const experienceIdx = EXPERIENCE_INDEX[experienceLevel];
					const selectExperience = (idx: number) =>
						setExperienceLevel(
							EXPERIENCE_OPTIONS[
								Math.max(0, Math.min(EXPERIENCE_OPTIONS.length - 1, idx))
							].value,
						);
					return (
						<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="max-w-md mx-auto space-y-10">
								<div className="text-center space-y-2">
									<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<Sparkles className="w-8 h-8 text-brand-primary" />
									</div>
									<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
										What&apos;s the goal?
									</h2>
									<p className="text-sm text-foreground/40 font-medium">
										Tell the coach what you&apos;re training for.
									</p>
								</div>

								<div className="space-y-3">
									{GOAL_OPTIONS.map((opt) => {
										const Icon = GOAL_ICONS[opt.value];
										const selected = goal === opt.value;
										return (
											<button
												key={opt.value}
												onClick={() => setGoal(opt.value)}
												className={cn(
													"w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group",
													selected
														? "bg-brand-primary/10 border-brand-primary"
														: "bg-foreground/5 border-foreground/5 hover:border-foreground/20",
												)}>
												<div
													className={cn(
														"w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
														selected
															? "bg-brand-primary text-black shadow-[0_0_25px_rgba(249,115,22,0.35)]"
															: "bg-foreground/10 text-foreground/40 group-hover:text-foreground/70",
													)}>
													<Icon className="w-6 h-6" />
												</div>
												<div className="flex-1 min-w-0">
													<p
														className={cn(
															"font-black text-sm uppercase tracking-wide",
															selected ? "text-brand-primary" : "text-foreground",
														)}>
														{opt.label}
													</p>
													<p className="text-xs font-medium text-foreground/50 mt-0.5 leading-snug">
														{GOAL_DESCRIPTIONS[opt.value]}
													</p>
												</div>
											</button>
										);
									})}
								</div>

								<hr className="border-foreground/10" />

								<div className="space-y-5">
									<div className="text-center space-y-1.5">
										<p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
											Experience level
										</p>
										<p className="text-4xl font-black text-brand-primary">
											{EXPERIENCE_OPTIONS[experienceIdx].label}
										</p>
									</div>

									<GlassSlider
										min={0}
										max={EXPERIENCE_OPTIONS.length - 1}
										step={1}
										value={experienceIdx}
										onChange={selectExperience}
										displayValue={EXPERIENCE_OPTIONS[experienceIdx].label}
										label="Experience Level"
										hideHeader
									/>

									<div className="flex items-center justify-between px-2 pt-1">
										{EXPERIENCE_OPTIONS.map((opt, i) => {
											const active = i === experienceIdx;
											return (
												<button
													key={opt.value}
													onClick={() => selectExperience(i)}
													className={cn(
														"text-[9px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
														active
															? "text-brand-primary"
															: "text-foreground/30 hover:text-foreground/60",
													)}>
													{opt.label}
												</button>
											);
										})}
									</div>
								</div>
							</div>
						</GlassCard>
					);
				}

				case 1:
					return (
						<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="max-w-md mx-auto space-y-8">
								<div className="text-center space-y-2">
									<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<CalendarRange className="w-8 h-8 text-brand-primary" />
									</div>
									<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
										Set your training days
									</h2>
									<p className="text-sm text-foreground/40 font-medium">
										Pick the frequency, then tap the exact days that fit your
										week — the program syncs to them.
									</p>
								</div>

								<div className="flex items-center justify-center space-x-6">
									<button
										onClick={() => adjustDays(-1)}
										className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
										-
									</button>
									<div className="text-5xl font-black text-brand-primary tabular-nums">
										{daysPerWeek}
									</div>
									<button
										onClick={() => adjustDays(1)}
										className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
										+
									</button>
								</div>
								<p className="text-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
									{daysPerWeek === 1 ? "day" : "days"} / week · A full
									week&apos;s split
								</p>

								<hr className="border-foreground/10" />

								<div className="text-center space-y-2">
									<h2 className="text-lg font-black text-foreground uppercase tracking-tight">
										Your training days
									</h2>
									<p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
										{trainingDays.length} of {daysPerWeek} selected
									</p>
								</div>

								<div className="grid grid-cols-7 gap-1.5">
									{WEEKDAY_ABBR.map((label, dow) => {
										const selected = trainingDays.includes(dow);
										return (
											<button
												key={dow}
												onClick={() => toggleWeekday(dow)}
												className={cn(
													"relative aspect-[3/4] rounded-xl border-2 transition-all flex items-center justify-center font-black text-[11px] uppercase tracking-wide",
													selected
														? "border-brand-primary bg-brand-primary/10 text-brand-primary"
														: "border-foreground/5 bg-foreground/5 text-foreground/50 hover:border-foreground/20",
												)}>
												{label}
												{selected && (
													<span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-brand-primary flex items-center justify-center">
														<Check
															className="w-2 h-2 text-black"
															strokeWidth={4}
														/>
													</span>
												)}
											</button>
										);
									})}
								</div>

								{trainingDays.length === daysPerWeek ? (
									<p className="text-center text-[10px] font-bold uppercase tracking-widest text-brand-primary">
										{trainingDays.map((d) => FULL_DAY_NAMES[d]).join(" · ")}
									</p>
								) : (
									<p className="text-center text-sm text-foreground/40 font-medium">
										Tip: when you&apos;re at {daysPerWeek} days, tapping a new
										day swaps it in — change them any time.
									</p>
								)}
							</div>
						</GlassCard>
					);

				case 2: {
					// Only show splits that are compatible with the selected day count
					const compatibleSplits = SPLIT_OPTIONS.filter(
						(opt) => daysPerWeek >= opt.minDays && daysPerWeek <= opt.maxDays,
					);
					// If current selection is not compatible, show all but mark
					const displaySplits =
						compatibleSplits.length > 0 ? compatibleSplits : SPLIT_OPTIONS;
					return (
						<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="max-w-md mx-auto space-y-8">
								<div className="text-center space-y-2">
									<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<Wand2 className="w-8 h-8 text-brand-primary" />
									</div>
									<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
										Pick a training split
									</h2>
									<p className="text-sm text-foreground/40 font-medium">
										Showing splits that fit your{" "}
										<span className="text-brand-primary font-bold">{daysPerWeek}-day</span>{" "}
										schedule.
									</p>
								</div>

								<div className="space-y-3">
									{displaySplits.map((opt) => {
										const selected = splitStyle === opt.value;
										const isRecommended = SPLIT_FOR_DAYS[daysPerWeek] === opt.value;
										return (
											<button
												key={opt.value}
												onClick={() => {
													setSplitStyle(opt.value);
													// Recompute default day assignments for the new split
													const sorted = [...effectiveTrainingDays].sort((a, b) => a - b);
													const labels = getDefaultDayLabels(opt.value, sorted.length);
													const assignments: DayAssignments = {};
													sorted.forEach((dow, i) => { assignments[dow] = [labels[i]]; });
													setDayAssignments(assignments);
												}}
												className={cn(
													"w-full text-left py-4 px-5 rounded-2xl border-2 transition-all relative",
													selected
														? "bg-brand-primary/10 border-brand-primary"
														: "bg-foreground/5 border-foreground/5 hover:border-foreground/20",
												)}>
												{isRecommended && (
													<span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-brand-primary text-black rounded-full px-2 py-0.5">
														Recommended
													</span>
												)}
												<div className="flex items-center justify-between gap-3 pr-16">
													<div>
														<p
															className={cn(
																"font-black text-sm uppercase tracking-wide",
																selected
																	? "text-brand-primary"
																	: "text-foreground",
															)}>
															{opt.label}
														</p>
														<p className="text-xs font-medium text-foreground/50 mt-1">
															{opt.description}
														</p>
														<p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mt-1.5">
															Best for {opt.bestFor}
														</p>
													</div>
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</GlassCard>
					);
				}

				case 3: {
					// Day Assignment — drag & drop session types onto your training days
					const sessionOptions = Array.from(
						new Set(getDefaultDayLabels(splitStyle, 7)),
					);
					const sortedDays = [...effectiveTrainingDays].sort((a, b) => a - b);
					// Session types currently placed somewhere across the week
					const assignedLabels = sortedDays.flatMap(
						(dow) => dayAssignments[dow] ?? [],
					);
					// Chips still available in the pool (single-instance semantics)
					const availableSessions = sessionOptions.filter(
						(label) => !assignedLabels.includes(label),
					);
					return (
						<GlassCard className="space-y-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="max-w-md mx-auto space-y-6">
								<div className="text-center space-y-2">
									<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<CalendarRange className="w-8 h-8 text-brand-primary" />
									</div>
									<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
										Assign your days
									</h2>
									<p className="text-sm text-foreground/40 font-medium">
										Drag sessions onto your days — stack more than one on a day,
										drag between days to move, or drag back to free a spot.
									</p>
								</div>

								<DndContext
									sensors={dndSensors}
									collisionDetection={closestCorners}
									onDragStart={handleDragStart}
									onDragEnd={handleDragEnd}>
									<div className="space-y-2.5">
										{sortedDays.map((dow) => (
											<DaySlot
												key={dow}
												dayNumber={dow}
												abbr={WEEKDAY_ABBR[dow]}
												labels={dayAssignments[dow] ?? []}
											/>
										))}
									</div>

									<PoolSection labels={availableSessions} allowStacking={allowStacking} />

									{/* Summary preview */}
									<div className="bg-foreground/3 rounded-2xl px-4 py-3 border border-foreground/8">
										<p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">
											Your week
										</p>
										<div className="flex flex-wrap gap-1.5">
											{sortedDays.map((dow) => {
												const sessions = dayAssignments[dow] ?? [];
												const lbl = sessions.join(" + ");
												const c =
													(sessions.length === 1
														? SESSION_COLORS[sessions[0]]
														: null) ??
													"bg-brand-primary/10 border-brand-primary/40 text-brand-primary";
												return (
													<span
														key={dow}
														className={cn(
															"text-[9px] font-black uppercase tracking-widest border rounded-full px-2 py-0.5",
															c,
														)}>
														{WEEKDAY_ABBR[dow]} · {lbl || "—"}
													</span>
												);
											})}
										</div>
									</div>

									<DragOverlay dropAnimation={null}>
										{activeDrag && (
											<div className="rotate-2 scale-105">
												<SessionChip
													label={activeDrag.label}
													className="shadow-2xl ring-1 ring-black/20"
												/>
											</div>
										)}
									</DragOverlay>
								</DndContext>
							</div>
						</GlassCard>
					);
				}

				case 4:
					return (
						<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="max-w-md mx-auto space-y-8">
								<div className="text-center space-y-2">
									<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<CalendarRange className="w-8 h-8 text-brand-primary" />
									</div>
									<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
										How many weeks?
									</h2>
								</div>

								<div className="space-y-6">
									<div className="flex items-center justify-center space-x-6">
										<button
											onClick={() =>
												setWeeksCount((prev) => Math.max(1, prev - 1))
											}
											className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
											-
										</button>
										<div className="text-5xl font-black text-brand-primary tabular-nums">
											{weeksCount}
										</div>
										<button
											onClick={() =>
												setWeeksCount((prev) => Math.min(12, prev + 1))
											}
											className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
											+
										</button>
									</div>
									<GlassSlider
										min={1}
										max={12}
										step={1}
										value={weeksCount}
										onChange={setWeeksCount}
										displayValue={`${weeksCount} Weeks`}
										label="Program Duration"
										unit="Weeks"
										hideHeader={true}
									/>
								</div>
							</div>
						</GlassCard>
					);

				case 5:
				default:
					return (
						<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
							<div className="max-w-md mx-auto space-y-8">
								<div className="text-center space-y-2">
									<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<Dumbbell className="w-8 h-8 text-brand-primary" />
									</div>
									<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
										What equipment do you have?
									</h2>
									<p className="text-sm text-foreground/40 font-medium">
										Only exercises you can actually do will be generated.
									</p>
								</div>

								<div className="space-y-3">
									{EQUIPMENT_OPTIONS.map((opt) => {
										const selected = equipment.includes(opt.value);
										return (
											<button
												key={opt.value}
												onClick={() => toggleEquipment(opt.value)}
												className={cn(
													"w-full p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group",
													selected
														? "border-brand-primary bg-brand-primary/5"
														: "border-foreground/5 bg-foreground/5 opacity-60",
												)}>
												<div className="flex items-center space-x-4">
													<div
														className={cn(
															"w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase",
															selected
																? "bg-brand-primary text-black"
																: "bg-foreground/10 text-foreground/40",
														)}>
														<Dumbbell className="w-4 h-4" />
													</div>
													<p className="font-bold text-foreground">
														{opt.label}
													</p>
												</div>
												<div
													className={cn(
														"w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
														selected
															? "border-brand-primary bg-brand-primary"
															: "border-foreground/20",
													)}>
													{selected && <Check className="w-4 h-4 text-black" />}
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</GlassCard>
					);
			}
		})();

		return (
			<div className="space-y-6">
				{/* Stepper */}
				<GlassCard className="px-5 py-4">
					<div className="flex items-center justify-between">
						<p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
							Step {formStep + 1} of {STEP_LABELS.length} ·{" "}
							{STEP_LABELS[formStep]}
						</p>
					</div>
					<div className="mt-3 flex items-center gap-1.5">
						{STEP_LABELS.map((_, i) => (
							<button
								key={i}
								disabled={i > formStep}
								onClick={() => setFormStep(i)}
								title={STEP_LABELS[i]}
								className={cn(
									"h-1.5 rounded-full transition-all",
									i === formStep
										? "w-8 bg-brand-primary"
										: i < formStep
											? "w-4 bg-brand-primary/40 cursor-pointer hover:bg-brand-primary/70"
											: "w-4 bg-foreground/10",
								)}
							/>
						))}
					</div>
				</GlassCard>

				{stepContent}



				{/* Sticky footer */}
				<div className="fixed bottom-0 left-0 md:left-20 right-0 z-50 pointer-events-none">
					<div className="max-w-4xl mx-auto px-6 pb-6 pt-3 relative pointer-events-auto glass border-t border-foreground/5">
						{/* Error banner — always visible above action buttons */}
						{error && (
							<div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 py-3 px-4 mb-3 animate-in slide-in-from-bottom-2 duration-200">
								<div className="flex items-center gap-2.5">
									<AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
									<p className="text-sm font-semibold text-rose-300 leading-snug">{error}</p>
								</div>
								<button
									onClick={() => setError(null)}
									className="text-rose-400/50 hover:text-rose-300 transition-colors text-[10px] font-black uppercase tracking-widest shrink-0">
									✕
								</button>
							</div>
						)}
						<div className="flex items-center gap-3">
							{formStep > 0 && (
								<button
									onClick={() => setFormStep((s) => Math.max(0, s - 1))}
									className="glass-button px-5 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center">
									<ArrowLeft className="w-4 h-4 mr-1.5" />
									Back
								</button>
							)}
							<button
								onClick={isLastStep ? handleGenerate : handleContinue}
								disabled={isGenerating || !canContinue || quotaReached}
								className="flex-1 bg-brand-primary text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100">
								{isGenerating ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin mr-2" />
										Generating your program...
									</>
								) : isLastStep ? (
									<>
										<Wand2 className="w-5 h-5 mr-2" />
										Generate
									</>
								) : (
									<>Continue</>
								)}
							</button>
						</div>
					</div>
				</div>
				{generationOverlay}
			</div>
		);
	}

	// ---- Preview phase ----

	return (
		<div className="space-y-6">
			{/* Preview toolbar */}
			<GlassCard className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
							<Sparkles className="w-5 h-5 text-brand-primary" />
						</div>
						<div>
							<h2 className="text-sm font-black text-foreground uppercase tracking-tight">
								AI Program Preview
							</h2>
							<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
								{splitLabel} · {goal} ·{" "}
								{effectiveTrainingDays.map((d) => FULL_DAY_NAMES[d]).join(", ")}{" "}
								· {weeksCount} wks · {experienceLevel} ·{" "}
								{equipment.map((e) => e).join(", ")}
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => {
								setPhase("form");
								setFormStep(0);
							}}
							className="glass-button px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-foreground/10 flex items-center">
							<ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
							Edit Inputs
						</button>
						<button
							onClick={handleRegenerate}
							disabled={isGenerating || quotaReached}
							className="bg-brand-primary text-black px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100">
							{isGenerating ? (
								<Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
							) : (
								<RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
							)}
							Regenerate
						</button>
					</div>
				</div>
				{previewDirty && (
					<p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center">
						<AlertTriangle className="w-3 h-3 mr-1" /> Unsaved edits — navigate
						away or regenerate to discard
					</p>
				)}
			</GlassCard>

			<PlanDesigner
				key={`preview-${generatedProgram?.days.length}-${matchedDays.length}`}
				initialData={planData}
				initialExercises={initialExercises}
				initialStep="exercises"
				dayRationales={dayRationales}
				exerciseReviews={exerciseReviews}
				showDraftOption
				onDirtyStateChange={handleDirty}
			/>
			{generationOverlay}
		</div>
	);
}