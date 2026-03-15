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
    const dayOfWeek = targetDate.getDay();

    const todayPlan = await db.collection("WorkoutTemplate").findOne({
      userId: new ObjectId(userId),
      dayOfWeek,
    }) as (WithId<Document> & Partial<WorkoutTemplate>) | null;

    if (!todayPlan) return null;

    const { _id, ...rest } = todayPlan;

    return JSON.parse(JSON.stringify({
      ...rest,
      id: _id.toString(),
      userId: todayPlan.userId ? todayPlan.userId.toString() : "",
    })) as WorkoutTemplate;
  } catch (error) {
    console.error("Error fetching today's plan:", error);
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
    
    // Get today's plan
    const todayPlanRaw = await db.collection("WorkoutTemplate").findOne({
      userId: new ObjectId(userId),
      dayOfWeek,
    });

    // Get today's log
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const log = await db.collection("WorkoutLog").findOne({
      userId: new ObjectId(userId),
      date: { $gte: today }
    });

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
