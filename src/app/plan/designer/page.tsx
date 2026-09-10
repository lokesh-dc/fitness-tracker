import { PlanDesigner } from "@/components/PlanDesigner";
import { getPlanDetails } from "@/app/actions/plan";
import { getExercises } from "@/app/actions/exercises";
import { Header } from "@/components/Header";
import { PlanModeChoice } from "@/components/PlanModeChoice";
import { CalendarRange } from "lucide-react";

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
					title="Plan Wizard"
					subtitle="How would you like to build your routine?"
				/>
				<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-12">
					<div className="text-center space-y-2 py-4">
						<div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
							<CalendarRange className="w-8 h-8 text-brand-primary" />
						</div>
						<h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
							Choose how to build
						</h2>
						<p className="text-sm text-foreground/40 font-medium">
							AI generates a full split you can tweak, or you build it yourself.
						</p>
					</div>
					<PlanModeChoice />
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
				title={editId ? "Edit Plan" : "Plan Wizard"}
				subtitle="Design your routine"
			/>
			<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-12">
				<PlanDesigner
					initialData={initialData}
					editPlanId={editId}
					initialExercises={exercises}
				/>
			</main>
		</div>
	);
}