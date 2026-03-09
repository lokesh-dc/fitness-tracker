import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, ChevronLeft, Dumbbell, LayoutGrid } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getPlanDetails } from "@/app/actions/plan";
import { WorkoutTemplate } from "@/types/workout";
import { PlanActionButtons } from "./PlanActionButtons";

export default async function PlanDetailPage({ params }: { params: Promise<{ planId: string }> | { planId: string } }) {
  // Await params in case Next.js 15 treats them as Promises in Server Components
  const resolvedParams = await Promise.resolve(params);
  const planId = resolvedParams.planId;

  const data = await getPlanDetails(planId);

  if (!data) {
    redirect("/plan");
  }

  const { plan, templates } = data;

  // We only show the daily structure for the first week, since it repeats.
  const baseWeek = templates.filter(t => t.weekNumber === 1).sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <header className="px-6 py-8 flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="flex items-center space-x-4">
          <Link href="/plan" className="glass-button w-10 h-10 rounded-xl border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight line-clamp-1">{plan.name}</h1>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{plan.numWeeks} Week Cycle</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full">
        
        {/* Client side interactive buttons */}
        <PlanActionButtons planId={plan.id} />

        {/* Templates Tree */}
        <section className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Started On</p>
              <p className="text-sm font-bold text-foreground">{new Date(plan.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 ml-2">
              <LayoutGrid className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Weekly Schedule</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {baseWeek.map((day) => (
                <GlassCard key={day.id} className="p-4 flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 group-hover:text-orange-500 transition-colors">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-widest">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.dayOfWeek]}
                      </p>
                      <p className="text-sm font-bold text-foreground/60">{day.splitName || "Workout"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-orange-500 uppercase">{day.exercises.length} Exercises</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
