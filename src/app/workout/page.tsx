import { getTodayPlan } from "@/app/actions/plan";
import WorkoutSession from "@/components/WorkoutSession";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
  const plan = await getTodayPlan();

  if (!plan) {
    // If no plan, we could redirect or show a message.
    // For now, let's just show the empty state in the component.
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-0 md:pl-20 px-6 py-8">
      <WorkoutSession template={plan} />
    </div>
  );
}
