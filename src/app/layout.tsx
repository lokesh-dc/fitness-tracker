import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import LayoutShell from "@/components/ui/LayoutShell";
import NextTopLoader from "nextjs-toploader";

import "@/app/globals.css";

export const metadata: Metadata = {
	title: "Fitness Tracker",
	description: "Premium Workout & Progress Tracking",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Fitness Tracker",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	themeColor: "#000000",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({ children }: any) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<NextTopLoader
					color="var(--brand-accent)"
					height={3}
					showSpinner={false}
					shadow="0 0 10px var(--brand-accent), 0 0 5px var(--brand-accent)"
				/>
				<Providers>
					<LayoutShell>{children}</LayoutShell>
				</Providers>
			</body>
		</html>
	);
}
