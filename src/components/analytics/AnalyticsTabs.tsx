"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, TrendingUp, AlertTriangle } from "lucide-react";

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
		{
			label: "Not Improved",
			href: "/analytics/not-improved",
			icon: AlertTriangle,
			active: pathname === "/analytics/not-improved",
		},
	];

	return (
		<nav
			aria-label="Analytics sections"
			className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-[1.25rem] border border-foreground/[0.06] bg-foreground/[0.02] p-1">
			{tabs.map((tab) => (
				<Link
					key={tab.href}
					href={tab.href}
					aria-current={tab.active ? "page" : undefined}
					className={cn(
						"inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-[13px] font-semibold tracking-tight transition-all",
						tab.active
							? "bg-foreground text-background"
							: "text-foreground/45 hover:bg-foreground/[0.04] hover:text-foreground/80",
					)}>
					<tab.icon
						className={cn(
							"h-4 w-4",
							tab.active ? "text-brand-primary" : "text-foreground/30",
						)}
					/>
					{tab.label}
				</Link>
			))}
		</nav>
	);
}