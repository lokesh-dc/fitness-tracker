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
}

export function HomeSidebar({ 
  streakData, 
  monthDates, 
  weekSnapshot, 
  nextWorkout 
}: HomeSidebarProps) {
  return (
    <>
      <StreakWidget data={streakData} />
      <CalendarWidget initialDates={monthDates} />
      <WeekSnapshotWidget data={weekSnapshot} />
      <NextWorkoutWidget data={nextWorkout} />
    </>
  );
}
