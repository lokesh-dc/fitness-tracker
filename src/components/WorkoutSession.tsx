"use client";

import { useState, useEffect } from "react";
import { saveWorkoutSession } from "@/app/actions/logs";
import { getHighestWeightPR } from "@/app/actions/analytics";
import { type Exercise, type WorkoutTemplate } from "@/types/workout";
import { Loader2, Plus, Trash2, Trophy, ChevronLeft, Save, CheckCircle2, ArrowRight, Edit2 } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import { cn } from "@/lib/utils";
import Link from "next/link";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface WorkoutSessionProps {
  template: WorkoutTemplate | null;
  initialBodyWeight?: number | null;
}

export default function WorkoutSession({ template, initialBodyWeight }: WorkoutSessionProps) {
  const [step, setStep] = useState<number>(initialBodyWeight && initialBodyWeight > 0 ? 2 : 1);
  const [exercises, setExercises] = useState<Exercise[]>(
    template?.exercises.map((ex) => ({
      ...ex,
      sets: [{ weight: ex.lastWeight || 0, reps: ex.targetReps }],
      pr: 0,
    })) || []
  );
  const [bodyWeight, setBodyWeight] = useState<number>(initialBodyWeight || 0);
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

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto space-y-8 pt-12">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="glass-button w-10 h-10 rounded-xl border-foreground/10">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-black text-foreground uppercase tracking-wider">
            Step 1: Body Weight
          </h1>
          <div className="w-10 h-10" />
        </div>

        <GlassCard className="p-8 space-y-8 flex flex-col items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-wider">Current Weight</h2>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Log today's body weight</p>
          </div>

          <div className="flex items-end justify-center space-x-2">
            <input
              type="number"
              value={bodyWeight || ""}
              placeholder="0.0"
              onChange={(e) => setBodyWeight(Number(e.target.value))}
              className="w-32 bg-transparent text-5xl text-center font-black text-orange-500 outline-none border-b-2 border-foreground/10 focus:border-orange-500 transition-colors pb-2"
              autoFocus
            />
            <span className="text-xl font-black text-foreground/20 uppercase mb-2">KG</span>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!bodyWeight || bodyWeight <= 0}
            className="w-full mt-8 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-orange-500 text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            Continue <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <Link href="/" className="glass-button w-10 h-10 rounded-xl border-foreground/10">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-foreground uppercase tracking-wider">
            {(template as any).splitName || "Session"}
          </h1>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Week {template.weekNumber} • {DAYS[template.dayOfWeek]}</p>
        </div>
        <div className="w-10 h-10" />
      </div>

      <GlassCard className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-foreground uppercase tracking-widest">Body Weight</span>
          <span className="text-lg font-black text-orange-500">{bodyWeight} <span className="text-xs text-foreground/40">KG</span></span>
        </div>
        <button
          onClick={() => setStep(1)}
          className="p-2 text-foreground/40 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-500/10 flex items-center space-x-2"
        >
          <Edit2 className="w-4 h-4" />
          <span className="text-[10px] items-center font-bold uppercase tracking-wider hidden sm:inline-block">Edit</span>
        </button>
      </GlassCard>

      <div className="space-y-6">
        {exercises.map((ex, exIndex) => (
          <GlassCard key={ex.exerciseId} className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-black text-foreground tracking-tight">{ex.name}</h2>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Target: {ex.targetSets} Sets • {ex.targetReps} Reps</p>
              </div>
              {ex.pr && ex.pr > 0 && (
                <div className="flex items-center bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                  <Trophy className="w-3 h-3 text-orange-500 mr-1.5" />
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">PR: {ex.pr} KG</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] px-2">
                <div className="col-span-1">Set</div>
                <div className="col-span-5 text-center">Weight</div>
                <div className="col-span-5 text-center">Reps</div>
                <div className="col-span-1"></div>
              </div>

              {ex.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-12 gap-3 items-center group">
                  <div className="col-span-1 text-xs font-black text-foreground/40">{setIndex + 1}</div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      value={set.weight || ""}
                      onChange={(e) => updateSet(exIndex, setIndex, "weight", Number(e.target.value))}
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-center font-bold text-foreground outline-none focus:bg-foreground/10 focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      value={set.reps || ""}
                      onChange={(e) => updateSet(exIndex, setIndex, "reps", Number(e.target.value))}
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-center font-bold text-foreground outline-none focus:bg-foreground/10 focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeSet(exIndex, setIndex)}
                      className="p-2 text-foreground/20 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exIndex)}
              className="w-full py-3 rounded-xl border border-dashed border-foreground/10 text-foreground/40 hover:text-foreground hover:bg-foreground/5 hover:border-foreground/20 transition-all flex items-center justify-center text-[10px] font-black uppercase tracking-widest"
            >
              <Plus className="w-3 h-3 mr-2" /> Add Set
            </button>
          </GlassCard>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 md:pl-32">
        <GlassCard className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 md:py-3 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-foreground/10">
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => setUpdateTemplate(!updateTemplate)}
              className={cn(
                "w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-300",
                updateTemplate ? "bg-orange-500" : "bg-foreground/10 border border-foreground/10"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                updateTemplate ? "right-1" : "left-1"
              )} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-foreground uppercase tracking-wider">Update Master Plan?</span>
              <span className="text-[8px] font-bold text-foreground/40 uppercase">Saves weights for next week</span>
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
