"use client";

import { useState, useEffect } from "react";
import { saveWorkoutSession } from "@/app/actions/logs";
import { getHighestWeightPR } from "@/app/actions/analytics";
import { type Exercise, type WorkoutTemplate } from "@/types/workout";
import { Loader2, Plus, Trash2, Trophy, ChevronLeft, Save, CheckCircle2 } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WorkoutSessionProps {
  template: WorkoutTemplate | null;
}

export default function WorkoutSession({ template }: WorkoutSessionProps) {
  const [exercises, setExercises] = useState<Exercise[]>(
    template?.exercises.map((ex) => ({
      ...ex,
      sets: [{ weight: ex.lastWeight || 0, reps: ex.targetReps }],
      pr: 0,
    })) || []
  );
  const [bodyWeight, setBodyWeight] = useState<number>(0);
  const [updateTemplate, setUpdateTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (template) {
      template.exercises.forEach(async (ex, index) => {
        const pr = await getHighestWeightPR(ex.name);
        setExercises((prev) => {
          const newExs = [...prev];
          newExs[index] = { ...newExs[index], pr };
          return newExs;
        });
      });
    }
  }, [template]);

  const addSet = (exerciseIndex: number) => {
    setExercises((prev) => {
      const newExs = [...prev];
      const lastSet = newExs[exerciseIndex].sets[newExs[exerciseIndex].sets.length - 1];
      newExs[exerciseIndex].sets.push({ ...lastSet });
      return newExs;
    });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) => {
      const newExs = [...prev];
      if (newExs[exerciseIndex].sets.length > 1) {
        newExs[exerciseIndex].sets.splice(setIndex, 1);
      }
      return newExs;
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: number) => {
    setExercises((prev) => {
      const newExs = [...prev];
      newExs[exerciseIndex].sets[setIndex][field] = value;
      return newExs;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveWorkoutSession({ bodyWeight, exercises }, updateTemplate);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to save workout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!template) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link href="/" className="glass-button w-10 h-10 rounded-xl border-white/10">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-white uppercase tracking-wider">Session</h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Week {template.weekNumber} • Day {template.dayOfWeek}</p>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Body Weight Input */}
      <GlassCard className="flex items-center justify-between py-4">
        <span className="text-sm font-bold text-white uppercase tracking-widest">Body Weight</span>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={bodyWeight || ""}
            placeholder="0.0"
            onChange={(e) => setBodyWeight(Number(e.target.value))}
            className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-right font-bold text-orange-500 outline-none focus:border-orange-500/50 transition-colors"
          />
          <span className="text-xs font-bold text-white/40 uppercase">KG</span>
        </div>
      </GlassCard>

      {/* Exercises */}
      <div className="space-y-6">
        {exercises.map((ex, exIndex) => (
          <GlassCard key={ex.exerciseId} className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">{ex.name}</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Target: {ex.targetSets} Sets • {ex.targetReps} Reps</p>
              </div>
              {ex.pr && ex.pr > 0 && (
                <div className="flex items-center bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                  <Trophy className="w-3 h-3 text-orange-500 mr-1.5" />
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">PR: {ex.pr} KG</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">
                <div className="col-span-1">Set</div>
                <div className="col-span-5 text-center">Weight</div>
                <div className="col-span-5 text-center">Reps</div>
                <div className="col-span-1"></div>
              </div>

              {ex.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-12 gap-3 items-center group">
                  <div className="col-span-1 text-xs font-black text-white/40">{setIndex + 1}</div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(exIndex, setIndex, "weight", Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center font-bold text-white outline-none focus:bg-white/10 focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(exIndex, setIndex, "reps", Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center font-bold text-white outline-none focus:bg-white/10 focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeSet(exIndex, setIndex)}
                      className="p-2 text-white/20 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exIndex)}
              className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center text-[10px] font-black uppercase tracking-widest"
            >
              <Plus className="w-3 h-3 mr-2" /> Add Set
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 md:pl-24">
        <GlassCard className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-3 shadow-[0_-20px_40px_rgba(0,0,0,0.4)] border-white/10">
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => setUpdateTemplate(!updateTemplate)}
              className={cn(
                "w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                updateTemplate ? "bg-orange-500" : "bg-white/10 border border-white/10"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                updateTemplate ? "right-1" : "left-1"
              )} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Update Master Plan?</span>
              <span className="text-[8px] font-bold text-white/40 uppercase">Saves weights for next week</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "w-full md:w-auto px-10 py-4 md:py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center",
              showSuccess 
                ? "bg-emerald-500 text-white" 
                : "bg-orange-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : showSuccess ? (
              <><CheckCircle2 className="w-5 h-5 mr-2" /> Done!</>
            ) : (
              <><Save className="w-5 h-5 mr-2" /> Finish Workout</>
            )}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
