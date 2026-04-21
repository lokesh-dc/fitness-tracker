import { NextResponse } from 'next/server'
import { withAuth, AuthedRequest } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const GET = withAuth(async (req: AuthedRequest, { params }) => {
  try {
    const { db } = await connectToDatabase()
    const userId = new ObjectId(req.user.sub)
    const { id: planId } = await params

    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const doc = await db.collection('PlanDocument').findOne({
      _id: new ObjectId(planId),
      userId
    })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const templates = await db.collection('WorkoutTemplate')
      .find({ planId, userId })
      .sort({ dayOfWeek: 1 })
      .toArray()

    // Calculate status
    const start = new Date(doc.startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + doc.numWeeks * 7)
    const now = new Date()

    let status = 'active'
    if (now < start) status = 'draft'
    else if (now > end) status = 'completed'
    else status = 'active'

    const plan = {
      _id: doc._id.toString(),
      name: doc.name || `Plan starting ${doc.startDate}`,
      status,
      days: templates.map(t => ({
        dayOfWeek: t.dayOfWeek,
        name: t.splitName || 'Workout',
        exercises: t.exercises || []
      })),
      startDate: doc.startDate,
      weeksCount: doc.numWeeks,
      createdAt: doc.createdAt
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Failed to fetch plan:', error)
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 })
  }
})

export const PATCH = withAuth(async (req: AuthedRequest, { params = {} }) => {
  try {
    const { _id, userId: bUserId, ...updateData } = await req.json()
    const { db } = await connectToDatabase()
    const userId = new ObjectId(req.user.sub)
    const { id: planId } = await params

    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const result = await db.collection('PlanDocument').findOneAndUpdate(
      { _id: new ObjectId(planId), userId },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Fetch templates to include in response
    const templates = await db.collection('WorkoutTemplate')
      .find({ planId, userId })
      .sort({ dayOfWeek: 1 })
      .toArray()

    return NextResponse.json({
      plan: {
        ...result,
        _id: result._id.toString(),
        days: templates.map(t => ({
          dayOfWeek: t.dayOfWeek,
          name: t.splitName || 'Workout',
          exercises: t.exercises || []
        }))
      }
    })
  } catch (error) {
    console.error('Failed to update plan:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
})
