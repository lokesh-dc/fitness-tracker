import { getUserExercises } from "@/app/actions/analytics";
import { ExerciseTimeline } from "@/components/analytics/ExerciseTimeline";
import { Header } from "@/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exercise Progress | PR Timeline",
  description: "Track your strength progression over time with detailed charts and PR milestones.",
};

export default async function ExerciseTimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const { exercise: queryExercise } = await searchParams;
  const exerciseNames = await getUserExercises();
  
  // Default to the first exercise if none selected in URL
  const initialExercise = queryExercise || exerciseNames[0] || "";

  return (
    <div className="flex flex-col">
      <Header title="Exercise Progress" subtitle="PR Timeline" />
      <main className="flex-1 px-6 w-full pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        <ExerciseTimeline 
          exerciseNames={exerciseNames} 
          initialExercise={initialExercise} 
        />
      </main>
    </div>
  );
}
