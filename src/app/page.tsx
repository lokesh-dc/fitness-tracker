import { getTodayPlan } from "./actions/plan";
import { StatCard } from "@/components/ui/StatCard";
import { WorkoutListItem } from "@/components/ui/WorkoutListItem";
import { GlassCard } from "@/components/ui/GlassCard";
import { Footprints, Flame, Plus, ChevronRight, User, Dumbbell } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

// Mock user ID for demonstration
const MOCK_USER_ID = "65e6d6b8b8b8b8b8b8b8b8b8";

export default async function Home() {
  let plan = null;
  let error = null;

  try {
    plan = await getTodayPlan(MOCK_USER_ID);
  } catch (e) {
    console.error("Error loading home page data:", e);
    error = "Failed to load workout data.";
  }

  const today = new Date();

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-0 md:pl-20">
      {/* Mobile Header / Desktop Top Nav */}
      <header className="px-6 py-8 flex justify-between items-center">
        <div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-1">
            {format(today, "EEEE, MMMM d")}
          </p>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hi, Lokesh! 👋
          </h1>
        </div>
        <div className="glass-button w-12 h-12 rounded-2xl border-white/10 overflow-hidden">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lokesh" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full">
        {/* Today's Stats Section */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Today&apos;s Stats</h2>
            <Link href="#" className="text-xs font-bold text-accent hover:underline flex items-center">
              Details <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              label="Steps" 
              value="8,432" 
              unit="steps" 
              status="Good"
              icon={<Footprints className="w-5 h-5 text-orange-400" />}
            />
            <StatCard 
              label="Calories" 
              value="1,240" 
              unit="kcal" 
              status="Average"
              icon={<Flame className="w-5 h-5 text-white/40" />}
            />
          </div>
        </section>

        {/* Current Plan / Workout Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-bold text-white tracking-tight">Your Plan</h2>
            <Link href="#" className="text-xs font-bold text-orange-500 hover:underline">
              Edit Plan
            </Link>
          </div>

          {plan ? (
            <Link href="/workout" className="block">
              <WorkoutListItem 
                title={plan.dayOfWeek === 0 ? "Rest Day" : `Day ${plan.dayOfWeek}: Strength Training`}
                subtitle={`Week ${plan.weekNumber} • Master Plan`}
                duration="60 min"
                exercisesCount={plan.exercises.length}
                active
              />
            </Link>
          ) : (
            <div className="glass-card border-dashed border-white/10 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-white/40" />
              </div>
              <p className="text-white/60 text-sm font-medium mb-1">No workout scheduled for today</p>
              <p className="text-white/40 text-xs">Tap to create a new session or set up a plan.</p>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <GlassCard className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Plus className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Log Weight</h3>
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Update trend</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
           </GlassCard>

           <Link href="/analytics" className="contents">
             <GlassCard className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <BarChart2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">View Progress</h3>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">All-time PRs</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
             </GlassCard>
           </Link>
        </section>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 flex justify-around items-center px-6 md:hidden">
        <Link href="/" className="flex flex-col items-center text-orange-500">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Home</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Stats</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Profile</span>
        </Link>
      </nav>

      {/* Sidebar Navigation (Desktop Only) */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 glass border-r border-white/10 hidden md:flex flex-col items-center py-8 space-y-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] mb-8">
          <Dumbbell className="w-6 h-6 text-black" />
        </div>
        
        <Link href="/" className="p-3 text-orange-500 bg-white/5 rounded-2xl transition-all">
          <LayoutDashboard className="w-6 h-6" />
        </Link>
        <Link href="/analytics" className="p-3 text-white/40 hover:text-white transition-all">
          <BarChart2 className="w-6 h-6" />
        </Link>
        <Link href="/profile" className="p-3 text-white/40 hover:text-white transition-all">
          <User className="w-6 h-6" />
        </Link>
      </nav>
    </div>
  );
}

function LayoutDashboard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function BarChart2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}
