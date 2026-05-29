import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { updateExerciseRecords } from '@/app/actions/logs'
import { calculateEpley, bestEpleyFromSets } from '@/lib/epley'

// AUDIT FINDINGS:
// - WorkoutLog model: Raw MongoDB collection 'WorkoutLog' (no Mongoose model)
// - PR update logic: uses updateExerciseRecords() in logs.ts (reused from src/app/actions/logs.ts)
// - startedAt / completedAt: Already in WorkoutLog interface and schema usage
// - Existing save route: POST /api/logs exists but creating new POST /api/workout/save per requirements
// - Auth pattern: withAuth helper uses getToken(secret) supporting Bearer tokens

export const POST = withAuth(async (req) => {
  try {
    const { db } = await connectToDatabase()
    const payload = await req.json()
    const userId = new ObjectId(req.user.sub)

    // Validation
    if (!payload.exercises || payload.exercises.length === 0) {
      return NextResponse.json({ error: 'At least one exercise is required' }, { status: 400 })
    }

    const validExercises = payload.exercises.filter((ex: any) => ex.isDone).map((ex: any) => {
      const validSets = ex.sets.filter((s: any) => s.weight > 0 && s.reps > 0 && s.done)
      if (validSets.length === 0) return null
      return { ...ex, sets: validSets }
    }).filter(Boolean)

    if (validExercises.length === 0) {
      return NextResponse.json({ error: 'At least one exercise with valid sets must be completed' }, { status: 400 })
    }

    const startedAt = new Date(payload.startedAt)
    const completedAt = new Date(payload.completedAt)
    if (isNaN(startedAt.getTime()) || isNaN(completedAt.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
    }

    // Prepare Date for grouping (start of day)
    const startOfDay = new Date(completedAt)
    startOfDay.setHours(0, 0, 0, 0)

    const workoutLog = {
      userId,
      date: startOfDay,
      name: payload.workoutName || 'Workout',
      splitName: payload.splitName,
      bodyWeight: payload.bodyWeight || null,
      startedAt,
      completedAt,
      durationSeconds: payload.durationSeconds,
      exercises: validExercises.map((ex: any) => {
        const maxWeight = Math.max(...ex.sets.map((s: any) => s.weight))
        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          lastWeight: maxWeight,
          unit: ex.unit,
          isDone: true,
          sets: ex.sets.map((s: any) => ({
            weight: s.weight,
            reps: s.reps,
            completed: true
          }))
        }
      }),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Save in parallel with try/catch
    const results = await Promise.all([
      db.collection('WorkoutLog').insertOne(workoutLog).catch(err => {
        console.error('saveWorkoutLog error:', err)
        return null
      }),
      updateExerciseRecords(userId, workoutLog.exercises, startOfDay).catch(err => {
        console.error('updateExerciseRecords error:', err)
        return null
      })
    ])

    const savedLog = results[0]
    if (!savedLog) {
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }

    // Phase 5: Calculate 1RM per exercise
    const oneRepMaxes: Record<string, {
      estimated1RM: number
      basedOn: { weight: number; reps: number }
      previous1RM: number | null
    }> = {}

    for (const ex of validExercises) {
      const result = bestEpleyFromSets(ex.sets)
      if (!result) continue

      // Fetch previous best 1RM from ExerciseRecord
      const record = await db.collection('ExerciseRecords').findOne(
        { userId, exerciseId: ex.exerciseId },
        { projection: { history: 1 } }
      )

      // history[0] is THIS session (just updated), history[1] is the previous one
      const previous1RM = record?.history?.length > 1
        ? calculateEpley(
            record.history[1].maxWeight,
            record.history[1].maxWeightReps ?? 1
          )
        : null

      oneRepMaxes[ex.exerciseId] = {
        ...result,
        previous1RM: previous1RM ?? null,
      }
    }

    return NextResponse.json({
      success: true,
      workoutLogId: savedLog.insertedId.toString(),
      oneRepMaxes,
      message: 'Workout saved successfully'
    })

  } catch (error) {
    console.error('Unexpected error in /api/workout/save:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
})
