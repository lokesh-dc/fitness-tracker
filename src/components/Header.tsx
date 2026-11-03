"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { getUserAvatarUrl } from "@/lib/avatar";

interface HeaderProps {
	title?: React.ReactNode;
	subtitle?: React.ReactNode;
	showBack?: boolean;
	backHref?: string;
	avatarUrl?: string;
}

export function Header({ title, subtitle, showBack, backHref, avatarUrl: customAvatarUrl }: HeaderProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();
	const showProfile = !pathname.startsWith("/profile");
	const userGender = (session?.user as any)?.gender;
	const avatarUrl = customAvatarUrl || getUserAvatarUrl(userGender);

	const handleBack = (e: React.MouseEvent) => {
		if (typeof window !== "undefined" && window.history.length > 1) {
			e.preventDefault();
			router.back();
		}
	};

	return (
		<header className="fixed top-0 left-0 md:left-20 right-0 z-40 px-5 py-3.5 md:py-4 flex justify-between items-center bg-background/85 backdrop-blur-2xl border-b border-foreground/[0.04]">
			<div className="flex items-center space-x-3 min-w-0">
				{showBack && (
					<Link
						href={backHref || "/dashboard"}
						onClick={handleBack}
						className="w-9 h-9 rounded-xl bg-foreground/5 hover:bg-foreground/10 active:scale-95 border border-foreground/10 flex items-center justify-center text-foreground/75 hover:text-foreground transition-all shrink-0 cursor-pointer"
						aria-label="Go back">
						<ChevronLeft className="w-5 h-5" />
					</Link>
				)}
				<div className="min-w-0">
					{subtitle && (
						<p className="text-foreground/35 text-[10px] font-semibold uppercase tracking-[0.18em] mb-0.5">
							{subtitle}
						</p>
					)}
					{title && (
						<h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight line-clamp-1">
							{title}
						</h1>
					)}
				</div>
			</div>
			<div className="flex items-center space-x-3 shrink-0">
				<ThemeToggle />
				{showProfile && (
					<Link
						href="/profile"
						className="glass-button w-12 h-12 rounded-2xl border-foreground/10 overflow-hidden block hover:scale-105 active:scale-95 transition-transform">
						<img
							src={avatarUrl}
							alt="User Profile"
							className="w-full h-full object-cover"
						/>
					</Link>
				)}
			</div>
		</header>
	);
}
