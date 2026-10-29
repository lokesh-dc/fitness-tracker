"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { clearOnboardingSkip } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";

export function StartFirstSessionCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await clearOnboardingSkip();
      router.push("/onboarding/first-session");
    } catch {
      router.push("/onboarding/first-session");
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="w-full text-left block group focus:outline-none">
      <GlassCard className="relative overflow-hidden p-5 flex items-center justify-between border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 via-brand-primary/[0.04] to-transparent hover:border-brand-primary/50 transition-all duration-300">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {loading ? (
              <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 text-brand-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
              Guided Setup
            </p>
            <h3 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight truncate mt-0.5">
              Start your first session
            </h3>
            <p className="text-xs text-foreground/50 font-medium truncate mt-0.5">
              Generate a personalized AI routine or jump into a guided live workout
            </p>
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-foreground/5 group-hover:bg-brand-primary group-hover:text-black flex items-center justify-center transition-all shrink-0 ml-3">
          <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-black transition-colors" />
        </div>
      </GlassCard>
    </button>
  );
}

