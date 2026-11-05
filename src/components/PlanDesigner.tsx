"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
	Plus,
	Trash2,
	ChevronLeft,
	ChevronUp,
	ChevronDown,
	Dumbbell,
	Loader2,
	CheckCircle2,
	Search,
	X,
	Calendar as CalendarIcon,
	Settings2,
	Info,
	Check,
	Sparkles,
	AlertTriangle,
	ArrowLeftRight,
	Clock,
	Layers,
	Flame,
	Activity,
} from "lucide-react";
import { GlassSlider } from "@/components/ui/GlassSlider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { savePlanTemplates } from "@/app/actions/plan";
import { getExerciseHistory } from "@/app/actions/analytics";
import {
	Exercise,
	ExerciseDefinition,
	PlanDocument,
	WorkoutTemplate,
	MobilityMovement,
	ExerciseReview,
} from "@/types/workout";
import { addCustomExercise } from "@/app/actions/exercises";
import { WarmupSetsPanel } from "./WarmupSetsPanel";
import { MOBILITY_MOVEMENTS } from "@/lib/mobility-warmup-data";

const DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const SPLIT_PRESETS = [
	{
		label: "Push / Pull / Legs",
		splits: [
			"Rest",
			"Push (Chest & Tris)",
			"Pull (Back & Bis)",
			"Legs & Core",
			"Push",
			"Pull",
			"Rest",
		],
	},
	{
		label: "Upper / Lower",
		splits: [
			"Rest",
			"Upper Body A",
			"Lower Body A",
			"Rest",
			"Upper Body B",
			"Lower Body B",
			"Rest",
		],
	},
	{
		label: "Full Body 3x",
		splits: [
			"Rest",
			"Full Body A",
			"Rest",
			"Full Body B",
			"Rest",
			"Full Body C",
			"Rest",
		],
	},
];

type SetupStep = "config" | "days" | "exercises";

export function PlanDesigner({
	initialData,
	editPlanId,
	initialExercises = [],
	initialStep,
	dayRationales = {},
	exerciseReviews = {},
	showDraftOption = false,
	duplicateMode = false,
	onDirtyStateChange,
	onSavedRedirectUrl,
}: {
	initialData?: { plan: PlanDocument; templates: WorkoutTemplate[] } | null;
	editPlanId?: string;
	initialExercises?: ExerciseDefinition[];
	initialStep?: SetupStep;
	dayRationales?: Record<number, string>;
	exerciseReviews?: Record<string, ExerciseReview>;
	showDraftOption?: boolean;
	duplicateMode?: boolean;
	onDirtyStateChange?: (dirty: boolean) => void;
	onSavedRedirectUrl?: string;
}) {
	const router = useRouter();

	const [step, setStep] = useState<SetupStep>(
		initialStep || (editPlanId && initialData ? "days" : "config"),
	);
	const [startDate, setStartDate] = useState(
		duplicateMode
			? new Date().toISOString().split("T")[0]
			: initialData?.plan?.startDate || new Date().toISOString().split("T")[0],
	);
	const [numWeeks, setNumWeeks] = useState(initialData?.plan?.numWeeks || 4);
	const [trainingDays, setTrainingDays] = useState<number[]>(() => {
		if (initialData?.templates) {
			const days = initialData.templates
				.filter((t) => t.weekNumber === 1 && t.exercises.length > 0)
				.map((t) => t.dayOfWeek);
			if (days.length > 0) return Array.from(new Set(days)).sort();
		}
		return [1, 2, 3, 5, 6]; // Default Mon, Tue, Wed, Fri, Sat
	});

	const [currentDay, setCurrentDay] = useState(() => {
		if (initialStep === "exercises" && initialData?.templates) {
			const days = initialData.templates
				.filter((t) => t.weekNumber === 1 && t.exercises.length > 0)
				.map((t) => t.dayOfWeek)
				.sort((a, b) => a - b);
			return days[0] ?? 1;
		}
		return 1;
	});

	const [isSaving, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [warmupOpen, setWarmupOpen] = useState(false);
	const [warmupIds, setWarmupIds] = useState<string[]>(() => {
		if (initialData?.plan?.mobilityWarmupIds?.length) {
			return initialData.plan.mobilityWarmupIds;
		}
		return [];
	});
	const [customWarmups, setCustomWarmups] = useState<MobilityMovement[]>(() => {
		if (initialData?.plan?.customMobilityWarmups?.length) {
			return initialData.plan.customMobilityWarmups;
		}
		return [];
	});

	// Exercise selector modal states
	const [showExerciseSelector, setShowExerciseSelector] = useState(false);
	const [alternativeForIndex, setAlternativeForIndex] = useState<number | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedMuscleFilter, setSelectedMuscleFilter] =
		useState<string>("All");
	const [draftSelectedExercises, setDraftSelectedExercises] = useState<
		string[]
	>([]);
	const [customExerciseInput, setCustomExerciseInput] = useState("");
	const [customExerciseMuscle, setCustomExerciseMuscle] =
		useState<string>("Chest");
	const [customWarmupInput, setCustomWarmupInput] = useState("");
	const [customWarmupDuration, setCustomWarmupDuration] = useState(45);
	const [loadingHistory, setLoadingHistory] = useState<string | null>(null);

	const [availableExercises, setAvailableExercises] =
		useState<ExerciseDefinition[]>(initialExercises);

	const availableMuscleGroups = useMemo(() => {
		const groups = Array.from(
			new Set(availableExercises.map((e) => e.muscleGroup).filter(Boolean)),
		).sort();
		return ["All", ...groups];
	}, [availableExercises]);

	const [masterWeekData, setMasterWeekData] = useState<
		Record<number, { splitName: string; exercises: Exercise[] }>
	>(() => {
		const defaultData = DAYS.reduce(
			(acc, _, i) => ({
				...acc,
				[i]: { splitName: "", exercises: [] },
			}),
			{} as Record<number, { splitName: string; exercises: Exercise[] }>,
		);

		if (initialData?.templates) {
			const baseTemplates = initialData.templates.filter(
				(t) => t.weekNumber === 1,
			);
			baseTemplates.forEach((dayTemplate) => {
				if (dayTemplate.exercises.length > 0) {
					defaultData[dayTemplate.dayOfWeek] = {
						splitName: dayTemplate.splitName || "",
						exercises: dayTemplate.exercises,
					};
				}
			});
		}
		return defaultData;
	});

	const [dayRationalesState, setDayRationalesState] =
		useState<Record<number, string>>(dayRationales);

	const [pendingReviews, setPendingReviews] =
		useState<Record<string, ExerciseReview>>(exerciseReviews);

	const dirtyMountedRef = useRef(false);
	useEffect(() => {
		if (!dirtyMountedRef.current) {
			dirtyMountedRef.current = true;
			return;
		}
		onDirtyStateChange?.(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [masterWeekData, trainingDays, startDate, numWeeks]);

	const currentDayData = masterWeekData[currentDay] || {
		splitName: "",
		exercises: [],
	};

	// Pending review calculations
	const pendingDayCounts: Record<number, number> = {};
	let pendingReviewTotal = 0;
	for (let d = 0; d < 7; d++) {
		let count = 0;
		for (const ex of masterWeekData[d]?.exercises || []) {
			if (pendingReviews[ex.exerciseId]) count++;
		}
		if (count > 0) {
			pendingDayCounts[d] = count;
			pendingReviewTotal += count;
		}
	}
	const pendingDays = Object.keys(pendingDayCounts)
		.map(Number)
		.sort((a, b) => a - b);

	// Quick date helpers
	const setDatePreset = (
		preset: "today" | "next-monday" | "first-of-month",
	) => {
		const d = new Date();
		if (preset === "today") {
			setStartDate(d.toISOString().split("T")[0]);
		} else if (preset === "next-monday") {
			const day = d.getDay();
			const diff = (7 - day + 1) % 7 || 7;
			d.setDate(d.getDate() + diff);
			setStartDate(d.toISOString().split("T")[0]);
		} else if (preset === "first-of-month") {
			d.setMonth(d.getMonth() + 1, 1);
			setStartDate(d.toISOString().split("T")[0]);
		}
	};

	const formattedDisplayDate = useMemo(() => {
		try {
			const parts = startDate.split("-");
			if (parts.length === 3) {
				const d = new Date(
					Number(parts[0]),
					Number(parts[1]) - 1,
					Number(parts[2]),
				);
				return new Intl.DateTimeFormat("en-US", {
					weekday: "short",
					month: "short",
					day: "numeric",
					year: "numeric",
				}).format(d);
			}
		} catch {
			// fallback
		}
		return startDate;
	}, [startDate]);

	const toggleDay = (idx: number) => {
		setTrainingDays((prev) =>
			prev.includes(idx)
				? prev.filter((d) => d !== idx)
				: [...prev, idx].sort(),
		);
	};

	const applySplitPreset = (preset: (typeof SPLIT_PRESETS)[0]) => {
		const newDays: number[] = [];
		const updatedData = { ...masterWeekData };
		preset.splits.forEach((split, idx) => {
			if (split !== "Rest") {
				newDays.push(idx);
				updatedData[idx] = {
					...updatedData[idx],
					splitName: split,
				};
			} else {
				updatedData[idx] = {
					...updatedData[idx],
					splitName: "Rest Day",
				};
			}
		});
		setTrainingDays(newDays);
		setMasterWeekData(updatedData);
	};

	const updateDayData = (
		idx: number,
		newData: Partial<{ splitName: string; exercises: Exercise[] }>,
	) => {
		setMasterWeekData((prev) => ({
			...prev,
			[idx]: { ...prev[idx], ...newData },
		}));
	};

	const handleMoveExercise = (idx: number, direction: "up" | "down") => {
		const exercises = [...currentDayData.exercises];
		const targetIdx = direction === "up" ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= exercises.length) return;
		[exercises[idx], exercises[targetIdx]] = [
			exercises[targetIdx],
			exercises[idx],
		];
		updateDayData(currentDay, { exercises });
	};

	const handleAddCustomWarmup = () => {
		const name = customWarmupInput.trim();
		if (!name) return;
		const id =
			"custom-warmup-" +
			Date.now() +
			"-" +
			Math.random().toString(36).substr(2, 6);
		setCustomWarmups((prev) => [
			...prev,
			{ id, name, durationSeconds: customWarmupDuration },
		]);
		setCustomWarmupInput("");
	};

	const handleAddSelected = async () => {
		if (draftSelectedExercises.length === 0) return;

		// "OR alternative" mode
		if (alternativeForIndex !== null) {
			const target = currentDayData.exercises[alternativeForIndex];
			if (target) {
				const ownName = target.name.toLowerCase();
				const current = new Set(
					(target.alternatives || []).map((n) => n.toLowerCase()),
				);
				for (const name of draftSelectedExercises) {
					if (name.toLowerCase() !== ownName) current.add(name.toLowerCase());
				}
				const altNames = Array.from(current);
				const newExs = [...currentDayData.exercises];
				newExs[alternativeForIndex] = {
					...newExs[alternativeForIndex],
					alternatives: altNames,
				};
				updateDayData(currentDay, { exercises: newExs });
			}
			closeExerciseSelector();
			return;
		}

		setLoadingHistory("multiple");
		try {
			const newExercises: Exercise[] = [];

			for (const exerciseName of draftSelectedExercises) {
				const history = await getExerciseHistory(exerciseName);
				newExercises.push({
					exerciseId:
						Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
					name: exerciseName,
					targetSets: history?.suggestedSets || 3,
					targetReps: history?.suggestedReps || 10,
					lastWeight: history?.pr || history?.lastWeight || 0,
					pr: history?.pr || 0,
					unit:
						availableExercises.find((e) => e.name === exerciseName)?.unit ||
						"reps",
					restDuration: 90,
					sets: [],
				});
			}

			updateDayData(currentDay, {
				exercises: [...currentDayData.exercises, ...newExercises],
			});
			closeExerciseSelector();
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingHistory(null);
		}
	};

	const closeExerciseSelector = () => {
		setShowExerciseSelector(false);
		setSearchQuery("");
		setSelectedMuscleFilter("All");
		setCustomExerciseInput("");
		setDraftSelectedExercises([]);
		setAlternativeForIndex(null);
	};

	const toggleExerciseSelection = (exerciseName: string) => {
		setDraftSelectedExercises((prev) =>
			prev.includes(exerciseName)
				? prev.filter((e) => e !== exerciseName)
				: [...prev, exerciseName],
		);
	};

	const handleAddCustomExercise = async () => {
		if (!customExerciseInput.trim()) return;

		setLoadingHistory("custom");
		const result = await addCustomExercise({
			name: customExerciseInput.trim(),
			muscleGroup: customExerciseMuscle || "Other",
			unit: "reps",
		});
		setLoadingHistory(null);

		if (
			result &&
			!availableExercises.some(
				(e) => e.name.toLowerCase() === result.name.toLowerCase(),
			)
		) {
			setAvailableExercises((prev) => [...prev, result]);
		}

		const finalName = result?.name || customExerciseInput.trim();
		setDraftSelectedExercises((prev) => [...prev, finalName]);
		setCustomExerciseInput("");
	};

	const resolveExerciseReview = (
		tempId: string,
		exerciseId: string,
		name: string,
	) => {
		const newExs = currentDayData.exercises.map((e) =>
			e.exerciseId === tempId ? { ...e, exerciseId, name } : e,
		);
		updateDayData(currentDay, { exercises: newExs });
		setPendingReviews((prev) => {
			const next = { ...prev };
			delete next[tempId];
			return next;
		});
	};

	const handleCreateNewExercise = async (
		tempId: string,
		aiName: string,
		muscleGroup: string,
	) => {
		const result = await addCustomExercise({
			name: aiName,
			muscleGroup,
			unit: "reps",
		});
		if (result) {
			if (
				!availableExercises.some(
					(e) => e.name.toLowerCase() === result.name.toLowerCase(),
				)
			) {
				setAvailableExercises((prev) => [...prev, result]);
			}
			resolveExerciseReview(tempId, result.id || tempId, result.name);
		} else {
			alert("Failed to create the exercise. Please try again.");
		}
	};

	const handleSave = async (status?: "draft" | "active") => {
		if (pendingReviewTotal > 0) {
			for (const tempId of Object.keys(pendingReviews)) {
				const review = pendingReviews[tempId];
				if (
					review.kind === "review" &&
					review.candidates &&
					review.candidates.length > 0
				) {
					resolveExerciseReview(
						tempId,
						review.candidates[0].id,
						review.candidates[0].name,
					);
				} else if (review.kind === "new") {
					await handleCreateNewExercise(
						tempId,
						review.aiName,
						review.muscleGroup,
					);
				}
			}
		}

		setIsSubmitting(true);
		try {
			const allTemplates: Partial<WorkoutTemplate>[] = [];

			for (let d = 0; d < 7; d++) {
				const isTraining = trainingDays.includes(d);
				const dayData = masterWeekData[d] || { splitName: "", exercises: [] };

				allTemplates.push({
					weekNumber: 1,
					dayOfWeek: d,
					splitName: isTraining ? dayData.splitName || "Workout" : "Rest Day",
					exercises: isTraining ? dayData.exercises : [],
				});
			}

			await savePlanTemplates(
				{
					startDate,
					numWeeks,
					planId: editPlanId || undefined,
					status,
					mobilityWarmupIds: warmupIds,
					customMobilityWarmups: customWarmups,
				},
				allTemplates,
			);
			setShowSuccess(true);
			setTimeout(() => {
				setShowSuccess(false);
				router.push(
					onSavedRedirectUrl || (editPlanId ? `/plan/${editPlanId}` : "/plan"),
				);
			}, 1500);
		} catch (error) {
			alert("Failed to save plan.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Filter exercises for modal
	const filteredExercises = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		return availableExercises.filter((ex) => {
			const matchesGroup =
				selectedMuscleFilter === "All" ||
				ex.muscleGroup === selectedMuscleFilter;
			const matchesQuery = !query || ex.name.toLowerCase().includes(query);
			return matchesGroup && matchesQuery;
		});
	}, [availableExercises, selectedMuscleFilter, searchQuery]);

	// Stepper metadata
	const steps: { id: SetupStep; title: string; subtitle: string }[] = [
		{
			id: "config",
			title: "Schedule",
			subtitle: `${numWeeks} weeks · Starts ${formattedDisplayDate}`,
		},
		{
			id: "days",
			title: "Split",
			subtitle: `${trainingDays.length} training days`,
		},
		{
			id: "exercises",
			title: "Exercises",
			subtitle: `${currentDayData.exercises.length} today`,
		},
	];

	return (
		<div className="space-y-6 pb-40">
			{/* ── Interactive Progress Stepper ── */}
			<div className="relative">
				<GlassCard className="p-3 border-foreground/10 bg-foreground/[0.02]">
					<div className="grid grid-cols-3 gap-2">
						{steps.map((s, idx) => {
							const isCurrent = step === s.id;
							const isPast =
								(s.id === "config" &&
									(step === "days" || step === "exercises")) ||
								(s.id === "days" && step === "exercises");

							return (
								<button
									key={s.id}
									type="button"
									onClick={() => {
										if (s.id === "exercises" && trainingDays.length === 0)
											return;
										setStep(s.id);
									}}
									className={cn(
										"flex items-center gap-2.5 p-2 rounded-xl text-left transition-all group",
										isCurrent &&
											"bg-brand-primary/10 border border-brand-primary/25",
										!isCurrent &&
											isPast &&
											"hover:bg-foreground/5 cursor-pointer",
										!isCurrent && !isPast && "opacity-40 cursor-default",
									)}>
									<div
										className={cn(
											"w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all",
											isCurrent && "bg-brand-primary text-black shadow-xs",
											isPast && "bg-brand-primary/20 text-brand-primary",
											!isCurrent &&
												!isPast &&
												"bg-foreground/10 text-foreground/40",
										)}>
										{isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
									</div>
									<div className="min-w-0 flex-1 hidden sm:block">
										<p
											className={cn(
												"text-xs font-bold truncate leading-tight",
												isCurrent ? "text-foreground" : "text-foreground/70",
											)}>
											{s.title}
										</p>
										<p className="text-[10px] text-foreground/40 truncate mt-0.5">
											{s.subtitle}
										</p>
									</div>
								</button>
							);
						})}
					</div>
				</GlassCard>
			</div>

			{/* ── Step 1: Configuration (Schedule & Duration) ── */}
			{step === "config" && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
					{/* Start Date Card */}
					<GlassCard className="p-6 space-y-5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
									<CalendarIcon className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-foreground">
										Cycle Start Date
									</h2>
									<p className="text-xs text-foreground/45">
										When does week 1 officially begin?
									</p>
								</div>
							</div>
							<span className="text-xs font-bold text-brand-primary px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
								{formattedDisplayDate}
							</span>
						</div>

						{/* Quick Presets */}
						<div className="flex flex-wrap gap-2 pt-1">
							<button
								type="button"
								onClick={() => setDatePreset("today")}
								className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground border border-foreground/10 transition-colors">
								Today
							</button>
							<button
								type="button"
								onClick={() => setDatePreset("next-monday")}
								className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground border border-foreground/10 transition-colors">
								Next Monday
							</button>
							<button
								type="button"
								onClick={() => setDatePreset("first-of-month")}
								className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground/5 hover:bg-foreground/10 text-foreground/70 hover:text-foreground border border-foreground/10 transition-colors">
								1st of Next Month
							</button>
						</div>

						{/* Styled Date Input */}
						<div className="relative">
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-sm font-semibold text-foreground outline-none focus:border-brand-primary transition-colors cursor-pointer"
							/>
						</div>
					</GlassCard>

					{/* Duration Card */}
					<GlassCard className="p-6 space-y-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
									<Clock className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-foreground">
										Plan Duration
									</h2>
									<p className="text-xs text-foreground/45">
										How many weeks will this meso-cycle run?
									</p>
								</div>
							</div>
							<div className="flex items-baseline gap-1">
								<span className="text-2xl font-black text-brand-primary tabular-nums">
									{numWeeks}
								</span>
								<span className="text-xs font-bold text-foreground/40">
									weeks
								</span>
							</div>
						</div>

						{/* Duration Quick Chips */}
						<div className="grid grid-cols-4 gap-2">
							{[4, 6, 8, 12].map((w) => (
								<button
									key={w}
									type="button"
									onClick={() => setNumWeeks(w)}
									className={cn(
										"py-2.5 rounded-xl text-xs font-bold border transition-all text-center",
										numWeeks === w
											? "bg-brand-primary/15 border-brand-primary text-brand-primary shadow-xs"
											: "bg-foreground/5 border-foreground/10 text-foreground/60 hover:text-foreground hover:bg-foreground/10",
									)}>
									{w} Weeks
								</button>
							))}
						</div>

						{/* Slider */}
						<div className="space-y-2 pt-2">
							<GlassSlider
								min={1}
								max={12}
								step={1}
								value={numWeeks}
								onChange={setNumWeeks}
								displayValue={`${numWeeks} Weeks`}
								label="Duration"
								unit="Weeks"
								hideHeader={true}
							/>
							<div className="flex justify-between text-[10px] font-semibold text-foreground/30 px-1">
								<span>1 Week (Micro)</span>
								<span>6 Weeks (Standard)</span>
								<span>12 Weeks (Full Block)</span>
							</div>
						</div>
					</GlassCard>
				</div>
			)}

			{/* ── Step 2: Weekly Split ── */}
			{step === "days" && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
					{/* Split volume summary header */}
					<GlassCard className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-brand-primary/20 bg-brand-primary/[0.03]">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-brand-primary/15 flex items-center justify-center text-brand-primary shrink-0">
								<Activity className="w-5 h-5" />
							</div>
							<div>
								<h2 className="text-sm font-bold text-foreground">
									Weekly Training Architecture
								</h2>
								<p className="text-xs text-foreground/50 mt-0.5">
									{trainingDays.length} training days ·{" "}
									{7 - trainingDays.length} rest days
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-[11px] font-semibold text-brand-primary px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25">
								{trainingDays.length >= 5
									? "High Frequency"
									: trainingDays.length >= 3
										? "Balanced Frequency"
										: "Maintenance Frequency"}
							</span>
						</div>
					</GlassCard>

					{/* Split presets */}
					<div className="space-y-2">
						<label className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider block ml-1">
							Quick Split Presets
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
							{SPLIT_PRESETS.map((p) => (
								<button
									key={p.label}
									type="button"
									onClick={() => applySplitPreset(p)}
									className="px-3.5 py-2.5 rounded-xl border border-foreground/10 bg-foreground/[0.03] hover:bg-foreground/[0.07] hover:border-brand-primary/30 text-left transition-all group">
									<p className="text-xs font-bold text-foreground/80 group-hover:text-brand-primary transition-colors">
										{p.label}
									</p>
									<p className="text-[10px] text-foreground/40 mt-0.5">
										Auto-names training days
									</p>
								</button>
							))}
						</div>
					</div>

					{/* 7-Day Selection Grid */}
					<div className="space-y-2">
						<label className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider block ml-1">
							Days of the Week
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
							{DAYS.map((day, idx) => {
								const isTraining = trainingDays.includes(idx);
								const currentSplit = masterWeekData[idx]?.splitName;

								return (
									<button
										key={day}
										type="button"
										onClick={() => toggleDay(idx)}
										className={cn(
											"p-4 rounded-2xl border transition-all flex items-center justify-between text-left group",
											isTraining
												? "border-brand-primary/40 bg-brand-primary/[0.08] hover:bg-brand-primary/[0.12] shadow-xs"
												: "border-foreground/8 bg-foreground/[0.02] hover:bg-foreground/[0.05] opacity-60 hover:opacity-80",
										)}>
										<div className="flex items-center gap-3.5 min-w-0">
											<div
												className={cn(
													"w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 transition-colors",
													isTraining
														? "bg-brand-primary text-black font-extrabold"
														: "bg-foreground/10 text-foreground/40",
												)}>
												{day.substring(0, 3)}
											</div>
											<div className="min-w-0">
												<p className="font-bold text-sm text-foreground truncate">
													{day}
												</p>
												<p
													className={cn(
														"text-[11px] truncate mt-0.5",
														isTraining
															? "text-brand-primary font-semibold"
															: "text-foreground/35 font-medium",
													)}>
													{isTraining
														? currentSplit || "Workout Day"
														: "Scheduled Rest"}
												</p>
											</div>
										</div>

										<div
											className={cn(
												"w-6 h-6 rounded-full border flex items-center justify-center transition-all shrink-0 ml-2",
												isTraining
													? "border-brand-primary bg-brand-primary text-black"
													: "border-foreground/20 text-transparent",
											)}>
											{isTraining && (
												<Check className="w-3.5 h-3.5 stroke-[3]" />
											)}
										</div>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* ── Step 3: Exercises & Day Builder ── */}
			{step === "exercises" && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
					{/* Day Navigator Horizontal Strip */}
					<div className="space-y-2">
						<div className="flex items-center justify-between px-1">
							<span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
								Select Day to Edit
							</span>
							<span className="text-[11px] font-semibold text-brand-primary">
								{masterWeekData[currentDay]?.exercises?.length || 0} exercises
								configured
							</span>
						</div>

						<div className="flex overflow-x-auto pb-1.5 gap-2 no-scrollbar">
							{DAYS.map((day, idx) => {
								const isTrainingDay = trainingDays.includes(idx);
								const isSelected = currentDay === idx;
								const exerciseCount =
									masterWeekData[idx]?.exercises?.length || 0;
								const splitName = masterWeekData[idx]?.splitName;

								return (
									<button
										key={day}
										type="button"
										disabled={!isTrainingDay}
										onClick={() => setCurrentDay(idx)}
										className={cn(
											"px-3.5 py-3 rounded-2xl text-left transition-all border min-w-[110px] flex flex-col justify-between shrink-0 relative",
											!isTrainingDay &&
												"opacity-30 border-dashed border-foreground/10 bg-foreground/[0.01] cursor-not-allowed",
											isTrainingDay &&
												!isSelected &&
												"bg-foreground/[0.03] hover:bg-foreground/[0.06] border-foreground/10 text-foreground cursor-pointer",
											isSelected &&
												"bg-brand-primary text-black border-brand-primary shadow-md font-bold cursor-default",
										)}>
										<div className="flex items-center justify-between w-full">
											<span
												className={cn(
													"text-xs font-bold",
													isSelected ? "text-black" : "text-foreground",
												)}>
												{day.substring(0, 3)}
											</span>
											{pendingDayCounts[idx] > 0 ? (
												<span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
											) : isSelected ? (
												<span className="w-1.5 h-1.5 rounded-full bg-black/60" />
											) : isTrainingDay && exerciseCount > 0 ? (
												<span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
											) : null}
										</div>

										<div className="mt-2 w-full">
											<p
												className={cn(
													"text-[11px] font-semibold truncate leading-tight",
													isSelected ? "text-black/90" : "text-foreground/75",
												)}>
												{isTrainingDay ? splitName || "Workout" : "Rest"}
											</p>
											<p
												className={cn(
													"text-[10px] mt-0.5 truncate",
													isSelected
														? "text-black/60 font-medium"
														: "text-foreground/40",
												)}>
												{isTrainingDay ? `${exerciseCount} exercises` : "Off"}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Split Name Editor */}
					<GlassCard className="p-4 space-y-2 border-foreground/10">
						<div className="flex items-center justify-between">
							<label className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">
								Day Focus / Title for {DAYS[currentDay]}
							</label>
							<div className="flex gap-1">
								{["Push", "Pull", "Legs", "Upper", "Lower"].map((tag) => (
									<button
										key={tag}
										type="button"
										onClick={() =>
											updateDayData(currentDay, { splitName: tag })
										}
										className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-foreground/5 hover:bg-brand-primary/20 hover:text-brand-primary text-foreground/50 transition-colors">
										{tag}
									</button>
								))}
							</div>
						</div>
						<input
							value={currentDayData.splitName}
							onChange={(e) =>
								updateDayData(currentDay, { splitName: e.target.value })
							}
							placeholder="e.g. Upper Body Hypertrophy, Heavy Deadlifts..."
							className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-semibold text-sm outline-none focus:border-brand-primary transition-colors"
						/>
					</GlassCard>

					{/* AI Split Rationale Note (if present) */}
					{dayRationalesState[currentDay] && (
						<div className="relative rounded-2xl border border-brand-primary/25 bg-brand-primary/[0.04] p-4 pr-10 space-y-1">
							<div className="flex items-center gap-2 text-brand-primary">
								<Sparkles className="w-3.5 h-3.5" />
								<span className="text-[10px] font-bold uppercase tracking-wider">
									Program Design Rationale
								</span>
							</div>
							<p className="text-xs text-foreground/75 leading-relaxed">
								{dayRationalesState[currentDay]}
							</p>
							<button
								type="button"
								onClick={() =>
									setDayRationalesState((prev) => {
										const next = { ...prev };
										delete next[currentDay];
										return next;
									})
								}
								className="absolute top-3 right-3 p-1.5 text-foreground/30 hover:text-foreground transition-colors"
								aria-label="Dismiss rationale">
								<X className="w-4 h-4" />
							</button>
						</div>
					)}

					{/* Exercises List Section */}
					<div className="space-y-3">
						<div className="flex justify-between items-center px-1">
							<div className="flex items-center gap-2">
								<Layers className="w-4 h-4 text-brand-primary" />
								<h3 className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
									Exercise Routine ({currentDayData.exercises.length})
								</h3>
							</div>
							<button
								type="button"
								onClick={() => {
									setAlternativeForIndex(null);
									setShowExerciseSelector(true);
								}}
								className="text-black bg-brand-primary hover:opacity-95 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95">
								<Plus className="w-4 h-4" /> Add Exercise
							</button>
						</div>

						{currentDayData.exercises.length === 0 ? (
							<GlassCard className="flex flex-col items-center justify-center py-16 text-center border-dashed border-foreground/15">
								<div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3 text-foreground/30">
									<Dumbbell className="w-6 h-6" />
								</div>
								<p className="text-sm font-bold text-foreground/60">
									No exercises configured for {DAYS[currentDay]}
								</p>
								<p className="text-xs text-foreground/30 mt-1 max-w-xs">
									Tap &quot;Add Exercise&quot; above to select movements from
									the library.
								</p>
							</GlassCard>
						) : (
							<div className="space-y-3">
								{currentDayData.exercises.map((ex, idx) => {
									const review = pendingReviews[ex.exerciseId];

									return (
										<GlassCard
											key={ex.exerciseId}
											className={cn(
												"p-4 space-y-4 relative transition-all border-l-4",
												review
													? "border-l-rose-500 ring-1 ring-rose-500/25 bg-rose-500/[0.03]"
													: "border-l-brand-primary",
											)}>
											{/* Header row: title + actions */}
											<div className="flex items-start justify-between gap-3">
												<div className="flex items-center gap-3 min-w-0 flex-1">
													<div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
														<Dumbbell className="w-4 h-4" />
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2 flex-wrap">
															<h4 className="font-bold text-sm text-foreground truncate">
																{ex.name}
															</h4>
															{ex.pr && ex.pr > 0 ? (
																<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10 text-[10px] font-semibold text-foreground/60">
																	<Flame className="w-2.5 h-2.5 text-brand-primary" />{" "}
																	PR: {ex.pr}kg
																</span>
															) : null}
														</div>
														{review && (
															<span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-[9px] font-bold text-rose-400">
																<AlertTriangle className="w-2.5 h-2.5 mr-1" />
																{review.kind === "new"
																	? "New movement"
																	: "Verify match"}
															</span>
														)}
													</div>
												</div>

												{/* Action toolbar */}
												<div className="flex items-center gap-1 shrink-0">
													<button
														type="button"
														onClick={() => {
															setAlternativeForIndex(idx);
															setDraftSelectedExercises([]);
															setShowExerciseSelector(true);
														}}
														title="Add swap alternative"
														className={cn(
															"p-1.5 rounded-lg transition-colors",
															ex.alternatives && ex.alternatives.length > 0
																? "text-brand-primary bg-brand-primary/10"
																: "text-foreground/30 hover:text-brand-primary hover:bg-foreground/5",
														)}>
														<ArrowLeftRight className="w-4 h-4" />
													</button>
													<button
														type="button"
														onClick={() => handleMoveExercise(idx, "up")}
														disabled={idx === 0}
														className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 disabled:opacity-20 disabled:cursor-not-allowed">
														<ChevronUp className="w-4 h-4" />
													</button>
													<button
														type="button"
														onClick={() => handleMoveExercise(idx, "down")}
														disabled={
															idx === currentDayData.exercises.length - 1
														}
														className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 disabled:opacity-20 disabled:cursor-not-allowed">
														<ChevronDown className="w-4 h-4" />
													</button>
													<button
														type="button"
														onClick={() => {
															const removed = currentDayData.exercises[idx];
															const newExs = currentDayData.exercises.filter(
																(_, i) => i !== idx,
															);
															updateDayData(currentDay, { exercises: newExs });
															if (
																removed &&
																pendingReviews[removed.exerciseId]
															) {
																setPendingReviews((prev) => {
																	const next = { ...prev };
																	delete next[removed.exerciseId];
																	return next;
																});
															}
														}}
														className="p-1.5 rounded-lg text-foreground/30 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</div>

											{/* AI Review Resolution Card (if needed) */}
											{review?.kind === "review" && (
												<div className="space-y-2 bg-foreground/5 border border-brand-primary/25 rounded-xl p-3">
													<p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
														Match with canonical exercise
													</p>
													<div className="flex flex-wrap gap-1.5">
														{review.candidates?.map((c) => (
															<button
																key={c.id}
																type="button"
																onClick={() =>
																	resolveExerciseReview(
																		ex.exerciseId,
																		c.id,
																		c.name,
																	)
																}
																className="px-2.5 py-1.5 rounded-lg border border-foreground/10 bg-foreground/5 text-xs font-semibold text-foreground/80 hover:border-brand-primary hover:text-brand-primary transition-all">
																{c.name}
															</button>
														))}
													</div>
													<button
														type="button"
														onClick={() =>
															setPendingReviews((prev) => ({
																...prev,
																[ex.exerciseId]: {
																	kind: "new",
																	aiName: review.aiName,
																	muscleGroup: review.muscleGroup,
																},
															}))
														}
														className="text-[10px] font-semibold text-foreground/40 hover:text-brand-primary transition-colors">
														Keep as custom movement
													</button>
												</div>
											)}

											{review?.kind === "new" && (
												<div className="flex items-center justify-between gap-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-3">
													<p className="text-xs text-foreground/70">
														&quot;{review.aiName}&quot; under{" "}
														<span className="text-brand-primary font-bold">
															{review.muscleGroup}
														</span>
													</p>
													<button
														type="button"
														onClick={() =>
															handleCreateNewExercise(
																ex.exerciseId,
																review.aiName,
																review.muscleGroup,
															)
														}
														className="px-3 py-1.5 rounded-lg bg-brand-primary text-black font-bold text-xs hover:opacity-95 transition-opacity shrink-0">
														Create
													</button>
												</div>
											)}

											{/* Parameters: Sets, Reps, Weight Micro-Steppers */}
											<div className="grid grid-cols-3 gap-2.5 pt-1">
												{/* Sets */}
												<div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-2.5 text-center">
													<span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block mb-1">
														Sets
													</span>
													<div className="flex items-center justify-between">
														<button
															type="button"
															onClick={() => {
																const newExs = [...currentDayData.exercises];
																newExs[idx].targetSets = Math.max(
																	1,
																	(newExs[idx].targetSets || 3) - 1,
																);
																updateDayData(currentDay, {
																	exercises: newExs,
																});
															}}
															className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/15 text-foreground/60 flex items-center justify-center font-bold text-sm">
															-
														</button>
														<span className="text-base font-black text-foreground tabular-nums">
															{ex.targetSets || 3}
														</span>
														<button
															type="button"
															onClick={() => {
																const newExs = [...currentDayData.exercises];
																newExs[idx].targetSets =
																	(newExs[idx].targetSets || 3) + 1;
																updateDayData(currentDay, {
																	exercises: newExs,
																});
															}}
															className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/15 text-foreground/60 flex items-center justify-center font-bold text-sm">
															+
														</button>
													</div>
												</div>

												{/* Reps */}
												<div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-2.5 text-center">
													<span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block mb-1">
														Reps
													</span>
													<div className="flex items-center justify-between">
														<button
															type="button"
															onClick={() => {
																const newExs = [...currentDayData.exercises];
																newExs[idx].targetReps = Math.max(
																	1,
																	(newExs[idx].targetReps || 10) - 1,
																);
																updateDayData(currentDay, {
																	exercises: newExs,
																});
															}}
															className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/15 text-foreground/60 flex items-center justify-center font-bold text-sm">
															-
														</button>
														<span className="text-base font-black text-foreground tabular-nums">
															{ex.targetReps || 10}
														</span>
														<button
															type="button"
															onClick={() => {
																const newExs = [...currentDayData.exercises];
																newExs[idx].targetReps =
																	(newExs[idx].targetReps || 10) + 1;
																updateDayData(currentDay, {
																	exercises: newExs,
																});
															}}
															className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/15 text-foreground/60 flex items-center justify-center font-bold text-sm">
															+
														</button>
													</div>
												</div>

												{/* Target Weight */}
												<div className="bg-foreground/[0.03] border border-foreground/10 rounded-xl p-2.5 text-center">
													<span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block mb-1">
														Target (kg)
													</span>
													<div className="flex items-center justify-between">
														<button
															type="button"
															onClick={() => {
																const newExs = [...currentDayData.exercises];
																newExs[idx].lastWeight = Math.max(
																	0,
																	(newExs[idx].lastWeight || 0) - 2.5,
																);
																updateDayData(currentDay, {
																	exercises: newExs,
																});
															}}
															className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/15 text-foreground/60 flex items-center justify-center font-bold text-sm">
															-
														</button>
														<span className="text-base font-black text-brand-primary tabular-nums">
															{ex.lastWeight || 0}
														</span>
														<button
															type="button"
															onClick={() => {
																const newExs = [...currentDayData.exercises];
																newExs[idx].lastWeight =
																	(newExs[idx].lastWeight || 0) + 2.5;
																updateDayData(currentDay, {
																	exercises: newExs,
																});
															}}
															className="w-7 h-7 rounded-lg bg-foreground/5 hover:bg-foreground/15 text-foreground/60 flex items-center justify-center font-bold text-sm">
															+
														</button>
													</div>
												</div>
											</div>

											{/* Rest Timer Segmented Selector */}
											<div className="pt-2 border-t border-foreground/5 flex flex-wrap items-center justify-between gap-2">
												<span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
													Rest
												</span>
												<div className="flex items-center gap-1.5">
													{[60, 90, 120, 180].map((sec) => (
														<button
															key={sec}
															type="button"
															onClick={() => {
																const newExs = [...currentDayData.exercises];
																newExs[idx].restDuration = sec;
																updateDayData(currentDay, {
																	exercises: newExs,
																});
															}}
															className={cn(
																"px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
																ex.restDuration === sec
																	? "bg-brand-primary text-black font-bold"
																	: "bg-foreground/5 text-foreground/60 hover:bg-foreground/10",
															)}>
															{sec < 60
																? `${sec}s`
																: sec % 60 === 0
																	? `${sec / 60}m`
																	: `${sec}s`}
														</button>
													))}
												</div>
											</div>

											{/* OR Alternatives Chips */}
											{ex.alternatives && ex.alternatives.length > 0 && (
												<div className="flex flex-wrap items-center gap-1.5 pt-1">
													<span className="text-[10px] font-bold text-foreground/30 uppercase mr-1">
														Alt:
													</span>
													{(ex.alternatives as string[]).map((altName) => (
														<span
															key={altName}
															className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-semibold text-brand-primary">
															<span>{altName}</span>
															<button
																type="button"
																onClick={() => {
																	const newExs = [...currentDayData.exercises];
																	newExs[idx] = {
																		...newExs[idx],
																		alternatives: (
																			ex.alternatives as string[]
																		).filter((n) => n !== altName),
																	};
																	updateDayData(currentDay, {
																		exercises: newExs,
																	});
																}}
																className="hover:text-rose-400">
																<X className="w-3 h-3" />
															</button>
														</span>
													))}
												</div>
											)}

											{/* Warmup Sets Panel */}
											<WarmupSetsPanel
												workingWeight={ex.lastWeight || 0}
												repsField={ex.targetReps || 10}
												mode="PLAN_DESIGNER"
											/>
										</GlassCard>
									);
								})}
							</div>
						)}
					</div>

					{/* Mobility Warmup Selection Card */}
					<GlassCard className="p-4 space-y-3 border-foreground/10">
						<button
							type="button"
							onClick={() => setWarmupOpen(!warmupOpen)}
							className="w-full flex items-center justify-between text-left">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
									<Activity className="w-4 h-4" />
								</div>
								<div>
									<h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
										Mobility & Warmup Routine
									</h4>
									<p className="text-[11px] text-foreground/40 mt-0.5">
										{warmupIds.length === 0 && customWarmups.length === 0
											? "Standard 6-movement mobility flow active"
											: `${warmupIds.length + customWarmups.length} custom movements selected`}
									</p>
								</div>
							</div>
							<div className="p-1 rounded-lg text-foreground/40">
								{warmupOpen ? (
									<ChevronUp className="w-4 h-4" />
								) : (
									<ChevronDown className="w-4 h-4" />
								)}
							</div>
						</button>

						{warmupOpen && (
							<div className="pt-3 border-t border-foreground/10 space-y-4">
								{/* Custom warmup input */}
								<div className="flex items-center gap-2">
									<input
										value={customWarmupInput}
										onChange={(e) => setCustomWarmupInput(e.target.value)}
										placeholder="Add custom mobility move (e.g. World's Greatest Stretch)"
										className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-3.5 py-2 text-xs font-medium text-foreground outline-none focus:border-brand-primary"
									/>
									<select
										value={customWarmupDuration}
										onChange={(e) =>
											setCustomWarmupDuration(Number(e.target.value))
										}
										className="bg-foreground/5 border border-foreground/10 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground outline-none">
										<option value={30}>30s</option>
										<option value={45}>45s</option>
										<option value={60}>60s</option>
									</select>
									<button
										type="button"
										onClick={handleAddCustomWarmup}
										disabled={!customWarmupInput.trim()}
										className="px-3 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs disabled:opacity-30">
										<Plus className="w-4 h-4" />
									</button>
								</div>

								{/* Movement list */}
								<div className="grid grid-cols-2 gap-2">
									{MOBILITY_MOVEMENTS.map((m) => {
										const isSelected = warmupIds.includes(m.id);
										return (
											<button
												key={m.id}
												type="button"
												onClick={() => {
													setWarmupIds((prev) =>
														prev.includes(m.id)
															? prev.filter((id) => id !== m.id)
															: [...prev, m.id],
													);
												}}
												className={cn(
													"p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all",
													isSelected
														? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary"
														: "border-foreground/10 bg-foreground/[0.02] text-foreground/70 hover:bg-foreground/[0.05]",
												)}>
												<div className="min-w-0">
													<p className="text-xs font-semibold truncate leading-tight">
														{m.name}
													</p>
													<p className="text-[10px] opacity-60 mt-0.5">
														{m.durationSeconds}s
													</p>
												</div>
												{isSelected && (
													<Check className="w-3.5 h-3.5 shrink-0" />
												)}
											</button>
										);
									})}
								</div>
							</div>
						)}
					</GlassCard>
				</div>
			)}

			{/* ── Sticky Action Bar ── */}
			<div className="fixed bottom-0 left-0 md:left-20 right-0 z-40 pointer-events-none">
				<div
					className="absolute inset-0 bg-background/85 backdrop-blur-xl"
					style={{
						maskImage: "linear-gradient(to top, black 60%, transparent 100%)",
						WebkitMaskImage:
							"linear-gradient(to top, black 60%, transparent 100%)",
					}}
				/>

				<div className="max-w-3xl mx-auto p-4 md:p-6 relative pointer-events-auto">
					{/* Review alert banner if reviews remain */}
					{step === "exercises" && pendingReviewTotal > 0 && (
						<div className="mb-3 flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-2.5 text-rose-300 text-xs font-semibold">
							<AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
							<span>
								{pendingReviewTotal} movement
								{pendingReviewTotal === 1 ? "" : "s"} will auto-match on save.
							</span>
						</div>
					)}

					<div className="flex items-center gap-3">
						{step === "config" ? (
							<button
								type="button"
								onClick={() => {
									if (!startDate) return alert("Please select a date.");
									setStep("days");
								}}
								className="w-full bg-brand-primary text-black py-4 rounded-2xl font-bold text-sm tracking-wide shadow-md hover:opacity-95 active:scale-[0.99] transition-all">
								Continue to Split ({numWeeks} Weeks)
							</button>
						) : step === "days" ? (
							<>
								<button
									type="button"
									onClick={() => setStep("config")}
									className="flex-1 glass-button py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border-foreground/10">
									Back
								</button>
								<button
									type="button"
									onClick={() => {
										if (trainingDays.length === 0)
											return alert("Please select at least one training day.");
										setStep("exercises");
										setCurrentDay(trainingDays[0]);
									}}
									className="flex-[2] bg-brand-primary text-black py-4 rounded-2xl font-bold text-sm tracking-wide shadow-md hover:opacity-95 active:scale-[0.99] transition-all">
									Configure Exercises ({trainingDays.length} Days)
								</button>
							</>
						) : (
							<>
								<button
									type="button"
									onClick={() => setStep("days")}
									className="flex-1 glass-button py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border-foreground/10">
									Back
								</button>
								{showDraftOption && (
									<button
										type="button"
										onClick={() => handleSave("draft")}
										disabled={isSaving}
										className="flex-1 glass-button py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border-foreground/10 hover:border-brand-primary/40">
										{isSaving ? (
											<Loader2 className="w-4 h-4 animate-spin mx-auto" />
										) : (
											"Save Draft"
										)}
									</button>
								)}
								<button
									type="button"
									onClick={() =>
										handleSave(showDraftOption ? "active" : undefined)
									}
									disabled={isSaving}
									className="flex-[2] bg-brand-primary text-black py-4 rounded-2xl font-bold text-sm tracking-wide shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
									{isSaving ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : showSuccess ? (
										<>
											<CheckCircle2 className="w-4 h-4" /> Saved!
										</>
									) : showDraftOption ? (
										"Save as Plan"
									) : (
										"Finalize Plan"
									)}
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* ── Search-First Exercise Selector Modal ── */}
			{showExerciseSelector && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
					<div
						className="absolute inset-0 bg-black/80 backdrop-blur-md"
						onClick={closeExerciseSelector}
					/>
					<GlassCard className="w-full max-w-xl max-h-[88vh] overflow-hidden flex flex-col relative z-50 border-foreground/15 p-0 shadow-2xl">
						{/* Modal Header */}
						<div className="p-4 sm:p-5 border-b border-foreground/10 flex items-center justify-between bg-background/60 backdrop-blur-md">
							<div>
								<h3 className="text-base font-bold text-foreground">
									{alternativeForIndex !== null
										? "Select Swap Alternatives"
										: "Exercise Library"}
								</h3>
								<p className="text-xs text-foreground/45 mt-0.5">
									{availableExercises.length} verified exercises available
								</p>
							</div>
							<button
								type="button"
								onClick={closeExerciseSelector}
								className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors">
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Search Bar & Muscle Filter Pills */}
						<div className="p-4 space-y-3 border-b border-foreground/10 bg-foreground/[0.01]">
							<div className="relative">
								<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
								<input
									placeholder="Search exercises by name..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									autoFocus
									className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-primary placeholder:text-foreground/35"
								/>
							</div>

							{/* Muscle Category Filter Chips */}
							<div className="flex overflow-x-auto gap-1.5 no-scrollbar pb-0.5">
								{availableMuscleGroups.map((group) => {
									const isSelected = selectedMuscleFilter === group;
									return (
										<button
											key={group}
											type="button"
											onClick={() => setSelectedMuscleFilter(group)}
											className={cn(
												"px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
												isSelected
													? "bg-brand-primary text-black font-bold"
													: "bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground",
											)}>
											{group}
										</button>
									);
								})}
							</div>
						</div>

						{/* Exercise List */}
						<div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar min-h-[260px] max-h-[400px]">
							{filteredExercises.length === 0 ? (
								<div className="py-12 text-center space-y-3">
									<p className="text-sm font-semibold text-foreground/50">
										No exercises found for &quot;{searchQuery}&quot;
									</p>
									<p className="text-xs text-foreground/30">
										Add it as a custom exercise below:
									</p>
								</div>
							) : (
								filteredExercises.map((ex) => {
									const isSelected = draftSelectedExercises.includes(ex.name);

									return (
										<button
											key={ex.name}
											type="button"
											onClick={() => toggleExerciseSelection(ex.name)}
											className={cn(
												"w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group",
												isSelected
													? "bg-brand-primary/10 border-brand-primary/50 text-foreground"
													: "bg-foreground/[0.02] border-foreground/5 hover:border-foreground/20 hover:bg-foreground/[0.05] text-foreground/80",
											)}>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<span className="font-semibold text-sm truncate">
														{ex.name}
													</span>
													{ex.isCustom && (
														<span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-primary/15 text-brand-primary">
															Custom
														</span>
													)}
												</div>
												<p className="text-[11px] text-foreground/40 mt-0.5">
													{ex.muscleGroup}
												</p>
											</div>

											<div
												className={cn(
													"w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-all",
													isSelected
														? "border-brand-primary bg-brand-primary text-black"
														: "border-foreground/20 text-transparent group-hover:border-foreground/40",
												)}>
												<Check className="w-3 h-3 stroke-[3]" />
											</div>
										</button>
									);
								})
							)}

							{/* Custom Exercise Quick Inline Add */}
							<div className="pt-3 border-t border-foreground/10 space-y-2">
								<p className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
									Create Custom Movement
								</p>
								<div className="flex items-center gap-2">
									<input
										placeholder="Exercise name..."
										value={customExerciseInput}
										onChange={(e) => setCustomExerciseInput(e.target.value)}
										onKeyDown={(e) =>
											e.key === "Enter" && handleAddCustomExercise()
										}
										className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-brand-primary"
									/>
									<select
										value={customExerciseMuscle}
										onChange={(e) => setCustomExerciseMuscle(e.target.value)}
										className="bg-foreground/5 border border-foreground/10 rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground outline-none">
										<option value="Chest">Chest</option>
										<option value="Back">Back</option>
										<option value="Legs">Legs</option>
										<option value="Shoulders">Shoulders</option>
										<option value="Arms">Arms</option>
										<option value="Core">Core</option>
										<option value="Cardio">Cardio</option>
										<option value="Other">Other</option>
									</select>
									<button
										type="button"
										onClick={handleAddCustomExercise}
										disabled={
											!customExerciseInput.trim() || loadingHistory === "custom"
										}
										className="px-3 py-2 rounded-xl bg-foreground/10 hover:bg-brand-primary hover:text-black text-xs font-bold transition-colors disabled:opacity-30">
										{loadingHistory === "custom" ? (
											<Loader2 className="w-3.5 h-3.5 animate-spin" />
										) : (
											"Add"
										)}
									</button>
								</div>
							</div>
						</div>

						{/* Modal Footer with Multi-Select Action */}
						{draftSelectedExercises.length > 0 && (
							<div className="p-4 border-t border-foreground/10 bg-background/80 backdrop-blur-md">
								<button
									type="button"
									onClick={handleAddSelected}
									disabled={loadingHistory === "multiple"}
									className="w-full bg-brand-primary text-black py-3.5 rounded-xl font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
									{loadingHistory === "multiple" ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : alternativeForIndex !== null ? (
										`Attach ${draftSelectedExercises.length} Swap Alternative${draftSelectedExercises.length === 1 ? "" : "s"}`
									) : (
										`Add ${draftSelectedExercises.length} Selected Exercise${draftSelectedExercises.length === 1 ? "" : "s"}`
									)}
								</button>
							</div>
						)}
					</GlassCard>
				</div>
			)}
		</div>
	);
}
