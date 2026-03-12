"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
	title?: React.ReactNode;
	subtitle?: React.ReactNode;
}

export function Header({ title, subtitle }: HeaderProps) {
	const pathname = usePathname();
	const showProfile = pathname !== "/profile";

	return (
		<header className="px-6 py-8 flex justify-between items-center w-full">
			<div>
				{subtitle && (
					<p className="text-foreground/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1">
						{subtitle}
					</p>
				)}
				{title && (
					<h1 className="text-2xl font-black text-foreground tracking-tight line-clamp-1">
						{title}
					</h1>
				)}
			</div>
			<div className="flex items-center space-x-3 shrink-0">
				<ThemeToggle />
				{showProfile && (
					<Link
						href="/profile"
						className="glass-button w-12 h-12 rounded-2xl border-foreground/10 overflow-hidden block hover:scale-105 active:scale-95 transition-transform">
						<img
							src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lokesh"
							alt="User Profile"
							className="w-full h-full object-cover"
						/>
					</Link>
				)}
			</div>
		</header>
	);
}
