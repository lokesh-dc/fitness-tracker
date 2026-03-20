"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	BarChart2,
	User,
	Dumbbell,
	CalendarRange,
	Play,
	Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
	const pathname = usePathname();

	// Don't show navigation on auth pages or landing page
	if (pathname.startsWith("/auth") || pathname === "/") return null;

	// Specific paths where navigation should be hidden
	const isWorkoutPage = pathname === "/workout";

	const navItems = [
		{
			href: "/dashboard",
			icon: LayoutDashboard,
			label: "Home",
			mobile: true,
			desktop: true,
		},
		{
			href: "/plan",
			icon: CalendarRange,
			label: "Plan",
			mobile: true,
			desktop: true,
		},
		{
			href: "/workout",
			icon: Dumbbell,
			label: "Workout",
			isAction: true,
			mobile: true,
			desktop: true,
		},
		{
			href: "/workouts",
			icon: Activity,
			label: "History",
			mobile: true,
			desktop: true,
		},
		{
			href: "/analytics",
			icon: BarChart2,
			label: "Analytics",
			mobile: false,
			desktop: true,
		},
		{
			href: "/profile",
			icon: User,
			label: "Profile",
			mobile: true,
			desktop: true,
		},
	];

	return (
		<>
			{/* Bottom Navigation (Mobile Only) */}
			{!isWorkoutPage && (
				<nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-foreground/10 flex justify-around items-center px-6 md:hidden z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
					{navItems
						.filter((item) => item.mobile)
						.map((item) => {
							if (item.isAction) {
								return (
									<Link
										key={item.href}
										href={item.href}
										className="flex flex-col items-center -mt-5 group transition-all">
										<div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-4 border-background-500 shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover:scale-110 active:scale-95 transition-all">
											<div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
												<Play className="w-6 h-6 text-black fill-current ml-1" />
											</div>
										</div>
										<span className="text-[9px] font-black mt-2 text-foreground/40 uppercase tracking-[0.2em] group-hover:text-orange-500 transition-colors">
											{item.label}
										</span>
									</Link>
								);
							}

							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex flex-col items-center transition-all px-2",
										pathname === item.href
											? "text-orange-500"
											: "text-foreground/40 hover:text-foreground",
									)}>
									<item.icon
										className={cn(
											"w-5 h-5",
											pathname === item.href && "stroke-[3px]",
										)}
									/>
									<span className="text-[9px] font-black mt-1.5 uppercase tracking-[0.15em]">
										{item.label}
									</span>
								</Link>
							);
						})}
				</nav>
			)}

			{/* Sidebar Navigation (Desktop Only) */}
			<nav className="fixed left-0 top-0 bottom-0 w-20 glass border-r border-foreground/10 hidden md:flex flex-col items-center py-8 space-y-8 z-50">
				<Link
					href="/dashboard"
					className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] mb-8 hover:scale-105 active:scale-95 transition-all cursor-pointer">
					<Dumbbell className="w-6 h-6 text-black" />
				</Link>

				{navItems
					.filter((item) => item.desktop)
					.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"p-3 rounded-2xl transition-all relative group",
								pathname === item.href
									? "text-orange-500 bg-foreground/5 shadow-inner"
									: "text-foreground/40 hover:text-foreground hover:bg-foreground/5",
							)}>
							<item.icon className="w-6 h-6" />

							{/* Tooltip for desktop */}
							<div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-black uppercase tracking-widest opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
								{item.label}
								<div className="absolute left-[-4px] top-1/2 -translate-y-1/2 border-[4px] border-transparent border-r-black"></div>
							</div>

							{pathname === item.href && (
								<div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-orange-500 rounded-full" />
							)}
						</Link>
					))}
			</nav>
		</>
	);
}
