import { getUserExercises } from "@/app/actions/analytics";
import { ExerciseTimeline } from "@/components/analytics/ExerciseTimeline";
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
    <div className="container mx-auto px-4 py-8">
      <ExerciseTimeline 
        exerciseNames={exerciseNames} 
        initialExercise={initialExercise} 
      />
    </div>
  );
}
