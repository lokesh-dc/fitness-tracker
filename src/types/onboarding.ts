import { Goal, ExperienceLevel, Equipment } from "./workout";

export type OnboardingStatus = 'INERT' | 'FIRST_RUN' | 'SKIPPED';

export type OnboardingState =
  | { status: 'INERT' }
  | { status: 'FIRST_RUN' }
  | { status: 'SKIPPED' };

export interface FirstSessionGoalProfile {
  goal: Goal;
  experienceLevel: ExperienceLevel;
  daysPerWeek: number;
  equipment: Equipment[];
}

export interface CoachMarkStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'center';
}

