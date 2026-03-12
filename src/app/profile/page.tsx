import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	User,
	Bell,
	Shield,
	CircleHelp,
	LogOut,
	ChevronRight,
	Settings,
	CreditCard,
} from "lucide-react";

import { Header } from "@/components/Header";

export default function ProfilePage() {
	const sections = [
		{
			title: "Account",
			items: [
				{
					icon: <User className="w-5 h-5" />,
					label: "Personal Information",
					value: "Lokesh Choudhary",
				},
				{
					icon: <CreditCard className="w-5 h-5" />,
					label: "Subscription",
					value: "Pro Plan",
				},
			],
		},
		{
			title: "Settings",
			items: [
				{
					icon: <Bell className="w-5 h-5" />,
					label: "Notifications",
					toggle: true,
				},
				{ icon: <Shield className="w-5 h-5" />, label: "Privacy & Security" },
				{ icon: <Settings className="w-5 h-5" />, label: "Preferences" },
			],
		},
		{
			title: "Support",
			items: [
				{ icon: <CircleHelp className="w-5 h-5" />, label: "Help Center" },
			],
		},
	];

	return (
		<div className="flex flex-col min-h-screen">
			<Header title="Profile" />

			<main className="flex-1 px-6 space-y-6 max-w-2xl mx-auto w-full pb-12">
				<GlassCard className="flex items-center space-x-6 py-8">
					<div className="relative">
						<div className="w-20 h-20 rounded-3xl border-2 border-orange-500/50 p-1">
							<img
								src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lokesh"
								alt="Profile"
								className="w-full h-full rounded-2xl object-cover"
							/>
						</div>
						<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-4 border-background flex items-center justify-center">
							<div className="w-2 h-2 bg-white rounded-full animate-pulse" />
						</div>
					</div>
					<div>
						<h2 className="text-xl font-bold text-foreground">
							Lokesh Choudhary
						</h2>
						<p className="text-foreground/40 text-sm font-medium">
							Joined March 2024
						</p>
						<div className="mt-2 flex items-center space-x-2">
							<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-500 uppercase tracking-widest border border-orange-500/30">
								Level 12
							</span>
							<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 uppercase tracking-widest border border-foreground/10">
								Pro
							</span>
						</div>
					</div>
				</GlassCard>

				{sections.map((section, idx) => (
					<section key={idx} className="space-y-3">
						<h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
							{section.title}
						</h3>
						<div className="space-y-2">
							{section.items.map((item, itemIdx) => (
								<GlassCard
									key={itemIdx}
									className="p-4 flex items-center justify-between group cursor-pointer hover:bg-foreground/5 transition-all">
									<div className="flex items-center space-x-4">
										<div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/60 group-hover:text-orange-500 group-hover:bg-orange-500/10 transition-colors">
											{item.icon}
										</div>
										<div>
											<p className="text-sm font-bold text-foreground">
												{item.label}
											</p>
											{"value" in item && item.value && (
												<p className="text-[10px] text-foreground/40 font-medium">
													{item.value}
												</p>
											)}
										</div>
									</div>
									{"toggle" in item && item.toggle ? (
										<div className="w-10 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 relative">
											<div className="absolute right-1 top-1 w-4 h-4 bg-orange-500 rounded-full" />
										</div>
									) : (
										<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
									)}
								</GlassCard>
							))}
						</div>
					</section>
				))}

				<button className="w-full glass-card border-rose-500/20 hover:bg-rose-500/10 transition-colors flex items-center justify-center space-x-2 py-4 mt-8">
					<LogOut className="w-5 h-5 text-rose-500" />
					<span className="text-sm font-bold text-rose-500 uppercase tracking-widest">
						Log Out
					</span>
				</button>
			</main>
		</div>
	);
}
