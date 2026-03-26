"use client";

import { useState, useEffect } from "react";
import { ChevronDown, BarChart2 } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import ExerciseProgressChart from "./ExerciseProgressChart";
import { getExerciseProgress } from "@/app/actions/analytics";
import { cn } from "@/lib/utils";

interface ExerciseProgressSectionProps {
  exercises: string[];
}

export default function ExerciseProgressSection({ exercises }: ExerciseProgressSectionProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>(exercises[0] || "");
  const [progressData, setProgressData] = useState<{ date: string; weight: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedExercise) {
      const fetchProgress = async () => {
        setLoading(true);
        try {
          const data = await getExerciseProgress(selectedExercise);
          setProgressData(data);
        } catch (error) {
          console.error("Error fetching progress data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProgress();
    }
  }, [selectedExercise]);

  if (exercises.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          Exercise Progress
        </h2>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 glass-button rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-primary hover:scale-105 active:scale-95 transition-all"
          >
            <span>{selectedExercise || "Select Exercise"}</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 glass z-50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 shadow-2xl border border-white/10">
                <div className="max-h-64 overflow-y-auto no-scrollbar py-2">
                  {exercises.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => {
                        setSelectedExercise(ex);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                        selectedExercise === ex 
                          ? "bg-brand-primary text-black" 
                          : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <GlassCard className="p-6 relative overflow-hidden">
        {loading ? (
          <div className="h-[300px] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Analyzing Gains...</p>
          </div>
        ) : progressData.length > 0 ? (
          <ExerciseProgressChart data={progressData} exerciseName={selectedExercise} />
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-foreground/20" />
            </div>
            <div>
              <p className="text-foreground/60 text-sm font-bold uppercase tracking-tight">Insufficient Data</p>
              <p className="text-foreground/40 text-[10px] font-medium uppercase tracking-widest mt-1">Record more {selectedExercise} sessions to see progress</p>
            </div>
          </div>
        )}
      </GlassCard>
    </section>
  );
}
