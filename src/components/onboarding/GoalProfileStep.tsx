"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Equipment, ExperienceLevel, Goal } from "@/types/workout";
import { FirstSessionGoalProfile } from "@/types/onboarding";
import { Dumbbell, Flame, Activity, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalProfileStepProps {
  initialProfile: Partial<FirstSessionGoalProfile>;
  onSubmit: (profile: FirstSessionGoalProfile) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

const GOALS: { value: Goal; label: string; desc: string; icon: typeof Dumbbell }[] = [
  { value: "strength", label: "Strength", desc: "Build maximum raw power & lift heavier", icon: Dumbbell },
  { value: "hypertrophy", label: "Hypertrophy", desc: "Gain muscle size & physical definition", icon: Flame },
  { value: "endurance", label: "Endurance", desc: "Boost stamina, work capacity & fitness", icon: Activity },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", desc: "< 1 year of consistent lifting" },
  { value: "intermediate", label: "Intermediate", desc: "1 - 3 years of structured training" },
  { value: "advanced", label: "Advanced", desc: "3+ years of dedicated progression" },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "Barbell & Plates" },
  { value: "dumbbell", label: "Dumbbells" },
  { value: "cables", label: "Cable Machine" },
  { value: "machines", label: "Weight Machines" },
  { value: "bodyweight", label: "Bodyweight Only" },
  { value: "kettlebell", label: "Kettlebells" },
  { value: "bands", label: "Resistance Bands" },
];

export function GoalProfileStep({
  initialProfile,
  onSubmit,
  onSkip,
  isSubmitting = false,
}: GoalProfileStepProps) {
  const [goal, setGoal] = React.useState<Goal>(initialProfile.goal || "hypertrophy");
  const [experienceLevel, setExperienceLevel] = React.useState<ExperienceLevel>(
    initialProfile.experienceLevel || "beginner"
  );
  const [daysPerWeek, setDaysPerWeek] = React.useState<number>(
    Math.min(6, Math.max(2, initialProfile.daysPerWeek || 3))
  );
  const [equipment, setEquipment] = React.useState<Equipment[]>(
    initialProfile.equipment && initialProfile.equipment.length > 0
      ? initialProfile.equipment
      : ["barbell", "dumbbell", "cables", "machines", "bodyweight"]
  );

  const toggleEquipment = (eq: Equipment) => {
    setEquipment((prev) =>
      prev.includes(eq)
        ? prev.length > 1
          ? prev.filter((item) => item !== eq)
          : prev
        : [...prev, eq]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equipment.length === 0) return;
    onSubmit({
      goal,
      experienceLevel,
      daysPerWeek,
      equipment,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1 Card: Goal */}
      <GlassCard className="p-5 sm:p-7 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">
            1. Primary Fitness Goal
          </h2>
          <p className="text-xs text-foreground/40 font-medium mt-0.5">
            What do you want this starter routine to prioritize?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {GOALS.map((item) => {
            const Icon = item.icon;
            const isSelected = goal === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setGoal(item.value)}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[96px]",
                  isSelected
                    ? "border-brand-primary bg-brand-primary/10 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                    : "border-foreground/5 bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.04]"
                )}>
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-brand-primary text-black"
                        : "bg-foreground/5 text-foreground/50"
                    )}>
                    <Icon className="w-4 h-4" />
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-black stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-black text-sm text-foreground mt-2">{item.label}</p>
                  <p className="text-[11px] text-foreground/40 font-medium leading-tight mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Step 2 Card: Experience Level */}
      <GlassCard className="p-5 sm:p-7 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">
            2. Lifting Experience
          </h2>
          <p className="text-xs text-foreground/40 font-medium mt-0.5">
            Helps calibrate volume, progression, and exercise selection
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {EXPERIENCE_LEVELS.map((item) => {
            const isSelected = experienceLevel === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setExperienceLevel(item.value)}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[84px]",
                  isSelected
                    ? "border-brand-primary bg-brand-primary/10"
                    : "border-foreground/5 bg-foreground/[0.02] hover:border-foreground/20 hover:bg-foreground/[0.04]"
                )}>
                <div className="flex items-center justify-between w-full">
                  <p className="font-black text-sm text-foreground">{item.label}</p>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-foreground/40 font-medium leading-tight mt-1">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Step 3 Card: Training Days Per Week (2-6) */}
      <GlassCard className="p-5 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">
              3. Weekly Training Days
            </h2>
            <p className="text-xs text-foreground/40 font-medium mt-0.5">
              How many days per week can you hit the gym?
            </p>
          </div>
          <span className="text-2xl font-black text-brand-primary tabular-nums">
            {daysPerWeek} <span className="text-xs uppercase text-foreground/40 font-bold">days</span>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[2, 3, 4, 5, 6].map((num) => {
            const isSelected = daysPerWeek === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setDaysPerWeek(num)}
                className={cn(
                  "py-3 rounded-xl border-2 text-center transition-all font-black text-base tabular-nums",
                  isSelected
                    ? "border-brand-primary bg-brand-primary text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                    : "border-foreground/5 bg-foreground/5 text-foreground/60 hover:border-foreground/20"
                )}>
                {num}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Step 4 Card: Available Equipment */}
      <GlassCard className="p-5 sm:p-7 space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">
            4. Available Equipment
          </h2>
          <p className="text-xs text-foreground/40 font-medium mt-0.5">
            Select all gear you have access to
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EQUIPMENT_OPTIONS.map((item) => {
            const isSelected = equipment.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleEquipment(item.value)}
                className={cn(
                  "px-3.5 py-3 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                  isSelected
                    ? "border-brand-primary bg-brand-primary/10 text-foreground"
                    : "border-foreground/5 bg-foreground/[0.02] text-foreground/50 hover:border-foreground/20"
                )}>
                <span className="text-xs font-bold">{item.label}</span>
                <span
                  className={cn(
                    "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                    isSelected
                      ? "border-brand-primary bg-brand-primary text-black"
                      : "border-foreground/20 bg-foreground/5"
                  )}>
                  {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="w-full sm:w-auto order-2 sm:order-1 glass-button py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all">
          Skip for now
        </button>

        <button
          type="submit"
          disabled={isSubmitting || equipment.length === 0}
          className="w-full sm:flex-1 order-1 sm:order-2 bg-brand-primary text-black py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50">
          <Sparkles className="w-4 h-4 text-black" />
          Generate My Starter Program
        </button>
      </div>
    </form>
  );
}
