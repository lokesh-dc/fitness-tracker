import { NextResponse } from 'next/server'
import { withAuth, AuthedRequest } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    const { db } = await connectToDatabase()
    const userId = new ObjectId(req.user.sub)

    // 1. Get today's day of week (0 = Monday, 6 = Sunday)
    // Javascript getDay(): 0 = Sunday, 1 = Monday, 6 = Saturday
    // User's web app convention (from prompt): 0 = Monday, 6 = Sunday
    const jsDay = new Date().getDay()
    const todayDOW = jsDay

    // 2. Fetch all plan documents to find active one matching phase 0 schema
    const plansRaw = await db.collection('PlanDocument')
      .find({ userId })
      .sort({ startDate: -1 })
      .toArray()

    let activePlanDoc = null
    const now = new Date()

    for (const doc of plansRaw) {
      const start = new Date(doc.startDate)
      const end = new Date(start)
      end.setDate(end.getDate() + doc.numWeeks * 7)

      if (now >= start && now <= end) {
        activePlanDoc = doc
        break
      }
    }

    if (!activePlanDoc) {
      return NextResponse.json({ hasPlan: false })
    }

    // Calculate which week number we are in
    const planStart = new Date(activePlanDoc.startDate)
    // reset times
    planStart.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    const diffTime = Math.abs(now.getTime() - planStart.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const currentWeekNumber = Math.floor(diffDays / 7) + 1

    // 3. Find WorkoutTemplate for todayDOW
    const templateForToday = await db.collection('WorkoutTemplate')
      .findOne({ planId: activePlanDoc._id.toString(), userId, dayOfWeek: todayDOW })

    if (!templateForToday || !templateForToday.exercises || templateForToday.exercises.length === 0) {
      return NextResponse.json({ hasPlan: false })
    }

    // 4. Resolve last weights using Promise.all running in parallel
    const resolvedExercises = await Promise.all(
      templateForToday.exercises.map(async (ex: any) => {
        try {
          const lastLog = await db.collection('WorkoutLog')
            .find({
              userId,
              "exercises.exerciseId": ex.exerciseId
            })
            .sort({ date: -1 })
            .limit(1)
            .toArray()

          let lastWeight: number | null = null
          let lastUnit: 'kg' | 'lbs' = 'kg'

          if (lastLog.length > 0) {
            const loggedExercise = lastLog[0].exercises.find((e: any) => e.exerciseId === ex.exerciseId)
            if (loggedExercise && loggedExercise.sets) {
              const maxSetWeight = Math.max(...loggedExercise.sets.map((s: any) => s.weight))
              if (maxSetWeight > 0) {
                lastWeight = maxSetWeight
              }
            }
          }

          return {
            exerciseId: ex.exerciseId,
            name: ex.name || ex.exerciseName || 'Unknown Exercise', // fallback naming
            targetSets: ex.sets || 3, // fallback config defaults
            targetReps: ex.reps || 10,
            lastWeight,
            lastUnit,
            restDuration: ex.restTimer || 90
          }
        } catch (err) {
          console.error("Failed looking up max weight for", ex.exerciseId, err)
          return {
            exerciseId: ex.exerciseId,
            name: ex.name || ex.exerciseName || 'Unknown Exercise',
            targetSets: ex.sets || 3,
            targetReps: ex.reps || 10,
            lastWeight: null,
            lastUnit: 'kg',
            restDuration: ex.restTimer || 90
          }
        }
      })
    )

    const planDay = {
      planId: activePlanDoc._id.toString(),
      planName: activePlanDoc.name || `Plan starting ${activePlanDoc.startDate}`,
      dayName: templateForToday.splitName || 'Workout',
      weekNumber: currentWeekNumber,
      exercises: resolvedExercises
    }

    return NextResponse.json({ hasPlan: true, planDay })
  } catch (error) {
    console.error('Failed to fetch today plan:', error)
    return NextResponse.json({ hasPlan: false }) // Fail softly or 500
  }
})
