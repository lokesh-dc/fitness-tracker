import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { updateExerciseRecords } from '@/app/actions/logs'

export const POST = withAuth(async (req) => {
  try {
    const { db } = await connectToDatabase()
    const payload = await req.json()
    const userId = req.user.sub

    // Validation
    if (!payload.exercises || payload.exercises.length === 0) {
      return NextResponse.json({ error: 'No exercises provided' }, { status: 400 })
    }

    // Prepare Date
    const logDate = payload.date ? new Date(payload.date) : new Date();
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0,0,0,0);

    // 1. Prepare the log document
    const workoutLog = {
      userId: new ObjectId(userId),
      name: payload.name || 'Workout',
      date: startOfDay,
      exercises: payload.exercises.map((ex: any) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        sets: ex.sets.map((s: any) => ({
          weight: s.weight,
          reps: s.reps,
          completed: s.completed || s.isDone || true // API logs usually implies completed
        }))
      })),
      durationSeconds: payload.durationSeconds || 0,
      startedAt: payload.startedAt ? new Date(payload.startedAt) : null,
      completedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
      isLive: !!payload.durationSeconds,
      createdAt: new Date()
    }

    // 2. Insert the log
    const result = await db.collection('WorkoutLog').insertOne(workoutLog)

    // 3. Update ExerciseRecords using centralized helper
    await updateExerciseRecords(new ObjectId(userId), workoutLog.exercises, startOfDay);

    return NextResponse.json({ 
      success: true, 
      logId: result.insertedId 
    })

  } catch (error) {
    console.error('Failed to save workout log:', error)
    return NextResponse.json({ error: 'Failed to save workout log' }, { status: 500 })
  }
})

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const { db } = await connectToDatabase()
    const query: Record<string, unknown> = { userId: new ObjectId(req.user.sub) }
    
    if (from || to) {
      query.date = {
        ...(from ? { $gte: from } : {}),
        ...(to   ? { $lte: to }   : {}),
      }
    }

    const [logs, total] = await Promise.all([
      db.collection('WorkoutLog')
        .find(query)
        .sort({ date: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      db.collection('WorkoutLog').countDocuments(query),
    ])

    return NextResponse.json({ logs, total })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
})
