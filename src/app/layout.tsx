import { Providers } from "@/components/Providers";
import LayoutShell from "@/components/ui/LayoutShell";
import NextTopLoader from "nextjs-toploader";

import "@/app/globals.css";

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
