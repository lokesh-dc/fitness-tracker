import { MuscleGroupSummary } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface MuscleGroupCardProps {
	summary: MuscleGroupSummary;
	isUnderTrained?: boolean;
}

export function MuscleGroupCard({
	summary,
	isUnderTrained,
}: MuscleGroupCardProps) {
	const daysAgo = summary.lastTrainedDate
		? Math.floor(
				(new Date().getTime() - new Date(summary.lastTrainedDate).getTime()) /
					(1000 * 60 * 60 * 24),
			)
		: null;

	const detailHref = `/muscle-groups/${summary.muscleGroup.toLowerCase().replace(/\s+/g, "-")}`;

	const getRecencyBadge = () => {
		if (daysAgo === null) {
			return { label: "Never", color: "text-foreground/40 bg-foreground/[0.04] border-foreground/[0.06]" };
		}
		if (daysAgo === 0) {
			return { label: "Today", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
		}
		if (daysAgo === 1) {
			return { label: "Yesterday", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
		}
		if (daysAgo <= 7) {
			return { label: `${daysAgo}d ago`, color: "text-foreground/60 bg-foreground/[0.04] border-foreground/[0.06]" };
		}
		if (daysAgo <= 14) {
			return { label: `${daysAgo}d ago`, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
		}
		return { label: `${daysAgo}d ago`, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
	};

	const recency = getRecencyBadge();

	return (
		<Link href={detailHref} className="block group">
			<GlassCard className="h-full p-4 md:p-5 flex flex-col justify-between transition-all duration-300 hover:border-brand-primary/30">
				<div>
					{/* Top bar: Muscle Group title + optional under-trained badge */}
					<div className="flex justify-between items-start gap-2 mb-3">
						<div className="min-w-0">
							<h3 className="text-base md:text-lg font-bold text-foreground tracking-tight group-hover:text-brand-primary transition-colors flex items-center gap-1.5 truncate">
								{summary.muscleGroup}
								<ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
							</h3>
							<p className="text-[11px] font-medium text-foreground/40 truncate mt-0.5">
								Top: {summary.topExercise}
							</p>
						</div>

						{isUnderTrained && (
							<span className="text-[10px] font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-0.5 rounded-lg shrink-0">
								Low Volume
							</span>
						)}
					</div>

					{/* 2-Column Metrics */}
					<div className="grid grid-cols-2 gap-3 mb-4">
						<div className="space-y-0.5">
							<p className="text-[10px] font-semibold text-foreground/35 uppercase tracking-wider">
								Volume & Sets
							</p>
							<p className="text-sm md:text-base font-bold text-foreground tabular-nums leading-tight">
								{summary.totalVolume.toLocaleString()}{" "}
								<span className="text-[10px] font-medium text-foreground/40">kg</span>
							</p>
							<p className="text-[11px] font-medium text-foreground/50">
								{summary.totalSets} sets
							</p>
						</div>

						<div className="text-right space-y-0.5">
							<p className="text-[10px] font-semibold text-foreground/35 uppercase tracking-wider">
								Activity
							</p>
							<p className="text-sm md:text-base font-bold text-foreground tabular-nums leading-tight">
								{summary.sessionCount}{" "}
								<span className="text-[10px] font-medium text-foreground/40">
									{summary.sessionCount === 1 ? "session" : "sessions"}
								</span>
							</p>
							<div className="flex justify-end">
								<span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md border inline-block mt-0.5", recency.color)}>
									{recency.label}
								</span>
							</div>
						</div>
					</div>

					{/* Sparkline Volume History */}
					{summary.weeklyData && summary.weeklyData.length > 0 && (
						<div className="h-8 w-full mb-3">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={summary.weeklyData}>
									<Bar
										dataKey="totalVolume"
										fill="var(--brand-accent, #ff5722)"
										radius={[2, 2, 0, 0]}
										opacity={0.75}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</div>

				{/* Card Footer */}
				<div className="flex items-center justify-between pt-3 border-t border-foreground/[0.04] text-[11px] font-semibold text-foreground/40 group-hover:text-brand-primary transition-colors">
					<span>Deep dive analytics</span>
					<ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
				</div>
			</GlassCard>
		</Link>
	);
}
