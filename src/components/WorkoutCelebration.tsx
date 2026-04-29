"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Trophy,
	ArrowRight,
	PartyPopper,
	Dumbbell,
	Activity,
	CheckCircle2,
	Share2,
	Loader2,
	Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./ui/GlassCard";
import { WorkoutShareCard, type ExerciseDetail } from "./WorkoutShareCard";

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
	targetUrl,
}: WorkoutCelebrationProps) {
	const router = useRouter();
	const [isVisible, setIsVisible] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const shareCardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsVisible(true);
		// Auto-navigate after 15 seconds instead of 5 to give time to share
		const timer = setTimeout(() => {
			if (!document.hidden && targetUrl) {
				router.push(targetUrl);
			}
		}, 15000);
		return () => clearTimeout(timer);
	}, [router, targetUrl]);

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
			if (!blob) {
				throw new Error("Failed to generate image");
			}

			const file = new File([blob], "workout-summary.png", {
				type: "image/png",
			});

			const shareText = `I just finished my workout! 🏋️‍♂️\n\n- ${stats.exercises} Exercises\n- ${stats.totalSets} Sets\n- ${stats.totalReps} Reps\n\nTracked with Fitness Tracker.`;

			// Try native share with file
			if (navigator.share && navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					title: "Workout Completed!",
					text: shareText,
					files: [file],
				});
			} else if (navigator.share) {
				// Native share without file support — share text + download image
				downloadImage(blob);
				await navigator.share({
					title: "Workout Completed!",
					text: shareText,
					url: window.location.origin,
				});
			} else {
				// Full fallback — just download
				downloadImage(blob);
				await navigator.clipboard.writeText(shareText);
				alert("Image downloaded & summary copied to clipboard!");
			}
		} catch (err: any) {
			// User cancelled sharing — not an error
			if (err?.name !== "AbortError") {
				console.error("Error sharing:", err);
			}
		} finally {
			setIsGenerating(false);
		}
	};

	const downloadImage = (blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "workout-summary.png";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<div
			className={cn(
				"fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-600 transition-all duration-700 ease-out",
				isVisible ? "opacity-100" : "opacity-0",
			)}>
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{[...Array(30)].map((_, i) => (
					<div
						key={i}
						className="absolute top-[-10%] animate-confetti"
						style={{
							left: `${Math.random() * 100}%`,
							backgroundColor: ["#10b981", "#34d399", "#ffffff", "#059669"][
								Math.floor(Math.random() * 4)
							],
							width: `${Math.random() * 10 + 5}px`,
							height: `${Math.random() * 10 + 5}px`,
							animation: `confetti-fall ${Math.random() * 3 + 2}s linear infinite`,
							animationDelay: `${Math.random() * 2}s`,
						}}
					/>
				))}
			</div>

			<style jsx>{`
				@keyframes confetti-fall {
					0% {
						transform: translateY(0) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(110vh) rotate(720deg);
						opacity: 0;
					}
				}
			`}</style>

			{/* Hidden share card for capture */}
			<WorkoutShareCard
				ref={shareCardRef}
				stats={stats}
				exerciseDetails={exerciseDetails}
				splitName={splitName}
			/>

			<GlassCard
				className={cn(
					"max-w-md w-full p-8 text-center space-y-8 border-white/20 bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-1000 transform",
					isVisible ? "scale-100 translate-y-0" : "scale-90 translate-y-20",
				)}>
				<div className="relative">
					<div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-bounce">
						<Trophy className="w-12 h-12 text-emerald-600" />
					</div>
					<div className="absolute -top-2 -right-2 animate-pulse">
						<PartyPopper className="w-8 h-8 text-white" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-4xl font-black text-white uppercase tracking-tight italic">
						HURRAY!
					</h1>
					<p className="text-sm font-black text-white/80 uppercase tracking-[0.3em]">
						Workout Completed
					</p>
				</div>

				<div className="grid grid-cols-3 gap-4 py-6 border-y border-white/10">
					<div className="space-y-1">
						<Dumbbell className="w-4 h-4 text-white/40 mx-auto" />
						<p className="text-lg font-black text-white">{stats.exercises}</p>
						<p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
							Exercises
						</p>
					</div>
					<div className="space-y-1 border-x border-white/10">
						<Activity className="w-4 h-4 text-white/40 mx-auto" />
						<p className="text-lg font-black text-white">{stats.totalSets}</p>
						<p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
							Sets
						</p>
					</div>
					<div className="space-y-1">
						<CheckCircle2 className="w-4 h-4 text-white/40 mx-auto" />
						<p className="text-lg font-black text-white">{stats.totalReps}</p>
						<p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
							Reps
						</p>
					</div>
				</div>

				<div className="space-y-3">
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

					<button
						onClick={() => {
							setIsVisible(false);
							setTimeout(() => {
								if (targetUrl) {
									router.push(targetUrl);
								}
								onClose();
							}, 500);
						}}
						className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center group">
						Done
						<ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
					</button>
				</div>
			</GlassCard>
		</div>
	);
}
