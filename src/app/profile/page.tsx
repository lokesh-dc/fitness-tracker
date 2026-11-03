import { Header } from "@/components/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStats } from "@/app/actions/logs";
import { 
	getProfileBodyWeightTrend, 
	getAllTimeStats, 
	getAccountSummary 
} from "@/app/actions/analytics";
import { getUserSettings } from "@/app/actions/user";
import { getOnboardingProfile } from "@/app/actions/profile";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ProfileClient } from "./ProfileClient";
import PageWithSidebar from "@/components/layout/PageWithSidebar";
import { ProfileSidebar } from "@/components/sidebar/ProfileSidebar";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileStatsGrid } from "@/components/profile/ProfileStatsGrid";
import { WorkoutPreferences } from "@/components/profile/WorkoutPreferences";
import { BodyAndGoalsCard } from "@/components/profile/BodyAndGoalsCard";
import { SettingsGroup, SettingsRow } from "@/components/profile/SettingsGroup";
import { User, CreditCard, Shield, CircleHelp } from "lucide-react";

export default async function ProfilePage() {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;

	const userId = (session.user as any).id;
	const client = await clientPromise;
	const db = client.db();

	const [
		user,
		stats,
		bodyWeightTrend,
		allTimeStats,
		accountSummary,
		userSettings,
		onboardingProfile,
	] = await Promise.all([
		db.collection("users").findOne({ _id: new ObjectId(userId) }),
		getUserStats(),
		getProfileBodyWeightTrend(userId),
		getAllTimeStats(userId),
		getAccountSummary(userId),
		getUserSettings(),
		getOnboardingProfile(),
	]);

	const userName = user?.name || session.user.name || "User";
	const userEmail = user?.email || session.user.email || "";
	const joinedDate = stats ? new Date(stats.joinedAt) : new Date();
	const level = stats ? Math.floor(stats.totalWorkouts / 5) + 1 : 1;
	const isVerified = Boolean(user?.emailVerified);
	const gender = user?.gender || "";
	const weight = user?.weight || null;

	return (
		<div className="flex flex-col">
			<Header title="Profile" showBack backHref="/dashboard" />

			<main className="px-4 sm:px-6 pb-12 md:pb-16 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<PageWithSidebar
					sidebar={
						<ProfileSidebar
							bodyWeightTrend={bodyWeightTrend}
							allTimeStats={allTimeStats}
							accountSummary={accountSummary}
						/>
					}
				>
					<div className="space-y-6 max-w-2xl mx-auto lg:max-w-none">
						{/* Mobile-first Hero */}
						<ProfileHero
							userName={userName}
							userEmail={userEmail}
							joinedDate={joinedDate}
							level={level}
							weight={weight}
							isVerified={isVerified}
							gender={gender}
						/>

						{/* 2x2 Stats Grid for Mobile */}
						<ProfileStatsGrid
							bodyWeightTrend={bodyWeightTrend}
							allTimeStats={allTimeStats}
							accountSummary={accountSummary}
						/>

						{/* Workout Preferences (Weight logging toggle & default rest timer) */}
						<WorkoutPreferences initialSettings={userSettings} />

						{/* Body & Goals summary with quick edit link */}
						<BodyAndGoalsCard
							profile={onboardingProfile}
							currentWeight={weight}
						/>

						{/* Account Security / Email Verification notice */}
						<ProfileClient isVerified={isVerified} />

						{/* Push Notifications */}
						<section className="space-y-2.5">
							<h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] px-1">
								Notifications
							</h3>
							<PushNotificationManager />
						</section>

						{/* Account Settings */}
						<SettingsGroup title="Account">
							<SettingsRow
								icon={<User className="w-4 h-4" />}
								label="Personal Information"
								value={`${userName} • ${gender || "No gender set"}`}
								href="/profile/edit"
							/>
							<SettingsRow
								icon={<CreditCard className="w-4 h-4" />}
								label="Subscription"
								value="Active"
								badge="Pro Plan"
								isLast
							/>
						</SettingsGroup>

						{/* Support & Legal */}
						<SettingsGroup title="Support & Legal">
							<SettingsRow
								icon={<CircleHelp className="w-4 h-4" />}
								label="Help Center"
								value="Guides, FAQs & Support"
							/>
							<SettingsRow
								icon={<Shield className="w-4 h-4" />}
								label="Privacy & Security"
								value="Data encryption & account protection"
								isLast
							/>
						</SettingsGroup>

						{/* Subtle version info */}
						<div className="text-center pt-2">
							<p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
								FitTrack Web v1.2 • Sunday-Start Calendar
							</p>
						</div>
					</div>
				</PageWithSidebar>
			</main>
		</div>
	);
}
