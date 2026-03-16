"use server";

import { ObjectId, WithId, Document } from "mongodb";
import { getDb, getCurrentDayOfWeek, getCurrentWeekIndex } from "@/lib/db-utils";
import { PlanDocument, WorkoutTemplate, Exercise } from "@/types/workout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

    // Fetch all logs within this period
    const logs = await db.collection("WorkoutLog").find({
      userId,
      date: { $gte: start, $lte: end }
    }).toArray();

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

    return {
      planName: plan.name,
      startDate: plan.startDate,
      numWeeks: plan.numWeeks,
      totalSessions,
      totalVolume,
      topPRs: Object.values(exercisePRs).sort((a, b) => b.weight - a.weight).slice(0, 5),
      weightChange,
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
        name: planData.name || `Plan starting ${planData.startDate}`,
        startDate: planData.startDate,
        numWeeks: planData.numWeeks,
        createdAt: new Date(),
      });
      planId = planResult.insertedId.toString();
    }

    // 2. Insert all the templates linked to that planId
    const finalTemplates = templates.map(t => ({
      userId,
      planId,
      weekNumber: t.weekNumber,
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

    // We optionally fetch the individual templates for preview counting
    const allTemplatesCount = await db.collection("WorkoutTemplate").aggregate([
      { $match: { userId } },
      { $group: { _id: "$planId", days: { $sum: 1 } } }
    ]).toArray();

    const templatesMap = allTemplatesCount.reduce((acc, curr) => {
      acc[curr._id] = curr.days;
      return acc;
    }, {});

    return { plans, templatesMap };
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

    return {
      plan: { id: _id.toString(), ...restPlan } as PlanDocument,
      templates
    };
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
