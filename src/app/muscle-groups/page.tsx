import { getMuscleGroupPageData } from "@/app/actions/analytics";
import MuscleGroupsClient from "./MuscleGroupsClient";
import { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Muscle Group Analytics | FitTrack",
  description: "Detailed breakdown of your training volume and strength progress by muscle group.",
};

export default async function MuscleGroupsPage() {
  const data = await getMuscleGroupPageData();

  return (
    <div className="flex flex-col">
      <Header 
        title="Muscle Groups" 
        subtitle="Training distribution & performance analytics" 
      />

      <main className="px-6 pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
        <MuscleGroupsClient data={data} />
      </main>
    </div>
  );
}
