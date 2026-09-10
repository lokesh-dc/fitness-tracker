import { PlanDesigner } from "@/components/PlanDesigner";
import { getPlanDetails } from "@/app/actions/plan";
import { getExercises } from "@/app/actions/exercises";
import { Header } from "@/components/Header";
import { PlanModeChoice } from "@/components/PlanModeChoice";
import { Zap } from "lucide-react";

export default async function DesignerPage({
	searchParams,
}: {
	searchParams: Promise<{ edit?: string; mode?: string }>;
}) {
	const { edit: editId, mode } = await searchParams;

	if (!editId && mode !== "manual") {
		return (
			<div className="flex flex-col">
				<Header
					title="New plan"
					subtitle="Choose how to build"
				/>
				<main className="flex-1 px-4 md:px-6 pb-28 md:pb-12 max-w-lg mx-auto w-full">
					<div className="space-y-8">
						{/* Hero context */}
						<div className="flex flex-col gap-2 pt-2">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
									<Zap className="w-4 h-4 text-brand-primary" />
								</div>
								<p className="text-xs text-foreground/40 leading-relaxed">
									Build a structured training cycle in minutes
								</p>
							</div>
						</div>

						<PlanModeChoice />

						<p className="text-center text-[11px] text-foreground/25">
							You can edit and adjust any plan after it&apos;s created.
						</p>
					</div>
				</main>
			</div>
		);
	}

	const [initialData, exercises] = await Promise.all([
		editId ? getPlanDetails(editId) : null,
		getExercises(),
	]);

	return (
		<div className="flex flex-col">
			<Header
				title={editId ? "Edit plan" : "Plan wizard"}
				subtitle="Design your routine"
			/>
			<main className="flex-1 px-4 md:px-6 pb-28 md:pb-12 max-w-4xl mx-auto w-full">
				<PlanDesigner
					initialData={initialData}
					editPlanId={editId}
					initialExercises={exercises}
				/>
			</main>
		</div>
	);
}