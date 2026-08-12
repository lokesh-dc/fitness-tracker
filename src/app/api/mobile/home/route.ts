import { NextResponse } from 'next/server'
import { withAuth, AuthedRequest } from '@/lib/with-auth'
import {
  getStreakData,
  getMonthWorkoutDates,
  getWeekSnapshot,
  getNextPlannedWorkout,
} from '@/app/actions/analytics'

export const GET = withAuth(async (req: AuthedRequest) => {
  try {
    const userId = req.user.sub
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const [streak, monthDates, weekSnapshot, nextWorkout] = await Promise.all([
      getStreakData(userId),
      getMonthWorkoutDates(currentYear, currentMonth, userId),
      getWeekSnapshot(userId),
      getNextPlannedWorkout(userId),
    ])

    return NextResponse.json({
      streak,
      monthDates,
      weekSnapshot,
      nextWorkout,
    })
  } catch (error) {
    console.error('Failed to fetch home data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    )
  }
})
