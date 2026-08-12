import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/with-auth'
import { getWorkoutHistory } from '@/app/actions/logs'

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || '')
    const month = parseInt(searchParams.get('month') || '')

    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      return NextResponse.json({ error: 'Invalid year/month' }, { status: 400 })
    }

    const logs = await getWorkoutHistory(req.user.sub, year, month)
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Failed to fetch month logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
})
