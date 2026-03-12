import { PlanDesigner } from "@/components/PlanDesigner";
import { getPlanDetails } from "@/app/actions/plan";
import { getExercises } from "@/app/actions/exercises";
import { Header } from "@/components/Header";

export default async function DesignerPage({
	searchParams,
}: {
	searchParams: Promise<{ edit?: string }> | { edit?: string };
}) {
	const resolvedParams = await Promise.resolve(searchParams);
	const editId = resolvedParams?.edit;

	const [initialData, exercises] = await Promise.all([
		editId ? getPlanDetails(editId) : null,
		getExercises(),
	]);

	return (
		<div className="flex flex-col ">
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
