"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Trophy,
	Share2,
	Loader2,
	Zap,
	ArrowRight,
	Timer,
	Dumbbell,
	Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutShareCard } from "./WorkoutShareCard";
import Image from "next/image";

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
		router.push(targetUrl);
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
							
							{/* Character Illustration */}
							<motion.div
								initial={{ scale: 0.5, opacity: 0, y: 50 }}
								animate={{ scale: 1, opacity: 1, y: 0 }}
								transition={{ type: "spring", damping: 15, stiffness: 80, delay: 0.2 }}
								className="relative w-full aspect-square max-w-[320px] mb-2">
								<div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-3xl animate-pulse" />
								<div className="relative w-full h-full rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
									<Image 
										src="/celebration.png" 
										alt="Workout Complete" 
										fill 
										className="object-cover"
										priority
									/>
								</div>
								
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.8, type: "spring" }}
									className="absolute -bottom-4 -right-4 w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-2xl rotate-12">
									<Trophy className="w-8 h-8 text-black" strokeWidth={2.5} />
								</motion.div>
							</motion.div>

							<div className="text-center space-y-1">
								<motion.h1
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.4 }}
									className="text-5xl font-black text-foreground uppercase tracking-tighter italic leading-none">
									SESSION <span className="text-brand-primary italic">CRUSHED</span>
								</motion.h1>
								<motion.p
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.5 }}
									className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.6em] ml-1">
									Beast Mode: Complete
								</motion.p>
							</div>

							{/* Stats Row */}
							<motion.div
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.6 }}
								className="grid grid-cols-3 gap-2 w-full">
								{[
									{ label: "Exercises", value: stats.exercises, icon: <Dumbbell className="w-3 h-3" /> },
									{ label: "Total Sets", value: stats.totalSets, icon: <Zap className="w-3 h-3" /> },
									{ label: "Total Reps", value: stats.totalReps, icon: <Activity className="w-3 h-3" /> },
								].map((stat, i) => (
									<GlassCard key={i} className="p-4 text-center border-white/5 bg-white/5 backdrop-blur-sm">
										<div className="flex justify-center text-foreground/20 mb-1">{stat.icon}</div>
										<p className="text-xl font-black text-foreground tracking-tight">{stat.value}</p>
										<p className="text-[7px] font-black text-foreground/30 uppercase tracking-widest mt-0.5 whitespace-nowrap">
											{stat.label}
										</p>
									</GlassCard>
								))}
							</motion.div>

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
											transition={{ delay: 0.7 + i * 0.1 }}
											key={i}>
											<GlassCard
												className={cn(
													"p-4 flex items-center justify-between transition-all duration-500",
													ex.isPR 
														? "bg-brand-primary border-brand-primary/20 shadow-[0_10px_30px_rgba(var(--brand-accent-rgb),0.2)]" 
														: "bg-white/5 border-white/5"
												)}>
												<div className="flex items-center gap-4">
													<div className={cn(
														"w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
														ex.isPR ? "bg-black text-brand-primary" : "bg-foreground/5 text-foreground/40"
													)}>
														{i + 1}
													</div>
													<div>
														<p className={cn(
															"text-sm font-black uppercase tracking-tight",
															ex.isPR ? "text-black" : "text-foreground"
														)}>
															{ex.name}
														</p>
														<p className={cn(
															"text-[9px] font-bold uppercase tracking-widest mt-0.5",
															ex.isPR ? "text-black/60" : "text-foreground/30"
														)}>
															{ex.sets.length} Sets • {Math.max(...ex.sets.map(s => s.weight))} kg max
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
