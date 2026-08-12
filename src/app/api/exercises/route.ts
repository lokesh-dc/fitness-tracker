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
      .project({ name: 1, muscleGroup: 1 })
      .toArray()
    
    return NextResponse.json({ exercises })
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
})
