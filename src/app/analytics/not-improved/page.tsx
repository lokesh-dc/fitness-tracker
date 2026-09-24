import { getExercisesNotImproved } from "@/app/actions/analytics";
import { Header } from "@/components/Header";
import { NotImprovedExerciseList } from "@/components/analytics/NotImprovedExerciseList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Improved | Exercises",
  description:
    "Exercises that haven't improved in the last 3 weeks — stalled lifts and neglected movements worth your attention.",
};

export default async function NotImprovedPage() {
  const data = await getExercisesNotImproved(21);

  return (
    <div className="flex flex-col">
      <Header title="Not Improved" subtitle="No progress in the last 3 weeks" />
      <main className="flex-1 px-6 w-full pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        <NotImprovedExerciseList data={data} />
      </main>
    </div>
  );
}