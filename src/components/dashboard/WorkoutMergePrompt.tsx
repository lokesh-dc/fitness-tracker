"use client";

import { useState } from "react";
import { Zap, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRouter } from "next/navigation";

interface WorkoutMergePromptProps {
  yesterdaySplitName: string;
  yesterdayExerciseCount: number;
}

export function WorkoutMergePrompt({
  yesterdaySplitName,
  yesterdayExerciseCount,
}: WorkoutMergePromptProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleMerge = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/workout/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "AI merge failed. Try doing today's workout normally.");
        setIsLoading(false);
        return;
      }

      router.push(`/workout?mode=LIVE_SESSION&mergedId=${data.mergedId}`);
    } catch {
      setError("Network error. Try doing today's workout normally.");
      setIsLoading(false);
    }
  };

  return (
    <section>
      <GlassCard className="relative overflow-hidden p-5 border-brand-primary/30 bg-gradient-to-br from-brand-primary/10 via-brand-primary/5 to-transparent">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Zap className="w-14 h-14 text-brand-primary rotate-12" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-primary" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">
              Catch-Up Mode
            </h3>
          </div>

          <p className="text-sm font-bold text-foreground mb-1">
            Missed <span className="text-brand-primary">{yesterdaySplitName}</span>?
          </p>
          <p className="text-xs text-foreground/50 mb-4">
            AI will merge it with today&apos;s workout into one smart session
            <span className="text-foreground/30 ml-1">
              ({yesterdayExerciseCount} exercises from yesterday)
            </span>
          </p>

          {error && (
            <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Merging with AI...
              </>
            ) : (
              <>
                Merge & Start
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </GlassCard>
    </section>
  );
}
