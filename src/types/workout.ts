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
  isSkipped?: boolean;
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
    isSkipped?: boolean;
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

export interface MuscleGroupStat {
  muscleGroup: string;
  totalVolume: number;
  percentageOfTotal: number;
}

export interface MonthlyVolume {
  month: string;
  year: number;
  totalVolume: number;
}

export interface MonthlyVolumeTrend {
  months: MonthlyVolume[];
  trendPercent: number | null;
}

export interface MissedWorkoutsStat {
  sessionsLogged: number;
  sessionsPlanned: number;
  sessionsMissed: number;
  completionPercent: number;
  hasActivePlan: boolean;
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

export interface MostImprovedExercise {
  exerciseName: string;
  startWeight: number;
  endWeight: number;
  improvementPercent: number;
  improvementKg: number;
  sessionCount: number;
}

export interface WeeklyVolumeComparison {
  thisWeekVolume: number;
  lastWeekVolume: number;
  differenceKg: number;
  differencePercent: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface BodyWeightEntry {
  date: Date | string;
  weight: number;
}

export interface BodyWeightTrend {
  entries: BodyWeightEntry[];
  currentWeight: number | null;
  firstWeight: number | null;
  changeKg: number | null;
  changeDirection: 'up' | 'down' | 'neutral' | null;
}

export interface AllTimeStats {
  totalWorkouts: number;
  totalVolumeKg: number;
  totalPRsBroken: number;
  longestStreakDays: number;
}

export interface AccountSummary {
  memberSince: Date;
  monthsTraining: number;
  memberSinceLabel: string;
}

export interface PlanProgressData {
  currentWeek: number;
  totalWeeks: number;
  sessionsCompleted: number;
  totalSessionsPlanned: number;
  daysRemaining: number;
  percentComplete: number;
  weekStrip: WeekStripDay[];
}

export interface WeekStripDay {
  dayOfWeek: number;
  label: string;
  status: 'done' | 'today' | 'upcoming' | 'missed' | 'rest';
}

export interface StrengthProgressItem {
  exerciseName: string;
  currentMaxWeight: number;
  startMaxWeight: number;
  delta: number;
  unit: 'kg' | 'lbs';
}

export interface WeeklyVolumeData {
  weeks: { weekNumber: number; totalVolume: number }[];
  currentWeekVolume: number;
  averageWeeklyVolume: number;
  trend: 'increasing' | 'declining' | 'flat';
}

export interface BodyweightData {
  currentWeight: number | null;
  startWeight: number | null;
  delta: number | null;
  chartPoints: { date: string; weight: number }[];
}

export interface MuscleGroupSummary {
  muscleGroup: string;
  totalSets: number;
  totalVolume: number;  // kg
  sessionCount: number;
  lastTrainedDate: string; // ISO
  topExercise: string;
  weeklyData: { 
    week: string; 
    totalSets: number; 
    totalVolume: number;
    sessionCount?: number;
    exerciseVolumes?: { name: string; volume: number }[];
  }[];
}

export interface ExerciseProgressDataPoint {
  date: string; // ISO
  maxWeight: number;
  estimatedOneRM: number;
  totalSets: number;
}

export interface ExerciseProgressMap {
  [exerciseName: string]: {
    muscleGroup: string;
    prDate?: string;
    currentPR?: number;
    dataPoints: ExerciseProgressDataPoint[];
  };
}

export interface MuscleGroupPageData {
  muscleGroups: MuscleGroupSummary[];
  exerciseProgress: ExerciseProgressMap;
  trainingBalance: { muscleGroup: string; volumePercent: number }[];
  mostImproved: { muscleGroup: string; percentChange: number; topExercise: string } | null;
  neglectedMuscles: { muscleGroup: string; daysSinceLastTrained: number }[];
}

export interface WeeklyMuscleVolume {
  week: string;         // "2024-W32"
  weekStart: string;    // ISO date
  totalVolume: number;
  totalSets: number;
  sessionCount: number;
  rollingAvgVolume?: number; // Calculated server-side
}

export interface ExerciseDetailData {
  exerciseName: string;
  currentPR: number;
  currentPRReps: number;
  prDate?: string;
  currentEstimatedOneRM: number;  // from most recent dataPoint
  totalSets: number;
  totalSessions: number;
  firstLoggedDate: string;
  lastLoggedDate: string;
  dataPoints: ExerciseProgressDataPoint[];
}

export interface RepRangeDistribution {
  strength: number;
  strengthHyper: number;
  hypertrophy: number;
  endurance: number;
  total: number;
  interpretation?: string; // Generated server-side
}

export interface BestSession {
  date: string;
  workoutName: string;
  totalVolume: number;
  totalSets: number;
  exerciseCount: number;
}

export interface MuscleGroupDetailPageData {
  muscleGroup: string;
  totalExercises: number;
  totalSessions: number;
  weeklyVolume: WeeklyMuscleVolume[];
  exercises: ExerciseDetailData[];
  heatmapDates: string[];          // ISO dates trained
  repRangeDistribution: RepRangeDistribution;
  bestSession: BestSession | null;
}
