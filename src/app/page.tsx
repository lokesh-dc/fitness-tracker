import { LandingContent } from "@/components/LandingContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

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
