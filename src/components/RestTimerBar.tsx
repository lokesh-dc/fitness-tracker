"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerBarProps {
  secondsLeft: number;
  totalDuration: number;
  isRunning: boolean;
  onSkip: () => void;
  onAdjust: (seconds: number) => void;
}

export function RestTimerBar({ 
  secondsLeft, 
  totalDuration, 
  isRunning,
  onSkip, 
  onAdjust 
}: RestTimerBarProps) {
  const prevSecondsRef = useRef(secondsLeft);

  useEffect(() => {
    if (secondsLeft === 0 && prevSecondsRef.current > 0 && isRunning) {
      // Haptics
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 500]);
      }

      // Audio beep
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.warn("Rest timer beep failed:", e);
      }
    }
    prevSecondsRef.current = secondsLeft;
  }, [secondsLeft, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = totalDuration > 0 ? (secondsLeft / totalDuration) : 0;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const getColor = () => {
    if (progress > 0.3) return "stroke-emerald-500";
    if (progress > 0.1) return "stroke-brand-primary";
    return "stroke-rose-500";
  };

  const getTextColor = () => {
    if (progress > 0.3) return "text-emerald-500";
    if (progress > 0.1) return "text-brand-primary";
    return "text-rose-500";
  };

  return (
    <AnimatePresence>
      {secondsLeft > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-50 flex justify-center"
        >
          <div className="glass-card flex items-center justify-between gap-6 p-4 px-6 pr-4 border-foreground/10 shadow-2xl backdrop-blur-3xl min-w-[320px] max-w-md w-full">
            {/* Progress Circle & Time */}
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-foreground/5"
                  />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    className={cn("transition-colors duration-500", getColor())}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Timer className={cn("w-5 h-5 opacity-20", getTextColor())} />
                </div>
              </div>
              
              <div>
                <p className={cn("text-2xl font-black tabular-nums transition-colors duration-500", getTextColor())}>
                  {formatTime(secondsLeft)}
                </p>
                <p className="text-[8px] font-black uppercase text-foreground/40 tracking-widest">
                  Resting
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onAdjust(-15)}
                className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                aria-label="Decrease rest by 15 seconds"
              >
                <Minus className="w-4 h-4 text-foreground/60" />
              </button>
              
              <button
                onClick={() => onAdjust(15)}
                className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                aria-label="Increase rest by 15 seconds"
              >
                <Plus className="w-4 h-4 text-foreground/60" />
              </button>

              <div className="w-px h-8 bg-foreground/10 mx-1" />

              <button
                onClick={onSkip}
                className="px-4 h-10 rounded-xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
