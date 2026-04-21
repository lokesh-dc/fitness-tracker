"use client";

import { usePathname } from "next/navigation";

interface PageWithSidebarProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
	mobileWidgets?: React.ReactNode;
}

export default function PageWithSidebar({
	children,
	sidebar,
	mobileWidgets,
}: PageWithSidebarProps) {
	const pathname = usePathname();

	return (
		<div className="flex flex-col lg:flex-row gap-8 w-full">
			{/* Main Content Area */}
			<div className="flex-1 min-w-0 space-y-8">
				{/* Mobile Widget Strip (hidden on desktop) */}
				{mobileWidgets && (
					<div className="lg:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none snap-x h-auto mb-0">
						{mobileWidgets}
					</div>
				)}

				{children}
			</div>

			{/* Right Sidebar (desktop only, sticky) */}
			{sidebar && (
				<aside className="hidden lg:flex flex-col w-[340px] shrink-0 sticky top-32 self-start max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar gap-6 pb-20">
					{sidebar}
				</aside>
			)}
		</div>
	);
}
