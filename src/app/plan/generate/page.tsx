import { GenerateProgramForm } from "@/components/GenerateProgramForm";
import { getExercises } from "@/app/actions/exercises";
import { Header } from "@/components/Header";

export default async function GeneratePage() {
	const exercises = await getExercises();

	return (
		<div className="flex flex-col">
			<Header
				title="AI Plan Generator"
				subtitle="Describe your goal, we'll design the routine"
			/>
			<main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-40">
				<GenerateProgramForm initialExercises={exercises} />
			</main>
		</div>
	);
}