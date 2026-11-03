"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, AlertTriangle, RefreshCw, Play } from "lucide-react";

interface GeneratingPlanStateProps {
  error?: string | null;
  onRetry: () => void;
  onStartEmptySession: () => void;
  onBackToProfile?: () => void;
}

export function GeneratingPlanState({
  error,
  onRetry,
  onStartEmptySession,
  onBackToProfile,
}: GeneratingPlanStateProps) {
  if (error) {
    return (
      <GlassCard className="p-6 sm:p-8 space-y-6 text-center border-rose-500/30 bg-rose-500/5">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
            Generation Stalled
          </h2>
          <p className="text-xs text-foreground/60 leading-relaxed font-medium">
            {error || "We couldn't generate your starter routine right now. You can retry or jump straight into an open gym session."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto flex-1 bg-brand-primary text-black py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>

          <button
            type="button"
            onClick={onStartEmptySession}
            className="w-full sm:w-auto flex-1 glass-button py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-widest text-foreground/80 hover:text-foreground flex items-center justify-center gap-2 transition-all">
            <Play className="w-3.5 h-3.5 text-brand-primary" />
            Start Empty Session
          </button>
        </div>

        {onBackToProfile && (
          <button
            type="button"
            onClick={onBackToProfile}
            className="text-[11px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground/70 transition-colors">
            Edit Goal Profile
          </button>
        )}
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <GlassCard className="p-5 flex items-center gap-4 border-brand-primary/20 bg-brand-primary/[0.03]">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-brand-primary animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-brand-primary">
            AI Coach Active
          </p>
          <p className="text-xs text-foreground/60 font-medium">
            Structuring workout days, selecting exercises, and calculating rest periods...
          </p>
        </div>
      </GlassCard>

      {/* Skeleton Day Cards */}
      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <GlassCard key={idx} className="p-5 space-y-4 animate-pulse border-foreground/5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-foreground/10 rounded-md" />
                <div className="h-3 w-48 bg-foreground/5 rounded-md" />
              </div>
              <div className="h-6 w-16 bg-foreground/10 rounded-full" />
            </div>

            <div className="space-y-2 pt-1">
              {[1, 2, 3, 4].map((exIdx) => (
                <div
                  key={exIdx}
                  className="flex items-center justify-between p-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-primary/40" />
                    <div className="h-3.5 w-28 bg-foreground/10 rounded" />
                  </div>
                  <div className="h-3 w-20 bg-foreground/5 rounded" />
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

