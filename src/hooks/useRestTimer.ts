"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { scheduleRestNotification, cancelRestNotification } from "@/lib/notifications";

interface UseRestTimerOptions {
  onComplete?: () => void;
}

export function useRestTimer(options?: UseRestTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restEndsAtRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    restEndsAtRef.current = null;
    cancelRestNotification();
    setSecondsLeft(0);
    setIsRunning(false);
  }, []);

  const start = useCallback((duration: number) => {
    if (duration <= 0) return;
    
    // Clear existing timer if any
    if (timerRef.current) clearInterval(timerRef.current);
    
    const deadline = Date.now() + duration * 1000;
    restEndsAtRef.current = deadline;
    setSecondsLeft(duration);
    setTotalDuration(duration);
    setIsRunning(true);
    
    scheduleRestNotification(duration);

    timerRef.current = setInterval(() => {
      if (!restEndsAtRef.current) return;
      
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((restEndsAtRef.current - now) / 1000));
      
      setSecondsLeft(remaining);

      if (remaining === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRunning(false);
        cancelRestNotification();
        options?.onComplete?.();
      }
    }, 500);
  }, [options]);

  const adjust = useCallback((seconds: number) => {
    if (!restEndsAtRef.current || !isRunning) return;
    
    restEndsAtRef.current += seconds * 1000;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((restEndsAtRef.current - now) / 1000));
    
    setSecondsLeft(remaining);
    
    if (remaining === 0) {
      cancel();
    } else {
      // Re-schedule notification with new duration
      scheduleRestNotification(remaining);
    }
  }, [isRunning, cancel]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { 
    secondsLeft, 
    timeLeft: secondsLeft, // Keep original name for compatibility if needed elsewhere
    totalDuration, 
    isRunning, 
    start, 
    cancel, 
    skip: cancel, // Map skip to cancel for compatibility
    adjust 
  };
}
