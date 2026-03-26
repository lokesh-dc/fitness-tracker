// src/components/ui/LayoutShell.tsx — NEW
"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { DailyReminder } from "@/components/DailyReminder";
import ScrollToTop from "@/components/ScrollToTop";

function cn(...inputs: any[]) {
	return inputs.filter(Boolean).join(" ");
}

export default function LayoutShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isWorkoutPage = pathname === "/workout";
	const isLandingPage = pathname === "/";

	return (
		<div className="flex flex-col">
			<ScrollToTop />
			<Navigation />
			<DailyReminder />
			<div
				className={cn(
					"flex-1",
					!isLandingPage && "md:pb-0 md:pl-20 pt-28 md:pt-32",
					isWorkoutPage ? "pb-0" : "pb-0",
					// ← removed max-h-[20px], that was clipping everything
				)}>
				{children}
			</div>
		</div>
	);
}
