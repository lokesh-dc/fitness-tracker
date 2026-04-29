import { getMuscleGroupDetail } from "@/app/actions/analytics";
import MuscleGroupDetailClient from "../MuscleGroupDetailClient";
import { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";

interface PageProps {
	params: Promise<{ muscleGroup: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { muscleGroup } = await params;
	const name = muscleGroup
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(" ");

	return {
		title: `${name} Analytics | FitTrack`,
		description: `Deep dive analysis into your ${name} training progress, volume, and strength milestones.`,
	};
}

export const dynamic = "force-dynamic";

export default async function MuscleGroupDetailPage({ params }: PageProps) {
	const { muscleGroup } = await params;
	const data = await getMuscleGroupDetail(muscleGroup);

	if (!data || data.exercises.length === 0) {
		const name = muscleGroup
			.split("-")
			.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
			.join(" ");
		return (
			<div className="flex flex-col">
				<Header title={name} subtitle="Analytics" />
				<main className="px-6 py-20 flex flex-col items-center justify-center text-center">
					<div className="bg-white/5 p-6 rounded-3xl mb-6">
						<Trophy className="w-12 h-12 text-foreground/20" />
					</div>
					<h2 className="text-2xl font-black text-foreground mb-2">
						No {name} exercises logged yet.
					</h2>
					<p className="text-foreground/40 max-w-md mb-8">
						Start logging workouts to see your {name} breakdown and performance
						trends.
					</p>
					<Link
						href="/workout"
						className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
						Start a Workout
					</Link>
				</main>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<Header title={data.muscleGroup} subtitle="Deep Dive Analytics" />
			<main className="px-6 pb-12 pt-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<MuscleGroupDetailClient data={data} />
			</main>
		</div>
	);
}
