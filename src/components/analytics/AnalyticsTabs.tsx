"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, TrendingUp } from "lucide-react";

export function AnalyticsTabs() {
	const pathname = usePathname();

	const tabs = [
		{
			label: "Overview",
			href: "/analytics",
			icon: LayoutDashboard,
			active: pathname === "/analytics",
		},
		{
			label: "Exercise Timeline",
			href: "/analytics/exercise-timeline",
			icon: TrendingUp,
			active: pathname === "/analytics/exercise-timeline",
		},
	];

	return (
		<div className="flex p-1.5 glass rounded-2xl border border-white/5 w-fit mb-8">
			{tabs.map((tab) => (
				<Link
					key={tab.href}
					href={tab.href}
					className={cn(
						"flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
						tab.active
							? "bg-orange-500 text-black shadow-[0_5px_15px_rgba(249,115,22,0.3)]"
							: "text-foreground/40 hover:text-foreground/70 hover:bg-white/5",
					)}>
					<tab.icon
						className={cn(
							"w-3.5 h-3.5",
							tab.active ? "text-black" : "text-orange-500/60",
						)}
					/>
					<span>{tab.label}</span>
				</Link>
			))}
		</div>
	);
}
