import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "TRAK.FIT — strength training log with live PR tracking",
	description:
		"Plan multi-week blocks, log sets between rests, and get flagged the moment you beat a PR. A workout log built around progressive overload.",
};

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LandingPage({ searchParams }: Props) {
	const params = await searchParams;
	const isDemoRequest = params?.demo === "true";

	const session = await getServerSession(authOptions);

	if (session && !isDemoRequest) {
		redirect("/dashboard");
	}

	return <LandingContent autoLoginDemo={isDemoRequest} />;
}
