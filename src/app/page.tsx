import { LandingContent } from "@/components/LandingContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
	const session = await getServerSession(authOptions);

	if (session) {
		redirect("/dashboard");
	}

	return <LandingContent />;
}
