"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "./ui/GlassCard";

export function NotificationPrompt() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		// Only show if supported and permission is still "default" (not yet asked)
		console.log(
			"Notification.permission",
			Notification.permission,
			"Notification" in window && "serviceWorker" in navigator,
		);
		if ("Notification" in window && "serviceWorker" in navigator) {
			setShow(true);
		}
	}, []);

	if (!show) return null;

	return (
		<Link href="/profile" className="block mb-8">
			<GlassCard className="bg-brand-primary/5 border-brand-primary/20 flex items-center justify-between p-4 group hover:bg-brand-primary/10 transition-colors">
				<div className="flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] dark:shadow-[0_0_15px_rgba(249,115,22,0.15)]">
						<Bell className="w-5 h-5 text-brand-secondary" />
					</div>
					<div>
						<h4 className="text-sm font-bold text-foreground leading-tight">
							Stay on Track
						</h4>
						<p className="text-[10px] text-foreground/50 font-medium uppercase tracking-widest">
							Enable workout reminders
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-[10px] font-black uppercase text-brand-primary tracking-widest bg-brand-primary/10 px-2 py-1 rounded-lg">
						Setup
					</span>
					<ChevronRight className="w-4 h-4 text-brand-primary group-hover:translate-x-1 transition-transform" />
				</div>
			</GlassCard>
		</Link>
	);
}
