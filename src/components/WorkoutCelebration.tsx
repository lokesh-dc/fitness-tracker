"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Trophy,
	Share2,
	Loader2,
	Zap,
	ArrowRight,
	Dumbbell,
	Activity,
	Sparkles,
	Flame
} from "lucide-react";
import { WorkoutShareCard } from "./WorkoutShareCard";
import { type Exercise, type PRHit } from "@/types/workout";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseDetail {
	name: string;
	sets: { weight: number; reps: number }[];
	isPR?: boolean;
	muscleGroup?: string;
}

interface WorkoutCelebrationProps {
	stats: {
		exercises: number;
		totalSets: number;
		totalReps: number;
		calories: number;
	};
	exerciseDetails: ExerciseDetail[];
	muscleGroups?: string[];
	splitName?: string;
	onClose: () => void;
	targetUrl?: string;
	logId?: string;
	exercises?: Exercise[];
	durationSeconds?: number;
	prsHit?: PRHit[];
	bodyWeight?: number;
}

export function WorkoutCelebration({
	stats,
	exerciseDetails,
	muscleGroups,
	splitName,
	logId,
	exercises,
	durationSeconds,
	prsHit = [],
	bodyWeight,
	targetUrl = "/",
}: WorkoutCelebrationProps) {
	const router = useRouter();
	const isVisible = true;
	const [isGenerating, setIsGenerating] = useState(false);
	const [aiSummary, setAiSummary] = useState<string | null>(null);
	const [isSummaryLoading, setIsSummaryLoading] = useState(false);
	const shareCardRef = useRef<HTMLDivElement>(null);
	const summaryRequestedRef = useRef(false);

	const handleDone = () => {
		router.push(targetUrl);
	};

	useEffect(() => {
		if (
			!logId ||
			!exercises ||
			exercises.length === 0 ||
			summaryRequestedRef.current
		)
			return;
		summaryRequestedRef.current = true;
		setIsSummaryLoading(true);

		const payload = {
			logId,
			exercises,
			splitName,
			durationSeconds,
			prsHit,
			bodyWeight,
		};

		(async () => {
			try {
				const res = await fetch("/api/workout-summary", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error("Failed to fetch summary");
				const data = await res.json();
				if (data.summary) setAiSummary(data.summary);
			} catch (err) {
				console.error("Error fetching AI summary:", err);
			} finally {
				setIsSummaryLoading(false);
			}
		})();
	}, [logId, exercises, splitName, durationSeconds, prsHit, bodyWeight]);

	const generateShareImage = async (): Promise<Blob | null> => {
		if (!shareCardRef.current) return null;

		const html2canvas = (await import("html2canvas")).default;
		const canvas = await html2canvas(shareCardRef.current, {
			backgroundColor: null,
			scale: 1,
			useCORS: true,
			logging: false,
			width: 1080,
			height: 1920,
		});

		return new Promise<Blob | null>((resolve) => {
			canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
		});
	};

	const handleShare = async () => {
		setIsGenerating(true);
		try {
			const blob = await generateShareImage();
			if (!blob) throw new Error("Failed to generate image");

			const file = new File([blob], "workout-summary.png", { type: "image/png" });
			const shareText = `I just crushed my ${splitName || "workout"}! 🏋️‍♂️\n\nTracked with Fitness Tracker.`;

			if (navigator.share && navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					title: "Session Crushed!",
					text: shareText,
					files: [file],
				});
			} else {
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = "workout-summary.png";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				await navigator.clipboard.writeText(shareText);
				alert("Summary snapshot downloaded & text copied to clipboard!");
			}
		} catch (err) {
			console.error("Error sharing:", err);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col items-center overflow-hidden m-0">

					{/* Hidden share card for capture */}
					<WorkoutShareCard
						ref={shareCardRef}
						stats={stats}
						exerciseDetails={exerciseDetails}
						splitName={splitName}
					/>

					{/* Animated Background Elements */}
					<div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
						<div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/20 rounded-full blur-[140px] animate-pulse" />
						<div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/20 rounded-full blur-[140px] animate-pulse delay-700" />
					</div>

					{/* Scrollable Content Area */}
					<div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center">
						<div className="w-full max-w-lg px-6 py-12 flex flex-col items-center gap-6 relative z-10">

							<div className="text-center space-y-1">
								<motion.h1
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.2 }}
									className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
									SESSION <span className="text-brand-primary italic">CRUSHED</span>
								</motion.h1>
								<motion.p
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.3 }}
									className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.6em] ml-1">
									Beast Mode: Complete
								</motion.p>
							</div>

							{/* Stats Row */}
							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.4 }}
								className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
								{[
									{ label: "Exercises", value: stats.exercises, icon: <Dumbbell className="w-3 h-3" /> },
									{ label: "Total Sets", value: stats.totalSets, icon: <Zap className="w-3 h-3" /> },
									{ label: "Total Reps", value: stats.totalReps, icon: <Activity className="w-3 h-3" /> },
									{ label: "Burned", value: `${stats.calories} kcal`, icon: <Flame className="w-3 h-3" /> },
								].map((stat, i) => {
									const isCalories = i === 3;
									return (
										<GlassCard
											key={i}
											className={cn(
												"p-4 text-center",
												isCalories
													? "bg-brand-primary text-white border-brand-primary shadow-[0_0_20px_rgba(249,115,22,0.3)]"
													: "bg-white/5 border-white/5 backdrop-blur-sm"
											)}>
											<div className={cn(
												"flex justify-center mb-1",
												isCalories ? "text-white/80" : "text-foreground/20"
											)}>
												{stat.icon}
											</div>
											<p className={cn(
												"text-xl font-black tracking-tight",
												isCalories ? "text-white" : "text-foreground"
											)}>
												{stat.value}
											</p>
											<p className={cn(
												"text-[7px] font-black uppercase tracking-widest mt-0.5 whitespace-nowrap",
												isCalories ? "text-white/70" : "text-foreground/30"
											)}>
												{stat.label}
											</p>
										</GlassCard>
									);
								})}
							</motion.div>

							{/* Muscles Trained */}
							{muscleGroups && muscleGroups.length > 0 && (
								<motion.div
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.5 }}
									className="w-full space-y-3">
									<h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2">
										Muscles Trained
									</h3>
									<div className="flex flex-wrap gap-2 px-2">
										{muscleGroups.map((mg) => (
											<div
												key={mg}
												className="px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[9px] font-black uppercase tracking-wider"
											>
												{mg}
											</div>
										))}
									</div>
								</motion.div>
							)}

							{(isSummaryLoading || aiSummary) && (
								<div className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-left">
									<div className="flex items-center space-x-2 mb-2">
										<Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
										<p className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">
											AI Coach Summary
										</p>
									</div>
									{isSummaryLoading && !aiSummary ? (
										<div className="space-y-2">
											<div className="h-2.5 rounded-full bg-foreground/10 animate-pulse" />
											<div className="h-2.5 rounded-full bg-foreground/10 animate-pulse w-5/6" />
											<div className="h-2.5 rounded-full bg-foreground/10 animate-pulse w-2/3" />
										</div>
									) : (
										<p className="text-[11px] font-medium text-foreground/80 leading-relaxed whitespace-pre-line">
											{aiSummary}
										</p>
									)}
								</div>
							)}

							<div className="space-y-3 w-full">
								<button
									onClick={handleShare}
									disabled={isGenerating}
									className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group border border-white/20 disabled:opacity-70 disabled:hover:scale-100">
									{isGenerating ? (
										<>
											<Loader2 className="w-4 h-4 mr-3 animate-spin" />
											Generating Image...
										</>
									) : (
										<>
											<Share2 className="w-4 h-4 mr-3" />
											Share Achievement
										</>
									)}
								</button>
								{/* Exercise List */}
								<div className="w-full space-y-4">
									<h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2 flex items-center justify-between">
										<span>Workout Breakdown</span>
										<span className="text-brand-primary">Total Focus</span>
									</h3>
									<div className="space-y-2">
										{exerciseDetails.map((ex, i) => (
											<motion.div
												initial={{ x: -20, opacity: 0 }}
												animate={{ x: 0, opacity: 1 }}
												transition={{ delay: 0.6 + i * 0.1 }}
												key={i}>
												<GlassCard
													className={cn(
														"p-4 flex items-center justify-between transition-all duration-500",
														ex.isPR
															? "bg-emerald-500/20 border-emerald-500/30"
															: "bg-white/5 border-white/5"
													)}>
													<div className="flex items-center gap-4">
														<div className={cn(
															"w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
															ex.isPR ? "bg-emerald-500 text-white" : "bg-foreground/5 text-foreground/40"
														)}>
															{ex.isPR ? <Trophy className="w-5 h-5" /> : (i + 1)}
														</div>
														<div>
															<p className={cn(
																"text-sm font-black uppercase tracking-tight",
																ex.isPR ? "text-emerald-400" : "text-foreground"
															)}>
																{ex.name}
															</p>
															<p className={cn(
																"text-[9px] font-bold uppercase tracking-widest mt-0.5",
																ex.isPR ? "text-emerald-400/60" : "text-foreground/30"
															)}>
																{ex.sets.length} Sets • {Math.max(...ex.sets.map(s => s.weight))} kg max
																{ex.muscleGroup && <span className="ml-2 opacity-50">{ex.muscleGroup}</span>}
															</p>
														</div>
													</div>
													{ex.isPR && (
														<div className="bg-emerald-500/10 p-2 rounded-lg">
															<Trophy className="w-4 h-4 text-emerald-400" />
														</div>
													)}
												</GlassCard>
											</motion.div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Fixed Bottom Action Bar */}
						<div className="w-full max-w-lg px-6 py-2 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-lg z-50 flex flex-col gap-4 border-t border-white/5">
							<div className="flex gap-3">
								<button
									onClick={handleShare}
									disabled={isGenerating}
									className="flex-1 bg-white/[0.03] text-foreground py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center">
									{isGenerating ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<>
											<Share2 className="w-4 h-4 mr-2" />
											Share
										</>
									)}
								</button>
								<button
									onClick={handleDone}
									className="flex-[2] bg-brand-primary text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(var(--brand-accent-rgb),0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center group">
									Go to Home
									<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
