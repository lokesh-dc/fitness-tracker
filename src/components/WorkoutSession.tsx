"use client";

import { useState } from "react";
import {
	saveWorkoutSession,
	saveBodyWeight,
	saveSingleExerciseLog,
} from "@/app/actions/logs";
import {
	type Exercise,
	type WorkoutTemplate,
	type WorkoutLog,
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
	initialPRs?: Record<string, number>;
	date?: string;
}

export default function WorkoutSession({
	template,
	initialBodyWeight,
	initialWorkoutLog,
	initialPRs = {},
	date,
}: WorkoutSessionProps) {
	// Sync logic for initial weight and step
	const effectiveBodyWeight =
		initialWorkoutLog?.bodyWeight || initialBodyWeight || 0;

	const [step, setStep] = useState<number>(0);
	const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(
		null,
	);
	const [exercises, setExercises] = useState<Exercise[]>(
		template?.exercises.map((ex) => {
			const loggedEx = initialWorkoutLog?.exercises?.find(
				(le: any) => le.exerciseId === ex.exerciseId,
			);
			return {
				...ex,
				sets: loggedEx
					? loggedEx.sets
					: [
							{
								weight: ex.lastWeight || 0,
								reps: ex.targetReps || 0,
							},
						],
				pr: initialPRs[ex.exerciseId] || 0,
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

	const addSet = (exerciseIndex: number) => {
		setExercises((prev) => {
			const newExs = [...prev];
			const targetEx = { ...newExs[exerciseIndex] };
			
			let newSet = {
				weight: targetEx.lastWeight || 0,
				reps: targetEx.targetReps || 0,
			};

			if (targetEx.sets.length > 0) {
				const lastSet = targetEx.sets[targetEx.sets.length - 1];
				newSet = { ...lastSet };
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
		field: "weight" | "reps",
		value: number,
	) => {
		setExercises((prev) => {
			const newExs = [...prev];
			const targetEx = { ...newExs[exerciseIndex] };
			const newSets = [...targetEx.sets];
			newSets[setIndex] = { ...newSets[setIndex], [field]: value };
			targetEx.sets = newSets;
			newExs[exerciseIndex] = targetEx;
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
					name: template?.splitName || "Workout Session"
				}, 
				updateTemplate, 
				date
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
			const exercise = exercises[activeExerciseIndex];
			await saveSingleExerciseLog(exercise, updateTemplate, date);

			// Mark as done locally
			setExercises((prev) => {
				const newExs = [...prev];
				newExs[activeExerciseIndex] = {
					...newExs[activeExerciseIndex],
					isDone: true,
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

	if (!template) return null;

	const completedCount = exercises.filter((ex) => (ex as any).isDone).length;
	const totalCount = exercises.length;
	const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	if (step === 0) {
		const footer = (
			<div className="glass-card p-2 bg-foreground/2 max-w-3xl mx-auto flex items-center justify-between gap-4">
				<button
					onClick={() => setStep(effectiveBodyWeight > 0 ? 2 : 1)}
					className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-orange-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
					Start Now <ArrowRight className="w-4 h-4 ml-2" />
				</button>
			</div>
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
				date={date}>
				<div className="space-y-6">
					<GlassCard className="p-6 border-orange-500/10 bg-orange-500/5">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
									<Dumbbell className="w-5 h-5 text-orange-500" />
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
							<Play className="w-3 h-3 text-orange-500" />
							<h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">
								Overview
							</h3>
						</div>
						{exercises.map((ex, idx) => (
							<GlassCard
								key={idx}
								className="p-4 flex items-center justify-between group">
								<div className="flex flex-col gap-3 w-full">
									{ex.pr && ex.pr > 0 ? (
										<div className="flex w-fit items-center space-x-1.5 px-2 py-1 rounded-lg bg-orange-500/5 border border-orange-500/10">
											<Trophy className="w-3 h-3 text-orange-500" />
											<span className="text-[8px] font-black text-orange-500 uppercase">
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
		return (
			<SessionLayout
				title="Step 1: Body Weight"
				maxWidth="max-w-md"
				exercises={exercises}
				completedCount={completedCount}
				totalCount={totalCount}
				progress={progress}
				date={date}>
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
							className="w-32 bg-transparent text-5xl text-center font-black text-orange-500 outline-none border-b-2 border-foreground/10 focus:border-orange-500 transition-colors pb-2"
							autoFocus
						/>
						<span className="text-xl font-black text-foreground/20 uppercase mb-2">
							KG
						</span>
					</div>

					<button
						onClick={handleBodyWeightSubmit}
						disabled={!bodyWeight || bodyWeight <= 0 || isSubmittingWeight}
						className="w-full mt-8 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-orange-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none">
						{isSubmittingWeight ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<>
								Continue <ArrowRight className="w-5 h-5 ml-2" />
							</>
						)}
					</button>
				</GlassCard>
			</SessionLayout>
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
								? "bg-orange-500 border border-orange-500"
								: "bg-foreground/10 border border-foreground/10",
						)}>
						<div
							className={cn(
								"absolute top-[3px]  w-4 h-4 bg-white rounded-full transition-all duration-300",
								updateTemplate ? "right-1" : "left-1 bg-orange-500",
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
							: "bg-orange-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]",
					)}>
					{isSubmitting ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : showSuccess ? (
						<>
							<CheckCircle2 className="w-5 h-5 mr-2" /> All Done!
						</>
					) : (
						<>
							<Save className="w-5 h-5 mr-2" /> Complete Workout
						</>
					)}
				</button>
			</GlassCard>
		);

		const celebrationStats = {
			exercises: exercises.filter((ex: any) => ex.isDone).length,
			totalSets: exercises.reduce((acc, ex: any) => acc + (ex.isDone ? ex.sets.length : 0), 0),
			totalReps: exercises.reduce((acc, ex: any) => acc + (ex.isDone ? ex.sets.reduce((sAcc: any, s: any) => sAcc + s.reps, 0) : 0), 0)
		};

		const celebrationExerciseDetails = exercises
			.filter((ex: any) => ex.isDone)
			.map((ex) => ({
				name: ex.name,
				sets: ex.sets,
			}));

		return (
			<>
				{showCelebration && (
					<WorkoutCelebration 
						stats={celebrationStats}
						exerciseDetails={celebrationExerciseDetails}
						splitName={template?.splitName}
						onClose={() => setShowCelebration(false)} 
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
					date={date}>
					<GlassCard className="flex items-center justify-between p-4 px-6 border-orange-500/10 bg-orange-500/5">
						<div className="flex items-center space-x-3">
							<span className="text-sm font-bold text-foreground uppercase tracking-widest">
								Body Weight
							</span>
							<span className="text-lg font-black text-orange-500">
								{bodyWeight}{" "}
								<span className="text-xs text-foreground/40">KG</span>
							</span>
						</div>
						<button
							onClick={() => setStep(1)}
							className="p-2 text-foreground/40 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-500/10 flex items-center space-x-2">
							<Edit2 className="w-4 h-4" />
							<span className="text-[10px] items-center font-bold uppercase tracking-wider hidden sm:inline-block">
								Edit
							</span>
						</button>
					</GlassCard>

					<div className="space-y-4">
						<div className="flex items-center space-x-2 ml-2 mb-2">
							<Dumbbell className="w-4 h-4 text-orange-500" />
							<h3 className="text-xs font-black text-foreground uppercase tracking-widest">
								Exercises
							</h3>
						</div>
						{exercises.map((ex, exIndex) => (
							<GlassCard
								key={ex.exerciseId}
								className={cn(
									"p-4 flex items-center justify-between group transition-all duration-300",
									(ex as any).isDone
										? "border-emerald-500/20 bg-emerald-500/5 shadow-none"
										: "hover:bg-foreground/5 shadow-xl",
								)}>
								<div className="flex items-center space-x-4">
									<div
										className={cn(
											"w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
											(ex as any).isDone
												? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
												: "bg-foreground/5 text-foreground/20 group-hover:text-orange-500",
										)}>
										{(ex as any).isDone ? (
											<CheckCircle2 className="w-5 h-5" />
										) : (
											<Play className="w-4 h-4" />
										)}
									</div>
									<div>
										<h4 className="text-sm font-black text-foreground">
											{ex.name}
										</h4>
										<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
											{ex.targetSets} Sets • {ex.targetReps} Reps
										</p>
									</div>
								</div>
								<button
									onClick={() => {
										setActiveExerciseIndex(exIndex);
										setStep(3);
									}}
									className={cn(
										"flex items-center px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
										(ex as any).isDone
											? "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
											: "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:scale-105 active:scale-95",
									)}>
									{(ex as any).isDone ? "Log Again" : "Log"}
									{(!ex as any).isDone ? null : (
										<ArrowRight className="w-3 h-3 ml-2" />
									)}
								</button>
							</GlassCard>
						))}
					</div>
				</SessionLayout>
			</>
		);
	}

	if (step === 3 && activeExerciseIndex !== null) {
		const ex = exercises[activeExerciseIndex];
		const footer = (
			<button
				onClick={handleSingleExerciseSubmit}
				disabled={isSubmittingExercise}
				className="max-w-3xl mx-auto w-full px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-orange-500 text-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(249,115,22,0.3)] backdrop-blur-xl">
				{isSubmittingExercise ? (
					<Loader2 className="w-5 h-5 animate-spin" />
				) : (
					<>
						<CheckCircle2 className="w-5 h-5 mr-3" /> Save Exercise
					</>
				)}
			</button>
		);

		return (
			<SessionLayout
				title={ex.name}
				subtitle="Logging Exercise"
				onBack={() => setStep(2)}
				footer={footer}
				exercises={exercises}
				completedCount={completedCount}
				totalCount={totalCount}
				progress={progress}
				date={date}>
				<GlassCard className="space-y-6 p-6">
					<div className="flex justify-between items-start border-b border-foreground/5 pb-4">
						<div>
							<h2 className="text-lg font-black text-foreground tracking-tight">
								{ex.name}
							</h2>
							<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
								Target: {ex.targetSets} Sets • {ex.targetReps} Reps
							</p>
						</div>
						{ex.pr && ex.pr > 0 ? (
							<div className="flex items-center bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
								<Trophy className="w-3 h-3 text-orange-500 mr-1.5" />
								<span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">
									PR: {ex.pr} KG
								</span>
							</div>
						) : null}
					</div>

					<div className="space-y-3">
						<div className="grid grid-cols-12 gap-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] px-2">
							<div className="col-span-1">Set</div>
							<div className="col-span-5 text-center">Weight</div>
							<div className="col-span-5 text-center">Reps</div>
							<div className="col-span-1"></div>
						</div>

						{ex.sets.map((set, setIndex) => (
							<div
								key={setIndex}
								className="grid grid-cols-12 gap-3 items-center group">
								<div className="col-span-1 text-xs font-black text-foreground/40">
									{setIndex + 1}
								</div>
								<div className="col-span-5">
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
										className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-center font-bold text-foreground outline-none focus:bg-foreground/10 focus:border-orange-500/50 transition-all font-mono"
									/>
								</div>
								<div className="col-span-5">
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
										className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-center font-bold text-foreground outline-none focus:bg-foreground/10 focus:border-orange-500/50 transition-all font-mono"
									/>
								</div>
								<div className="col-span-1 flex justify-center">
									<button
										onClick={() => removeSet(activeExerciseIndex, setIndex)}
										className="p-2 text-foreground/20 hover:text-rose-500 transition-colors">
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
			</SessionLayout>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-[60vh]">
			<div className="text-center space-y-4">
				<Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
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
	maxWidth = "max-w-3xl",
	exercises,
	completedCount,
	totalCount,
	progress,
	date,
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
}) => (
	<div className={cn(maxWidth, "mx-auto space-y-8 pt-4 pb-12")}>
		<div className="space-y-6">
			{date && date !== format(new Date(), "yyyy-MM-dd") && (
				<div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between mb-2">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
							<Save className="w-4 h-4 text-orange-500" />
						</div>
						<div>
							<p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
								Historical Logging
							</p>
							<p className="text-xs font-bold text-foreground/60 uppercase">
								Recording Session for {format(new Date(`${date}T00:00:00`), "d MMMM ''yy")}
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
				<div className="text-center">
					{subtitle && (
						<p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1">
							{subtitle}
						</p>
					)}
					<h1 className="text-xl font-black text-foreground uppercase tracking-wider">
						{title}
					</h1>
				</div>
				<div className="w-10 h-10" />
			</div>

			{/* Segmented Progress Bar */}
			<div className="px-2 space-y-3">
				<div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
					<span>Progress</span>
					<span className="text-orange-500">
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
									? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
									: "bg-foreground/5 border border-foreground/5",
							)}
						/>
					))}
				</div>
			</div>
		</div>

		{children}

		{footer && (
			<div className="fixed bottom-0 left-0 right-0 p-6 md:pl-32 bg-gradient-to-t from-background via-background/80 to-transparent z-40">
				{footer}
			</div>
		)}
	</div>
);
