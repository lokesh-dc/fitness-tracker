"use client";

import { PRHit } from "@/types/workout";
import { Trophy, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";

interface PRsFeedDisplayProps {
  prsHit: PRHit[];
  variant: 'sidebar' | 'mobile-toast' | 'mobile-summary';
}

export function PRsFeedDisplay({ prsHit, variant }: PRsFeedDisplayProps) {
  const [lastPR, setLastPR] = useState<PRHit | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (prsHit.length > 0) {
      setLastPR(prsHit[prsHit.length - 1]);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [prsHit]);

  if (variant === 'mobile-toast') {
    return (
      <AnimatePresence>
        {showToast && lastPR && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50"
          >
            <div className="bg-brand-primary text-white px-4 py-3 rounded-2xl shadow-lg flex items-center space-x-3">
              <Trophy className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">New PR!</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{lastPR.exerciseName}</span>
                  <span className="font-mono font-black">{lastPR.newPRWeight} kg × {lastPR.newPRReps}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'mobile-summary') {
    if (prsHit.length === 0) return null;
    return (
      <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-primary/20 border border-brand-primary/30 rounded-full mb-3 w-fit mx-auto">
        <Trophy className="w-3 h-3 text-brand-primary" />
        <span className="text-[10px] font-black text-brand-primary uppercase">
          {prsHit.length} PR{prsHit.length > 1 ? 's' : ''} Hit
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
        <Trophy className="w-3 h-3" />
        <span>PRs This Session</span>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {prsHit.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center"
            >
              <Star className="w-8 h-8 text-foreground/5 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                No PRs yet —<br />Keep pushing!
              </p>
            </motion.div>
          ) : (
            prsHit.map((pr, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-start space-x-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10"
              >
                <div className="mt-0.5">
                  <Trophy className="w-4 h-4 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
                      {pr.exerciseName}
                    </span>
                    <span className="text-xs font-black text-brand-primary">
                      {pr.newPRWeight} kg × {pr.newPRReps}
                    </span>
                  </div>
                  <p className="text-[8px] font-bold text-foreground/40 uppercase">
                    {pr.previousPRWeight ? `was: ${pr.previousPRWeight} kg × ${pr.previousPRReps}` : "First time! 🎉"}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
