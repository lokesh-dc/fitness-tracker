"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trophy, Flame, Dumbbell, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface FirstWorkoutSummaryProps {
  stats: {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    durationSeconds: number;
  };
  trainedMuscles?: string[];
  onClose: () => void;
}

export function FirstWorkoutSummary({
  stats,
  trainedMuscles = [],
  onClose,
}: FirstWorkoutSummaryProps) {
  const durationMinutes = Math.max(1, Math.round(stats.durationSeconds / 60));
  const estimatedCalories = Math.round(durationMinutes * 6.5 + stats.totalVolume * 0.015);

  const displayMuscles =
    trainedMuscles.length > 0
      ? Array.from(new Set(trainedMuscles))
      : ["Target Muscle Groups"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-md p-6 sm:p-8 space-y-6 border-brand-primary/40 bg-background/90 shadow-[0_25px_70px_rgba(0,0,0,0.7)] text-center">
        {/* Celebration Trophy Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.35)]">
          <Trophy className="w-10 h-10 text-brand-primary animate-bounce" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
            <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
            First Workout Complete
          </p>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
            You&apos;re Officially Rolling!
          </h2>
          <p className="text-xs text-foreground/60 font-medium">
            Your first session is logged to your profile. Here is how you performed today:
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/5">
            <div className="flex items-center justify-center gap-1 text-foreground/40 mb-1">
              <Dumbbell className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[9px] font-black uppercase tracking-wider">Volume</span>
            </div>
            <p className="text-base sm:text-lg font-black text-foreground tabular-nums">
              {stats.totalVolume.toLocaleString()}
            </p>
            <span className="text-[9px] font-bold text-foreground/40 uppercase">KG</span>
          </div>

          <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/5">
            <div className="flex items-center justify-center gap-1 text-foreground/40 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">Sets</span>
            </div>
            <p className="text-base sm:text-lg font-black text-foreground tabular-nums">
              {stats.totalSets}
            </p>
            <span className="text-[9px] font-bold text-foreground/40 uppercase">Done</span>
          </div>

          <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/5">
            <div className="flex items-center justify-center gap-1 text-foreground/40 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[9px] font-black uppercase tracking-wider">Calories</span>
            </div>
            <p className="text-base sm:text-lg font-black text-foreground tabular-nums">
              ~{estimatedCalories}
            </p>
            <span className="text-[9px] font-bold text-foreground/40 uppercase">KCAL</span>
          </div>
        </div>

        {/* Muscle Recovery Heatmap Teaser Card */}
        <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 text-left space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-primary/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                Muscle Recovery Heatmap
              </p>
              <p className="text-xs font-bold text-foreground">
                {displayMuscles.slice(0, 3).join(", ")} now recovering
              </p>
            </div>
          </div>
          <p className="text-[11px] text-foreground/60 leading-relaxed font-medium">
            Your recovery heatmap on the Dashboard updates dynamically as your muscles rebuild over the next 48 hours.
          </p>
        </div>

        {/* Finish CTA */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="w-full bg-brand-primary text-black py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.35)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 text-black" />
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

