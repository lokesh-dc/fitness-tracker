"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Check,
	ChevronLeft,
	ChevronRight,
	Search,
	X,
} from "lucide-react";
import MuscleBodyMap from "@/components/ui/MuscleBodyMap";
import MuscleIcon from "@/components/ui/MuscleIcon";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { type ExerciseDefinition } from "@/types/workout";

interface ChangeWorkoutModalProps {
	open: boolean;
	exercises: ExerciseDefinition[];
	preSelectedExerciseNames: string[];
	/** Whether a planned template exists, so clearing the selection means "reset to plan". */
	hasPlannedWorkout?: boolean;
	onClose: () => void;
	onConfirm: (selectedExercises: string[]) => void;
}

/** Canonical display order. Anything unlisted falls back, sorted alphabetically. */
const MUSCLE_ORDER = [
	"Chest",
	"Back",
	"Legs",
	"Shoulders",
	"Biceps",
	"Triceps",
	"Forearms",
	"Core",
	"Cardio",
	// Legacy and AI-invented groups still exist in the library
	"Arms",
	"Other",
];

function muscleRank(muscle: string) {
	const index = MUSCLE_ORDER.indexOf(muscle);
	return index === -1 ? MUSCLE_ORDER.length : index;
}

function sortMuscles(muscles: string[]) {
	return [...muscles].sort(
		(a, b) => muscleRank(a) - muscleRank(b) || a.localeCompare(b),
	);
}

export default function ChangeWorkoutModal({
	open,
	exercises: allExercises,
	preSelectedExerciseNames,
	hasPlannedWorkout = false,
	onClose,
	onConfirm,
}: ChangeWorkoutModalProps) {
	const [step, setStep] = useState<"muscles" | "exercises">("muscles");
	const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
	const [selectedExercises, setSelectedExercises] = useState<string[]>(
		preSelectedExerciseNames,
	);
	const [searchQuery, setSearchQuery] = useState("");

	// Group the library once instead of on every keystroke.
	const exercisesByMuscle = useMemo(() => {
		const groups = new Map<string, ExerciseDefinition[]>();
		for (const ex of allExercises) {
			const list = groups.get(ex.muscleGroup) ?? [];
			list.push(ex);
			groups.set(ex.muscleGroup, list);
		}
		return Array.from(groups.entries())
			.map(([muscle, exercises]) => ({ muscle, exercises }))
			.sort(
				(a, b) =>
					muscleRank(a.muscle) - muscleRank(b.muscle) ||
					a.muscle.localeCompare(b.muscle),
			);
	}, [allExercises]);

	// muscle -> exercise names, for cascade + per-muscle counts.
	const namesByMuscle = useMemo(
		() =>
			new Map(
				exercisesByMuscle.map(({ muscle, exercises }) => [
					muscle,
					new Set(exercises.map((ex) => ex.name)),
				]),
			),
		[exercisesByMuscle],
	);

	const bodyGroups = useMemo(
		() =>
			exercisesByMuscle.map(({ muscle, exercises }) => ({
				muscle,
				count: exercises.length,
			})),
		[exercisesByMuscle],
	);

	// Re-sync from the live session each time the modal is opened.
	const [wasOpen, setWasOpen] = useState(open);
	if (open !== wasOpen) {
		setWasOpen(open);
		if (open) {
			setSelectedExercises(preSelectedExerciseNames);
			setSelectedMuscles(
				sortMuscles(
					Array.from(
						new Set(
							allExercises
								.filter((ex) => preSelectedExerciseNames.includes(ex.name))
								.map((ex) => ex.muscleGroup),
						),
					),
				),
			);
			setSearchQuery("");
			setStep("muscles");
		}
	}

	// Unticking a muscle also drops any of its exercises that were picked,
	// so the selection can never hold a muscle the user just said no to.
	const toggleMuscle = (muscle: string) => {
		if (selectedMuscles.includes(muscle)) {
			const names = namesByMuscle.get(muscle);
			setSelectedExercises((prev) =>
				prev.filter((name) => !names?.has(name)),
			);
			setSelectedMuscles((prev) => prev.filter((m) => m !== muscle));
		} else {
			setSelectedMuscles((prev) => [...prev, muscle]);
		}
	};

	const toggleExercise = (exerciseName: string) => {
		setSelectedExercises((prev) =>
			prev.includes(exerciseName)
				? prev.filter((e) => e !== exerciseName)
				: [...prev, exerciseName],
		);
	};

	const handleClose = () => {
		setSelectedExercises(preSelectedExerciseNames);
		setSelectedMuscles([]);
		setSearchQuery("");
		setStep("muscles");
		onClose();
	};

	const handleConfirm = () => {
		onConfirm(selectedExercises);
		handleClose();
	};

	if (!open) return null;

	const query = searchQuery.trim().toLowerCase();

	// Groups render in the order the user picked them, narrowed by the search.
	const visibleGroups = selectedMuscles
		.map((muscle) => {
			const groupExercises = exercisesByMuscle.find(
				(g) => g.muscle === muscle,
			)?.exercises;
			if (!groupExercises) return null;
			const filtered = groupExercises.filter((ex) =>
				ex.name.toLowerCase().includes(query),
			);
			return filtered.length ? { muscle, exercises: filtered } : null;
		})
		.filter((g): g is { muscle: string; exercises: ExerciseDefinition[] } =>
			Boolean(g),
		);

	const confirmLabel =
		selectedExercises.length === 0
			? hasPlannedWorkout
				? "Reset To Planned Workout"
				: "Clear Today's Workout"
			: `Update Workout (${selectedExercises.length})`;

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/90 backdrop-blur-md"
				onClick={handleClose}
			/>
			<GlassCard className="w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col relative z-101 border-brand-primary/20 p-0">
				{/* Header */}
				<div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-background/50 backdrop-blur-md z-10">
					<div className="flex items-center space-x-2 min-w-0">
						{step === "exercises" && (
							<button
								onClick={() => setStep("muscles")}
								className="p-2 hover:bg-foreground/5 rounded-full -ml-2 shrink-0"
								aria-label="Back to muscles">
								<ChevronLeft className="w-5 h-5 text-foreground/60 hover:text-foreground" />
							</button>
						)}
						<div className="min-w-0">
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight truncate">
								{step === "muscles"
									? "What Are You Training?"
									: "Pick Your Exercises"}
							</h2>
							{step === "exercises" && (
								<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest truncate">
									{selectedMuscles.join(" · ")}
								</p>
							)}
						</div>
					</div>
					<button
						onClick={handleClose}
						className="p-2 hover:bg-foreground/5 rounded-full -mr-2 shrink-0"
						aria-label="Close">
						<X className="w-5 h-5" />
					</button>
				</div>

				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={step}
						initial={{ opacity: 0, x: 16 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -16 }}
						transition={{ duration: 0.18, ease: "easeOut" }}
						className="flex-1 flex flex-col min-h-0">
						{/* Step 1 — pick the muscles */}
						{step === "muscles" ? (
							<>
								<p className="shrink-0 px-6 pt-5 pb-1 text-[10px] font-black text-foreground/30 text-center uppercase tracking-[0.2em]">
									Pick the muscles, we&apos;ll show the moves
								</p>

								<div className="flex-1 overflow-y-auto px-6 pb-4">
									<MuscleBodyMap
										groups={bodyGroups}
										selected={selectedMuscles}
										onToggle={toggleMuscle}
									/>

									{/* What you picked, in words */}
									<div className="pt-5">
										<p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 pb-2">
											{selectedMuscles.length > 0
												? "Training"
												: "Nothing picked yet"}
										</p>
										{selectedMuscles.length > 0 && (
											<div className="flex flex-wrap items-center justify-center gap-2">
												{selectedMuscles.map((muscle) => {
													const groupNames = namesByMuscle.get(muscle);
													const count = selectedExercises.filter(
														(name) => groupNames?.has(name),
													).length;
													return (
														<button
															key={muscle}
															onClick={() => toggleMuscle(muscle)}
															aria-label={`Remove ${muscle}`}
															className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase tracking-wider transition-colors hover:bg-brand-primary hover:text-black">
															{muscle}
															{count > 0 && (
																<span className="text-[9px] opacity-70">
																	{count}
																</span>
															)}
															<X className="w-3 h-3" />
														</button>
													);
												})}
											</div>
										)}
									</div>
								</div>

								<div className="shrink-0 px-6 pb-6">
									<button
										onClick={() => setStep("exercises")}
										disabled={selectedMuscles.length === 0}
										className={cn(
											"w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center",
											selectedMuscles.length > 0
												? "bg-brand-primary text-black shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95"
												: "bg-foreground/10 text-foreground/40 cursor-not-allowed",
										)}>
										Next: Choose Exercises
										<ChevronRight className="w-4 h-4 ml-2" />
									</button>
								</div>
							</>
						) : (
							<>
								{/* Tap a chip to drop that muscle and anything picked under it */}
								<div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
									{selectedMuscles.map((muscle) => {
										const groupNames = namesByMuscle.get(muscle);
										const count = selectedExercises.filter((name) =>
											groupNames?.has(name),
										).length;
										return (
											<button
												key={muscle}
												onClick={() => {
													toggleMuscle(muscle);
													setSearchQuery("");
												}}
												className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[10px] font-black uppercase tracking-wider hover:bg-brand-primary hover:text-black transition-colors">
												{muscle}
												{count > 0 && (
													<span className="text-[9px] opacity-70">
														{count}
													</span>
												)}
												<X className="w-3 h-3" />
											</button>
										);
									})}
								</div>

								<div className="px-6 pb-3">
									<div className="relative">
										<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
										<input
											autoFocus
											placeholder={`Search ${selectedMuscles.join(", ")}...`}
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-brand-primary placeholder:text-foreground/30"
										/>
									</div>
								</div>

								<div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
									{visibleGroups.map(({ muscle, exercises }) => (
										<div key={muscle} className="space-y-3">
											<h3 className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">
												<MuscleIcon
													muscle={muscle}
													className="w-4 h-4"
												/>
												{muscle}
											</h3>
											<div className="grid grid-cols-1 gap-2">
												{exercises.map((ex) => {
													const isSelected = selectedExercises.includes(
														ex.name,
													);
													return (
														<button
															key={ex.name}
															onClick={() => toggleExercise(ex.name)}
															aria-pressed={isSelected}
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
																	"shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
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
									))}

									{visibleGroups.length === 0 && (
										<div className="py-12 text-center">
											<p className="text-sm font-bold text-foreground/50">
												{selectedMuscles.length === 0
													? "No muscles selected"
													: `No matches for "${searchQuery.trim()}"`}
											</p>
											<p className="text-[10px] uppercase tracking-widest text-foreground/30 mt-2">
												{selectedMuscles.length === 0
													? "Go back and pick the muscle you want to train"
													: "Try another search or tap a muscle to change it"}
											</p>
										</div>
									)}
								</div>

								<div className="p-6 border-t border-foreground/10 bg-background/95 backdrop-blur-md flex items-center gap-4">
									{selectedExercises.length > 0 && (
										<button
											onClick={() => setSelectedExercises([])}
											className="shrink-0 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-rose-400 transition-colors">
											Clear
										</button>
									)}
									<button
										onClick={handleConfirm}
										className="flex-1 bg-brand-primary text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all">
										{confirmLabel}
									</button>
								</div>
							</>
						)}
					</motion.div>
				</AnimatePresence>
			</GlassCard>
		</div>
	);
}
