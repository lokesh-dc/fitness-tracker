import { useState, useEffect, useRef, useCallback } from 'react';
import { startWorkoutSession } from '@/app/actions/logs';
import { PRHit, Exercise } from '@/types/workout';

export interface SessionStats {
  elapsedSeconds: number;
  startedAt: Date | null;
  totalSetsCompleted: number;
  totalSetsPlanned: number;
  totalExercisesDone: number;
  totalExercisesPlanned: number;
  totalVolumeKg: number;
  estimatedSecondsRemaining: number;
  prsHit: PRHit[];
}

export function useSessionStats(
  exercises: Exercise[],
  workoutLogId: string, // Unused for now but kept for consistency with user request
  userId: string,      // Unused for now but kept for consistency with user request
  workoutName: string = "Workout Session",
  splitName?: string,
  date?: string | Date,
  avgSetDurationSeconds: number = 45,
  initialStartedAt?: string | Date
) {
  const [startedAt, setStartedAt] = useState<Date | null>(
    initialStartedAt ? new Date(initialStartedAt) : null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [prsHit, setPrsHit] = useState<PRHit[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(async () => {
    if (startedAt) return;
    
    const now = new Date();
    setStartedAt(now);
    
    try {
      // Persist the start time to MongoDB
      await startWorkoutSession(workoutName, splitName, date);
    } catch (error) {
      console.error("Failed to persist session start:", error);
    }
  }, [startedAt, workoutName, splitName, date]);

  useEffect(() => {
    if (startedAt) {
      const syncTimer = () => {
        const now = new Date();
        const diff = Math.round((now.getTime() - startedAt.getTime()) / 1000);
        setElapsedSeconds(Math.max(0, diff));
      };
      
      syncTimer();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(syncTimer, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startedAt]);

  // Derived stats
  const totalSetsCompleted = exercises.reduce((acc, ex) => 
    acc + (ex.isDone ? ex.sets.length : 0), 0);

  const totalSetsPlanned = exercises.reduce((acc, ex) => 
    acc + ex.targetSets, 0);

  const totalExercisesDone = exercises.filter(ex => ex.isDone).length;
  const totalExercisesPlanned = exercises.length;

  const totalVolumeKg = exercises.reduce((acc, ex) => 
    acc + (ex.isDone ? ex.sets.reduce((setAcc, s) => setAcc + (s.weight * s.reps), 0) : 0), 0);

  // Estimate remaining time
  const estimatedSecondsRemaining = exercises.reduce((acc, ex) => {
    if (ex.isDone) return acc;
    // For simplicity, we assume targetSets remain for unfinished exercises
    const remainingSets = ex.targetSets;
    const workTime = remainingSets * avgSetDurationSeconds;
    const restTime = remainingSets * (ex.restDuration ?? 90);
    return acc + workTime + restTime;
  }, 0);

  const registerPR = useCallback((pr: PRHit) => {
    setPrsHit(prev => [...prev, pr]);
  }, []);

  return {
    startSession,
    registerPR,
    stats: {
      elapsedSeconds,
      startedAt,
      totalSetsCompleted,
      totalSetsPlanned,
      totalExercisesDone,
      totalExercisesPlanned,
      totalVolumeKg,
      estimatedSecondsRemaining,
      prsHit,
    }
  };
}
