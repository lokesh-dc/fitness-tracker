"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DemoBanner() {
	const pathname = usePathname();

	// Hide on auth pages
	if (pathname.startsWith("/auth")) return null;

	return (
		<div className="demo-banner fixed top-0 left-0 right-0 z-[9999] h-11 bg-orange-500/10 border-b border-orange-500/20 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 animate-fade-in-down">
			<div className="flex items-center space-x-2">
				<AlertCircle className="w-4 h-4 text-brand-primary animate-pulse" />
				<span className="text-[10px] sm:text-xs font-bold text-foreground/80 uppercase tracking-wider">
					<span className="hidden sm:inline">You're exploring a </span>demo —
					data resets every 24 hours
				</span>
			</div>

			<Link
				href="/auth/signup"
				className="px-3 py-1.5 bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_5px_15px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center">
				Sign up Now
				<ArrowRight className="w-3 h-3 ml-1" />
			</Link>
		</div>
	);
}
