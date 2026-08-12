import { NextResponse } from 'next/server'
import { withAuth, AuthedRequest } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    const { db } = await connectToDatabase()
    const userId = new ObjectId(req.user.sub)

    // 1. Fetch PlanDocuments
    const plansRaw = await db.collection('PlanDocument')
      .find({ userId })
      .sort({ startDate: -1 })
      .toArray()

    // 2. Map plans and fetch their templates
    const plans = await Promise.all(plansRaw.map(async (doc) => {
      // Find templates for this plan
      const templates = await db.collection('WorkoutTemplate')
        .find({ planId: doc._id.toString(), userId })
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

      return {
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
    }))

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Failed to fetch plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
})

export const POST = withAuth(async (req: AuthedRequest) => {
  try {
    const body = await req.json()
    const { db } = await connectToDatabase()

    const plan = {
      ...body,
      userId: new ObjectId(req.user.sub),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('PlanDocument').insertOne(plan)
    return NextResponse.json({ plan: { ...plan, _id: result.insertedId } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
})
