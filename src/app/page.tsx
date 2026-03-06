import { getTodayPlan, getBodyWeightTrend } from "./actions/workout";
import WorkoutSession from "@/components/WorkoutSession";
import WeightTrendChart from "@/components/WeightTrendChart";

export const dynamic = "force-dynamic";

// Mock user ID for demonstration
const MOCK_USER_ID = "65e6d6b8b8b8b8b8b8b8b8b8";

interface WeightTrendData {
  date: string;
  bodyWeight: number;
}

export default async function Home() {
  let plan = null;
  let weightTrend: WeightTrendData[] = [];
  let error = null;

  try {
    const results = await Promise.all([
      getTodayPlan(MOCK_USER_ID),
      getBodyWeightTrend(MOCK_USER_ID),
    ]);
    plan = results[0];
    weightTrend = results[1] as unknown as WeightTrendData[];
  } catch (e) {
    console.error("Error loading home page data:", e);
    error = "Failed to load workout data. Please check your connection.";
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600 tracking-tight">TRAK.FIT</span>
          <div className="flex space-x-6 text-sm font-medium text-gray-600">
            <a href="#" className="text-blue-600 underline underline-offset-4">Today</a>
            <a href="#" className="hover:text-blue-500 transition-colors">History</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Plan</a>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        <section className="lg:col-span-2">
          <WorkoutSession userId={MOCK_USER_ID} template={plan} />
        </section>

        <aside className="space-y-8">
          <WeightTrendChart data={weightTrend} />
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Consistently hitting your target reps? Try increasing your weight by 2.5kg next session and toggle the &quot;Update Master Plan&quot; to track your progress!
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
