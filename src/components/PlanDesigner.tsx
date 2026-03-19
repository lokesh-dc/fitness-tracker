"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Trash2, ChevronLeft, Dumbbell, Loader2, CheckCircle2, Search, X, Calendar, Settings2, Info, Check } from "lucide-react";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { savePlanTemplates } from "@/app/actions/plan";
import { getExerciseHistory } from "@/app/actions/analytics";
import { Exercise, ExerciseDefinition } from "@/types/workout";
import { MuscleGroup } from "@/lib/exercises";
import { PlanDocument, WorkoutTemplate } from "@/types/workout";
import { addCustomExercise } from "@/app/actions/exercises";
import { WarmupSetsPanel } from "./WarmupSetsPanel";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type SetupStep = "config" | "days" | "exercises";

export function PlanDesigner({ initialData, editPlanId, initialExercises = [] }: { initialData?: { plan: PlanDocument; templates: WorkoutTemplate[] } | null, editPlanId?: string, initialExercises?: ExerciseDefinition[] }) {
  const router = useRouter();

  const [step, setStep] = useState<SetupStep>(editPlanId && initialData ? "days" : "config");
  const [startDate, setStartDate] = useState(initialData?.plan?.startDate || new Date().toISOString().split("T")[0]);
  const [numWeeks, setNumWeeks] = useState(initialData?.plan?.numWeeks || 4);
  const [trainingDays, setTrainingDays] = useState<number[]>(() => {
    if (initialData?.templates) {
      const days = initialData.templates
        .filter(t => t.weekNumber === 1 && t.exercises.length > 0)
        .map(t => t.dayOfWeek);
      if (days.length > 0) return Array.from(new Set(days)).sort();
    }
    return [1, 2, 3, 5, 6]; // Default Mon, Tue, Wed, Fri, Sat
  });
  
  const [currentDay, setCurrentDay] = useState(1);
  
  const [isSaving, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [exerciseModalStep, setExerciseModalStep] = useState<"muscles" | "exercises">("muscles");
  const [searchQuery, setSearchQuery] = useState("");
  const [customExerciseInput, setCustomExerciseInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null);

  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [draftSelectedExercises, setDraftSelectedExercises] = useState<string[]>([]);
  const [availableExercises, setAvailableExercises] = useState<ExerciseDefinition[]>(initialExercises);

  const availableMuscleGroups = Array.from(new Set(availableExercises.map(e => e.muscleGroup))).sort();

  const [masterWeekData, setMasterWeekData] = useState<Record<number, { splitName: string; exercises: Exercise[] }>>(() => {
    const defaultData = DAYS.reduce((acc, _, i) => ({
      ...acc,
      [i]: { splitName: "", exercises: [] }
    }), {} as Record<number, { splitName: string; exercises: Exercise[] }>);

    if (initialData?.templates) {
      const baseTemplates = initialData.templates.filter(t => t.weekNumber === 1);
      baseTemplates.forEach((dayTemplate) => {
        if (dayTemplate.exercises.length > 0) {
          defaultData[dayTemplate.dayOfWeek] = {
            splitName: dayTemplate.splitName || "",
            exercises: dayTemplate.exercises
          };
        }
      });
    }
    return defaultData;
  });

  const currentDayData = masterWeekData[currentDay];

  const toggleDay = (idx: number) => {
    setTrainingDays(prev => 
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx].sort()
    );
  };

  const updateDayData = (idx: number, newData: Partial<{ splitName: string; exercises: Exercise[] }>) => {
    setMasterWeekData(prev => ({
      ...prev,
      [idx]: { ...prev[idx], ...newData }
    }));
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const toggleExerciseSelection = (exerciseName: string) => {
    setDraftSelectedExercises(prev => 
      prev.includes(exerciseName) ? prev.filter(e => e !== exerciseName) : [...prev, exerciseName]
    );
  };

  const handleAddSelected = async () => {
    if (draftSelectedExercises.length === 0) return;
    
    setLoadingHistory("multiple");
    try {
      const newExercises: Exercise[] = [];
      
      for (const exerciseName of draftSelectedExercises) {
        const history = await getExerciseHistory(exerciseName);
        newExercises.push({
          exerciseId: Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
          name: exerciseName,
          targetSets: history?.suggestedSets || 3,
          targetReps: history?.suggestedReps || 10,
          lastWeight: history?.pr || history?.lastWeight || 0,
          pr: history?.pr || 0,
          unit: availableExercises.find(e => e.name === exerciseName)?.unit || 'reps',
          restDuration: 90, // Default to 90s
          sets: []
        });
      }

      updateDayData(currentDay, { 
        exercises: [...currentDayData.exercises, ...newExercises] 
      });
      closeExerciseSelector();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(null);
    }
  };

  const closeExerciseSelector = () => {
    setShowExerciseSelector(false);
    setExerciseModalStep("muscles");
    setSearchQuery("");
    setCustomExerciseInput("");
    setDraftSelectedExercises([]);
    setSelectedMuscles([]);
  };

  const handleAddCustomExercise = async () => {
    if (!customExerciseInput.trim()) return;
    
    // We need a muscle group and unit. 
    // If they have selected exactly 1 muscle group, use that, else default to "Other" or first selected
    const muscleGroupToUse = selectedMuscles.length === 1 ? selectedMuscles[0] : (selectedMuscles[0] || "Other");
    
    setLoadingHistory("custom"); // reuse loading state
    const result = await addCustomExercise({
      name: customExerciseInput.trim(),
      muscleGroup: muscleGroupToUse,
      unit: "reps" // default to reps for simple custom adds
    });
    
    setLoadingHistory(null);

    // If successfully added to db, add to available memory list
    if (result && !availableExercises.some(e => e.name.toLowerCase() === result.name.toLowerCase())) {
        setAvailableExercises(prev => [...prev, result]);
    }
    
    const finalName = result?.name || customExerciseInput.trim();
    setDraftSelectedExercises(prev => [...prev, finalName]);
    setCustomExerciseInput("");
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const allTemplates: Partial<WorkoutTemplate>[] = [];
      
      // We only send Week 1 templates because the current UI only supports a repeating master week.
      // The backend uses weekNumber: 1 as the source of truth for all weeks in the plan.
      for (let d = 0; d < 7; d++) {
        const isTraining = trainingDays.includes(d);
        const dayData = masterWeekData[d];
        
        allTemplates.push({
          weekNumber: 1,
          dayOfWeek: d,
          splitName: isTraining ? ((dayData as any).splitName || "Workout") : "Rest Day",
          exercises: isTraining ? dayData.exercises : []
        });
      }
      
      await savePlanTemplates({ startDate, numWeeks, planId: editPlanId || undefined }, allTemplates);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push(editPlanId ? `/plan/${editPlanId}` : "/plan");
      }, 2000);
    } catch (error) {
      alert("Failed to save plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Step Header */}
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Step {step === "config" ? "1" : step === "days" ? "2" : "3"} of 3</p>
      </div>

      {/* Step 1: Configuration */}
      {step === "config" && (
        <GlassCard className="space-y-12 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="max-w-xs mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">When do we start?</h2>
            </div>
            
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-5 text-center font-black text-xl text-foreground outline-none focus:border-orange-500 transition-colors"
            />

            <hr className="border-foreground/10" />

            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">How many weeks?</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-6">
                <button 
                  onClick={() => setNumWeeks(prev => Math.max(1, prev - 1))}
                  className="glass-button w-12 h-12 rounded-xl text-2xl font-bold"
                >-</button>
                <div className="text-5xl font-black text-orange-500 tabular-nums">{numWeeks}</div>
                <button 
                  onClick={() => setNumWeeks(prev => Math.min(12, prev + 1))}
                  className="glass-button w-12 h-12 rounded-xl text-2xl font-bold"
                >+</button>
              </div>
              <input 
                type="range" min="1" max="12" value={numWeeks} 
                onChange={(e) => setNumWeeks(parseInt(e.target.value))}
                className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <button 
              onClick={() => {
                if (!startDate) return alert("Please select a date.");
                setStep("days");
              }}
              className="w-full bg-orange-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all mt-8"
            >
              Continue to Days
            </button>
          </div>
        </GlassCard>
      )}

      {/* Step 2: Days */}
      {step === "days" && (
        <GlassCard className="space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings2 className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Weekly Split</h2>
            <p className="text-sm text-foreground/40 font-medium">Select your training days and rest days.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
            {DAYS.map((day, idx) => (
              <div 
                key={day}
                onClick={() => toggleDay(idx)}
                className={cn(
                  "p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group",
                  trainingDays.includes(idx) 
                    ? "border-orange-500 bg-orange-500/5" 
                    : "border-foreground/5 bg-foreground/5 opacity-50"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs uppercase",
                    trainingDays.includes(idx) ? "bg-orange-500 text-black" : "bg-foreground/10 text-foreground/40"
                  )}>
                    {day.substring(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{day}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-orange-500/60">
                      {trainingDays.includes(idx) ? "Gym Day" : "Rest Day"}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  trainingDays.includes(idx) ? "border-orange-500 bg-orange-500" : "border-foreground/20"
                )}>
                  {trainingDays.includes(idx) && <CheckCircle2 className="w-4 h-4 text-black" />}
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto flex space-x-4">
            <button 
              onClick={() => setStep("config")}
              className="flex-1 glass-button py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em]"
            >Back</button>
            <button 
              onClick={() => {
                if (trainingDays.length === 0) return alert("Please select at least one training day.");
                setStep("exercises");
                setCurrentDay(trainingDays[0]);
              }}
              className="flex-[2] bg-orange-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Set Exercises
            </button>
          </div>
        </GlassCard>
      )}

      {/* Step 3: Exercises */}
      {step === "exercises" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Day Navigator */}
          <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
            {DAYS.map((day, idx) => (
              <button
                key={day}
                disabled={!trainingDays.includes(idx)}
                onClick={() => setCurrentDay(idx)}
                className={cn(
                  "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border min-w-[120px] flex flex-col items-center",
                  !trainingDays.includes(idx) && "opacity-20 grayscale cursor-not-allowed",
                  currentDay === idx 
                    ? "bg-foreground text-background border-foreground shadow-lg" 
                    : "bg-foreground/5 text-foreground/40 border-foreground/10"
                )}
              >
                {day}
                <span className="text-[8px] mt-1 opacity-60">
                  {masterWeekData[idx].exercises.length} Exercises
                </span>
              </button>
            ))}
          </div>

          {/* Split Name Editor */}
          <GlassCard className="space-y-1">
            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Split Name for {DAYS[currentDay]}</label>
            <input
              value={currentDayData.splitName}
              onChange={(e) => updateDayData(currentDay, { splitName: e.target.value })}
              placeholder="e.g. Upper Body, Pull, Heavy Squat Day..."
              className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-bold outline-none focus:border-orange-500 transition-colors"
            />
          </GlassCard>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.2em]">Workout List</h3>
              <button 
                onClick={() => setShowExerciseSelector(true)}
                className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center hover:underline bg-orange-500/10 px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Exercise
              </button>
            </div>

            {currentDayData.exercises.length === 0 ? (
              <div className="glass-card border-dashed border-foreground/10 flex flex-col items-center justify-center py-20 text-center opacity-40">
                <Dumbbell className="w-12 h-12 mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">No exercises added yet</p>
              </div>
            ) : (
              currentDayData.exercises.map((ex, idx) => (
                <GlassCard key={ex.exerciseId} className="space-y-4 relative border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-black text-foreground uppercase tracking-tight">{ex.name}</h4>
                        <div className="flex items-center space-x-2 text-[8px] font-black uppercase text-foreground/40">
                          <span className="flex items-center"><Info className="w-2 h-2 mr-1" /> Best: {ex.pr || 0}kg</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const newExs = currentDayData.exercises.filter((_, i) => i !== idx);
                        updateDayData(currentDay, { exercises: newExs });
                      }}
                      className="p-2 text-foreground/20 hover:text-rose-500"
                    ><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-foreground/40 uppercase text-center block">Sets</label>
                      <input 
                        type="number" value={ex.targetSets} 
                        onChange={(e) => {
                          const newExs = [...currentDayData.exercises];
                          newExs[idx].targetSets = parseInt(e.target.value);
                          updateDayData(currentDay, { exercises: newExs });
                        }}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 text-center font-bold text-foreground outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-foreground/40 uppercase text-center block">Reps</label>
                      <input 
                        type="number" value={ex.targetReps} 
                        onChange={(e) => {
                          const newExs = [...currentDayData.exercises];
                          newExs[idx].targetReps = parseInt(e.target.value);
                          updateDayData(currentDay, { exercises: newExs });
                        }}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 text-center font-bold text-foreground outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-orange-500/60 uppercase text-center block">Target Weight</label>
                      <input 
                        type="number" value={ex.lastWeight} 
                        onChange={(e) => {
                          const newExs = [...currentDayData.exercises];
                          newExs[idx].lastWeight = parseInt(e.target.value);
                          updateDayData(currentDay, { exercises: newExs });
                        }}
                        className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-3 text-center font-bold text-orange-500 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  {/* Rest Duration Selector */}
                  <div className="pt-2 border-t border-foreground/5">
                    <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest ml-1 mb-2 block">Rest Duration</label>
                    <div className="flex flex-wrap gap-2">
                      {[60, 90, 120, 180].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            const newExs = [...currentDayData.exercises];
                            newExs[idx].restDuration = time;
                            updateDayData(currentDay, { exercises: newExs });
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                            ex.restDuration === time 
                              ? "bg-orange-500 border-orange-500 text-black" 
                              : "border-foreground/10 text-foreground/40 hover:border-foreground/20"
                          )}
                        >
                          {time < 60 ? `${time}s` : time % 60 === 0 ? `${time/60}m` : `${time}s`}
                        </button>
                      ))}
                      <div className="flex items-center bg-foreground/5 border border-foreground/10 rounded-lg px-2 py-1.5 ml-auto">
                        <input 
                          type="number"
                          placeholder="Custom..."
                          value={ex.restDuration || ""}
                          onChange={(e) => {
                            const newExs = [...currentDayData.exercises];
                            newExs[idx].restDuration = parseInt(e.target.value) || 0;
                            updateDayData(currentDay, { exercises: newExs });
                          }}
                          className="w-12 bg-transparent text-center font-bold text-[10px] outline-none placeholder:font-normal"
                        />
                        <span className="text-[8px] font-black text-foreground/20 uppercase ml-1">Secs</span>
                      </div>
                    </div>
                  </div>

                  <WarmupSetsPanel 
                    workingWeight={ex.lastWeight}
                    repsField={ex.targetReps}
                    mode="PLAN_DESIGNER"
                  />
                </GlassCard>
              ))
            )}
          </div>

          {/* Nav Buttons */}
          <div className="flex space-x-4">
            <button onClick={() => setStep("days")} className="flex-1 glass-button py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">Back to Days</button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex-[2] bg-orange-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : showSuccess ? <CheckCircle2 className="w-5 h-5" /> : "Finalize Plan"}
            </button>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeExerciseSelector} />
          <GlassCard className="w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col relative z-[101] border-orange-500/20 p-0">
            {/* Header */}
            <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-background/50 backdrop-blur-md z-10 sticky top-0">
              <div className="flex items-center space-x-3">
                {exerciseModalStep === "exercises" && (
                  <button onClick={() => setExerciseModalStep("muscles")} className="p-2 hover:bg-foreground/5 rounded-full -ml-2">
                    <ChevronLeft className="w-5 h-5 text-foreground/60 hover:text-foreground" />
                  </button>
                )}
                <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
                  {exerciseModalStep === "muscles" ? "Target Muscles" : "Select Exercises"}
                </h2>
              </div>
              <button onClick={closeExerciseSelector} className="p-2 hover:bg-foreground/5 rounded-full -mr-2"><X className="w-5 h-5" /></button>
            </div>

            {/* Step 1: Muscle Selection */}
            {exerciseModalStep === "muscles" && (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
                <p className="text-sm font-bold text-foreground/40 text-center mb-8 uppercase tracking-widest">
                  Which muscle groups are you training today?
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {availableMuscleGroups.map((muscle) => {
                    const isSelected = selectedMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        onClick={() => toggleMuscle(muscle)}
                        className={cn(
                          "py-5 px-4 rounded-2xl font-black text-sm uppercase tracking-wide border-2 transition-all group flex items-center justify-between",
                          isSelected 
                            ? "bg-orange-500/10 border-orange-500 text-orange-500" 
                            : "bg-foreground/5 border-foreground/5 text-foreground/60 hover:border-foreground/20 hover:text-foreground hover:bg-foreground/10"
                        )}
                      >
                        {muscle}
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected ? "border-orange-500 bg-orange-500" : "border-foreground/20 group-hover:border-foreground/40"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-auto pt-6 border-t border-foreground/10">
                  <button
                    onClick={() => {
                      if (selectedMuscles.length === 0) return alert("Select at least one muscle group to continue!");
                      setExerciseModalStep("exercises");
                    }}
                    disabled={selectedMuscles.length === 0}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                      selectedMuscles.length > 0
                        ? "bg-orange-500 text-black shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95"
                        : "bg-foreground/10 text-foreground/40 cursor-not-allowed"
                    )}
                  >
                    Next: Choose Exercises
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Exercise Selection */}
            {exerciseModalStep === "exercises" && (
              <>
                <div className="p-6 pb-2 space-y-4">
                  {/* Custom Exercise Input */}
                  <div className="flex items-center space-x-2">
                    <input 
                      placeholder="Add a custom exercise..."
                      value={customExerciseInput}
                      onChange={(e) => setCustomExerciseInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomExercise()}
                      className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground font-bold outline-none focus:border-orange-500 placeholder:font-medium placeholder:opacity-50"
                    />
                    <button 
                      onClick={handleAddCustomExercise}
                      disabled={!customExerciseInput.trim() || loadingHistory === "custom"}
                      className="bg-foreground/10 text-foreground py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-black hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all disabled:opacity-30 disabled:hover:bg-foreground/10 disabled:hover:text-foreground disabled:hover:shadow-none min-w-[100px] flex justify-center items-center"
                    >
                      {loadingHistory === "custom" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Custom"}
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input 
                      placeholder="Search for exercises..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-xl pl-11 pr-4 py-3 text-sm text-foreground outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6 custom-scrollbar">
                  {availableMuscleGroups.map(group => {
                    if (!selectedMuscles.includes(group)) return null;

                    const groupExercises = availableExercises.filter(e => e.muscleGroup === group);
                    const filtered = groupExercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
                    if (filtered.length === 0) return null;
                    
                    return (
                      <div key={group} className="space-y-3">
                        <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] ml-1">{group}</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {filtered.map(ex => {
                            const isSelected = draftSelectedExercises.includes(ex.name);
                            return (
                              <button
                                key={ex.name}
                                onClick={() => toggleExerciseSelection(ex.name)}
                                className={cn(
                                  "w-full text-left px-5 py-4 rounded-2xl border transition-all flex justify-between items-center group",
                                  isSelected
                                    ? "bg-orange-500/10 border-orange-500"
                                    : "bg-foreground/5 border-foreground/10 hover:border-orange-500 hover:bg-orange-500/5 text-foreground/80"
                                )}
                              >
                                  <span className={cn("font-bold", isSelected ? "text-orange-500" : "group-hover:text-foreground")}>
                                    {ex.name}
                                    {ex.isCustom && <span className="ml-2 px-2 py-0.5 rounded-md bg-orange-500/10 text-[8px] uppercase tracking-wider text-orange-500 border border-orange-500/20">Custom</span>}
                                  </span>
                                <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all",
                                  isSelected ? "border-orange-500 bg-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.5)]" : "border-foreground/20 text-transparent group-hover:border-orange-500"
                                )}>
                                  <Check className={cn("w-3 h-3 transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty state when rendering exclusively selected muscles that don't match query */}
                  {selectedMuscles.length > 0 && selectedMuscles.every(muscle => 
                    availableExercises.filter(ex => ex.muscleGroup === muscle && ex.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0
                  ) && (
                    <div className="py-12 text-center text-foreground/40">
                      <p className="text-sm font-bold">No exercises found for your search.</p>
                      <p className="text-[10px] uppercase tracking-wider mt-2">Try using the Custom Exercise input above.</p>
                    </div>
                  )}
                </div>

                {/* Add Action Footer */}
                <div className={cn(
                  "p-6 border-t border-foreground/10 bg-background/95 backdrop-blur-md transition-all duration-300",
                  draftSelectedExercises.length > 0 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 hidden"
                )}>
                  <button
                    onClick={handleAddSelected}
                    disabled={loadingHistory === "multiple"}
                    className="w-full bg-orange-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                  >
                    {loadingHistory === "multiple" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Add {draftSelectedExercises.length} Exercise{draftSelectedExercises.length !== 1 ? 's' : ''}</>
                    )}
                  </button>
                </div>
              </>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
