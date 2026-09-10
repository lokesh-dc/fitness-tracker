"use client";

import { useCallback, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassSlider } from "@/components/ui/GlassSlider";
import {
	Sparkles,
	Loader2,
	ArrowLeft,
	RefreshCcw,
	AlertTriangle,
	Dumbbell,
	Wand2,
	Check,
} from "lucide-react";
import { generateProgram, matchGeneratedExercises } from "@/app/actions/plan";
import { PlanDesigner } from "@/components/PlanDesigner";
import {
	Goal,
	ExperienceLevel,
	Equipment,
	EQUIPMENT_OPTIONS,
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

function makeTempId(dayOfWeek: number, name: string) {
	return `ai-preview-${dayOfWeek}-${name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 40)}`;
}

export function GenerateProgramForm({
	initialExercises,
}: {
	initialExercises: ExerciseDefinition[];
}) {
	const [goal, setGoal] = useState<Goal>("hypertrophy");
	const [daysPerWeek, setDaysPerWeek] = useState(4);
	const [equipment, setEquipment] = useState<Equipment[]>([
		"dumbbell",
		"barbell",
	]);
	const [experienceLevel, setExperienceLevel] =
		useState<ExperienceLevel>("intermediate");
	const [weeksCount, setWeeksCount] = useState(4);

	const [phase, setPhase] = useState<"form" | "preview">("form");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [matchedDays, setMatchedDays] = useState<MatchedDay[]>([]);
	const [generatedProgram, setGeneratedProgram] =
		useState<GeneratedProgram | null>(null);
	const [previewDirty, setPreviewDirty] = useState(false);

	const handleDirty = useCallback(() => setPreviewDirty(true), []);

	const toggleEquipment = (value: Equipment) => {
		setEquipment((prev) =>
			prev.includes(value)
				? prev.filter((e) => e !== value)
				: [...prev, value],
		);
	};

	const runGeneration = async () => {
		setIsGenerating(true);
		setError(null);
		try {
			const result = await generateProgram({
				goal,
				daysPerWeek,
				equipment,
				experienceLevel,
				weeksCount,
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
		} catch {
			setError("Failed to generate program. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleGenerate = () => {
		if (equipment.length === 0) {
			setError("Select at least one equipment option.");
			return;
		}
		runGeneration();
	};

	const handleRegenerate = () => {
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
					lastWeight: 0,
					pr: 0,
					prReps: 0,
					sets: [],
				})),
			});
		}

		const plan = {
			id: "",
			userId: "",
			name: `AI Program · ${goal} · ${daysPerWeek} days`,
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

	// ---- Form phase ----

	if (phase === "form") {
		return (
			<div className="space-y-8 pb-48">
				{/* Goal */}
				<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="max-w-md mx-auto space-y-8">
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

						<div className="grid grid-cols-3 gap-2">
							{GOAL_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									onClick={() => setGoal(opt.value)}
									className={cn(
										"py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all",
										goal === opt.value
											? "bg-brand-primary/10 border-brand-primary text-brand-primary"
											: "bg-foreground/5 border-foreground/5 text-foreground/60 hover:border-foreground/20",
									)}>
									{opt.label}
								</button>
							))}
						</div>

						<hr className="border-foreground/10" />

						{/* Experience */}
						<div className="text-center space-y-2">
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
								Experience level
							</h2>
						</div>
						<div className="grid grid-cols-3 gap-2">
							{EXPERIENCE_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									onClick={() => setExperienceLevel(opt.value)}
									className={cn(
										"py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all",
										experienceLevel === opt.value
											? "bg-brand-primary/10 border-brand-primary text-brand-primary"
											: "bg-foreground/5 border-foreground/5 text-foreground/60 hover:border-foreground/20",
									)}>
									{opt.label}
								</button>
							))}
						</div>
					</div>
				</GlassCard>

				{/* Volume */}
				<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="max-w-md mx-auto space-y-8">
						<div className="text-center space-y-2">
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
								How many days per week?
							</h2>
							<p className="text-sm text-foreground/40 font-medium">
								Pick any frequency — the coach will explain the split in the preview.
							</p>
						</div>

						<div className="flex items-center justify-center space-x-6">
							<button
								onClick={() => setDaysPerWeek((prev) => Math.max(1, prev - 1))}
								className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
								-
							</button>
							<div className="text-5xl font-black text-brand-primary tabular-nums">
								{daysPerWeek}
							</div>
							<button
								onClick={() => setDaysPerWeek((prev) => Math.min(7, prev + 1))}
								className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
								+
							</button>
						</div>
						<p className="text-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
							{daysPerWeek === 1 ? "day" : "days"} / week
						</p>

						<hr className="border-foreground/10" />

						<div className="text-center space-y-2">
							<h2 className="text-xl font-black text-foreground uppercase tracking-tight">
								How many weeks?
							</h2>
						</div>

						<div className="space-y-6">
							<div className="flex items-center justify-center space-x-6">
								<button
									onClick={() => setWeeksCount((prev) => Math.max(1, prev - 1))}
									className="glass-button w-12 h-12 rounded-xl text-2xl font-bold">
									-
								</button>
								<div className="text-5xl font-black text-brand-primary tabular-nums">
									{weeksCount}
								</div>
								<button
									onClick={() => setWeeksCount((prev) => Math.min(12, prev + 1))}
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

				{/* Equipment */}
				<GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<div className="max-w-md mx-auto space-y-8">
						<div className="text-center space-y-2">
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
											<p className="font-bold text-foreground">{opt.label}</p>
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

				{error && (
					<div className="flex items-center justify-between gap-3 glass-card border border-rose-500/30 bg-rose-500/5 py-4 px-5">
						<div className="flex items-center space-x-3">
							<AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
							<p className="text-sm font-bold text-rose-400">{error}</p>
						</div>
						<button
							onClick={() => setError(null)}
							className="text-rose-400/60 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest shrink-0">
							Dismiss
						</button>
					</div>
				)}

				{/* Sticky Generate footer */}
				<div className="fixed bottom-0 left-0 md:left-20 right-0 z-50 pointer-events-none">
					<div className="max-w-4xl mx-auto p-6 relative pointer-events-auto">
						<button
							onClick={handleGenerate}
							disabled={isGenerating}
							className="w-full bg-brand-primary text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100">
							{isGenerating ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin mr-2" />
									Generating your program...
								</>
							) : (
								<>
									<Wand2 className="w-5 h-5 mr-2" />
									Generate My Program
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		);
	}

	// ---- Preview phase ----

	return (
		<div className="space-y-6 pb-48">
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
								{goal} · {daysPerWeek} days/wk · {weeksCount} wks ·{" "}
								{experienceLevel} · {equipment.map((e) => e).join(", ")}
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setPhase("form")}
							className="glass-button px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-foreground/10 flex items-center">
							<ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
							Edit Inputs
						</button>
						<button
							onClick={handleRegenerate}
							disabled={isGenerating}
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
		</div>
	);
}