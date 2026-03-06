"use client";

import { useState, useEffect } from "react";
import { saveWorkoutSession, getHighestWeightPR, type Exercise, type WorkoutTemplate } from "@/app/actions/workout";
import { Loader2, Plus, Trash2, Trophy } from "lucide-react";

interface WorkoutSessionProps {
  userId: string;
  template: WorkoutTemplate | null;
}

export default function WorkoutSession({ userId, template }: WorkoutSessionProps) {
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

  useEffect(() => {
    // Fetch PRs for each exercise
    if (template) {
      template.exercises.forEach(async (ex, index) => {
        const pr = await getHighestWeightPR(userId, ex.name);
        setExercises((prev) => {
          const newExs = [...prev];
          newExs[index] = { ...newExs[index], pr };
          return newExs;
        });
      });
    }
  }, [template, userId]);

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
      newExs[exerciseIndex].sets.splice(setIndex, 1);
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
      await saveWorkoutSession(userId, { bodyWeight, exercises }, updateTemplate);
      alert("Workout saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save workout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!template) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">No plan found for today.</h2>
        <p className="text-gray-500">Go to settings to create a 12-week master plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      <header className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Today&apos;s Workout</h1>
          <p className="text-gray-500">Week {template.weekNumber} • Day {template.dayOfWeek}</p>
        </div>
        <div className="text-right">
          <label className="block text-sm font-medium text-gray-700">Body Weight (kg)</label>
          <input
            type="number"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1 text-right"
          />
        </div>
      </header>

      <div className="space-y-6">
        {exercises.map((ex, exIndex) => (
          <div key={ex.exerciseId} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{ex.name}</h2>
              {ex.pr && ex.pr > 0 && (
                <div className="flex items-center text-amber-600 text-sm font-medium">
                  <Trophy className="w-4 h-4 mr-1" />
                  PR: {ex.pr} kg
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 px-2 uppercase tracking-wider">
                <div className="col-span-1">SET</div>
                <div className="col-span-5">WEIGHT (KG)</div>
                <div className="col-span-5">REPS</div>
                <div className="col-span-1"></div>
              </div>

              {ex.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center font-medium">{setIndex + 1}</div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, "weight", Number(e.target.value))}
                      className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, "reps", Number(e.target.value))}
                      className="w-full border rounded px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => removeSet(exIndex, setIndex)}
                      className="p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exIndex)}
              className="mt-4 flex items-center text-sm text-blue-600 font-medium hover:underline"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Set
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            id="update-template"
            type="checkbox"
            checked={updateTemplate}
            onChange={(e) => setUpdateTemplate(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="update-template" className="text-sm font-medium text-blue-900">
            Update Master Plan permanently?
          </label>
        </div>
        <p className="text-xs text-blue-700 max-w-[200px] text-right">
          Saves today&apos;s weights as the target for future sessions.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400 flex justify-center items-center transition-colors"
      >
        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "FINISH WORKOUT"}
      </button>
    </div>
  );
}
