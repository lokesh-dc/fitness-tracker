import { getTodayPlan } from "@/app/actions/plan";
import { getTodayBodyWeight, getTodayWorkoutLog } from "@/app/actions/logs";
import { getHighestWeightPRsBulk } from "@/app/actions/analytics";
import WorkoutSession from "@/components/WorkoutSession";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
	const plan = await getTodayPlan();
	const initialBodyWeight = await getTodayBodyWeight();
	const initialWorkoutLog = await getTodayWorkoutLog();

	let initialPRs: Record<string, number> = {};
	if (plan) {
		const exerciseIds = plan.exercises
			.map((ex) => ex.exerciseId)
			.filter(Boolean);
		if (exerciseIds.length > 0) {
			initialPRs = await getHighestWeightPRsBulk(exerciseIds);
		}
	}

	return (
		<div className="flex flex-col pb-24 md:pb-0 md:pl-20">
			<Header title="Workout Session" />
			<div className="px-6">
				<WorkoutSession
					template={plan}
					initialBodyWeight={initialBodyWeight}
					initialWorkoutLog={initialWorkoutLog}
					initialPRs={initialPRs}
				/>
			</div>
		</div>
	);
}
