import { PlanDesigner } from "@/components/PlanDesigner";
import { getPlanDetails } from "@/app/actions/plan";
import { getExercises } from "@/app/actions/exercises";

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
		<div className="px-6 py-8">
			<PlanDesigner
				initialData={initialData}
				editPlanId={editId}
				initialExercises={exercises}
			/>
		</div>
	);
}
