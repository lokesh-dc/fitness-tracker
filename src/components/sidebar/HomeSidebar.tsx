"use client";

import { StreakWidget } from "./widgets/StreakWidget";
import { CalendarWidget } from "./widgets/CalendarWidget";
import { WeekSnapshotWidget } from "./widgets/WeekSnapshotWidget";
import { NextWorkoutWidget } from "./widgets/NextWorkoutWidget";

interface HomeSidebarProps {
  streakData: any;
  monthDates: string[];
  weekSnapshot: any;
  nextWorkout: any;
  isFirstWorkoutUser?: boolean;
}

export function HomeSidebar({ 
  streakData, 
  monthDates, 
  weekSnapshot, 
  nextWorkout,
  isFirstWorkoutUser = false,
}: HomeSidebarProps) {
  return (
    <>
      <StreakWidget data={streakData} isFirstWorkoutUser={isFirstWorkoutUser} />
      <CalendarWidget initialDates={monthDates} />
      <WeekSnapshotWidget data={weekSnapshot} isFirstWorkoutUser={isFirstWorkoutUser} />
      <NextWorkoutWidget data={nextWorkout} />
    </>
  );
}
