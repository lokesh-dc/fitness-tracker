import { getTodayPlan } from "@/app/actions/plan";
import { getTodayBodyWeight } from "@/app/actions/logs";
import WorkoutSession from "@/components/WorkoutSession";
import { redirect } from "next/navigation";

import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
	const plan = await getTodayPlan();
	const initialBodyWeight = await getTodayBodyWeight();

	if (!plan) {
		// If no plan, we could redirect or show a message.
		// For now, let's just show the empty state in the component.
	}

	return (
		<div className="flex flex-col pb-24 md:pb-0 md:pl-20">
			<Header title="Workout Session" />
			<div className="px-6">
				<WorkoutSession template={plan} initialBodyWeight={initialBodyWeight} />
			</div>
		</div>
	);
}
