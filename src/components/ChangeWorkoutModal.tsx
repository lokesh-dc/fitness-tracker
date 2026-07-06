"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { type ExerciseDefinition } from "@/types/workout";
import { Check, X, Search } from "lucide-react";

interface ChangeWorkoutModalProps {
  open: boolean;
  exercises: ExerciseDefinition[];
  preSelectedExerciseNames: string[];
  onClose: () => void;
  onConfirm: (selectedExercises: string[]) => void;
}

export default function ChangeWorkoutModal({
  open,
  exercises: allExercises,
  preSelectedExerciseNames,
  onClose,
  onConfirm,
}: ChangeWorkoutModalProps) {
  const [selectedExercises, setSelectedExercises] = useState<string[]>(
    preSelectedExerciseNames,
  );
  const [searchQuery, setSearchQuery] = useState("");

  if (!open) return null;

  const muscleGroups = Array.from(
    new Set(allExercises.map((e) => e.muscleGroup)),
  ).sort();

  const toggleExercise = (exerciseName: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseName)
        ? prev.filter((e) => e !== exerciseName)
        : [...prev, exerciseName],
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedExercises);
    handleClose();
  };

  const handleClose = () => {
    setSelectedExercises(preSelectedExerciseNames);
    setSearchQuery("");
    onClose();
  };

  const exercisesByMuscle = muscleGroups
    .map((muscle) => {
      const groupExercises = allExercises.filter(
        (e) => e.muscleGroup === muscle,
      );
      const filtered = groupExercises.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return { muscle, exercises: filtered };
    })
    .filter((g) => g.exercises.length > 0);

  const anyExercisesVisible = exercisesByMuscle.length > 0;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={handleClose}
      />
      <GlassCard className="w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col relative z-101 border-brand-primary/20 p-0">
        <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-background/50 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              Select Exercises
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-foreground/5 rounded-full -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              placeholder="Search for exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 custom-scrollbar">
          {exercisesByMuscle.map(({ muscle, exercises }) => (
            <div key={muscle} className="space-y-3">
              <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">
                {muscle}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {exercises.map((ex) => {
                  const isSelected = selectedExercises.includes(ex.name);
                  return (
                    <button
                      key={ex.name}
                      onClick={() => toggleExercise(ex.name)}
                      className={cn(
                        "w-full text-left px-5 py-4 rounded-2xl border transition-all flex justify-between items-center group",
                        isSelected
                          ? "bg-brand-primary/10 border-brand-primary"
                          : "bg-foreground/5 border-foreground/10 hover:border-brand-primary hover:bg-brand-primary/5 text-foreground/80",
                      )}>
                      <span
                        className={cn(
                          "font-bold",
                          isSelected
                            ? "text-brand-primary"
                            : "group-hover:text-foreground",
                        )}>
                        {ex.name}
                        {ex.isCustom && (
                          <span className="ml-2 px-2 py-0.5 rounded-md bg-brand-primary/10 text-[8px] uppercase tracking-wider text-brand-primary border border-brand-primary/20">
                            Custom
                          </span>
                        )}
                      </span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
                          isSelected
                            ? "border-brand-primary bg-brand-primary text-black shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                            : "border-foreground/20 text-transparent group-hover:border-brand-primary",
                        )}>
                        <Check
                          className={cn(
                            "w-3 h-3 transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!anyExercisesVisible && (
            <div className="py-12 text-center text-foreground/40">
              <p className="text-sm font-bold">
                No exercises found for your search.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-foreground/10 bg-background/95 backdrop-blur-md">
          <button
            onClick={handleConfirm}
            className="w-full bg-brand-primary text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all">
            Update Workout ({selectedExercises.length} Exercise
            {selectedExercises.length !== 1 ? "s" : ""})
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
