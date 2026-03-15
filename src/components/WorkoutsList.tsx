"use client";

import { WorkoutLog } from "@/types/workout";
import { Dumbbell } from "lucide-react";
import { EmptyState } from "./ui/EmptyState";
import { WorkoutHistoryItem } from "./ui/WorkoutHistoryItem";

interface WorkoutsListProps {
  logs: WorkoutLog[];
}

export function WorkoutsList({ logs }: WorkoutsListProps) {
  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        icon={<Dumbbell className="w-8 h-8" />}
        title="No Workouts Yet"
        description="Your logged workouts will appear here. Time to hit the gym!"
      />
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <WorkoutHistoryItem
          key={log.id}
          id={log.id}
          date={log.date}
          name={log.name || log.splitName || "Workout Session"}
          exercisesCount={log.exercises?.length || 0}
          href={`/workouts/${log.id}`}
        />
      ))}
    </div>
  );
}

