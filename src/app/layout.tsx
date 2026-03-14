"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { DailyReminder } from "@/components/DailyReminder";
import "@/app/globals.css";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isWorkoutPage = pathname === "/workout";

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Providers>
					<ProgressBar
						height="4px"
						color="#f97316"
						options={{ showSpinner: false }}
						shallowRouting
					/>
					<div className="flex flex-col">
						<Navigation />
						<DailyReminder />
						<div
							className={cn(
								"flex-1 md:pb-0 md:pl-20 pt-28 md:pt-32",
								isWorkoutPage ? "pb-0" : "pb-0",
							)}>
							{children}
						</div>
					</div>
				</Providers>
			</body>
		</html>
	);
}

// Helper to keep layout clean if cn is not imported
function cn(...inputs: any[]) {
	return inputs.filter(Boolean).join(" ");
}
