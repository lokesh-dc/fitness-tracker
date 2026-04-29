"use client";

import { useState, useEffect } from "react";
import {
	saveWorkoutSession,
	saveBodyWeight,
	saveSingleExerciseLog,
} from "@/app/actions/logs";
import {
	type Exercise,
	type WorkoutTemplate,
	type WorkoutLog,
	type WorkoutMode,
} from "@/types/workout";
import { format } from "date-fns";
import {
	Loader2,
	Plus,
	Trash2,
	Trophy,
	ChevronLeft,
	Save,
	CheckCircle2,
	ArrowRight,
	Edit2,
	Dumbbell,
	Play,
} from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { WorkoutCelebration } from "./WorkoutCelebration";
import { useRestTimer } from "@/hooks/useRestTimer";
import { RestTimerBar } from "./RestTimerBar";
import { WarmupSetsPanel } from "./WarmupSetsPanel";
import { useSessionStats } from "@/hooks/useSessionStats";
import { PRsFeedDisplay } from "./workout/PRsFeedDisplay";
import PageWithSidebar from "./layout/PageWithSidebar";
import { requestNotificationPermission } from "@/lib/notifications";
import { ExerciseHistoryCard } from "./workout/ExerciseHistoryCard";
import { Confetti } from "./ui/Confetti";

const DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

interface WorkoutSessionProps {
	template: WorkoutTemplate | null;
	initialBodyWeight?: number | null;
	initialWorkoutLog?: WorkoutLog | null;
	initialPRs?: Record<string, { weight: number; reps: number }>;
	date?: string;
	mode?: WorkoutMode;
	userDefaultRest?: number;
}

export default function WorkoutSession({
	template,
	initialBodyWeight,
	initialWorkoutLog,
	initialPRs = {},
	date,
	mode = "LIVE_SESSION",
	userDefaultRest = 90,
}: WorkoutSessionProps) {
	// Sync logic for initial weight and step
	const effectiveBodyWeight =
		initialWorkoutLog?.bodyWeight || initialBodyWeight || 0;

	const [activeMode, setActiveMode] = useState<WorkoutMode>(mode);
	const [step, setStep] = useState<number>(0);
	const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(
		null,
	);
	const [exercises, setExercises] = useState<Exercise[]>(
		template?.exercises.map((ex) => {
			const loggedEx = initialWorkoutLog?.exercises?.find(
				(le: any) => le.exerciseId === ex.exerciseId,
			);
			const initialSets = loggedEx
				? loggedEx.sets
				: Array.from({ length: ex.targetSets || 1 }).map(() => ({
						weight: ex.lastWeight || 0,
						reps: ex.targetReps || 0,
						completed: activeMode === "MANUAL_LOG",
					}));
			return {
				...ex,
				sets: initialSets,
				pr: initialPRs[ex.exerciseId]?.weight || 0,
				prReps: initialPRs[ex.exerciseId]?.reps || 0,
				isDone: !!loggedEx,
			};
		}) || [],
	);
	const [bodyWeight, setBodyWeight] = useState<number>(effectiveBodyWeight);
	const [updateTemplate, setUpdateTemplate] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmittingWeight, setIsSubmittingWeight] = useState(false);
	const [isSubmittingExercise, setIsSubmittingExercise] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [showCelebration, setShowCelebration] = useState(false);
	const [plateauDetected, setPlateauDetected] = useState(false);
	const [triggerConfetti, setTriggerConfetti] = useState(false);

	const sessionStats = useSessionStats(
		exercises,
		initialWorkoutLog?.id || "",
		"", // userId handled serverside
		template?.splitName || "Workout",
		template?.splitName,
		date,
		userDefaultRest,
		initialWorkoutLog?.startedAt,
	);

	const timer = useRestTimer();

	useEffect(() => {
		setPlateauDetected(false);
	}, [activeExerciseIndex]);

	useEffect(() => {
		if (step > 0 && template && exercises.length > 0) {
			document.body.classList.add("hide-mobile-nav");
		} else {
			document.body.classList.remove("hide-mobile-nav");
		}
		return () => document.body.classList.remove("hide-mobile-nav");
	}, [step, template, exercises.length]);

	const addSet = (exerciseIndex: number) => {
		setExercises((prev) => {
			const newExs = [...prev];
			const targetEx = { ...newExs[exerciseIndex] };

			let newSet = {
				weight: targetEx.lastWeight || 0,
				reps: targetEx.targetReps || 0,
				completed: activeMode === "MANUAL_LOG",
			};

			if (targetEx.sets.length > 0) {
				const lastSet = targetEx.sets[targetEx.sets.length - 1];
				newSet = { ...lastSet, completed: activeMode === "MANUAL_LOG" };
			}

			targetEx.sets = [...targetEx.sets, newSet];
			newExs[exerciseIndex] = targetEx;
			return newExs;
		});
	};

	const removeSet = (exerciseIndex: number, setIndex: number) => {
		setExercises((prev) => {
			const newExs = [...prev];
			const targetEx = { ...newExs[exerciseIndex] };
			if (targetEx.sets.length > 1) {
				const newSets = [...targetEx.sets];
				newSets.splice(setIndex, 1);
				targetEx.sets = newSets;
				newExs[exerciseIndex] = targetEx;
			}
			return newExs;
		});
	};

	const updateSet = (
		exerciseIndex: number,
		setIndex: number,
		field: "weight" | "reps" | "completed",
		value: number | boolean,
	) => {
		setExercises((prev) => {
			const newExs = [...prev];
			const targetEx = { ...newExs[exerciseIndex] };
			const newSets = [...targetEx.sets];
			const oldVal = newSets[setIndex][field as keyof (typeof newSets)[0]];
			newSets[setIndex] = { ...newSets[setIndex], [field]: value } as any;
			targetEx.sets = newSets;
			newExs[exerciseIndex] = targetEx;

			if (field === "completed" && value === true && oldVal !== true) {
				const rest = targetEx.restDuration || userDefaultRest;
				if (rest > 0 && activeMode === "LIVE_SESSION") {
					timer.start(rest);
				}
			}

			return newExs;
		});
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			await saveWorkoutSession(
				{
					bodyWeight,
					exercises,
					splitName: template?.splitName,
					name: template?.splitName || "Workout Session",
					startedAt: sessionStats.stats.startedAt || undefined,
				},
				updateTemplate,
				date,
			);
			setShowSuccess(true);
			setShowCelebration(true);
		} catch (error) {
			console.error(error);
			alert("Failed to save workout.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBodyWeightSubmit = async () => {
		if (!bodyWeight || bodyWeight <= 0) return;
		setIsSubmittingWeight(true);
		try {
			await saveBodyWeight(bodyWeight, date);
			setStep(2);
		} catch (error) {
			console.error(error);
			alert("Failed to save body weight.");
		} finally {
			setIsSubmittingWeight(false);
		}
	};

	const handleSingleExerciseSubmit = async () => {
		if (activeExerciseIndex === null) return;
		setIsSubmittingExercise(true);
		try {
			let hasNewPR = false;
			const exercise = exercises[activeExerciseIndex];
			await saveSingleExerciseLog(exercise, updateTemplate, date);

			const maxWeightThisSession = Math.max(
				...exercise.sets.map((s) => s.weight || 0),
			);
			const maxRepsAtMaxWeight = Math.max(
				...exercise.sets
					.filter((s) => (s.weight || 0) === maxWeightThisSession)
					.map((s) => s.reps || 0),
			);

			// PR Detection - Only if NOT skipped
			if (!exercise.isSkipped) {
				const isWeightPR = maxWeightThisSession > (exercise.pr || 0);
				const isRepPR =
					maxWeightThisSession === (exercise.pr || 0) &&
					maxRepsAtMaxWeight > (exercise.prReps || 0);

				if (isWeightPR || isRepPR) {
					sessionStats.registerPR({
						exerciseName: exercise.name,
						newPRWeight: maxWeightThisSession,
						newPRReps: maxRepsAtMaxWeight,
						previousPRWeight: exercise.pr || null,
						previousPRReps: exercise.prReps || null,
						timestamp: new Date(),
					});

					// Mark locally that we hit a PR to show the badge
					hasNewPR = true;
					setTriggerConfetti(true);
					setTimeout(() => setTriggerConfetti(false), 500);
				}
			}

			// Mark as done locally
			setExercises((prev) => {
				const newExs = [...prev];
				newExs[activeExerciseIndex] = {
					...newExs[activeExerciseIndex],
					isDone: true,
					isNew: true, // Mark as completed in current session
					...(hasNewPR
						? {
								pr: maxWeightThisSession,
								prReps: maxRepsAtMaxWeight,
								isNewPR: true,
							}
						: {}),
				} as any;
				return newExs;
			});

			setStep(2);
			setActiveExerciseIndex(null);
		} catch (error) {
			console.error(error);
			alert("Failed to save exercise.");
		} finally {
			setIsSubmittingExercise(false);
		}
	};

	const handleSkipExercise = async (idx: number) => {
		setIsSubmittingExercise(true);
		try {
			const targetEx = { ...exercises[idx], isSkipped: true, isDone: true };
			await saveSingleExerciseLog(targetEx, false, date);

			setExercises((prev) => {
				const newExs = [...prev];
				newExs[idx] = targetEx;
				return newExs;
			});
		} catch (error) {
			console.error(error);
			alert("Failed to skip exercise.");
		} finally {
			setIsSubmittingExercise(false);
		}
	};

	if (!template || exercises.length === 0) {
		return (
			<PageWithSidebar>
				<GlassCard className="p-12 md:mt-12 flex flex-col items-center justify-center text-center space-y-6 border-brand-primary/10 bg-brand-primary/5 max-w-2xl mx-auto min-h-[50vh]">
					<div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center">
						<CheckCircle2 className="w-10 h-10 text-brand-primary" />
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-foreground uppercase tracking-widest">
							Rest Day
						</h2>
						<p className="text-xs font-bold text-foreground/40 max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
							No exercises are planned for today. Take some time to recover and
							prepare for your next session.
						</p>
					</div>
					<Link
						href="/dashboard"
						className="px-8 py-4 bg-brand-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all mt-4 inline-flex items-center">
						Back to Dashboard
					</Link>
				</GlassCard>
			</PageWithSidebar>
		);
	}

	const completedCount = exercises.filter((ex) => (ex as any).isDone).length;
	const totalCount = exercises.length;
	const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	if (step === 0) {
		const footer = (
			<GlassCard className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-3 shadow-[0_-20px_40px_rgba(0,0,0,0.2)] border-foreground/10 backdrop-blur-xl">
				<div className="flex items-center space-x-3">
					<div
						onClick={() =>
							setActiveMode(
								activeMode === "LIVE_SESSION" ? "MANUAL_LOG" : "LIVE_SESSION",
							)
						}
						className={cn(
							"w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
							activeMode === "LIVE_SESSION"
								? "bg-brand-primary border border-brand-primary"
								: "bg-foreground/10 border border-foreground/10",
						)}>
						<div
							className={cn(
								"absolute top-[3px]  w-4 h-4 bg-white rounded-full transition-all duration-300",
								activeMode === "LIVE_SESSION"
									? "right-1"
									: "left-1 bg-brand-primary",
							)}
						/>
					</div>
					<div className="flex flex-col text-left">
						<span className="text-[10px] font-black text-foreground uppercase tracking-wider">
							Currently Working Out?
						</span>
						<span className="text-[8px] font-bold text-foreground/40 uppercase">
							{activeMode === "LIVE_SESSION"
								? "Live Session + Timer"
								: "Manual History Log"}
						</span>
					</div>
				</div>

				<button
					onClick={async () => {
						// Request notification permission on user gesture
						await requestNotificationPermission();
						setStep(effectiveBodyWeight > 0 ? 2 : 1);
						if (activeMode === "LIVE_SESSION") {
							sessionStats.startSession();
						}
					}}
					className="w-full md:w-auto px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-brand-primary text-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(249,115,22,0.3)]">
					Start Now <ArrowRight className="w-4 h-4 ml-2" />
				</button>
			</GlassCard>
		);

		return (
			<SessionLayout
				title="Ready for your workout?"
				subtitle={`${DAYS[template.dayOfWeek]} • ${template.splitName}`}
				footer={footer}
				exercises={exercises}
				completedCount={completedCount}
				totalCount={totalCount}
				progress={progress}
				date={date}
				mode={activeMode}
				timer={activeMode === "LIVE_SESSION" ? timer : null}>
				<div className="max-w-4xl mx-auto space-y-6">
					<GlassCard className="p-6 border-brand-primary/10 bg-brand-primary/5">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
									<Dumbbell className="w-5 h-5 text-brand-primary" />
								</div>
								<div>
									<h3 className="text-xs font-black text-foreground uppercase tracking-widest">
										Daily Target
									</h3>
									<p className="text-[10px] font-bold text-foreground/40 uppercase">
										{totalCount} Exercises to complete
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-sm font-black text-foreground">
									{bodyWeight || "—"}{" "}
									<span className="text-[10px] text-foreground/40 uppercase">
										KG
									</span>
								</p>
								<p className="text-[8px] font-bold text-foreground/40 uppercase tracking-tighter">
									Body Weight
								</p>
							</div>
						</div>
					</GlassCard>

					<div className="space-y-3">
						<div className="flex items-center space-x-2 ml-2 mb-2">
							<Play className="w-3 h-3 text-brand-primary" />
							<h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">
								Overview
							</h3>
						</div>
						{exercises.map((ex, idx) => (
							<GlassCard
								key={idx}
								className="p-4 flex items-center justify-between group">
								<div className="flex flex-col gap-3 w-full">
									{(ex as any).isNewPR ? (
										<div className="flex w-fit items-center space-x-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
											<Trophy className="w-3 h-3 text-emerald-500" />
											<span className="text-[8px] font-black text-emerald-500 uppercase">
												New Record: {ex.pr} KG
											</span>
										</div>
									) : ex.pr && ex.pr > 0 ? (
										<div className="flex w-fit items-center space-x-1.5 px-2 py-1 rounded-lg bg-brand-primary/5 border border-brand-primary/10">
											<Trophy className="w-3 h-3 text-brand-primary" />
											<span className="text-[8px] font-black text-brand-primary uppercase">
												{ex.pr} KG
											</span>
										</div>
									) : null}


									<div className="flex items-center space-x-4 justify-between">
										<div className="flex items-center space-x-4">
											<div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-md font-black text-foreground/40">
												{idx + 1}
											</div>
											<div>
												<h4 className="text-md font-black text-foreground">
													{ex.name}
												</h4>
												<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
													{ex.targetSets} Sets • {ex.targetReps} Reps
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-4">
											<div className="text-right min-w-[60px]">
												<p className="text-md font-black text-foreground">
													{ex.lastWeight || "—"} KG
												</p>
												<p className="text-[8px] font-bold text-foreground/40 uppercase tracking-tighter">
													Last
												</p>
											</div>
										</div>
									</div>
								</div>
							</GlassCard>
						))}
					</div>
				</div>
			</SessionLayout>
		);
	}

	if (step === 1) {
		const footer = (
			<button
				onClick={handleBodyWeightSubmit}
				disabled={!bodyWeight || bodyWeight <= 0 || isSubmittingWeight}
				className="max-w-3xl mx-auto w-[calc(100%-3rem)] md:w-full px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-brand-primary text-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(249,115,22,0.3)] backdrop-blur-xl">
				{isSubmittingWeight ? (
					<Loader2 className="w-5 h-5 animate-spin" />
				) : (
					<>
						Continue <ArrowRight className="w-5 h-5 ml-2" />
					</>
				)}
			</button>
		);

		return (
			<PageWithSidebar>
				<SessionLayout
					title="Step 1: Body Weight"
					maxWidth="max-w-md"
					exercises={exercises}
					completedCount={completedCount}
					totalCount={totalCount}
					progress={progress}
					date={date}
					mode={activeMode}
					timer={activeMode === "LIVE_SESSION" ? timer : null}
					footer={footer}
					stats={sessionStats.stats}>
					<GlassCard className="p-8 space-y-8 flex flex-col items-center justify-center min-h-[40vh]">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-black text-foreground uppercase tracking-wider">
								Current Weight
							</h2>
							<p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
								Log today's body weight
							</p>
						</div>

						<div className="flex items-end justify-center space-x-2">
							<input
								type="number"
								value={bodyWeight || ""}
								placeholder="0.0"
								onChange={(e) => setBodyWeight(Number(e.target.value))}
								className="w-32 bg-transparent text-5xl text-center font-black text-brand-primary outline-none border-b-2 border-foreground/10 focus:border-brand-primary transition-colors pb-2"
								autoFocus
							/>
							<span className="text-xl font-black text-foreground/20 uppercase mb-2">
								KG
							</span>
						</div>
					</GlassCard>
				</SessionLayout>
			</PageWithSidebar>
		);
	}

	if (step === 2) {
		const footer = (
			<GlassCard className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-3 shadow-[0_-20px_40px_rgba(0,0,0,0.2)] border-foreground/10 backdrop-blur-xl">
				<div className="flex items-center space-x-3">
					<div
						onClick={() => setUpdateTemplate(!updateTemplate)}
						className={cn(
							"w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
							updateTemplate
								? "bg-brand-primary border border-brand-primary"
								: "bg-foreground/10 border border-foreground/10",
						)}>
						<div
							className={cn(
								"absolute top-[3px]  w-4 h-4 bg-white rounded-full transition-all duration-300",
								updateTemplate ? "right-1" : "left-1 bg-brand-primary",
							)}
						/>
					</div>
					<div className="flex flex-col text-left">
						<span className="text-[10px] font-black text-foreground uppercase tracking-wider">
							Update Master Plan?
						</span>
						<span className="text-[8px] font-bold text-foreground/40 uppercase">
							Saves weights for next week
						</span>
					</div>
				</div>

				<button
					onClick={handleSubmit}
					disabled={isSubmitting}
					className={cn(
						"w-full md:w-auto px-10 py-4 md:py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center",
						showSuccess
							? "bg-emerald-500 text-white"
							: "bg-brand-primary text-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(249,115,22,0.3)]",
					)}>
					{isSubmitting ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : showSuccess ? (
						<>
							<CheckCircle2 className="w-5 h-5 mr-2" /> All Done!
						</>
					) : (
						<div className="flex flex-col items-center">
							{sessionStats.stats.prsHit.length > 0 && (
								<div className="flex items-center space-x-1 mb-1 animate-pulse">
									<Trophy className="w-3 h-3 text-white" />
									<span className="text-[8px] font-black text-white uppercase">
										{sessionStats.stats.prsHit.length} PRs Hit!
									</span>
								</div>
							)}
							<div className="flex items-center">
								<Save className="w-5 h-5 mr-2" /> Complete Workout
							</div>
						</div>
					)}
				</button>
			</GlassCard>
		);

		const celebrationStats = {
			exercises: exercises.filter((ex: any) => ex.isNew).length,
			totalSets: exercises.reduce(
				(acc, ex: any) => acc + (ex.isNew ? ex.sets.length : 0),
				0,
			),
			totalReps: exercises.reduce(
				(acc, ex: any) =>
					acc +
					(ex.isNew
						? ex.sets.reduce((sAcc: any, s: any) => sAcc + s.reps, 0)
						: 0),
				0,
			),
		};

		const celebrationExerciseDetails = exercises
			.filter((ex: any) => ex.isNew)
			.map((ex) => ({
				name: ex.name,
				sets: ex.sets,
			}));

		return (
			<PageWithSidebar>
				<Confetti trigger={triggerConfetti} />
				{showCelebration && (
					<WorkoutCelebration
						stats={celebrationStats}
						exerciseDetails={celebrationExerciseDetails}
						splitName={template?.splitName}
						onClose={() => setShowCelebration(false)}
						targetUrl="/dashboard"
					/>
				)}
				<SessionLayout
					title={(template as any).splitName || "Session"}
					subtitle={`Week ${template.weekNumber} • ${DAYS[template.dayOfWeek]}`}
					footer={footer}
					exercises={exercises}
					completedCount={completedCount}
					totalCount={totalCount}
					progress={progress}
					date={date}
					mode={activeMode}
					timer={activeMode === "LIVE_SESSION" ? timer : null}
					stats={sessionStats.stats}>
					<GlassCard className="flex items-center justify-between p-4 px-6 border-brand-primary/10 bg-brand-primary/5">
						<div className="flex items-center space-x-3">
							<span className="text-sm font-bold text-foreground uppercase tracking-widest">
								Body Weight
							</span>
							<span className="text-lg font-black text-brand-primary">
								{bodyWeight}{" "}
								<span className="text-xs text-foreground/40">KG</span>
							</span>
						</div>
						<button
							onClick={() => setStep(1)}
							className="p-2 text-foreground/40 hover:text-brand-primary transition-colors rounded-lg hover:bg-brand-primary/10 flex items-center space-x-2">
							<Edit2 className="w-4 h-4" />
							<span className="text-[10px] items-center font-bold uppercase tracking-wider hidden sm:inline-block">
								Edit
							</span>
						</button>
					</GlassCard>

					<div className="space-y-4">
						<div className="flex items-center space-x-2 ml-2 mb-2">
							<Dumbbell className="w-4 h-4 text-brand-primary" />
							<h3 className="text-xs font-black text-foreground uppercase tracking-widest">
								Exercises
							</h3>
						</div>
						{exercises.map((ex, exIndex) => (
							<GlassCard
								key={ex.exerciseId}
								className={cn(
									"p-4 flex items-center justify-between group transition-all duration-300",
									ex.isSkipped
										? "border-foreground/10 bg-foreground/5 opacity-60"
										: (ex as any).isDone
											? "border-emerald-500/20 bg-emerald-500/5 shadow-none"
											: "hover:bg-foreground/5 shadow-xl",
								)}>
								<div className="flex items-center space-x-4">
									<div
										className={cn(
											"w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
											ex.isSkipped
												? "bg-foreground/10 text-foreground/40"
												: (ex as any).isDone
													? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
													: "bg-foreground/5 text-foreground/20 group-hover:text-brand-primary",
										)}>
										{ex.isSkipped ? (
											<Plus className="w-5 h-5 rotate-45" />
										) : (ex as any).isDone ? (
											<CheckCircle2 className="w-5 h-5" />
										) : (
											<Play className="w-4 h-4" />
										)}
									</div>
									<div>
										<h4 className="text-sm font-black text-foreground">
											{ex.name}
											{ex.isSkipped && (
												<span className="ml-2 text-[8px] px-1.5 py-0.5 rounded-md bg-foreground/10 text-foreground/60 uppercase tracking-widest">
													Skipped
												</span>
											)}
										</h4>
										<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
											{ex.targetSets} Sets • {ex.targetReps} Reps
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									{!ex.isDone && (
										<button
											onClick={() => handleSkipExercise(exIndex)}
											disabled={isSubmittingExercise}
											className="p-2 text-foreground/20 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
											title="Skip Exercise">
											<Trash2 className="w-4 h-4" />
										</button>
									)}
									<button
										onClick={() => {
											setActiveExerciseIndex(exIndex);
											setStep(3);
										}}
										className={cn(
											"flex items-center px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
											(ex as any).isDone
												? "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
												: "bg-brand-primary text-black shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:scale-105 active:scale-95",
										)}>
										{(ex as any).isDone ? "Log Again" : "Log"}
										{(!ex as any).isDone ? null : (
											<ArrowRight className="w-3 h-3 ml-2" />
										)}
									</button>
								</div>
							</GlassCard>
						))}
					</div>
				</SessionLayout>
			</PageWithSidebar>
		);
	}

	if (step === 3 && activeExerciseIndex !== null) {
		const ex = exercises[activeExerciseIndex];
		const footer = (
			<GlassCard className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-3 shadow-[0_-20px_40px_rgba(0,0,0,0.2)] border-foreground/10 backdrop-blur-xl">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
						<Dumbbell className="w-5 h-5 text-brand-primary" />
					</div>
					<div className="flex flex-col text-left">
						<span className="text-[10px] font-black text-foreground uppercase tracking-wider">
							{ex.name}
						</span>
						<span className="text-[8px] font-bold text-foreground/40 uppercase">
							{ex.sets.filter((s) => s.completed).length} of {ex.sets.length}{" "}
							Sets Completed
						</span>
					</div>
				</div>

				<button
					onClick={handleSingleExerciseSubmit}
					disabled={isSubmittingExercise}
					className="w-full md:w-auto px-10 py-4 md:py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-brand-primary text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
					{isSubmittingExercise ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<>
							<CheckCircle2 className="w-5 h-5 mr-3" /> Save Exercise
						</>
					)}
				</button>
			</GlassCard>
		);

		return (
			<PageWithSidebar>
				<SessionLayout
					timer={activeMode === "LIVE_SESSION" ? timer : null}
					title={ex.name}
					subtitle="Logging Exercise"
					onBack={() => setStep(2)}
					footer={footer}
					exercises={exercises}
					completedCount={completedCount}
					totalCount={totalCount}
					progress={progress}
					date={date}
					mode={activeMode}
					stats={sessionStats.stats}>
					<GlassCard className="space-y-6 p-6">
						<div className="flex items-center justify-between border-b border-foreground/5 pb-4">
							<div className="flex flex-col gap-1">
								{(ex as any).isNewPR ? (
									<div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg m-0 w-fit">
										<Trophy className="w-3 h-3 text-emerald-500 mr-1.5" />
										<span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
											NEW RECORD: {ex.pr} KG{" "}
											{(ex as any).prReps > 0 ? `× ${(ex as any).prReps}` : ""}
										</span>
									</div>
								) : ex.pr && ex.pr > 0 ? (
									<div className="flex items-center bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-lg m-0 w-fit">
										<Trophy className="w-3 h-3 text-brand-primary mr-1.5" />
										<span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">
											PR: {ex.pr} KG {(ex as any).prReps > 0 ? `× ${(ex as any).prReps}` : ""}
										</span>
									</div>
								) : (
									<div />
								)}

							</div>
							{plateauDetected && (
								<span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 animate-in fade-in slide-in-from-right-2 duration-500">
									⚠ No progress in 3 sessions
								</span>
							)}
						</div>

						<div>
							<h2 className="text-lg font-black text-foreground tracking-tight">
								{ex.name}
							</h2>
							<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
								Target: {ex.targetSets} Sets • {ex.targetReps} Reps
							</p>
						</div>

						<WarmupSetsPanel
							workingWeight={ex.sets[0]?.weight}
							repsField={ex.sets[0]?.reps ?? ex.targetReps}
							mode={activeMode}
						/>

						<div className="space-y-3">
							<div className="grid grid-cols-12 gap-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] px-2">
								<div className="col-span-1">Set</div>
								<div className="col-span-4 text-center">Weight</div>
								<div className="col-span-3 text-center">Reps</div>
								<div className="col-span-4 text-right pr-4">Status</div>
							</div>

							{ex.sets.map((set, setIndex) => (
								<div
									key={setIndex}
									className="grid grid-cols-12 gap-3 items-center group">
									<div className="col-span-1 text-xs font-black text-foreground/40">
										{setIndex + 1}
									</div>
									<div className="col-span-4">
										<input
											type="number"
											value={set.weight || ""}
											onChange={(e) =>
												updateSet(
													activeExerciseIndex,
													setIndex,
													"weight",
													Number(e.target.value),
												)
											}
											className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-center font-bold text-foreground outline-none focus:bg-foreground/10 focus:border-brand-primary/50 transition-all font-mono"
										/>
									</div>
									<div className="col-span-3">
										<input
											type="number"
											value={set.reps || ""}
											onChange={(e) =>
												updateSet(
													activeExerciseIndex,
													setIndex,
													"reps",
													Number(e.target.value),
												)
											}
											className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-center font-bold text-foreground outline-none focus:bg-foreground/10 focus:border-brand-primary/50 transition-all font-mono"
										/>
									</div>
									<div className="col-span-4 flex items-center justify-end gap-2 pr-1">
										<button
											onClick={() =>
												updateSet(
													activeExerciseIndex,
													setIndex,
													"completed",
													!set.completed,
												)
											}
											className={cn(
												"w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all",
												set.completed
													? "bg-brand-primary border-brand-primary text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
													: "bg-brand-primary/5 border-brand-primary/20 text-brand-primary/50 hover:border-brand-primary/50 hover:bg-brand-primary/10",
											)}>
											<CheckCircle2
												className={cn(
													"w-5 h-5",
													set.completed ? "opacity-100" : "opacity-100",
												)}
											/>
										</button>
										<button
											onClick={() => removeSet(activeExerciseIndex, setIndex)}
											className="w-10 h-10 rounded-xl border-2 border-rose-500/10 bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-all">
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							))}
						</div>

						<button
							onClick={() => addSet(activeExerciseIndex)}
							className="w-full py-3 rounded-xl border border-dashed border-foreground/10 text-foreground/40 hover:text-foreground hover:bg-foreground/5 hover:border-foreground/20 transition-all flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
							<Plus className="w-3 h-3 mr-2" /> Add Set
						</button>
					</GlassCard>

					<ExerciseHistoryCard
						exerciseName={ex.name}
						userId={template.userId}
						mode={activeMode}
						onPlateauDetected={setPlateauDetected}
					/>
				</SessionLayout>
			</PageWithSidebar>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<div className="text-center space-y-4">
				<Loader2 className="w-10 h-10 animate-spin text-brand-primary mx-auto" />
				<p className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em]">
					Loading Workout...
				</p>
			</div>
		</div>
	);
}

const SessionLayout = ({
	title,
	subtitle,
	onBack,
	footer,
	children,
	maxWidth = "",
	exercises,
	completedCount,
	totalCount,
	progress,
	date,
	mode,
	timer,
	stats,
}: {
	title: string;
	subtitle?: string;
	onBack?: () => void;
	footer?: React.ReactNode;
	children: React.ReactNode;
	maxWidth?: string;
	exercises: Exercise[];
	completedCount: number;
	totalCount: number;
	progress: number;
	date?: string;
	mode: WorkoutMode;
	timer: any;
	stats?: any;
}) => (
	<div className={cn(maxWidth, "mx-auto space-y-8 pt-4 pb-12")}>
		{stats && <PRsFeedDisplay prsHit={stats.prsHit} variant="mobile-toast" />}
		<div className="space-y-6">
			{date && date !== format(new Date(), "yyyy-MM-dd") && (
				<div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-4 flex items-center justify-between mb-2">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 rounded-xl bg-brand-primary/20 flex items-center justify-center">
							<Save className="w-4 h-4 text-brand-primary" />
						</div>
						<div>
							<p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
								Historical Logging
							</p>
							<p className="text-xs font-bold text-foreground/60 uppercase">
								Recording Session for{" "}
								{format(new Date(`${date}T00:00:00`), "d MMMM ''yy")}
							</p>
						</div>
					</div>
				</div>
			)}
			<div className="flex justify-between items-center">
				{onBack ? (
					<button
						onClick={onBack}
						className="glass-button w-10 h-10 rounded-xl border-foreground/10 flex items-center justify-center">
						<ChevronLeft className="w-5 h-5 text-foreground" />
					</button>
				) : (
					<Link
						href="/"
						className="glass-button w-10 h-10 rounded-xl border-foreground/10 flex items-center justify-center">
						<ChevronLeft className="w-5 h-5 text-foreground" />
					</Link>
				)}
				<div className="text-center w-full">
					{subtitle && (
						<p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">
							{subtitle}
						</p>
					)}
					<h1 className="text-xl line-clamp-1 text-center font-black text-foreground uppercase tracking-wider">
						{title}
					</h1>
				</div>
			</div>

			{/* Segmented Progress Bar */}
			{mode !== "MANUAL_LOG" && (
				<div className="px-2 space-y-3">
					<div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
						<span>Progress</span>
						<span className="text-brand-primary">
							{completedCount} / {totalCount} Exercises
						</span>
					</div>
					<div className="flex gap-1.5 h-1.5 w-full">
						{exercises.map((ex, idx) => (
							<div
								key={idx}
								className={cn(
									"h-full flex-1 rounded-full transition-all duration-500 ease-out",
									(ex as any).isDone
										? "bg-brand-primary shadow-[0_0_10px_rgba(249,115,22,0.4)]"
										: "bg-foreground/5 border border-foreground/5",
								)}
							/>
						))}
					</div>
				</div>
			)}
		</div>

		{children}

		{footer && (
			<div
				className={cn(
					"fixed mb-0 bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/80 to-transparent z-40 transition-all duration-300",
				)}>
				{footer}
			</div>
		)}

		{timer && (
			<RestTimerBar
				secondsLeft={timer.secondsLeft}
				totalDuration={timer.totalDuration}
				isRunning={timer.isRunning}
				onSkip={timer.skip}
				onAdjust={timer.adjust}
			/>
		)}
	</div>
);
