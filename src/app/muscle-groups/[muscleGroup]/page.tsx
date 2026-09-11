import { getMuscleGroupDetail } from "@/app/actions/analytics";
import MuscleGroupDetailClient from "../MuscleGroupDetailClient";
import { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChevronLeft, Trophy } from "lucide-react";
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

		const emptyTitle = (
			<div className="flex items-center space-x-3 h-full">
				<Link
					href="/muscle-groups"
					className="glass-button w-9 h-9 rounded-xl border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors">
					<ChevronLeft className="w-4 h-4 text-foreground/70" />
				</Link>
				<h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight line-clamp-1">
					{name}
				</h1>
			</div>
		);

		return (
			<div className="flex flex-col">
				<Header title={emptyTitle} subtitle="Analytics" />
				<main className="px-4 md:px-6 py-20 flex flex-col items-center justify-center text-center">
					<div className="bg-foreground/[0.04] p-5 rounded-2xl mb-4 border border-foreground/[0.06]">
						<Trophy className="w-8 h-8 text-foreground/25" />
					</div>
					<h2 className="text-lg font-bold text-foreground mb-1.5">
						No {name} exercises logged yet
					</h2>
					<p className="text-xs text-foreground/40 max-w-sm mb-6">
						Start logging workouts to track your {name} breakdown, volume milestones, and strength progress.
					</p>
					<Link
						href="/workout"
						className="bg-brand-primary text-white text-xs px-6 py-2.5 rounded-xl font-semibold tracking-wide hover:opacity-95 active:scale-95 transition-all">
						Start a Workout
					</Link>
				</main>
			</div>
		);
	}

	const titleNode = (
		<div className="flex items-center space-x-3 h-full">
			<Link
				href="/muscle-groups"
				className="glass-button w-9 h-9 rounded-xl border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors">
				<ChevronLeft className="w-4 h-4 text-foreground/70" />
			</Link>
			<h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight line-clamp-1">
				{data.muscleGroup}
			</h1>
		</div>
	);

	return (
		<div className="flex flex-col">
			<Header
				title={titleNode}
				subtitle={`${data.totalExercises} ${data.totalExercises === 1 ? "exercise" : "exercises"} · ${data.totalSessions} sessions`}
			/>
			<main className="px-4 md:px-6 pb-28 md:pb-12 w-full transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
				<MuscleGroupDetailClient data={data} />
			</main>
		</div>
	);
}
