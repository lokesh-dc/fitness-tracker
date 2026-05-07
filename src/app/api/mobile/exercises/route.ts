import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'

export const GET = withAuth(async () => {
  try {
    const { db } = await connectToDatabase()
    const exercises = await db
      .collection('Exercises')
      .find({})
      .sort({ name: 1 })
      .project({ _id: 1, name: 1, muscleGroup: 1 })
      .toArray()
    
    // Map _id to exerciseId for the mobile app
    const mappedExercises = exercises.map(ex => ({
      exerciseId: ex._id.toString(),
      name: ex.name,
      muscleGroup: ex.muscleGroup || 'Other'
    }))

    return NextResponse.json({ exercises: mappedExercises })
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
})
