"use server";

import { ObjectId, WithId, Document } from "mongodb";
import { getDb, getCurrentDayOfWeek, getCurrentWeekIndex } from "@/lib/db-utils";
import { PlanDocument, WorkoutTemplate, Exercise } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  subWeeks, 
  parseISO,
} from "date-fns";
import { 
  ActivePlanProgress, 
  AdherenceScore, 
  WeekScheduleDay, 
} from "@/types/workout";

export async function getPlanByDate(date?: string | Date): Promise<WorkoutTemplate | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = (session.user as any).id;

    const db = await getDb();

    // Determine the day of the week for the target date
    const targetDate = date ? new Date(date) : new Date();
    const targetDateStr = targetDate.toISOString().split("T")[0];
    const dayOfWeek = targetDate.getDay();

    // 1. Find the active plan for this date
    // Sort by startDate desc to get the most recent one if overlapping
    const activePlan = await db.collection("PlanDocument").findOne(
      {
        userId: new ObjectId(userId),
        startDate: { $lte: targetDateStr }
      },
      { sort: { startDate: -1 } }
    ) as (WithId<Document> & PlanDocument) | null;

    if (!activePlan) return null;

    // Check if target date is within the plan's duration
    const startDate = new Date(activePlan.startDate + "T00:00:00");
    const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7) + 1;

    // If target date is beyond the plan's duration, return null (it's completed)
    if (weekIndex > activePlan.numWeeks) return null;

    const template = await db.collection("WorkoutTemplate").findOne({
      planId: activePlan._id.toString(),
      userId: new ObjectId(userId),
      dayOfWeek,
      // We look for either specific week templating OR weekNumber=1 (master)
      $or: [{ weekNumber: weekIndex }, { weekNumber: 1 }]
    }, { sort: { weekNumber: -1 } }) as (WithId<Document> & Partial<WorkoutTemplate>) | null;

    if (!template) return null;

    const { _id, ...rest } = template;

    return JSON.parse(JSON.stringify({
      ...rest,
      id: _id.toString(),
      userId: template.userId ? template.userId.toString() : "",
      weekNumber: weekIndex, // Use the calculated current week
    })) as WorkoutTemplate;
  } catch (error) {
    console.error("Error fetching today's plan:", error);
    return null;
  }
}

export async function updatePlanWeeks(planId: string, numWeeks: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    await db.collection("PlanDocument").updateOne(
      { _id: new ObjectId(planId), userId },
      { $set: { numWeeks, updatedAt: new Date() } }
    );

    revalidatePath("/plan");
    revalidatePath(`/plan/${planId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating plan weeks:", error);
    return { success: false, error: "Failed to update plan duration" };
  }
}

export async function getPlanReport(planId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const plan = await db.collection("PlanDocument").findOne({ _id: new ObjectId(planId), userId }) as any;
    if (!plan) return null;

    const start = new Date(plan.startDate + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + plan.numWeeks * 7);

    // Fetch all logs within this period, sorted by date ascending
    const logs = await db.collection("WorkoutLog").find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 }).toArray();
    const totalSessions = logs.length;
    let totalVolume = 0;
    const exercisePRs: Record<string, { weight: number, name: string }> = {};

    logs.forEach(log => {
      log.exercises?.forEach((ex: any) => {
        ex.sets?.forEach((set: any) => {
          totalVolume += set.weight * set.reps;
          if (!exercisePRs[ex.exerciseId] || set.weight > exercisePRs[ex.exerciseId].weight) {
            exercisePRs[ex.exerciseId] = { weight: set.weight, name: ex.name };
          }
        });
      });
    });

    const bodyWeights = logs.filter(l => l.bodyWeight).map(l => l.bodyWeight);
    const weightChange = bodyWeights.length > 1
      ? (bodyWeights[bodyWeights.length - 1] - bodyWeights[0])
      : 0;

    const loggedDates = logs.map(l => new Date(l.date).toISOString().split('T')[0]);

    // Fetch templates to find training days (only days with exercises)
    const templates = await db.collection("WorkoutTemplate").find({
      planId: planId,
      userId,
      "exercises.0": { $exists: true }
    }).toArray();

    const trainingDays = Array.from(new Set(templates.map(t => t.dayOfWeek)));

    return {
      planName: plan.name,
      startDate: plan.startDate,
      numWeeks: plan.numWeeks,
      totalSessions,
      totalVolume,
      topPRs: Object.values(exercisePRs).sort((a, b) => b.weight - a.weight).slice(0, 5),
      weightChange,
      loggedDates,
      trainingDays,
    };
  } catch (error) {
    console.error("Error generating plan report:", error);
    return null;
  }
}

export async function savePlanTemplates(
  planData: { startDate: string; numWeeks: number; name?: string; planId?: string },
  templates: Partial<WorkoutTemplate>[]
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // 1. Create or Update the overarching Plan Document
    let planId = planData.planId;

    if (planId) {
      await db.collection("PlanDocument").updateOne(
        { _id: new ObjectId(planId), userId },
        {
          $set: {
            name: planData.name || `Plan starting ${planData.startDate}`,
            startDate: planData.startDate,
            numWeeks: planData.numWeeks,
            updatedAt: new Date()
          }
        }
      );
      // Clean old templates since we'll generate new mappings
      await db.collection("WorkoutTemplate").deleteMany({ planId, userId });
    } else {
      const planResult = await db.collection("PlanDocument").insertOne({
        userId,
        name: planData.name || `Plan starting ( ${planData.startDate}) `,
        startDate: planData.startDate,
        numWeeks: planData.numWeeks,
        createdAt: new Date(),
      });
      planId = planResult.insertedId.toString();
    }

    // 2. Insert templates (now strictly Week 1 as per UI simplification)
    const finalTemplates = templates.map(t => ({
      userId,
      planId,
      weekNumber: t.weekNumber || 1,
      dayOfWeek: t.dayOfWeek,
      exercises: t.exercises,
      splitName: (t as any).splitName || "Workout",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (finalTemplates.length > 0) {
      await db.collection("WorkoutTemplate").insertMany(finalTemplates);
    }

    revalidatePath("/");
    revalidatePath("/plan");
    return { success: true, planId };
  } catch (error) {
    console.error("Error saving plan templates:", error);
    throw new Error("Failed to save plan.");
  }
}

export async function getUserPlanSummary() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    // Fetch all plans
    const plansRaw = await db.collection("PlanDocument")
      .find({ userId })
      .sort({ startDate: -1 })
      .toArray();

    const plans = plansRaw.map(p => {
      const { _id, ...rest } = p;
      return { id: _id.toString(), ...rest };
    }) as PlanDocument[];

    // We fetch count of unique dayOfWeek per plan (where exercises are present)
    const allTemplatesCount = await db.collection("WorkoutTemplate").aggregate([
      { $match: { userId, "exercises.0": { $exists: true } } },
      { $group: { _id: "$planId", days: { $addToSet: "$dayOfWeek" } } },
      { $project: { _id: 1, count: { $size: "$days" } } }
    ]).toArray();

    const templatesMap = allTemplatesCount.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return JSON.parse(JSON.stringify({ plans, templatesMap }));
  } catch (error) {
    console.error("Error fetching plan summary:", error);
    return { plans: [], templatesMap: {} };
  }
}

export async function getActivePlanInfo() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();
    const activePlan = await db.collection("PlanDocument").findOne(
      { userId },
      { sort: { startDate: -1 } }
    ) as any;

    if (!activePlan) return null;

    const start = new Date(activePlan.startDate + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + activePlan.numWeeks * 7);
    const now = new Date();

    const isCompleted = now > end;
    const hasStarted = now >= start;

    return {
      id: activePlan._id.toString(),
      name: activePlan.name,
      startDate: activePlan.startDate,
      numWeeks: activePlan.numWeeks,
      isCompleted,
      hasStarted
    };
  } catch (error) {
    console.error("Error fetching active plan info:", error);
    return null;
  }
}

export async function getPlanDetails(planId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    const planDoc = await db.collection("PlanDocument").findOne({
      _id: new ObjectId(planId),
      userId
    });
    if (!planDoc) return null;

    const templatesRaw = await db.collection("WorkoutTemplate")
      .find({ planId, userId })
      .sort({ weekNumber: 1, dayOfWeek: 1 })
      .toArray();

    const templates = templatesRaw.map(t => {
      const { _id, ...rest } = t;
      return { id: _id.toString(), ...rest };
    }) as WorkoutTemplate[];

    const { _id, ...restPlan } = planDoc;

    return JSON.parse(JSON.stringify({
      plan: { id: _id.toString(), ...restPlan } as PlanDocument,
      templates
    }));
  } catch (err) {
    console.error("Error fetching plan details:", err);
    return null;
  }
}

export async function deletePlan(planId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const userId = new ObjectId((session.user as any).id);

    const db = await getDb();

    await db.collection("PlanDocument").deleteOne({ _id: new ObjectId(planId), userId });
    await db.collection("WorkoutTemplate").deleteMany({ planId, userId });

    revalidatePath("/plan");
    return { success: true };
  } catch (err) {
    console.error("Error deleting plan:", err);
    return { success: false, error: "Failed to delete plan" };
  }
}

export async function getReminderData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = (session.user as any).id;

    const db = await getDb();
    const dayOfWeek = getCurrentDayOfWeek();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's plan and log concurrently
    const [todayPlanRaw, log] = await Promise.all([
      db.collection("WorkoutTemplate").findOne({
        userId: new ObjectId(userId),
        dayOfWeek,
      }),
      db.collection("WorkoutLog").findOne({
        userId: new ObjectId(userId),
        date: { $gte: today }
      })
    ]);

    const isLogged = !!(log && log.exercises && log.exercises.length > 0);

    let plan = null;
    if (todayPlanRaw) {
      const { _id, ...rest } = todayPlanRaw;
      plan = {
        id: _id.toString(),
        ...rest,
        userId: userId.toString()
      };
    }

    return {
      plan,
      isLogged,
      currentTime: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching reminder data:", error);
    return null;
  }
}

/**
 * GET ACTIVE PLANS SUMMARY
 */
export async function getActivePlansSummary(userId: string): Promise<ActivePlanProgress[]> {
  try {
    const db = await getDb();
    const now = new Date();
    
    // Mon-Sun range
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const allPlans = await db.collection("PlanDocument").find({ 
      userId: new ObjectId(userId) 
    }).toArray();

    // Filter plans active during this week
    const activePlans = allPlans.filter(plan => {
      const planStart = parseISO(plan.startDate);
      const planEnd = addDays(planStart, plan.numWeeks * 7 - 1);
      return planStart <= weekEnd && planEnd >= weekStart;
    });

    if (activePlans.length === 0) return [];

    // Get logs for this week
    const logsThisWeek = await db.collection("WorkoutLog").find({
      userId: new ObjectId(userId),
      date: { $gte: weekStart, $lte: weekEnd }
    }).project({ date: 1 }).toArray();

    const loggedDates = new Set(
      logsThisWeek.map(l => new Date(l.date).toISOString().split('T')[0])
    );

    const summaries = await Promise.all(activePlans.map(async (plan) => {
      const templates = await db.collection("WorkoutTemplate").find({
        planId: plan._id.toString(),
        userId: new ObjectId(userId),
        "exercises.0": { $exists: true }
      }).toArray();

      const planStart = parseISO(plan.startDate);
      const planEnd = addDays(planStart, plan.numWeeks * 7 - 1);

      let plannedCount = 0;
      let completedCount = 0;

      for (let i = 0; i < 7; i++) {
        const dayDate = addDays(weekStart, i);
        const dayDateStr = dayDate.toISOString().split('T')[0];
        
        if (dayDate >= planStart && dayDate <= planEnd) {
          const systemDay = dayDate.getDay();
          const diffInDays = Math.floor((dayDate.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24));
          const currentWeekIndex = Math.floor(diffInDays / 7) + 1;

          // Find templates for THIS week or fall back to week 1 if none for this week
          const hasSpecificWeekTemplates = templates.some(t => t.dayOfWeek === systemDay && t.weekNumber === currentWeekIndex);
          const hasWeek1Templates = templates.some(t => t.dayOfWeek === systemDay && t.weekNumber === 1);
          
          if (hasSpecificWeekTemplates || hasWeek1Templates) {
            plannedCount++;
            if (loggedDates.has(dayDateStr)) completedCount++;
          }
        }
      }

      return {
        planId: plan._id.toString(),
        planName: plan.name || "Untitled Plan",
        sessionsCompletedThisWeek: completedCount,
        sessionsPlannedThisWeek: plannedCount,
        progressPercent: plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0
      };
    }));

    return summaries;
  } catch (error) {
    console.error("Error fetching active plans summary:", error);
    return [];
  }
}

/**
 * GET PLAN ADHERENCE SCORE
 */
export async function getPlanAdherenceScore(userId: string): Promise<AdherenceScore> {
  try {
    const db = await getDb();
    const activePlans = await db.collection("PlanDocument").find({
      userId: new ObjectId(userId)
    }).toArray();

    // Filter to find plans that were active at some point in the last 8 weeks
    const now = new Date();
    const eightWeeksAgo = subWeeks(now, 8);
    const plansWithHistory = activePlans.filter(plan => {
        const planStart = parseISO(plan.startDate);
        const planEnd = addDays(planStart, plan.numWeeks * 7 - 1);
        return planEnd >= eightWeeksAgo;
    });

    if (!plansWithHistory.length) {
      return { percent: 0, trend: 0, trendDirection: 'neutral', hasActivePlans: false };
    }

    const fourWeeksAgo = subWeeks(now, 4);

    const [currentLogs, previousLogs] = await Promise.all([
      db.collection("WorkoutLog").find({
        userId: new ObjectId(userId),
        date: { $gte: fourWeeksAgo, $lte: now }
      }).project({ date: 1 }).toArray(),
      db.collection("WorkoutLog").find({
        userId: new ObjectId(userId),
        date: { $gte: eightWeeksAgo, $lt: fourWeeksAgo }
      }).project({ date: 1 }).toArray()
    ]);

    const currentLogged = new Set(currentLogs.map(l => new Date(l.date).toISOString().split('T')[0])).size;
    const previousLogged = new Set(previousLogs.map(l => new Date(l.date).toISOString().split('T')[0])).size;

    const countPlannedInWindow = async (start: Date, end: Date) => {
      let total = 0;
      for (const plan of plansWithHistory) {
        const templates = await db.collection("WorkoutTemplate").find({
          planId: plan._id.toString(),
          userId: new ObjectId(userId),
          "exercises.0": { $exists: true }
        }).toArray();

        const planStart = parseISO(plan.startDate);
        const planEnd = addDays(planStart, plan.numWeeks * 7 - 1);

        const windowStart = start > planStart ? start : planStart;
        const windowEnd = end < planEnd ? end : planEnd;

        if (windowStart <= windowEnd) {
          const daysNum = Math.floor((windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          for (let i = 0; i < daysNum; i++) {
            const d = addDays(windowStart, i);
            const systemDay = d.getDay();
            const diffInDays = Math.floor((d.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24));
            const currentWeekIndex = Math.floor(diffInDays / 7) + 1;

            const hasSpecificWeekTemplates = templates.some(t => t.dayOfWeek === systemDay && t.weekNumber === currentWeekIndex);
            const hasWeek1Templates = templates.some(t => t.dayOfWeek === systemDay && t.weekNumber === 1);

            if (hasSpecificWeekTemplates || hasWeek1Templates) {
              total++;
            }
          }
        }
      }
      return total;
    };

    const [currentPlanned, previousPlanned] = await Promise.all([
      countPlannedInWindow(fourWeeksAgo, now),
      countPlannedInWindow(eightWeeksAgo, fourWeeksAgo)
    ]);

    const currentPercent = currentPlanned > 0 ? Math.round((currentLogged / currentPlanned) * 100) : 0;
    const previousPercent = previousPlanned > 0 ? Math.round((previousLogged / previousPlanned) * 100) : 0;
    const trend = currentPercent - previousPercent;

    return {
      percent: Math.min(currentPercent, 100),
      trend: Math.abs(trend),
      trendDirection: trend > 2 ? 'up' : trend < -2 ? 'down' : 'neutral',
      hasActivePlans: true
    };

  } catch (error) {
    console.error("Error fetching adherence score:", error);
    return { percent: 0, trend: 0, trendDirection: 'neutral', hasActivePlans: false };
  }
}

/**
 * GET WEEK PLAN SCHEDULE
 */
export async function getWeekPlanSchedule(userId: string): Promise<WeekScheduleDay[]> {
  try {
    const db = await getDb();
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const allPlans = await db.collection("PlanDocument").find({ userId: new ObjectId(userId) }).toArray();
    const activePlans = allPlans.filter(plan => {
      const planStart = parseISO(plan.startDate);
      const planEnd = addDays(planStart, plan.numWeeks * 7 - 1);
      return planStart <= weekEnd && planEnd >= weekStart;
    });

    const logsThisWeek = await db.collection("WorkoutLog").find({
      userId: new ObjectId(userId),
      date: { $gte: weekStart, $lte: weekEnd }
    }).project({ date: 1 }).toArray();

    const loggedDates = new Set(logsThisWeek.map(l => new Date(l.date).toISOString().split('T')[0]));

    const schedule = await Promise.all([0, 1, 2, 3, 4, 5, 6].map(async (dayIndex) => {
      const dayDate = addDays(weekStart, dayIndex);
      const dayDateStr = dayDate.toISOString().split('T')[0];
      const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex];
      const systemDay = dayDate.getDay();
      const isLogged = loggedDates.has(dayDateStr);
      const isToday = isSameDay(dayDate, now);
      const isPast = dayDate < now && !isToday;

      const sessions: any[] = [];

      for (const plan of activePlans) {
        const planStart = parseISO(plan.startDate);
        const planEnd = addDays(planStart, plan.numWeeks * 7 - 1);

        if (dayDate >= planStart && dayDate <= planEnd) {
          const diffInDays = Math.floor((dayDate.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24));
          const currentWeekIndex = Math.floor(diffInDays / 7) + 1;

          // Fetch templates for current week first
          let templates = await db.collection("WorkoutTemplate").find({
            planId: plan._id.toString(),
            userId: new ObjectId(userId),
            dayOfWeek: systemDay,
            weekNumber: currentWeekIndex,
            "exercises.0": { $exists: true }
          }).toArray();

          // Fallback to week 1 if no templates for current week (and it's not week 1)
          if (templates.length === 0 && currentWeekIndex !== 1) {
            templates = await db.collection("WorkoutTemplate").find({
              planId: plan._id.toString(),
              userId: new ObjectId(userId),
              dayOfWeek: systemDay,
              weekNumber: 1,
              "exercises.0": { $exists: true }
            }).toArray();
          }

          templates.forEach(t => {
            sessions.push({
              planName: plan.name || "Plan",
              workoutName: t.splitName || "Workout",
              status: isLogged ? 'completed' : (isPast ? 'missed' : 'planned')
            });
          });
        }
      }

      return { dayOfWeek: dayIndex, dayLabel, sessions };
    }));

    return schedule.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  } catch (error) {
    console.error("Error fetching weekly schedule:", error);
    return [];
  }
}

function isSameDay(d1: Date, d2: Date) {
  return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
}
