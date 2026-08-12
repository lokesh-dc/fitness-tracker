"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronDown, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getExerciseHistory, type ExerciseHistorySession } from "@/app/actions/exercise-history";
import { type WorkoutMode } from "@/types/workout";
import { cn } from "@/lib/utils";

type Props = {
  exerciseName: string;
  userId: string;
  mode: WorkoutMode;
  onPlateauDetected?: (detected: boolean) => void;
};

export function ExerciseHistoryCard({ exerciseName, userId, mode, onPlateauDetected }: Props) {
  const [sessions, setSessions] = useState<ExerciseHistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (mode !== "LIVE_SESSION") {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setError(false);
      try {
        const result = await getExerciseHistory(userId, exerciseName);
        if (isMounted) {
          setSessions(result.sessions);
          if (onPlateauDetected) {
            onPlateauDetected(result.plateauDetected);
          }
        }
      } catch (err) {
        console.error("Failed to fetch exercise history:", err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [exerciseName, userId, mode, onPlateauDetected]);

  if (mode !== "LIVE_SESSION") return null;

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center space-x-2 ml-2 mb-1">
        <History className="w-3 h-3 text-white/40" />
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
          Recent History
        </h3>
      </div>

      <GlassCard className="p-2 space-y-1">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Could not load history.
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
            No previous sessions found for this exercise.
          </div>
        ) : (
          sessions.map((session, idx) => (
            <div key={idx} className="border-b last:border-0 border-white/5">
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors rounded-xl text-left"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold">
                  <span className="text-white/40 w-12">{session.date}</span>
                  <span className="text-white/60">{session.totalSets} sets</span>
                  <span className="text-white/60">{session.topSetReps} reps</span>
                  <span className="text-white">{session.topSetWeight}kg</span>
                  <span className="text-brand-primary">~{session.estimated1RM}kg 1RM</span>
                </div>
                <div className={cn("transition-transform duration-200 shrink-0", expandedIndices.includes(idx) && "rotate-180")}>
                  <ChevronDown className="w-4 h-4 text-white/20" />
                </div>
              </button>

              <AnimatePresence>
                {expandedIndices.includes(idx) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 pt-2 border-t border-white/5">
                      {session.sets.map((set, sIdx) => (
                        <div key={sIdx} className="flex justify-between items-center text-[10px]">
                          <span className="text-white/40 uppercase tracking-widest font-medium">Set {sIdx + 1}</span>
                          <span className="font-bold text-white/80">{set.weight}kg × {set.reps}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
