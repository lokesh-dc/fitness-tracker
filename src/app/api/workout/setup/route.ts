import { NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db-utils';
import { calculateEpley } from '@/lib/epley';

import { getPlanByDate } from "@/app/actions/plan";
import { getTodayBodyWeight, getTodayWorkoutLog } from "@/app/actions/logs";
import { getHighestWeightPRsBulk } from "@/app/actions/analytics";
import { getUserSettings } from "@/app/actions/user";

export async function GET(req: Request) {
  try {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET || "development_secret_only_for_dev_mode"
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token.id || token.sub) as string;
    const db = await getDb();
    const userIdObj = new ObjectId(userId);

    // Fetch data using the same actions as the web app
    const [plan, todayBodyWeight, todayWorkoutLog, userSettings] = await Promise.all([
      getPlanByDate(undefined, userId),
      getTodayBodyWeight(undefined, userId),
      getTodayWorkoutLog(undefined, userId),
      getUserSettings(userId),
    ]);

    let initialPRs: Record<string, { weight: number; reps: number }> = {};
    if (plan && plan.exercises) {
      const exerciseIds = plan.exercises.map((ex: any) => ex.exerciseId).filter(Boolean);
      if (exerciseIds.length > 0) {
        initialPRs = await getHighestWeightPRsBulk(exerciseIds, userId);
      }
    }

    // Still need recentLogs for plateauData, lastLog for mobile fallback, and exerciseRecords for mobile PR mapping
    const [recentLogs, lastLog, exerciseRecordsRaw, userProfile] = await Promise.all([
      db.collection('WorkoutLog').find(
        { $or: [{ userId: userIdObj }, { userId: userId }] },
        { projection: { date: 1, exercises: 1 } }
      ).sort({ date: -1 }).limit(40).toArray(),
      db.collection('WorkoutLog').findOne(
        { $or: [{ userId: userIdObj }, { userId: userId }] },
        { sort: { date: -1 } }
      ),
      db.collection('ExerciseRecords').find({ $or: [{ userId: userIdObj }, { userId: userId }] }).toArray(),
      db.collection('users').findOne({ _id: userIdObj })
    ]);

    // Format plan to match mobile app expectations (activePlan.templates array)
    const activePlan = plan ? {
      ...plan,
      templates: [plan]
    } : null;

    // Compute plateau data
    const plateauData: Record<string, any> = {};
    const allExerciseIds = new Set<string>();
    
    // Add IDs from plan
    plan?.exercises?.forEach((ex: any) => {
      if (ex.exerciseId) allExerciseIds.add(ex.exerciseId.toString());
    });

    // Add IDs from recent logs
    recentLogs.forEach((log: any) => {
      log.exercises?.forEach((ex: any) => {
        if (ex.exerciseId) allExerciseIds.add(ex.exerciseId.toString());
      });
    });

    for (const exerciseId of Array.from(allExerciseIds)) {
      // Find the name for this exerciseId from plan or logs
      let exerciseName = "";
      const planEx = plan?.exercises?.find((ex: any) => ex.exerciseId?.toString() === exerciseId);
      if (planEx) exerciseName = planEx.name;
      
      if (!exerciseName) {
        for (const log of recentLogs) {
          const match = log.exercises?.find((e: any) => e.exerciseId?.toString() === exerciseId);
          if (match) {
            exerciseName = match.name;
            break;
          }
        }
      }

      const history = recentLogs
        .filter((log: any) =>
          log.exercises.some((e: any) => 
            (e.exerciseId?.toString() === exerciseId) || 
            (exerciseName && e.name === exerciseName)
          )
        )
        .slice(0, 5)
        .map((log: any) => {
          const match = log.exercises.find((e: any) => 
            (e.exerciseId?.toString() === exerciseId) || 
            (exerciseName && e.name === exerciseName)
          );
          const sets = match?.sets?.filter((s: any) => parseFloat(s.weight) > 0 && parseInt(s.reps) > 0) ?? [];
          
          // Calculate best 1RM for this session
          let best1RM = 0;
          sets.forEach((s: any) => {
            const est = calculateEpley(parseFloat(s.weight), parseInt(s.reps));
            if (est && est > best1RM) best1RM = est;
          });

          const maxWeight = sets.length > 0 ? Math.max(...sets.map((s: any) => parseFloat(s.weight))) : 0;
          const maxReps = sets.length > 0 ? Math.max(...sets.map((s: any) => parseInt(s.reps))) : 0;
          const volume = sets.reduce((acc: number, s: any) => acc + (parseFloat(s.weight) * parseInt(s.reps)), 0);
          
          return { 
            date: log.date, 
            maxWeight, 
            maxReps, 
            volume,
            estimated1RM: best1RM
          };
        });

      // Compute local PR from all 100 recent logs
      let localMaxWeight = 0;
      let localMaxReps = 0;
      recentLogs.forEach((log: any) => {
        const match = log.exercises?.find((e: any) => 
          (e.exerciseId?.toString() === exerciseId) || 
          (exerciseName && e.name === exerciseName)
        );
        if (match && match.sets) {
          match.sets.forEach((s: any) => {
            const w = parseFloat(s.weight);
            const r = parseInt(s.reps);
            if (w > localMaxWeight) {
              localMaxWeight = w;
              localMaxReps = r;
            } else if (w === localMaxWeight && r > localMaxReps) {
              localMaxReps = r;
            }
          });
        }
      });

      if (history.length < 3) {
        plateauData[exerciseId] = { 
          isPlateaued: false, 
          history,
          lastWeight: history[0]?.maxWeight || 0,
          localMaxWeight,
          localMaxReps
        };
        continue;
      }

      // Volume-based plateau detection (match web app)
      const s0 = history[0].volume;
      const s1 = history[1].volume;
      const s2 = history[2].volume;
      const isPlateaued = s0 <= s1 && s1 <= s2;

      plateauData[exerciseId] = {
        isPlateaued,
        history,
        lastWeight: history[0]?.maxWeight || 0,
        localMaxWeight,
        localMaxReps
      };
    }

    return NextResponse.json({
      lastLog: lastLog ? { ...lastLog, id: lastLog._id.toString() } : null,
      todayLog: todayWorkoutLog ? { ...todayWorkoutLog, id: (todayWorkoutLog as any)._id?.toString() || (todayWorkoutLog as any).id } : null,
      activePlan,
      exerciseRecords: exerciseRecordsRaw.map((r: any) => {
        // Use the detailed history from plateauData (derived from raw logs)
        const detailedHistory = plateauData[r.exerciseId?.toString()]?.history || [];
        const oneRMHistory = detailedHistory
          .map((entry: any) => ({
            date: entry.date,
            estimated1RM: entry.estimated1RM,
          }))
          .reverse(); // Reverse to oldest -> newest

        return {
          exerciseId: r.exerciseId,
          exerciseName: r.exerciseName,
          currentPR: r.currentPR,
          currentPRReps: r.currentPRReps,
          prDate: r.prDate,
          oneRMHistory,
        };
      }),
      userUnit: userProfile?.unit || 'kg',
      lastBodyWeight: userProfile?.weight || todayBodyWeight || lastLog?.bodyWeight || null,
      plateauData
    });
  } catch (error) {
    console.error('Error in workout setup API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
