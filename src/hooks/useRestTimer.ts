"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useRestTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((frequency: number, duration: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }, []);

  const start = useCallback((duration: number) => {
    if (duration <= 0) return;
    
    // Clear existing timer if any
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTimeLeft(duration);
    setTotalDuration(duration);
    setIsRunning(true);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const nextValue = prev - 1;

        if (nextValue <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsRunning(false);
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200]);
          }
          return 0;
        }
        
        // Beep at 3, 2, 1 seconds remaining
        if (nextValue <= 3) {
          playBeep(880, 0.1);
        }
        
        return nextValue;
      });
    }, 1000);
  }, [playBeep]);

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(0);
    setIsRunning(false);
  }, []);

  const adjust = useCallback((seconds: number) => {
    setTimeLeft((prev) => {
      const next = Math.max(0, prev + seconds);
      if (next === 0 && isRunning) {
        skip();
      }
      return next;
    });
  }, [isRunning, skip]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { timeLeft, totalDuration, isRunning, start, skip, adjust };
}
