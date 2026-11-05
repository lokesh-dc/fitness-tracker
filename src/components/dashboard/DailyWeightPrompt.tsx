"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Scale, Plus, X, Check, ArrowRight, Settings } from "lucide-react";
import { LogWeightModal } from "@/components/LogWeightModal";
import { WeekDayWeight } from "@/types/workout";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DailyWeightPromptProps {
	todayWeight: number | null;
	initialWeight?: number | null;
	todayDateStr: string;
	weekDays?: WeekDayWeight[];
	logWeightBeforeWorkout: boolean;
}

export function DailyWeightPrompt({
	todayWeight,
	initialWeight,
	todayDateStr,
	weekDays,
	logWeightBeforeWorkout,
}: DailyWeightPromptProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);
	const [justLoggedWeight, setJustLoggedWeight] = useState<number | null>(null);

	// Check if user dismissed the prompt for today in this session
	useEffect(() => {
		try {
			const dismissed = sessionStorage.getItem(`dismissed_weight_prompt_${todayDateStr}`);
			if (dismissed === "true") {
				setIsDismissed(true);
			}
		} catch {
			// ignore storage errors
		}
	}, [todayDateStr]);

	// Don't render if:
	// 1. The user has enabled pre-workout weight prompting (they log it in the workout session)
	// 2. Today's weight is already recorded and no fresh log animation is happening
	// 3. The prompt was dismissed for today's session
	if (logWeightBeforeWorkout) return null;
	if (todayWeight !== null && justLoggedWeight === null) return null;
	if (isDismissed && justLoggedWeight === null) return null;

	const handleDismiss = () => {
		setIsDismissed(true);
		try {
			sessionStorage.setItem(`dismissed_weight_prompt_${todayDateStr}`, "true");
		} catch {
			// ignore
		}
	};

	const handleSuccess = (weight: number) => {
		setJustLoggedWeight(weight);
		setTimeout(() => {
			setIsDismissed(true);
		}, 3000);
	};

	if (justLoggedWeight !== null) {
		return (
			<GlassCard className="p-4 border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/[0.04] to-transparent animate-in fade-in slide-in-from-bottom-2 duration-300">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
							<Check className="w-5 h-5" />
						</div>
						<div>
							<p className="text-xs font-bold text-foreground">
								Today&apos;s body weight logged
							</p>
							<p className="text-[11px] text-foreground/50 mt-0.5">
								{justLoggedWeight} kg recorded · Trends updated
							</p>
						</div>
					</div>
					<span className="text-xs font-extrabold text-emerald-400 tabular-nums">
						{justLoggedWeight} kg
					</span>
				</div>
			</GlassCard>
		);
	}

	return (
		<>
			<GlassCard className="relative overflow-hidden p-4 border-brand-primary/25 bg-gradient-to-br from-brand-primary/[0.08] via-brand-primary/[0.02] to-transparent hover:border-brand-primary/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
				{/* Ambient background glow */}
				<div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />

				<div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					{/* Left content */}
					<div className="flex items-start gap-3 min-w-0 flex-1">
						<div className="w-10 h-10 rounded-2xl bg-brand-primary/15 border border-brand-primary/25 text-brand-primary flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
							<Scale className="w-5 h-5" />
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<h3 className="text-xs font-bold text-foreground tracking-tight">
									Log Today&apos;s Weight
								</h3>
								<span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-primary/15 text-brand-primary border border-brand-primary/20">
									Daily Check-in
								</span>
							</div>
							<p className="text-[11px] text-foreground/50 leading-relaxed mt-0.5">
								Pre-workout weigh-in is turned off in settings. Log today to keep volume calibration and trends accurate.
							</p>
						</div>
					</div>

					{/* Right action buttons */}
					<div className="flex items-center gap-2 sm:shrink-0 self-end sm:self-center w-full sm:w-auto pt-1 sm:pt-0">
						<button
							type="button"
							onClick={() => setIsModalOpen(true)}
							className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:opacity-95 active:scale-95 transition-all shadow-xs">
							<Plus className="w-3.5 h-3.5 stroke-[3]" />
							<span>Log Weight</span>
						</button>

						<button
							type="button"
							onClick={handleDismiss}
							title="Dismiss for today"
							className="p-2 rounded-xl text-foreground/30 hover:text-foreground/70 hover:bg-foreground/5 transition-colors">
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Subtle footer hint linking to settings */}
				<div className="mt-2.5 pt-2 border-t border-foreground/5 flex items-center justify-between text-[10px] text-foreground/35">
					<span>Weighing consistently helps track real lean-mass progress.</span>
					<Link
						href="/profile"
						className="inline-flex items-center gap-1 hover:text-brand-primary transition-colors text-foreground/45 font-medium">
						<Settings className="w-2.5 h-2.5" />
						<span>Preferences</span>
					</Link>
				</div>
			</GlassCard>

			{/* Log Weight Modal */}
			<LogWeightModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				initialWeight={initialWeight || 70}
				initialDateStr={todayDateStr}
				days={weekDays}
				onSuccess={handleSuccess}
			/>
		</>
	);
}
