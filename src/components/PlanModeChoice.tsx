import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, PencilLine, ChevronRight } from "lucide-react";

export function PlanModeChoice() {
	return (
		<div className="grid gap-4">
			<Link href="/plan/generate" className="block group">
				<GlassCard className="border-dashed border-brand-primary/30 bg-brand-primary/5 hover:bg-brand-primary/10 transition-all flex items-center justify-between py-8 group-hover:scale-[1.01]">
					<div className="flex items-center space-x-6">
						<div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform">
							<Sparkles className="w-8 h-8 text-black" />
						</div>
						<div>
							<h2 className="text-lg font-black text-foreground uppercase tracking-tight">
								Generate with AI
							</h2>
							<p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
								Describe your goal — we build the split
							</p>
						</div>
					</div>
					<ChevronRight className="w-6 h-6 text-brand-primary" />
				</GlassCard>
			</Link>

			<Link href="/plan/designer?mode=manual" className="block group">
				<GlassCard className="border-dashed border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-all flex items-center justify-between py-8 group-hover:scale-[1.01]">
					<div className="flex items-center space-x-6">
						<div className="w-14 h-14 rounded-2xl bg-foreground/10 flex items-center justify-center group-hover:scale-110 transition-transform">
							<PencilLine className="w-8 h-8 text-foreground/70" />
						</div>
						<div>
							<h2 className="text-lg font-black text-foreground uppercase tracking-tight">
								Design Manually
							</h2>
							<p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
								Build each day step by step yourself
							</p>
						</div>
					</div>
					<ChevronRight className="w-6 h-6 text-foreground/30" />
				</GlassCard>
			</Link>
		</div>
	);
}