import { withAuth, AuthedRequest } from '@/lib/with-auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'plan'
  )
}

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

interface ExportExercise {
  name: string;
  targetSets?: number | string;
  targetReps?: number | string;
  unit?: string;
  restDuration?: number;
  alternatives?: string[];
}

interface ExportTemplate {
  dayOfWeek: number;
  weekNumber?: number;
  splitName?: string;
  exercises?: ExportExercise[];
}

interface ExportPlanDoc {
  name?: string;
  startDate: string;
  numWeeks: number;
  status?: string;
  mobilityWarmupIds?: string[];
  customMobilityWarmups?: { name: string; durationSeconds?: number }[];
}

function buildPlanText(
  planDoc: ExportPlanDoc,
  templates: ExportTemplate[],
  userEmail?: string,
): string {
  const planName: string = planDoc.name || `Plan starting ${planDoc.startDate}`
  const start = new Date(planDoc.startDate + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + planDoc.numWeeks * 7)

  const now = new Date()
  const status =
    planDoc.status ||
    (now < start ? 'draft' : now > end ? 'completed' : 'active')

  const byDay = new Map<number, ExportTemplate>()
  // Prefer weekNumber 1 (master week) — specific-week overrides fall back the same way the UI does
  const sorted = [...templates].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || (a.weekNumber ?? 1) - (b.weekNumber ?? 1),
  )
  for (const t of sorted) {
    if (!byDay.has(t.dayOfWeek)) byDay.set(t.dayOfWeek, t)
  }

  const trainingDays = [...byDay.values()].filter(
    (t) => Array.isArray(t.exercises) && t.exercises.length > 0,
  )
  const totalExercises = trainingDays.reduce(
    (acc, t) => acc + (t.exercises?.length ?? 0),
    0,
  )
  const totalSets = trainingDays.reduce(
    (acc, t) =>
      acc +
      (t.exercises ?? []).reduce(
        (s: number, ex: ExportExercise) => s + (Number(ex.targetSets) || 0),
        0,
      ),
    0,
  )

  const line = (char = '-', len = 48) => char.repeat(len)
  const out: string[] = []

  out.push('TRAK.FIT - TRAINING PLAN')
  out.push(line('='))
  out.push(`Plan      : ${planName}`)
  out.push(`Status    : ${status}`)
  out.push(`Start     : ${planDoc.startDate} (${formatDateLong(planDoc.startDate)})`)
  out.push(
    `End       : ${end.toISOString().split('T')[0]} (${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })})`,
  )
  out.push(`Duration  : ${planDoc.numWeeks} week(s)`)
  out.push(
    `Schedule  : ${trainingDays.length} training day(s) / week, ${totalExercises} exercises, ~${totalSets} sets / week`,
  )
  if (userEmail) out.push(`Exported  : ${new Date().toISOString()} for ${userEmail}`)
  else out.push(`Exported  : ${new Date().toISOString()}`)
  out.push(line('='))
  out.push('')
  out.push('WEEKLY SCHEDULE (repeats every week)')
  out.push(line())
  out.push('')

  // Monday-first ordering for readability: 1..6, 0
  const order = [1, 2, 3, 4, 5, 6, 0]
  for (const dow of order) {
    const t = byDay.get(dow)
    const exercises = t?.exercises
    const hasWork = !!t && Array.isArray(exercises) && exercises.length > 0
    out.push(`${DAY_NAMES[dow].toUpperCase()} (${DAY_SHORT[dow]}) — ${hasWork ? t?.splitName || 'Workout' : 'Rest Day'}`)
    if (!hasWork) {
      out.push('  Rest / recovery. No exercises scheduled.')
    } else if (exercises) {
      exercises.forEach((ex: ExportExercise, idx: number) => {
        const sets = ex.targetSets ?? '?'
        const reps = ex.targetReps ?? '?'
        const unit = ex.unit || 'reps'
        const rest = ex.restDuration ? ` | Rest ${ex.restDuration}s` : ''
        out.push(`  ${idx + 1}. ${ex.name} — ${sets} sets x ${reps} ${unit}${rest}`)
        if (Array.isArray(ex.alternatives) && ex.alternatives.length > 0) {
          out.push(`     Alt: ${ex.alternatives.join(', ')}`)
        }
      })
    }
    out.push('')
  }

  out.push(line())
  const mobilityIds: string[] = planDoc.mobilityWarmupIds || []
  const customMobility: { name: string; durationSeconds?: number }[] =
    planDoc.customMobilityWarmups || []
  if (mobilityIds.length > 0 || customMobility.length > 0) {
    out.push('MOBILITY WARM-UP')
    if (customMobility.length > 0) {
      customMobility.forEach((m) => {
        out.push(`  - ${m.name} (${m.durationSeconds ?? '?'}s)`)
      })
    }
    if (mobilityIds.length > 0) {
      out.push(`  Preset IDs: ${mobilityIds.join(', ')}`)
    }
    out.push('')
    out.push(line())
  }

  out.push('Generated by TRAK.FIT — train hard, recover harder.')
  out.push('')

  return out.join('\n')
}

export const GET = withAuth(async (req: AuthedRequest, { params }) => {
  try {
    const { db } = await connectToDatabase()
    const userId = new ObjectId(req.user.sub)
    const { id: planId } = await params

    if (!planId || !ObjectId.isValid(planId)) {
      return new Response('Invalid plan ID', { status: 400 })
    }

    const planDoc = await db.collection('PlanDocument').findOne({
      _id: new ObjectId(planId),
      userId,
    })
    if (!planDoc) {
      return new Response('Plan not found', { status: 404 })
    }

    const templates = await db
      .collection('WorkoutTemplate')
      .find({ planId, userId })
      .sort({ dayOfWeek: 1, weekNumber: 1 })
      .toArray()

    const text = buildPlanText(
      planDoc as unknown as ExportPlanDoc,
      templates as unknown as ExportTemplate[],
      req.user.email,
    )

    const base =
      planDoc.name || `plan-starting-${planDoc.startDate || planId}`
    const filename = `${sanitizeFilename(base)}-${planDoc.startDate || 'export'}.txt`

    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Failed to export plan:', error)
    return new Response('Failed to export plan', { status: 500 })
  }
})
