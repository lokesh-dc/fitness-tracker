export interface SetLog {
  weight: number;
  reps: number;
}

export interface ExerciseDefinition {
  id?: string;
  name: string;
  muscleGroup: string;
  unit: 'reps' | 'steps' | 'secs' | 'mins';
  isCustom?: boolean;
}

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
  }[];
  createdAt: string | Date;
}

export interface UserSettings {
  defaultRestDuration: number;
}

export interface WeightTrendData {
  id: string;
  date: string;
  bodyWeight: number;
}
