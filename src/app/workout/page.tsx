import { getPlanByDate } from "@/app/actions/plan";
import { getTodayBodyWeight, getTodayWorkoutLog } from "@/app/actions/logs";
import { getHighestWeightPRsBulk } from "@/app/actions/analytics";
import WorkoutSession from "@/components/WorkoutSession";
import { WorkoutMode } from "@/types/workout";
import { Header } from "@/components/Header";
import { getUserSettings } from "@/app/actions/user";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function WorkoutPage({
	searchParams,
}: {
	searchParams: Promise<{ date?: string; mode?: WorkoutMode }>;
}) {

	const resolvedParams = await searchParams;
	const date = resolvedParams.date;

	// Fetch base data in parallel
	const [plan, initialBodyWeight, initialWorkoutLog, userSettings] = await Promise.all([
		getPlanByDate(date),
		getTodayBodyWeight(date),
		getTodayWorkoutLog(date),
		getUserSettings()
	]);

	const today = format(new Date(), "yyyy-MM-dd");
	const explicitMode = resolvedParams.mode || (date && date !== today ? 'MANUAL_LOG' : 'LIVE_SESSION');

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
			<Header title="Workout Session" />
			<div className="px-6">
				<WorkoutSession
					template={plan}
					initialBodyWeight={initialBodyWeight}
					initialWorkoutLog={initialWorkoutLog}
					initialPRs={initialPRs}
					date={date}
					mode={explicitMode}
					userDefaultRest={userSettings.defaultRestDuration}
				/>
			</div>
		</div>
	);
}
