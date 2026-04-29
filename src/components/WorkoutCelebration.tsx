"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Trophy,
	Share2,
	Loader2,
	CheckCircle2,
	Zap,
	ArrowRight,
	Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutShareCard } from "./WorkoutShareCard";

interface ExerciseDetail {
	name: string;
	sets: { weight: number; reps: number }[];
	isPR?: boolean;
}

interface WorkoutCelebrationProps {
	stats: {
		exercises: number;
		totalSets: number;
		totalReps: number;
	};
	exerciseDetails: ExerciseDetail[];
	splitName?: string;
	onClose: () => void;
	targetUrl?: string;
}

export function WorkoutCelebration({
	stats,
	exerciseDetails,
	splitName,
	onClose,
	targetUrl = "/analytics",
}: WorkoutCelebrationProps) {
	const router = useRouter();
	const [isVisible, setIsVisible] = useState(false);
	const [countdown, setCountdown] = useState(10);
	const [isGenerating, setIsGenerating] = useState(false);
	const shareCardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsVisible(true);

		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handleDone();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const handleDone = () => {
		// router.push(targetUrl);
	};

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

			const file = new File([blob], "workout-summary.png", {
				type: "image/png",
			});
			const shareText = `I just finished my ${splitName || "workout"}! 🏋️‍♂️\n\nTracked with Fitness Tracker.`;

			if (navigator.share && navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					title: "Workout Completed!",
					text: shareText,
					files: [file],
				});
			} else {
				// Fallback: download the image
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
					className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col items-center m-0">
					{/* Hidden share card for capture */}
					<WorkoutShareCard
						ref={shareCardRef}
						stats={stats}
						exerciseDetails={exerciseDetails}
						splitName={splitName}
					/>

					{/* Animated Background Elements */}
					<div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
						<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />
						<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 rounded-full blur-[120px]" />
					</div>

					{/* Scrollable Content Area */}
					<div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center">
						<div className="w-full max-w-lg px-6 py-12 flex flex-col items-center gap-8 relative z-10">
							{/* Success Icon */}
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{
									type: "spring",
									damping: 12,
									stiffness: 100,
									delay: 0.2,
								}}
								className="relative">
								<div className="w-24 h-24 bg-brand-primary rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(var(--brand-accent-rgb),0.3)]">
									<CheckCircle2
										className="w-12 h-12 text-black"
										strokeWidth={3}
									/>
								</div>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ repeat: Infinity, duration: 2 }}
									className="absolute -top-2 -right-2 w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center shadow-lg">
									<Zap className="w-4 h-4 text-white fill-white" />
								</motion.div>
							</motion.div>

							<div className="text-center space-y-2">
								<motion.h1
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.4 }}
									className="text-4xl font-black text-foreground uppercase tracking-tight italic">
									VICTORY!
								</motion.h1>
								<motion.p
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.5 }}
									className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.4em]">
									Workout Summary
								</motion.p>
							</div>

							{/* Stats Row */}
							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.6 }}
								className="grid grid-cols-3 gap-3 w-full">
								{[
									{ label: "Exercises", value: stats.exercises, sub: "Lifts" },
									{
										label: "Total Sets",
										value: stats.totalSets,
										sub: "Rounds",
									},
									{ label: "Total Reps", value: stats.totalReps, sub: "Moves" },
								].map((stat, i) => (
									<GlassCard key={i} className="p-4 text-center border-white/5">
										<p className="text-xl font-black text-foreground">
											{stat.value}
										</p>
										<p className="text-[7px] font-black text-foreground/30 uppercase tracking-widest mt-1">
											{stat.label}
										</p>
									</GlassCard>
								))}
							</motion.div>

							{/* Exercise List */}
							<div className="w-full space-y-4 pb-12">
								<h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2">
									Performance Breakdown
								</h3>
								<div className="space-y-3">
									{exerciseDetails.map((ex, i) => (
										<motion.div
											initial={{ x: -20, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											transition={{ delay: 0.7 + i * 0.1 }}
											key={i}>
											<GlassCard
												className={cn(
													"p-4 flex items-center justify-between transition-all duration-500",
													ex.isPR
														? "bg-brand-primary border-brand-primary/20 shadow-[0_10px_30px_rgba(var(--brand-accent-rgb),0.2)]"
														: "bg-white/5 border-white/5",
												)}>
												<div className="flex items-center gap-4">
													<div
														className={cn(
															"w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
															ex.isPR
																? "bg-black text-brand-primary"
																: "bg-foreground/5 text-foreground/40",
														)}>
														{i + 1}
													</div>
													<div>
														<p
															className={cn(
																"text-sm font-black uppercase tracking-tight",
																ex.isPR ? "text-black" : "text-foreground",
															)}>
															{ex.name}
														</p>
														<p
															className={cn(
																"text-[9px] font-bold uppercase tracking-widest mt-0.5",
																ex.isPR
																	? "text-black/60"
																	: "text-foreground/30",
															)}>
															{ex.sets.length} Sets •{" "}
															{Math.max(...ex.sets.map((s) => s.weight))} kg max
														</p>
													</div>
												</div>
												{ex.isPR && (
													<div className="bg-black/10 p-2 rounded-lg">
														<Trophy className="w-4 h-4 text-black" />
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
					<div className="w-full max-w-lg px-6 pb-8 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-lg z-50 flex flex-col gap-4">
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
								Go to Analytics
								<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
							</button>
						</div>

						<div className="flex items-center justify-center gap-2 text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">
							<Timer className="w-3 h-3 animate-pulse" />
							<span>Redirecting in {countdown}s</span>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
