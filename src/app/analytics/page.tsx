import { getBodyWeightTrend, getHighestWeightPR } from "@/app/actions/analytics";
import WeightTrendChart from "@/components/WeightTrendChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trophy, TrendingUp, Calendar, ChevronRight, User, LayoutDashboard, BarChart2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const weightTrend = await getBodyWeightTrend();
  
  // Mock some PRs for the UI
  const prs = [
    { name: "Bench Press", weight: 100, date: "2024-02-15" },
    { name: "Squat", weight: 140, date: "2024-02-10" },
    { name: "Deadlift", weight: 180, date: "2024-02-20" },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-0 md:pl-20">
      <header className="px-6 py-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Analytics</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Insights & Progress</p>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-8 max-w-4xl mx-auto w-full">
        {/* Weight Trend Section */}
        <section className="space-y-4">
          <WeightTrendChart data={weightTrend as any} />
        </section>

        {/* PRs Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-bold text-white tracking-tight">Personal Records</h2>
            <Link href="#" className="text-xs font-bold text-orange-500 hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prs.map((pr, idx) => (
              <GlassCard key={idx} className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Trophy className="w-12 h-12 text-orange-500" />
                </div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{pr.name}</p>
                <div className="flex items-baseline space-x-1 mb-2">
                  <span className="text-2xl font-black text-white">{pr.weight}</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase">KG</span>
                </div>
                <div className="flex items-center text-[10px] font-medium text-emerald-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.5kg vs last
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Workout History Summary */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent History</h2>
          <div className="space-y-3">
             {[1, 2, 3].map((i) => (
               <GlassCard key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Strength Session</h3>
                      <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">March {10-i}, 2024 • 65 min</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
               </GlassCard>
             ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 flex justify-around items-center px-6 md:hidden">
        <Link href="/" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Home</span>
        </Link>
        <Link href="/analytics" className="flex flex-col items-center text-orange-500">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Stats</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
