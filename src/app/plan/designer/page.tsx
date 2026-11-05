import { PlanDesigner } from "@/components/PlanDesigner";
import { getPlanDetails } from "@/app/actions/plan";
import { getExercises } from "@/app/actions/exercises";
import { Header } from "@/components/Header";
import { PlanModeChoice } from "@/components/PlanModeChoice";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function DesignerPage({
	searchParams,
}: {
	searchParams: Promise<{ edit?: string; dup?: string; mode?: string }>;
}) {
	const { edit: editId, dup: duplicateId, mode } = await searchParams;

	if (!editId && !duplicateId && mode !== "manual") {
		return (
			<div className="flex flex-col min-h-screen">
				<Header title="Create Plan" subtitle="Select routine architecture" />
				<main className="flex-1 px-4 md:px-6 pb-28 md:pb-12 max-w-xl mx-auto w-full">
					<div className="space-y-6 pt-2">
						{/* Back link */}
						<Link
							href="/plan"
							className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/40 hover:text-foreground transition-colors group">
							<ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
							<span>Back to training cycles</span>
						</Link>

						{/* Hero context banner */}
						<div className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-5">
							<p className="text-sm font-semibold text-foreground/90">
								Build your next training block
							</p>
							<p className="text-xs text-foreground/50 mt-1 leading-relaxed">
								Pick how you want to build. You can modify every set, rep, and
								exercise at any time.
							</p>
						</div>

						<PlanModeChoice />

						<p className="text-center text-[11px] text-foreground/30 pt-2">
							Plans can be modified or exported as templates whenever you train.
						</p>
					</div>
				</main>
			</div>
		);
	}

	const [initialData, exercises] = await Promise.all([
		editId
			? getPlanDetails(editId)
			: duplicateId
				? getPlanDetails(duplicateId)
				: null,
		getExercises(),
	]);

	const title = duplicateId
		? "Duplicate Plan"
		: editId
			? "Edit Plan"
			: "Plan Designer";

	const subtitle = duplicateId
		? "Clone and adjust your training routine"
		: editId
			? "Fine-tune splits, days, and exercises"
			: "Build your custom training cycle";

	return (
		<div className="flex flex-col min-h-screen">
			<Header title={title} subtitle={subtitle} />
			<main className="flex-1 px-4 md:px-6 pb-28 md:pb-12 max-w-3xl mx-auto w-full">
				<PlanDesigner
					initialData={initialData}
					editPlanId={editId}
					duplicateMode={!!duplicateId}
					initialExercises={exercises}
				/>
			</main>
		</div>
	);
}
