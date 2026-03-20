export interface SetLog {
  weight: number;
  reps: number;
  completed?: boolean;
}

export interface ExerciseDefinition {
  id?: string;
  name: string;
  muscleGroup: string;
  unit: 'reps' | 'steps' | 'secs' | 'mins';
  isCustom?: boolean;
}

export type WorkoutMode = 'LIVE_SESSION' | 'MANUAL_LOG' | 'PLAN_DESIGNER';

export interface Exercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  unit?: 'reps' | 'steps' | 'secs' | 'mins'; // To handle legacy data where this is missing, mark as optional
  lastWeight?: number;
  sets: SetLog[];
  pr?: number;
  restDuration?: number;
  isDone?: boolean;
}

export interface PlanDocument {
  id: string;
  userId: string;
  name?: string;
  startDate: string;
  numWeeks: number;
  createdAt: string | Date;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  planId: string;
  weekNumber: number;
  dayOfWeek: number;
  splitName?: string;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string | Date;
  name?: string;
  splitName?: string;
  bodyWeight?: number;
  exercises: {
    exerciseId: string;
    name: string;
    sets: SetLog[];
    pr?: number; // PR at time of logging
  }[];
  startedAt?: string | Date;    // NEW
  completedAt?: string | Date;  // NEW
  durationSeconds?: number;     // NEW
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface PRHit {
  exerciseName: string;
  newPRWeight: number;
  previousPRWeight: number | null;
  timestamp: Date | string;
}

export interface UserSettings {
  defaultRestDuration: number;
}

export type WarmupScheme = 'STRENGTH' | 'STRENGTH_HYPER' | 'HYPERTROPHY' | 'ENDURANCE';

export interface WarmupSet {
  percentage: number;
  weight: number;
  reps: number;
  label: string;
}

export interface WarmupResult {
  scheme: WarmupScheme;
  sets: WarmupSet[];
  workingWeight: number;
  workingReps: number;
}

export interface WeightTrendData {
  id: string;
  date: string;
  bodyWeight: number;
}

export interface ExerciseTimelineEntry {
  date: Date | string;
  maxWeight: number;       // heaviest weight lifted that session
  estimatedOneRM: number;  // Epley: maxWeight * (1 + avgReps/30)
  totalVolume: number;     // sum of weight × reps across all sets
  totalSets: number;       // number of sets completed
  totalReps: number;       // total reps across all sets
  avgRepsPerSet: number;   // totalReps / totalSets
  isPR: boolean;           // true if date matches prDate in ExerciseRecords
}

export interface ActivePlanProgress {
  planId: string;
  planName: string;
  sessionsCompletedThisWeek: number;
  sessionsPlannedThisWeek: number;
  progressPercent: number;
}

export interface AdherenceScore {
  percent: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  hasActivePlans: boolean;
}

export type DayStatus = 'completed' | 'planned' | 'missed' | 'rest';

export interface WeekScheduleDay {
  dayOfWeek: number;
  dayLabel: string;
  sessions: {
    planName: string;
    workoutName: string;
    status: DayStatus;
  }[];
}
