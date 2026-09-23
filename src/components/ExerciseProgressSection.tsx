"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";
import ExerciseProgressChart from "./ExerciseProgressChart";
import { getExerciseProgress } from "@/app/actions/analytics";
import { cn } from "@/lib/utils";

interface ExerciseProgressSectionProps {
  exercises: string[];
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

export default function ExerciseProgressSection({
  exercises,
}: ExerciseProgressSectionProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>(exercises[0] || "");
  const [progressData, setProgressData] = useState<{ date: string; weight: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      return;
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.min(224, Math.max(200, window.innerWidth - 32));
      let left = rect.left;
      if (left + width > window.innerWidth - 16) {
        left = window.innerWidth - 16 - width;
      }
      if (left < 16) left = 16;
      setMenuPos({ top: rect.bottom + 8, left, width });
    }
    setIsDropdownOpen(true);
  };

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
    <div className="rounded-[1.5rem] border border-foreground/[0.06] bg-foreground/[0.02] p-5 md:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-medium text-foreground/40">
          Pick a lift to inspect its strength curve.
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={`/analytics/exercise-timeline?exercise=${encodeURIComponent(selectedExercise)}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/[0.08] px-3.5 py-2 text-[12px] font-semibold text-foreground/50 transition-all hover:border-brand-primary/40 hover:text-brand-primary">
            <ArrowRight className="h-3.5 w-3.5" />
            View full timeline
          </Link>

          <button
            ref={buttonRef}
            type="button"
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            className="glass flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-foreground transition-all hover:border-brand-primary/50 active:scale-95">
            <span className="max-w-[220px] truncate">
              {selectedExercise || "Choose an exercise"}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-foreground/40 transition-transform duration-300",
                isDropdownOpen && "rotate-180",
              )}
            />
          </button>

          {isDropdownOpen &&
            menuPos &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div
                  style={{
                    top: menuPos.top,
                    left: menuPos.left,
                    width: menuPos.width,
                  }}
                  className="glass fixed z-50 overflow-hidden rounded-2xl shadow-2xl animate-in fade-in duration-150"
                  role="menu">
                  <div className="max-h-64 overflow-y-auto no-scrollbar py-1.5">
                    {exercises.map((ex) => (
                      <button
                        key={ex}
                        role="menuitem"
                        onClick={() => {
                          setSelectedExercise(ex);
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full cursor-pointer truncate px-4 py-2.5 text-left text-[13px] font-medium transition-colors",
                          selectedExercise === ex
                            ? "bg-foreground/10 text-foreground"
                            : "text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground",
                        )}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </>,
              document.body,
            )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-[300px] flex-col justify-center gap-3 overflow-hidden px-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-9 animate-pulse rounded-lg bg-foreground/[0.04]"
              style={{ width: `${94 - i * 7}%` }}
            />
          ))}
        </div>
      ) : progressData.length > 0 ? (
        <div className="h-[300px] w-full md:h-[340px]">
          <ExerciseProgressChart
            data={progressData}
            exerciseName={selectedExercise}
          />
        </div>
      ) : (
        <div className="flex h-[300px] flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/[0.04]">
            <BarChart2 className="h-5 w-5 text-foreground/30" />
          </div>
          <p className="mt-4 text-base font-bold tracking-tight text-foreground">
            Not enough data yet
          </p>
          <p className="mt-1 max-w-[36ch] text-sm leading-relaxed text-foreground/50">
            Log {selectedExercise || "this exercise"} sessions and its strength
            trend will appear here.
          </p>
        </div>
      )}
    </div>
  );
}