export interface SetLog {
  weight: number;
  reps: number;
}

export interface Exercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  lastWeight?: number;
  sets: SetLog[];
  pr?: number;
}

export interface WorkoutTemplate {
  id: string;
  userId: string;
  weekNumber: number;
  dayOfWeek: number;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string | Date;
  bodyWeight?: number;
  exercises: {
    exerciseId: string;
    name: string;
    sets: SetLog[];
  }[];
  createdAt: string | Date;
}

export interface WeightTrendData {
  id: string;
  date: string;
  bodyWeight: number;
}
