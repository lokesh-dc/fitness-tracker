import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const POST = withAuth(async (req) => {
  try {
    const { db } = await connectToDatabase()
    const payload = await req.json()
    const userId = req.user.sub

    // Validation
    if (!payload.exercises || payload.exercises.length === 0) {
      return NextResponse.json({ error: 'No exercises provided' }, { status: 400 })
    }

    // 1. Prepare the log document
    const workoutLog = {
      userId: new ObjectId(userId),
      name: payload.name || 'Workout',
      date: payload.date || new Date().toISOString().split('T')[0],
      exercises: payload.exercises.map((ex: any) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.name,
        sets: ex.sets.map((s: any) => ({
          weight: s.weight,
          reps: s.reps,
          isDone: s.isDone
        }))
      })),
      durationSeconds: payload.durationSeconds || 0,
      startedAt: payload.startedAt ? new Date(payload.startedAt) : null,
      completedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
      isLive: !!payload.durationSeconds,
      createdAt: new Date()
    }

    // 2. Insert the log
    const result = await db.collection('WorkoutLogs').insertOne(workoutLog)

    // 3. Update ExerciseRecords for PRs
    // For each exercise, find the max weight lifted in this session
    for (const ex of payload.exercises) {
      const maxWeight = Math.max(...ex.sets.map((s: any) => s.weight))
      
      if (maxWeight > 0) {
        await db.collection('ExerciseRecords').updateOne(
          { userId: new ObjectId(userId), exerciseId: ex.exerciseId },
          { 
            $set: { 
              lastWeight: maxWeight,
              updatedAt: new Date() 
            },
            $max: { 
              personalRecord: maxWeight 
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { upsert: true }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      logId: result.insertedId 
    })

  } catch (error) {
    console.error('Failed to save workout log:', error)
    return NextResponse.json({ error: 'Failed to save workout log' }, { status: 500 })
  }
})
