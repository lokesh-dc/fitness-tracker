"use client";

import { useEffect, useRef, useState } from "react";
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
	Calendar,
	Settings2,
	Info,
	Check,
	Sparkles,
} from "lucide-react";
import { GlassSlider } from "@/components/ui/GlassSlider";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { savePlanTemplates } from "@/app/actions/plan";
import { getExerciseHistory } from "@/app/actions/analytics";
import { Exercise, ExerciseDefinition } from "@/types/workout";
import { PlanDocument, WorkoutTemplate, MobilityMovement, ExerciseReview } from "@/types/workout";
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

type SetupStep = "config" | "days" | "exercises";

export function PlanDesigner({
	initialData,
	editPlanId,
	initialExercises = [],
	initialStep,
	dayRationales = {},
	exerciseReviews = {},
	showDraftOption = false,
	onDirtyStateChange,
}: {
	initialData?: { plan: PlanDocument; templates: WorkoutTemplate[] } | null;
	editPlanId?: string;
	initialExercises?: ExerciseDefinition[];
	initialStep?: SetupStep;
	dayRationales?: Record<number, string>;
	exerciseReviews?: Record<string, ExerciseReview>;
	showDraftOption?: boolean;
	onDirtyStateChange?: (dirty: boolean) => void;
}) {
	const router = useRouter();

	const [step, setStep] = useState<SetupStep>(
		initialStep || (editPlanId && initialData ? "days" : "config"),
	);
	const [startDate, setStartDate] = useState(
		initialData?.plan?.startDate || new Date().toISOString().split("T")[0],
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
	const [showExerciseSelector, setShowExerciseSelector] = useState(false);
	const [exerciseModalStep, setExerciseModalStep] = useState<
		"muscles" | "exercises"
	>("muscles");
	const [searchQuery, setSearchQuery] = useState("");
	const [customExerciseInput, setCustomExerciseInput] = useState("");
	const [customWarmupInput, setCustomWarmupInput] = useState("");
	const [customWarmupDuration, setCustomWarmupDuration] = useState(45);
	const [loadingHistory, setLoadingHistory] = useState<string | null>(null);

	const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
	const [draftSelectedExercises, setDraftSelectedExercises] = useState<
		string[]
	>([]);
	const [availableExercises, setAvailableExercises] =
		useState<ExerciseDefinition[]>(initialExercises);

	const availableMuscleGroups = Array.from(
		new Set(availableExercises.map((e) => e.muscleGroup)),
	).sort();

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

	const currentDayData = masterWeekData[currentDay];

	const toggleDay = (idx: number) => {
		setTrainingDays((prev) =>
			prev.includes(idx)
				? prev.filter((d) => d !== idx)
				: [...prev, idx].sort(),
		);
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

	const toggleMuscle = (muscle: string) => {
		setSelectedMuscles((prev) =>
			prev.includes(muscle)
				? prev.filter((m) => m !== muscle)
				: [...prev, muscle],
		);
	};

	const toggleExerciseSelection = (exerciseName: string) => {
		setDraftSelectedExercises((prev) =>
			prev.includes(exerciseName)
				? prev.filter((e) => e !== exerciseName)
				: [...prev, exerciseName],
		);
	};

	const handleMoveExercise = (idx: number, direction: "up" | "down") => {
		const exercises = [...currentDayData.exercises];
		const targetIdx = direction === "up" ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= exercises.length) return;
		[exercises[idx], exercises[targetIdx]] = [exercises[targetIdx], exercises[idx]];
		updateDayData(currentDay, { exercises });
	};

	const handleAddCustomWarmup = () => {
		const name = customWarmupInput.trim();
		if (!name) return;
		const id = "custom-warmup-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6);
		setCustomWarmups((prev) => [...prev, { id, name, durationSeconds: customWarmupDuration }]);
		setCustomWarmupInput("");
	};

	const handleAddSelected = async () => {
		if (draftSelectedExercises.length === 0) return;

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
					restDuration: 90, // Default to 90s
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
		setExerciseModalStep("muscles");
		setSearchQuery("");
		setCustomExerciseInput("");
		setDraftSelectedExercises([]);
		setSelectedMuscles([]);
	};

	const handleAddCustomExercise = async () => {
		if (!customExerciseInput.trim()) return;

		// We need a muscle group and unit.
		// If they have selected exactly 1 muscle group, use that, else default to "Other" or first selected
		const muscleGroupToUse =
			selectedMuscles.length === 1
				? selectedMuscles[0]
				: selectedMuscles[0] || "Other";

		setLoadingHistory("custom"); // reuse loading state
		const result = await addCustomExercise({
			name: customExerciseInput.trim(),
			muscleGroup: muscleGroupToUse,
			unit: "reps", // default to reps for simple custom adds
		});

		setLoadingHistory(null);

		// If successfully added to db, add to available memory list
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
		}
	};

	const handleSave = async (status?: 'draft' | 'active') => {
		if (Object.keys(pendingReviews).length > 0) {
			alert(
				"Please resolve the pending exercise matches in the preview before saving.",
			);
			return;
		}

		setIsSubmitting(true);
		try {
			const allTemplates: Partial<WorkoutTemplate>[] = [];

			// We only send Week 1 templates because the current UI only supports a repeating master week.
			// The backend uses weekNumber: 1 as the source of truth for all weeks in the plan.
			for (let d = 0; d < 7; d++) {
				const isTraining = trainingDays.includes(d);
				const dayData = masterWeekData[d];

				allTemplates.push({
					weekNumber: 1,
					dayOfWeek: d,
					splitName: isTraining
						? (dayData as any).splitName || "Workout"
						: "Rest Day",
					exercises: isTraining ? dayData.exercises : [],
				});
			}

			await savePlanTemplates(
				{ startDate, numWeeks, planId: editPlanId || undefined, status, mobilityWarmupIds: warmupIds, customMobilityWarmups: customWarmups },
				allTemplates,
			);
			setShowSuccess(true);
			setTimeout(() => {
				setShowSuccess(false);
				router.push(editPlanId ? `/plan/${editPlanId}` : "/plan");
			}, 2000);
		} catch (error) {
			alert("Failed to save plan.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-8 pb-48">
			{/* Step Header */}
			<div className="flex justify-between items-center">
				<p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
					Step {step === "config" ? "1" : step === "days" ? "2" : "3"} of 3
				</p>
			</div>

			{/* Step 1: Configuration */}
			{step === "config" && (
				<GlassCard className="space-y-12 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="max-w-xs mx-auto space-y-8">
						<div className="text-center space-y-2">
							<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<Calendar className="w-8 h-8 text-brand-primary" />
							</div>
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
								When do we start?
							</h2>
						</div>

						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-5 text-center font-black text-xl text-foreground outline-none focus:border-brand-primary transition-colors"
						/>

						<hr className="border-foreground/10" />

						<div className="text-center space-y-2">
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
								How many weeks?
							</h2>
						</div>

						<div className="space-y-6">
							<div className="flex items-center justify-center space-x-6">
								<button
									onClick={() => setNumWeeks((prev) => Math.max(1, prev - 1))}
									className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
									-
								</button>
								<div className="text-5xl font-black text-brand-primary tabular-nums">
									{numWeeks}
								</div>
								<button
									onClick={() => setNumWeeks((prev) => Math.min(12, prev + 1))}
									className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
									+
								</button>
							</div>
							<GlassSlider
								min={1}
								max={12}
								step={1}
								value={numWeeks}
								onChange={setNumWeeks}
								displayValue={`${numWeeks} Weeks`}
								label="Plan Duration"
								unit="Weeks"
								hideHeader={true}
							/>
						</div>
					</div>
				</GlassCard>
			)}

			{/* Step 2: Days */}
			{step === "days" && (
				<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="text-center space-y-2">
						<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
							<Settings2 className="w-8 h-8 text-brand-primary" />
						</div>
						<h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
							Weekly Split
						</h2>
						<p className="text-sm text-foreground/40 font-medium">
							Select your training days and rest days.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
						{DAYS.map((day, idx) => (
							<div
								key={day}
								onClick={() => toggleDay(idx)}
								className={cn(
									"p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group",
									trainingDays.includes(idx)
										? "border-brand-primary bg-brand-primary/5"
										: "border-foreground/5 bg-foreground/5 opacity-50",
								)}>
								<div className="flex items-center space-x-4">
									<div
										className={cn(
											"w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase",
											trainingDays.includes(idx)
												? "bg-brand-primary text-black"
												: "bg-foreground/10 text-foreground/40",
										)}>
										{day.substring(0, 3)}
									</div>
									<div>
										<p className="font-bold text-foreground">{day}</p>
										<p className="text-[10px] uppercase font-black tracking-widest text-brand-primary/60">
											{trainingDays.includes(idx) ? "Gym Day" : "Rest Day"}
										</p>
									</div>
								</div>
								<div
									className={cn(
										"w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
										trainingDays.includes(idx)
											? "border-brand-primary bg-brand-primary"
											: "border-foreground/20",
									)}>
									{trainingDays.includes(idx) && (
										<CheckCircle2 className="w-4 h-4 text-black" />
									)}
								</div>
							</div>
						))}
					</div>
				</GlassCard>
			)}

			{/* Step 3: Exercises */}
			{step === "exercises" && (
			<>
				<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* Day Navigator */}
					<div className="flex overflow-x-auto pb-2 space-x-2.5 no-scrollbar">
						{DAYS.map((day, idx) => {
							const isTrainingDay = trainingDays.includes(idx);
							const isSelected = currentDay === idx;
							const exerciseCount = masterWeekData[idx]?.exercises?.length || 0;
							const splitName = masterWeekData[idx]?.splitName;

							return (
								<button
									key={day}
									type="button"
									disabled={!isTrainingDay}
									onClick={() => setCurrentDay(idx)}
									className={cn(
										"px-4 py-3 rounded-2xl text-left transition-all border min-w-[115px] md:min-w-[130px] flex flex-col justify-between shrink-0 relative overflow-hidden group",
										!isTrainingDay &&
											"opacity-35 border-dashed border-foreground/10 bg-foreground/[0.01] cursor-not-allowed",
										isTrainingDay &&
											!isSelected &&
											"bg-foreground/[0.03] hover:bg-foreground/[0.06] border-foreground/[0.08] hover:border-foreground/20 text-foreground cursor-pointer",
										isSelected &&
											"bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/25 ring-2 ring-brand-primary/30 cursor-default",
									)}>
									{/* Top Row: Short day name + active badge or status indicator */}
									<div className="flex items-center justify-between w-full">
										<span
											className={cn(
												"text-xs font-bold tracking-tight",
												isSelected
													? "text-white"
													: isTrainingDay
														? "text-foreground"
														: "text-foreground/30",
											)}>
											{day.substring(0, 3)}
										</span>
										{isSelected && (
											<span className="w-2 h-2 rounded-full bg-white shadow-xs animate-pulse" />
										)}
										{!isSelected && isTrainingDay && exerciseCount > 0 && (
											<span className="w-1.5 h-1.5 rounded-full bg-brand-primary/80" />
										)}
									</div>

									{/* Bottom Info: Full day or Split name or Exercise count */}
									<div className="mt-2.5 w-full">
										<p
											className={cn(
												"text-[11px] font-semibold truncate leading-tight",
												isSelected
													? "text-white/95"
													: isTrainingDay
														? "text-foreground/75"
														: "text-foreground/25",
											)}>
											{isTrainingDay ? splitName || day : "Rest Day"}
										</p>
										<p
											className={cn(
												"text-[10px] mt-0.5 truncate font-medium",
												isSelected
													? "text-white/75"
													: isTrainingDay
														? "text-foreground/40"
														: "text-foreground/20",
											)}>
											{isTrainingDay
												? `${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"}`
												: "Off"}
										</p>
									</div>
								</button>
							);
						})}
					</div>

					{/* Split Name Editor */}
					<GlassCard className="space-y-1">
						<label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
							Split Name for {DAYS[currentDay]}
						</label>
						<input
							value={currentDayData.splitName}
							onChange={(e) =>
								updateDayData(currentDay, { splitName: e.target.value })
							}
							placeholder="e.g. Upper Body, Pull, Heavy Squat Day..."
							className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-bold outline-none focus:border-brand-primary transition-colors"
						/>
					</GlassCard>

					{/* Rationale Note (AI preview) */}
					{dayRationalesState[currentDay] && (
						<div className="relative glass-card border-brand-primary/20 bg-brand-primary/5 py-3 px-4 pr-10 space-y-1">
							<div className="flex items-center space-x-2">
								<Sparkles className="w-3.5 h-3.5 text-brand-primary" />
								<h4 className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
									Why this split
								</h4>
							</div>
							<p className="text-xs font-medium text-foreground/70 leading-relaxed">
								{dayRationalesState[currentDay]}
							</p>
							<button
								onClick={() =>
									setDayRationalesState((prev) => {
										const next = { ...prev };
										delete next[currentDay];
										return next;
									})
								}
								className="absolute top-3 right-3 p-1 text-foreground/30 hover:text-foreground/70 transition-colors"
								aria-label="Dismiss rationale">
								<X className="w-4 h-4" />
							</button>
						</div>
					)}

					<div className="space-y-4">
						<div className="flex justify-between items-center px-2">
							<h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.2em]">
								Workout List
							</h3>
							<button
								onClick={() => setShowExerciseSelector(true)}
								className="text-brand-primary text-[10px] font-black uppercase tracking-widest flex items-center hover:underline bg-brand-primary/10 px-4 py-2 rounded-xl">
								<Plus className="w-4 h-4 mr-1" /> Add Exercise
							</button>
						</div>

						{currentDayData.exercises.length === 0 ? (
							<div className="glass-card border-dashed border-foreground/10 flex flex-col items-center justify-center py-20 text-center opacity-40">
								<Dumbbell className="w-12 h-12 mb-4" />
								<p className="text-xs font-bold uppercase tracking-widest">
									No exercises added yet
								</p>
							</div>
						) : (
							currentDayData.exercises.map((ex, idx) => {
								const review = pendingReviews[ex.exerciseId];
								return (
								<GlassCard
									key={ex.exerciseId}
									className="space-y-4 relative border-l-4 border-l-brand-primary">
									<div className="flex justify-between items-start">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
												<Dumbbell className="w-5 h-5 text-brand-primary" />
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="font-black text-foreground uppercase tracking-tight">
													{ex.name}
												</h4>
												{review?.kind === "new" && (
													<span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-[8px] font-black uppercase tracking-wider text-amber-500 border border-amber-500/20">
														New — not in library
													</span>
												)}
												<div className="flex items-center space-x-2 text-[8px] font-black uppercase text-foreground/40">
													<span className="flex items-center">
														<Info className="w-2 h-2 mr-1" /> Best: {ex.pr || 0}
														kg
													</span>
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-1">
											<button
												onClick={() => handleMoveExercise(idx, "up")}
												disabled={idx === 0}
												className="p-1.5 text-foreground/20 hover:text-brand-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
												<ChevronUp className="w-4 h-4" />
											</button>
											<button
												onClick={() => handleMoveExercise(idx, "down")}
												disabled={idx === currentDayData.exercises.length - 1}
												className="p-1.5 text-foreground/20 hover:text-brand-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
												<ChevronDown className="w-4 h-4" />
											</button>
											<button
												onClick={() => {
													const newExs = currentDayData.exercises.filter(
														(_, i) => i !== idx,
													);
													updateDayData(currentDay, { exercises: newExs });
												}}
												className="p-2 text-foreground/20 hover:text-rose-500">
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>

									{review?.kind === "review" && (
										<div className="space-y-2 bg-foreground/5 border border-brand-primary/20 rounded-xl p-3">
											<p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
												Which exercise did you mean?
											</p>
											<div className="flex flex-wrap gap-2">
												{review.candidates?.map((c) => (
													<button
														key={c.id}
														onClick={() =>
															resolveExerciseReview(ex.exerciseId, c.id, c.name)
														}
														className="px-3 py-2 rounded-lg border border-foreground/10 bg-foreground/5 text-[10px] font-bold text-foreground/80 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all">
														{c.name}{" "}
														<span className="text-foreground/40 font-medium">
															({Math.round(c.similarity * 100)}%)
														</span>
													</button>
												))}
											</div>
											<button
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
												className="text-[10px] font-bold text-foreground/40 hover:text-amber-500 underline underline-offset-2 transition-colors">
												None of these — create as new exercise
											</button>
										</div>
									)}

									{review?.kind === "new" && (
										<div className="flex items-center justify-between gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
											<p className="text-[10px] font-bold text-foreground/60">
												&quot;{review.aiName}&quot; isn&apos;t in your library —
												create it as a custom exercise under{" "}
												<span className="text-brand-primary uppercase font-black">
													{review.muscleGroup}
												</span>
												?
											</p>
											<button
												onClick={() =>
													handleCreateNewExercise(
														ex.exerciseId,
														review.aiName,
														review.muscleGroup,
													)
												}
												className="shrink-0 bg-amber-500/20 border border-amber-500/30 text-amber-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all">
												Create Exercise
											</button>
										</div>
									)}

									<div className="grid grid-cols-3 gap-4">
										<div className="space-y-1">
											<label className="text-[8px] font-black text-foreground/40 uppercase text-center block">
												Sets
											</label>
											<input
												type="number"
												value={ex.targetSets}
												onChange={(e) => {
													const newExs = [...currentDayData.exercises];
													newExs[idx].targetSets = parseInt(e.target.value);
													updateDayData(currentDay, { exercises: newExs });
												}}
												className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 text-center font-bold text-foreground outline-none focus:border-brand-primary"
											/>
										</div>
										<div className="space-y-1">
											<label className="text-[8px] font-black text-foreground/40 uppercase text-center block">
												Reps
											</label>
											<input
												type="number"
												value={ex.targetReps}
												onChange={(e) => {
													const newExs = [...currentDayData.exercises];
													newExs[idx].targetReps = parseInt(e.target.value);
													updateDayData(currentDay, { exercises: newExs });
												}}
												className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 text-center font-bold text-foreground outline-none focus:border-brand-primary"
											/>
										</div>
										<div className="space-y-1">
											<label className="text-[8px] font-black text-brand-primary/60 uppercase text-center block">
												Target Weight
											</label>
											<input
												type="number"
												value={ex.lastWeight}
												onChange={(e) => {
													const newExs = [...currentDayData.exercises];
													newExs[idx].lastWeight = parseInt(e.target.value);
													updateDayData(currentDay, { exercises: newExs });
												}}
												className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 text-center font-bold text-brand-primary outline-none focus:border-brand-primary"
											/>
										</div>
									</div>
									{/* Rest Duration Selector */}
									<div className="pt-2 border-t border-foreground/5">
										<label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest ml-1 mb-2 block">
											Rest Duration
										</label>
										<div className="flex flex-wrap gap-2">
											{[60, 90, 120, 180].map((time) => (
												<button
													key={time}
													type="button"
													onClick={() => {
														const newExs = [...currentDayData.exercises];
														newExs[idx].restDuration = time;
														updateDayData(currentDay, { exercises: newExs });
													}}
													className={cn(
														"px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
														ex.restDuration === time
															? "bg-brand-primary border-brand-primary text-black"
															: "border-foreground/10 text-foreground/40 hover:border-foreground/20",
													)}>
													{time < 60
														? `${time}s`
														: time % 60 === 0
															? `${time / 60}m`
															: `${time}s`}
												</button>
											))}
											<div className="flex items-center bg-foreground/5 border border-foreground/10 rounded-lg px-2 py-1.5 ml-auto">
												<input
													type="number"
													placeholder="Custom..."
													value={ex.restDuration || ""}
													onChange={(e) => {
														const newExs = [...currentDayData.exercises];
														newExs[idx].restDuration =
															parseInt(e.target.value) || 0;
														updateDayData(currentDay, { exercises: newExs });
													}}
													className="w-12 bg-transparent text-center font-bold text-[10px] outline-none placeholder:font-normal"
												/>
												<span className="text-[8px] font-black text-foreground/20 uppercase ml-1">
													Secs
												</span>
											</div>
										</div>
									</div>

									<WarmupSetsPanel
										workingWeight={ex.lastWeight}
										repsField={ex.targetReps}
										mode="PLAN_DESIGNER"
									/>
								</GlassCard>
								);
								})
						)}
					</div>
				</div>

				{/* Mobility Warmup Selection */}
				<GlassCard className="space-y-4">
					<button
						onClick={() => setWarmupOpen(!warmupOpen)}
						className="w-full flex items-center justify-between p-4"
					>
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
								<Dumbbell className="w-5 h-5 text-brand-primary" />
							</div>
							<div className="text-left">
								<h3 className="text-xs font-black text-foreground uppercase tracking-widest">
									Mobility Warmup
								</h3>
								<p className="text-[10px] font-bold text-foreground/40 uppercase">
									{warmupIds.length === 0 && customWarmups.length === 0
										? "Using 6 default movements"
										: `${warmupIds.length + customWarmups.length} selected`}
								</p>
							</div>
						</div>
						{warmupOpen ? (
							<ChevronUp className="w-4 h-4 text-foreground/40" />
						) : (
							<ChevronDown className="w-4 h-4 text-foreground/40" />
						)}
					</button>

					{warmupOpen && (
						<div className="px-4 pb-4 space-y-4">
							<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
								Select movements. Leave all empty for defaults.
							</p>

							{/* Custom warmup input */}
							<div className="flex items-center space-x-2">
								<input
									value={customWarmupInput}
									onChange={(e) => setCustomWarmupInput(e.target.value)}
									placeholder="Name (e.g. Ankle Rolls)"
									className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm text-foreground font-bold outline-none focus:border-brand-primary placeholder:font-medium placeholder:opacity-50"
								/>
								<select
									value={customWarmupDuration}
									onChange={(e) => setCustomWarmupDuration(Number(e.target.value))}
									className="bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2.5 text-sm text-foreground font-bold outline-none focus:border-brand-primary"
								>
									<option value={30}>30s</option>
									<option value={45}>45s</option>
									<option value={60}>60s</option>
									<option value={90}>90s</option>
								</select>
								<button
									onClick={handleAddCustomWarmup}
									disabled={!customWarmupInput.trim()}
									className="bg-brand-primary text-black px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
								>
									<Plus className="w-4 h-4" />
								</button>
							</div>

							{/* Movement grid — defaults + custom */}
							{customWarmups.length > 0 && (
								<div className="space-y-2">
									<h4 className="text-[8px] font-black text-brand-primary uppercase tracking-widest">Custom</h4>
									<div className="grid grid-cols-2 gap-2">
										{customWarmups.map((m, idx) => (
											<div
												key={m.id}
												className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-brand-primary/20 bg-brand-primary/5"
											>
												<div className="flex flex-col">
													<span className="text-[10px] font-bold text-foreground/80">{m.name}</span>
													<span className="text-[8px] font-medium text-foreground/40">{m.durationSeconds}s</span>
												</div>
												<button
													onClick={() => setCustomWarmups((prev) => prev.filter((_, i) => i !== idx))}
													className="p-1 text-foreground/20 hover:text-rose-500 transition-colors"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</button>
											</div>
										))}
									</div>
								</div>
							)}

							<h4 className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Defaults</h4>
							<div className="grid grid-cols-2 gap-2">
								{MOBILITY_MOVEMENTS.map((m) => {
									const selected = warmupIds.includes(m.id);
									return (
										<button
											key={m.id}
											onClick={() => {
												setWarmupIds((prev) =>
													prev.includes(m.id)
														? prev.filter((id) => id !== m.id)
														: [...prev, m.id]
												);
											}}
											className={cn(
												"flex items-center space-x-2 px-3 py-2.5 rounded-xl border text-left transition-all",
												selected
													? "border-brand-primary/30 bg-brand-primary/10"
													: "border-foreground/10 bg-foreground/5",
											)}
										>
											<div
												className={cn(
													"w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
													selected ? "bg-brand-primary" : "bg-foreground/10",
												)}
											>
												{selected && <Check className="w-3 h-3 text-black" />}
											</div>
											<div className="flex flex-col">
												<span className="text-[10px] font-bold text-foreground/80">
													{m.name}
												</span>
												<span className="text-[8px] font-medium text-foreground/40">
													{m.durationSeconds}s
												</span>
											</div>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</GlassCard>
			</>
			)}

			{/* Sticky Footer */}
			<div className="fixed bottom-0 left-0 md:left-20 right-0 z-50 pointer-events-none">
				<div
					className="absolute inset-0 bg-background/80 backdrop-blur-xl"
					style={{
						maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
						WebkitMaskImage:
							"linear-gradient(to top, black 40%, transparent 100%)",
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

				<div className="max-w-4xl mx-auto p-6 relative pointer-events-auto">
					<div className="flex gap-4">
						{step === "config" ? (
							<button
								onClick={() => {
									if (!startDate) return alert("Please select a date.");
									setStep("days");
								}}
								className="w-full bg-brand-primary text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
								Continue to Days
							</button>
						) : step === "days" ? (
							<>
								<button
									onClick={() => setStep("config")}
									className="flex-1 glass-button py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-foreground/10">
									Back
								</button>
								<button
									onClick={() => {
										if (trainingDays.length === 0)
											return alert("Please select at least one training day.");
										setStep("exercises");
										setCurrentDay(trainingDays[0]);
									}}
									className="flex-[2] bg-brand-primary text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all">
									Set Exercises
								</button>
							</>
						) : (
							<>
								<button
									onClick={() => setStep("days")}
									className="flex-1 glass-button py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-foreground/10">
									Back
								</button>
								{showDraftOption && (
									<button
										onClick={() => handleSave('draft')}
										disabled={isSaving}
										className="flex-1 glass-button py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border-foreground/10 hover:border-brand-primary/40">
										{isSaving ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											"Save as Draft"
										)}
									</button>
								)}
								<button
									onClick={() => handleSave(showDraftOption ? 'active' : undefined)}
									disabled={isSaving}
									className="flex-[2] bg-brand-primary text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all">
									{isSaving ? (
										<Loader2 className="w-5 h-5 animate-spin" />
									) : showSuccess ? (
										<CheckCircle2 className="w-5 h-5" />
									) : (
										showDraftOption ? "Save as Plan" : "Finalize Plan"
									)}
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Exercise Selector Modal */}
			{showExerciseSelector && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/90 backdrop-blur-md"
						onClick={closeExerciseSelector}
					/>
					<GlassCard className="w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col relative z-[101] border-brand-primary/20 p-0">
						{/* Header */}
						<div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-background/50 backdrop-blur-md z-10 sticky top-0">
							<div className="flex items-center space-x-3">
								{exerciseModalStep === "exercises" && (
									<button
										onClick={() => setExerciseModalStep("muscles")}
										className="p-2 hover:bg-foreground/5 rounded-full -ml-2">
										<ChevronLeft className="w-5 h-5 text-foreground/60 hover:text-foreground" />
									</button>
								)}
								<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
									{exerciseModalStep === "muscles"
										? "Target Muscles"
										: "Select Exercises"}
								</h2>
							</div>
							<button
								onClick={closeExerciseSelector}
								className="p-2 hover:bg-foreground/5 rounded-full -mr-2">
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Step 1: Muscle Selection */}
						{exerciseModalStep === "muscles" && (
							<div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
								<p className="text-sm font-bold text-foreground/40 text-center mb-8 uppercase tracking-widest">
									Which muscle groups are you training today?
								</p>
								<div className="grid grid-cols-2 gap-3 mb-8">
									{availableMuscleGroups.map((muscle) => {
										const isSelected = selectedMuscles.includes(muscle);
										return (
											<button
												key={muscle}
												onClick={() => toggleMuscle(muscle)}
												className={cn(
													"py-5 px-4 rounded-2xl font-black text-sm uppercase tracking-wide border-2 transition-all group flex items-center justify-between",
													isSelected
														? "bg-brand-primary/10 border-brand-primary text-brand-primary"
														: "bg-foreground/5 border-foreground/5 text-foreground/60 hover:border-foreground/20 hover:text-foreground hover:bg-foreground/10",
												)}>
												{muscle}
												<div
													className={cn(
														"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
														isSelected
															? "border-brand-primary bg-brand-primary"
															: "border-foreground/20 group-hover:border-foreground/40",
													)}>
													{isSelected && (
														<Check className="w-3 h-3 text-black" />
													)}
												</div>
											</button>
										);
									})}
								</div>

								<div className="mt-auto pt-6 border-t border-foreground/10">
									<button
										onClick={() => {
											if (selectedMuscles.length === 0)
												return alert(
													"Select at least one muscle group to continue!",
												);
											setExerciseModalStep("exercises");
										}}
										disabled={selectedMuscles.length === 0}
										className={cn(
											"w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
											selectedMuscles.length > 0
												? "bg-brand-primary text-black shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95"
												: "bg-foreground/10 text-foreground/40 cursor-not-allowed",
										)}>
										Next: Choose Exercises
									</button>
								</div>
							</div>
						)}

						{/* Step 2: Exercise Selection */}
						{exerciseModalStep === "exercises" && (
							<>
								<div className="p-6 pb-2 space-y-4">
									{/* Custom Exercise Input */}
									<div className="flex items-center space-x-2">
										<input
											placeholder="Add a custom exercise..."
											value={customExerciseInput}
											onChange={(e) => setCustomExerciseInput(e.target.value)}
											onKeyDown={(e) =>
												e.key === "Enter" && handleAddCustomExercise()
											}
											className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-bold outline-none focus:border-brand-primary placeholder:font-medium placeholder:opacity-50"
										/>
										<button
											onClick={handleAddCustomExercise}
											disabled={
												!customExerciseInput.trim() ||
												loadingHistory === "custom"
											}
											className="bg-foreground/10 text-foreground py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-black hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all disabled:opacity-30 disabled:hover:bg-foreground/10 disabled:hover:text-foreground disabled:hover:shadow-none min-w-[100px] flex justify-center items-center">
											{loadingHistory === "custom" ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												"Add Custom"
											)}
										</button>
									</div>

									{/* Search Bar */}
									<div className="relative">
										<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
										<input
											placeholder="Search for exercises..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-brand-primary"
										/>
									</div>
								</div>

								<div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 custom-scrollbar">
									{availableMuscleGroups.map((group) => {
										if (!selectedMuscles.includes(group)) return null;

										const groupExercises = availableExercises.filter(
											(e) => e.muscleGroup === group,
										);
										const filtered = groupExercises.filter((ex) =>
											ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
										);
										if (filtered.length === 0) return null;

										return (
											<div key={group} className="space-y-3">
												<h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">
													{group}
												</h3>
												<div className="grid grid-cols-1 gap-2">
													{filtered.map((ex) => {
														const isSelected = draftSelectedExercises.includes(
															ex.name,
														);
														return (
															<button
																key={ex.name}
																onClick={() => toggleExerciseSelection(ex.name)}
																className={cn(
																	"w-full text-left px-5 py-4 rounded-2xl border transition-all flex justify-between items-center group",
																	isSelected
																		? "bg-brand-primary/10 border-brand-primary"
																		: "bg-foreground/5 border-foreground/10 hover:border-brand-primary hover:bg-brand-primary/5 text-foreground/80",
																)}>
																<span
																	className={cn(
																		"font-bold",
																		isSelected
																			? "text-brand-primary"
																			: "group-hover:text-foreground",
																	)}>
																	{ex.name}
																	{ex.isCustom && (
																		<span className="ml-2 px-2 py-0.5 rounded-md bg-brand-primary/10 text-[8px] uppercase tracking-wider text-brand-primary border border-brand-primary/20">
																			Custom
																		</span>
																	)}
																</span>
																<div
																	className={cn(
																		"w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
																		isSelected
																			? "border-brand-primary bg-brand-primary text-black shadow-[0_0_10px_rgba(249,115,22,0.5)]"
																			: "border-foreground/20 text-transparent group-hover:border-brand-primary",
																	)}>
																	<Check
																		className={cn(
																			"w-3 h-3 transition-opacity",
																			isSelected ? "opacity-100" : "opacity-0",
																		)}
																	/>
																</div>
															</button>
														);
													})}
												</div>
											</div>
										);
									})}

									{/* Empty state when rendering exclusively selected muscles that don't match query */}
									{selectedMuscles.length > 0 &&
										selectedMuscles.every(
											(muscle) =>
												availableExercises.filter(
													(ex) =>
														ex.muscleGroup === muscle &&
														ex.name
															.toLowerCase()
															.includes(searchQuery.toLowerCase()),
												).length === 0,
										) && (
											<div className="py-12 text-center text-foreground/40">
												<p className="text-sm font-bold">
													No exercises found for your search.
												</p>
												<p className="text-[10px] uppercase tracking-wider mt-2">
													Try using the Custom Exercise input above.
												</p>
											</div>
										)}
								</div>

								{/* Add Action Footer */}
								<div
									className={cn(
										"p-6 border-t border-foreground/10 bg-background/95 backdrop-blur-md transition-all duration-300",
										draftSelectedExercises.length > 0
											? "translate-y-0 opacity-100"
											: "translate-y-8 opacity-0 hidden",
									)}>
									<button
										onClick={handleAddSelected}
										disabled={loadingHistory === "multiple"}
										className="w-full bg-brand-primary text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
										{loadingHistory === "multiple" ? (
											<Loader2 className="w-5 h-5 animate-spin" />
										) : (
											<>
												Add {draftSelectedExercises.length} Exercise
												{draftSelectedExercises.length !== 1 ? "s" : ""}
											</>
										)}
									</button>
								</div>
							</>
						)}
					</GlassCard>
				</div>
			)}
		</div>
	);
}
