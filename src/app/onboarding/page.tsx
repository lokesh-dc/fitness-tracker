import { getOnboardingProfile } from "@/app/actions/profile";
import OnboardingFlow from "./OnboardingFlow";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Welcome to FitTrack | Onboarding",
	description: "Set up your fitness profile to get started.",
};

export default async function OnboardingPage() {
	const initialData = await getOnboardingProfile();

	return (
		<main className="min-h-screen bg-black">
			<OnboardingFlow initialData={initialData} />
		</main>
	);
}
