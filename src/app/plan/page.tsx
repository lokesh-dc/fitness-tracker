import { getUserPlanSummary } from "@/app/actions/plan";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Calendar, ChevronRight, Dumbbell, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const { plans, templatesMap } = await getUserPlanSummary() || { plans: [], templatesMap: {} };

  const getPlanStatus = (startDateStr: string, numWeeks: number) => {
    const start = new Date(startDateStr);
    const end = new Date(start);
    end.setDate(end.getDate() + (numWeeks * 7));
    
    const now = new Date();
    
    if (now < start) return { label: "Not Started", color: "text-foreground/40", bg: "bg-foreground/5" };
    if (now > end) return { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    return { label: "Running", color: "text-orange-500", bg: "bg-orange-500/10" };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Your Plans</h1>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Manage your cycles</p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full pb-12">
        {/* Call to action */}
        <Link href="/plan/designer" className="block">
          <GlassCard className="border-dashed border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-all group flex items-center justify-between py-8">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                  Design a Plan
                </h2>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                  Create a new training cycle
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-orange-500" />
          </GlassCard>
        </Link>

        {/* Plan list */}
        <section className="space-y-6">
          <h2 className="text-sm font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Your Training Cycles</h2>
          
          {!plans || plans.length === 0 ? (
            <div className="text-center py-20 opacity-30">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">No plans designed yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const status = getPlanStatus(plan.startDate, plan.numWeeks);
                const uniqueDays = templatesMap[plan.id] ? Math.round(templatesMap[plan.id] / plan.numWeeks) : 0;

                return (
                  <Link key={plan.id} href={`/plan/${plan.id}`} className="block">
                    <GlassCard className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-orange-500/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/40 group-hover:text-orange-500 transition-colors flex-shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-foreground uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                            {plan.name || `Plan starting ${new Date(plan.startDate).toLocaleDateString()}`}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest bg-foreground/5 px-2 py-1 rounded-md">
                              {plan.startDate}
                            </span>
                            <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest bg-foreground/5 px-2 py-1 rounded-md">
                              {plan.numWeeks} Weeks
                            </span>
                            <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest bg-foreground/5 px-2 py-1 rounded-md">
                              {uniqueDays} Days/Week
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn("px-3 py-1.5 rounded-lg flex items-center w-fit", status.bg)}>
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", status.color)}>
                          {status.label}
                        </span>
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
