"use client";

import Link from "next/link";
import { Sparkles, PencilLine, ArrowRight } from "lucide-react";

export function PlanModeChoice() {
	return (
		<div className="flex flex-col gap-3">
			{/* AI Option — primary */}
			<Link href="/plan/generate" className="block group">
				<div className="relative overflow-hidden rounded-2xl bg-brand-primary p-5 transition-all hover:opacity-95 active:scale-[0.98]">
					<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
					<div className="relative flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<div>
								<h2 className="text-base font-semibold text-black/90">
									Generate with AI
								</h2>
								<p className="text-[12px] text-black/50 mt-0.5 leading-snug max-w-[240px]">
									Describe your goal — we build the full split for you
								</p>
							</div>
						</div>
						<ArrowRight className="w-4 h-4 text-black/40 group-hover:translate-x-0.5 transition-transform shrink-0" />
					</div>
				</div>
			</Link>

			{/* Manual Option — secondary */}
			<Link href="/plan/designer?mode=manual" className="block group">
				<div className="relative overflow-hidden rounded-2xl border border-foreground/8 bg-foreground/[0.03] p-5 transition-all hover:bg-foreground/[0.05] hover:border-foreground/12 active:scale-[0.98]">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-foreground/8 flex items-center justify-center shrink-0">
								<PencilLine className="w-5 h-5 text-foreground/50" />
							</div>
							<div>
								<h2 className="text-base font-semibold text-foreground/80">
									Design manually
								</h2>
								<p className="text-[12px] text-foreground/40 mt-0.5 leading-snug">
									Build each training day yourself, step by step
								</p>
							</div>
						</div>
						<ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/40 group-hover:translate-x-0.5 transition-all shrink-0" />
					</div>
				</div>
			</Link>
		</div>
	);
}