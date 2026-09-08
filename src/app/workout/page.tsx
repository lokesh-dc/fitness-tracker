import { getPlanByDate } from "@/app/actions/plan";
import { getTodayBodyWeight, getTodayWorkoutLog } from "@/app/actions/logs";
import { getHighestWeightPRsBulk } from "@/app/actions/analytics";
import { getExercises } from "@/app/actions/exercises";
import { getCustomWorkoutPlan } from "@/app/actions/custom-workout";
import { getMergedTemplate } from "@/app/actions/merge";
import WorkoutSession from "@/components/WorkoutSession";
import { WorkoutMode, WorkoutTemplate } from "@/types/workout";
import { Header } from "@/components/Header";
import { getUserSettings } from "@/app/actions/user";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function WorkoutPage({
	searchParams,
}: {
	searchParams: Promise<{ date?: string; mode?: WorkoutMode; mergedId?: string }>;
}) {

	const resolvedParams = await searchParams;
	const date = resolvedParams.date;
	const mergedId = resolvedParams.mergedId;
	const today = format(new Date(), "yyyy-MM-dd");
	const explicitMode = resolvedParams.mode || (date && date !== today ? 'MANUAL_LOG' : 'LIVE_SESSION');
	const isFuturePrep = date && date > today && explicitMode === 'LIVE_SESSION';
	const isMerged = !!mergedId;

	// If mergedId is provided, fetch the merged template; otherwise fetch the plan as usual
	let plan: WorkoutTemplate | null = null;

	if (isMerged) {
		const mergedDoc = await getMergedTemplate(mergedId);
		if (mergedDoc) {
			plan = {
				id: mergedDoc._id?.toString() || mergedId,
				userId: mergedDoc.userId.toString(),
				planId: "merged",
				weekNumber: 1,
				dayOfWeek: new Date().getDay(),
				splitName: mergedDoc.splitName,
				exercises: mergedDoc.exercises,
			};
		}
	} else {
		plan = await getPlanByDate(date);
	}

	const [initialBodyWeight, initialWorkoutLog, userSettings, allExercises, customPlan] = await Promise.all([
		isFuturePrep ? Promise.resolve(null) : getTodayBodyWeight(date),
		isFuturePrep ? Promise.resolve(null) : getTodayWorkoutLog(date),
		getUserSettings(),
		getExercises(),
		isFuturePrep || isMerged ? Promise.resolve(null) : getCustomWorkoutPlan(date),
	]);

	let initialPRs: Record<string, { weight: number; reps: number }> = {};
	if (plan && plan.exercises) {
		const exerciseIds = plan.exercises
			.map((ex) => ex.exerciseId)
			.filter(Boolean);
		if (exerciseIds.length > 0) {
			initialPRs = await getHighestWeightPRsBulk(exerciseIds);
		}
	}

	return (
		<div className="flex flex-col pb-24 md:pb-0">
			<Header title={isMerged ? "Merged Workout" : "Workout Session"} />
			<div className="px-6">
				<WorkoutSession
					template={plan}
					initialBodyWeight={initialBodyWeight}
					initialWorkoutLog={initialWorkoutLog}
					initialPRs={initialPRs}
					date={isFuturePrep ? undefined : (isMerged ? today : date)}
					mode={isMerged ? 'LIVE_SESSION' : explicitMode}
					userDefaultRest={userSettings.defaultRestDuration}
					allExercises={allExercises}
					customExerciseNames={customPlan?.exerciseNames || null}
					isMerged={isMerged}
				/>
			</div>
		</div>
	);
}
