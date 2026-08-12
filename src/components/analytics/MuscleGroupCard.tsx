import { MuscleGroupSummary } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { ChevronRight, ExternalLink } from "lucide-react";
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

	return (
		<Link href={detailHref} className="block group">
			<GlassCard
				className={cn(
					"flex flex-col gap-1 relative overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-brand-primary/50 hover:shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.2)]",
				)}>
				{isUnderTrained && (
					<div
						className="text-[10px] w-fit bg-orange-500/10 text-orange-500 px-2 py-1 rounded-lg"
						title="Significantly less volume than others">
						<span className="font-black uppercase tracking-widest">
							Low Volume
						</span>
					</div>
				)}
				<div className="flex justify-between items-start mb-4">
					<div className="group/title z-10">
						<h3 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight group-hover/title:text-brand-primary transition-colors flex items-center gap-2">
							{summary.muscleGroup}
							<ExternalLink className="w-3 h-3 opacity-0 group-hover/title:opacity-100 transition-opacity" />
						</h3>
						<p className="text-[10px] md:text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">
							Top: {summary.topExercise}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4 mb-6">
					<div>
						<p className="text-[9px] md:text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">
							Sets / Volume
						</p>
						<p className="text-base md:text-lg font-black text-foreground">
							{summary.totalSets}{" "}
							<span className="text-[9px] md:text-[10px] text-foreground/40 uppercase">
								sets
							</span>
						</p>
						<p className="text-[10px] md:text-xs font-bold text-foreground/60">
							{summary.totalVolume.toLocaleString()}{" "}
							<span className="text-[9px] md:text-[10px] uppercase">kg</span>
						</p>
					</div>
					<div className="text-right">
						<p className="text-[9px] md:text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">
							Frequency
						</p>
						<p className="text-base md:text-lg font-black text-foreground">
							{summary.sessionCount}{" "}
							<span className="text-[9px] md:text-[10px] text-foreground/40 uppercase">
								times
							</span>
						</p>
						<p
							className={cn(
								"text-[10px] md:text-xs font-bold uppercase",
								daysAgo !== null && daysAgo > 14
									? "text-red-500"
									: daysAgo !== null && daysAgo > 7
										? "text-orange-500"
										: "text-foreground/60",
							)}>
							{daysAgo === 0
								? "Today"
								: daysAgo === 1
									? "Yesterday"
									: daysAgo === null
										? "Never"
										: `${daysAgo} days ago`}
						</p>
					</div>
				</div>

				<div className="h-10 w-full mb-2">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={summary.weeklyData}>
							<Bar
								dataKey="totalVolume"
								fill="var(--brand-accent)"
								radius={[2, 2, 0, 0]}
								opacity={0.6}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>

				<div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 hover:bg-white/[0.02] -mx-6 px-6 transition-colors group/footer">
					<span className="text-[10px] font-black text-foreground/20 group-hover/footer:text-brand-primary uppercase tracking-widest transition-colors">
						View Deep Dive Analytics
					</span>
					<ChevronRight
						className={cn(
							"w-4 h-4 transition-transform duration-300 text-foreground/20 group-hover/footer:text-brand-primary group-hover/footer:translate-x-1",
						)}
					/>
				</div>
			</GlassCard>
		</Link>
	);
}
