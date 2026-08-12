"use client";

import {
	PlanProgressData,
	StrengthProgressItem,
	WeeklyVolumeData,
	BodyweightData,
} from "@/types/workout";
import { PlanProgressWidget } from "./widgets/PlanProgressWidget";
import { StrengthProgressWidget } from "./widgets/StrengthProgressWidget";
import { WeeklyVolumeWidget } from "./widgets/WeeklyVolumeWidget";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertCircle } from "lucide-react";
import { BodyweightWidget } from "./widgets/BodyweightWidget";

interface ActivePlanSidebarProps {
	progressData: PlanProgressData | null;
	strengthData: StrengthProgressItem[] | null;
	volumeData: WeeklyVolumeData | null;
	bodyweightData: BodyweightData | null;
}

function CompactError({ title }: { title: string }) {
	return (
		<GlassCard className="p-4 border-red-500/10">
			<div className="flex flex-col items-center justify-center py-2 text-white/40 gap-2">
				<AlertCircle className="w-5 h-5 text-red-500/50" />
				<span className="text-[10px] uppercase font-bold tracking-tighter">
					Couldn't load {title}
				</span>
			</div>
		</GlassCard>
	);
}

export function ActivePlanSidebar({
	progressData,
	strengthData,
	volumeData,
	bodyweightData,
}: ActivePlanSidebarProps) {
	return (
		<div className="flex flex-col gap-3">
			{progressData ? (
				<PlanProgressWidget data={progressData} variant="sidebar" />
			) : (
				<CompactError title="Progress" />
			)}

			{strengthData ? (
				<StrengthProgressWidget data={strengthData} variant="sidebar" />
			) : (
				<CompactError title="Strength" />
			)}

			{volumeData ? (
				<WeeklyVolumeWidget data={volumeData} variant="sidebar" />
			) : (
				<CompactError title="Volume" />
			)}

			{bodyweightData ? (
				<BodyweightWidget data={bodyweightData} variant="sidebar" />
			) : (
				<CompactError title="Bodyweight" />
			)}
		</div>
	);
}

export function ActivePlanMobileStrip({
	progressData,
	strengthData,
	volumeData,
	bodyweightData,
}: ActivePlanSidebarProps) {
	return (
		<>
			<PlanProgressWidget data={progressData} variant="mobile" />
			<StrengthProgressWidget data={strengthData} variant="mobile" />
			<WeeklyVolumeWidget data={volumeData} variant="mobile" />
			<BodyweightWidget data={bodyweightData} variant="mobile" />
		</>
	);
}
