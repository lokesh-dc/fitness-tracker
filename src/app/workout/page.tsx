import { getPlanByDate } from "@/app/actions/plan";
import {
	getTodayBodyWeight,
	getTodayWorkoutLog,
	getLastExerciseSetsBulk,
	type LastExerciseSets,
} from "@/app/actions/logs";
import { getHighestWeightPRsBulk } from "@/app/actions/analytics";
import { getExercises } from "@/app/actions/exercises";
import { getCustomWorkoutPlan } from "@/app/actions/custom-workout";
import { getMergedTemplate } from "@/app/actions/merge";
import WorkoutSession from "@/components/WorkoutSession";
import { WorkoutMode, WorkoutTemplate } from "@/types/workout";
import { getUserSettings } from "@/app/actions/user";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function WorkoutPage({
	searchParams,
}: {
	searchParams: Promise<{ date?: string; mode?: WorkoutMode; mergedId?: string; tour?: string }>;
}) {

	const resolvedParams = await searchParams;
	const date = resolvedParams.date;
	const mergedId = resolvedParams.mergedId;
	const isTour = resolvedParams.tour === "true";
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
		// For merged sessions, never load today's log — the merged template is the source of truth.
		// Loading today's log when isMerged risks shadowing the merged exercises if any partial
		// log already exists for the day (e.g. from a previous incomplete session).
		isFuturePrep || isMerged ? Promise.resolve(null) : getTodayWorkoutLog(date),
		getUserSettings(),
		getExercises(),
		isFuturePrep || isMerged ? Promise.resolve(null) : getCustomWorkoutPlan(date),
	]);

	const targetExercises: { exerciseId?: string; name: string }[] = [];
	if (plan?.exercises) {
		for (const ex of plan.exercises) {
			targetExercises.push({ exerciseId: ex.exerciseId, name: ex.name });
		}
	}
	if (customPlan?.exerciseNames) {
		for (const name of customPlan.exerciseNames) {
			if (!targetExercises.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
				targetExercises.push({ name });
			}
		}
	}

	let initialPRs: Record<string, { weight: number; reps: number }> = {};
	let lastSessionSets: Record<string, LastExerciseSets[]> = {};

	const exercisePromises: Promise<any>[] = [];
	if (plan && plan.exercises) {
		const exerciseIds = plan.exercises
			.map((ex) => ex.exerciseId)
			.filter(Boolean);
		if (exerciseIds.length > 0) {
			exercisePromises.push(
				getHighestWeightPRsBulk(exerciseIds).then((res) => {
					initialPRs = res;
				}),
			);
		}
	}

	if (targetExercises.length > 0) {
		exercisePromises.push(
			getLastExerciseSetsBulk(targetExercises, date || today).then((res) => {
				lastSessionSets = res;
			}),
		);
	}

	if (exercisePromises.length > 0) {
		await Promise.all(exercisePromises);
	}

	return (
		<div className="flex flex-col pb-24 md:pb-0">
			<div className="px-6">
				<WorkoutSession
					template={plan}
					initialBodyWeight={initialBodyWeight}
					initialWorkoutLog={initialWorkoutLog}
					initialPRs={initialPRs}
					lastSessionSets={lastSessionSets}
					date={isFuturePrep ? undefined : date}
					mode={isMerged ? 'LIVE_SESSION' : explicitMode}
					userDefaultRest={userSettings.defaultRestDuration}
					logWeightBeforeWorkout={userSettings.logWeightBeforeWorkout}
					allExercises={allExercises}
					customExerciseNames={customPlan?.exerciseNames || null}
					isMerged={isMerged}
					tour={isTour}
				/>
			</div>
		</div>
	);
}
