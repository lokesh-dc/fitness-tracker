"use client";

import Link from "next/link";
import { Sparkles, SlidersHorizontal, ArrowRight, Zap, Target } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function PlanModeChoice() {
	return (
		<div className="flex flex-col gap-4">
			{/* AI Option — primary recommended */}
			<Link href="/plan/generate" className="block group">
				<GlassCard className="relative overflow-hidden p-6 border-brand-primary/30 hover:border-brand-primary/60 bg-gradient-to-br from-brand-primary/[0.12] via-brand-primary/[0.04] to-transparent transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
					{/* Ambient glow */}
					<div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-primary/15 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-primary/25 transition-all" />

					<div className="relative flex flex-col gap-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-center gap-3.5">
								<div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
									<Sparkles className="w-6 h-6 text-brand-primary" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-base font-bold text-foreground tracking-tight">
											Generate with AI
										</h2>
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
											<Zap className="w-2.5 h-2.5" /> Recommended
										</span>
									</div>
									<p className="text-xs text-foreground/50 mt-1 leading-relaxed">
										Describe your targets, equipment, and schedule — we formulate a complete progressive split.
									</p>
								</div>
							</div>
							<div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-brand-primary group-hover:text-black flex items-center justify-center transition-all shrink-0">
								<ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-black group-hover:translate-x-0.5 transition-transform" />
							</div>
						</div>

						{/* Feature Pills */}
						<div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-foreground/50">
							<span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/5">
								Goal-matched volume
							</span>
							<span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/5">
								Auto progressive overload
							</span>
							<span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/5">
								Ready in ~30s
							</span>
						</div>
					</div>
				</GlassCard>
			</Link>

			{/* Manual Option — artisan control */}
			<Link href="/plan/designer?mode=manual" className="block group">
				<GlassCard className="relative overflow-hidden p-6 border-foreground/10 hover:border-foreground/25 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
					<div className="relative flex flex-col gap-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-center gap-3.5">
								<div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
									<SlidersHorizontal className="w-5 h-5 text-foreground/60" />
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-base font-bold text-foreground/90 tracking-tight">
											Design Manually
										</h2>
										<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-foreground/10 text-foreground/60 border border-foreground/10">
											<Target className="w-2.5 h-2.5" /> Full Control
										</span>
									</div>
									<p className="text-xs text-foreground/50 mt-1 leading-relaxed">
										Architect every training day, customize sets, reps, rest timers, and pick from 799+ exercises.
									</p>
								</div>
							</div>
							<div className="w-8 h-8 rounded-full bg-foreground/5 group-hover:bg-foreground/15 flex items-center justify-center transition-all shrink-0">
								<ArrowRight className="w-4 h-4 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 transition-transform" />
							</div>
						</div>

						{/* Feature Pills */}
						<div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-foreground/45">
							<span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/5">
								Custom weekly splits
							</span>
							<span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/5">
								799+ verified exercise library
							</span>
							<span className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/5">
								Warmup set calculations
							</span>
						</div>
					</div>
				</GlassCard>
			</Link>
		</div>
	);
}
