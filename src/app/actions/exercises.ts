"use server";

import { getDb } from "@/lib/db-utils";
import { ExerciseDefinition } from "@/types/workout";

export async function getExercises(): Promise<ExerciseDefinition[]> {
    try {
        const db = await getDb();
        const exercisesRaw = await db.collection("Exercises").find({}).sort({ name: 1 }).toArray();

        return exercisesRaw.map(ex => {
            const { _id, ...rest } = ex;
            return { id: _id.toString(), ...rest } as ExerciseDefinition;
        });
    } catch (error) {
        console.error("Error fetching exercises:", error);
        return [];
    }
}

export async function addCustomExercise(data: { name: string; muscleGroup: string; unit: 'reps' | 'steps' | 'secs' | 'mins' }): Promise<ExerciseDefinition | null> {
    try {
        const db = await getDb();

        // Check if the exercise already exists (case insensitive)
        const existing = await db.collection("Exercises").findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
        if (existing) {
            const { _id, ...rest } = existing;
            return { id: _id.toString(), ...rest } as ExerciseDefinition;
        }

        const doc = {
            name: data.name,
            muscleGroup: data.muscleGroup,
            unit: data.unit,
            isCustom: true,
            createdAt: new Date(),
        };

        const result = await db.collection("Exercises").insertOne(doc);

        return {
            id: result.insertedId.toString(),
            name: doc.name,
            muscleGroup: doc.muscleGroup,
            unit: doc.unit,
            isCustom: true
        };
    } catch (error) {
        console.error("Error adding custom exercise:", error);
        return null;
    }
}
