"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { dismissOnboardingBanner } from "@/app/actions/profile";

export default function OnboardingBanner() {
	const [isVisible, setIsVisible] = useState(true);

	const handleDismiss = async () => {
		setIsVisible(false);
		await dismissOnboardingBanner();
	};

	if (!isVisible) return null;

	return (
		<div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
			<GlassCard className="border-l-4 border-l-orange-500 overflow-hidden">
				<div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1">
					<div className="flex items-center gap-4">
						<div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
							<Zap size={20} fill="currentColor" />
						</div>
						<div className="text-left">
							<h3 className="text-sm font-semibold text-foreground">
								Finish setting up your profile
							</h3>
							<p className="text-xs text-foreground/50">
								Personalise your experience — takes under a minute
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
						<Link
							href="/onboarding"
							className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full transition-colors whitespace-nowrap shadow-lg shadow-orange-500/20">
							Complete setup
						</Link>
						<button
							onClick={handleDismiss}
							className="p-2 text-foreground/30 hover:text-foreground/70 transition-colors"
							aria-label="Dismiss">
							<X size={18} />
						</button>
					</div>
				</div>
			</GlassCard>
		</div>
	);
}
