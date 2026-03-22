import { GlassCard } from "@/components/ui/GlassCard";
import {
	User,
	Bell,
	Shield,
	CircleHelp,
	ChevronRight,
	Settings,
	CreditCard,
} from "lucide-react";

import { Header } from "@/components/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStats } from "@/app/actions/logs";
import { format } from "date-fns";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ProfileClient } from "./ProfileClient";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function ProfilePage() {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;

	const client = await clientPromise;
	const db = client.db();
	const user = await db.collection("users").findOne({
		_id: new ObjectId((session.user as any).id),
	});

	const stats = await getUserStats();

	const userName = user?.name || session.user.name || "User";
	const userEmail = user?.email || session.user.email || "";
	const joinedDate = stats ? new Date(stats.joinedAt) : new Date();
	const level = stats ? Math.floor(stats.totalWorkouts / 5) + 1 : 1;

	const isVerified = user?.emailVerified || false;
	const gender = user?.gender || "";
	const weight = user?.weight || null;

	const sections = [
		{
			title: "Account",
			items: [
				{
					icon: <User className="w-5 h-5" />,
					label: "Personal Information",
					value: `${userName} • ${gender || "No gender set"}`,
					href: "/profile/edit",
				},
				{
					icon: <CreditCard className="w-5 h-5" />,
					label: "Subscription",
					value: "Pro Plan",
				},
			],
		},
		{
			title: "Support",
			items: [
				{ icon: <CircleHelp className="w-5 h-5" />, label: "Help Center" },
				{ icon: <Shield className="w-5 h-5" />, label: "Privacy & Security" },
				{ icon: <Settings className="w-5 h-5" />, label: "Preferences" },
			],
		},
	];

	return (
		<div className="flex flex-col ">
			<Header title="Profile" />

			<main className="flex-1 px-6 space-y-6 w-full pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<GlassCard className="flex items-center justify-between p-8 group">
					<div className="flex items-center space-x-6">
						<div className="relative">
							<div className="w-20 h-20 rounded-3xl border-2 border-orange-500/50 p-1 group-hover:scale-105 transition-transform duration-500">
								<img
									src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
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
								{userName}
							</h2>
							<p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest mb-1">
								{userEmail}
							</p>
							<p className="text-foreground/40 text-xs font-medium">
								Joined {format(joinedDate, "d MMMM ''yy")}
							</p>
							<div className="mt-3 flex items-center space-x-2">
								<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-500 uppercase tracking-widest border border-orange-500/30">
									Level {level}
								</span>
								<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 uppercase tracking-widest border border-foreground/10">
									Pro
								</span>
								{weight && (
									<span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-500 uppercase tracking-widest border border-blue-500/30">
										{weight} kg
									</span>
								)}
							</div>
						</div>
					</div>

					<LogoutButton variant="icon" />
				</GlassCard>

				<ProfileClient 
					isVerified={isVerified}
				/>

				{sections.map((section, idx) => (
					<section key={idx} className="space-y-3">
						<h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
							{section.title}
						</h3>
						<div className="space-y-2">
							{section.items.map((item, itemIdx) => {
								const hasHref = 'href' in item;
								const Content = (
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
										<ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
									</GlassCard>
								);

								if (hasHref && (item as any).href) {
									return (
										<Link href={(item as any).href} key={itemIdx} className="block">
											{Content}
										</Link>
									);
								}

								return Content;
							})}
						</div>
					</section>
				))}
			</main>
		</div>
	);
}
