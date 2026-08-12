import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PlanDesignerNudge() {
	return (
		<div className="w-full mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
			<GlassCard className="border-l-4 border-l-orange-500 py-3 px-5">
				<div className="flex flex-col md:flex-row items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<span className="text-xl" role="img" aria-label="calendar">
							📅
						</span>
						<p className="text-sm text-foreground/70 text-left">
							Set your preferred training days for smarter defaults
						</p>
					</div>
					<Link
						href="/onboarding?step=4"
						className="text-xs text-orange-400 underline underline-offset-2 hover:text-orange-300 font-medium transition-colors">
						Set up now →
					</Link>
				</div>
			</GlassCard>
		</div>
	);
}
