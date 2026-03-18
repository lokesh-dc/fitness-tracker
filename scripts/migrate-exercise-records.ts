import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";

async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log("🚀 Starting ExerciseRecords migration...\n");

    // Create indexes first
    await db.collection("ExerciseRecords").createIndex(
      { userId: 1, exerciseId: 1 },
      { unique: true }
    );
    await db.collection("ExerciseRecords").createIndex(
      { userId: 1, exerciseName: 1 }
    );
    await db.collection("ExerciseRecords").createIndex(
      { userId: 1, prDate: -1 }
    );
    console.log("✅ Indexes created\n");

    // Fetch all workout logs, sorted by date ascending so we can track PR progression
    const logs = await db.collection("WorkoutLog")
      .find({})
      .sort({ date: 1 })
      .toArray();

    console.log(`📋 Found ${logs.length} WorkoutLog documents to process\n`);

    // Build a map: userId -> exerciseId -> record
    const recordsMap = new Map<string, Map<string, {
      userId: ObjectId;
      exerciseId: string;
      exerciseName: string;
      currentPR: number;
      prDate: Date;
      previousPR: number;
      history: { date: Date; maxWeight: number; totalSets: number; totalReps: number }[];
    }>>();

    let totalExerciseEntries = 0;

    for (const log of logs) {
      if (!log.exercises || log.exercises.length === 0) continue;

      const userIdStr = log.userId.toString();
      if (!recordsMap.has(userIdStr)) {
        recordsMap.set(userIdStr, new Map());
      }
      const userMap = recordsMap.get(userIdStr)!;

      for (const exercise of log.exercises) {
        if (!exercise.sets || exercise.sets.length === 0) continue;

        const exerciseId = exercise.exerciseId || exercise.name; // fallback to name if no ID
        const maxWeight = Math.max(...exercise.sets.map((s: any) => s.weight || 0));
        const totalSets = exercise.sets.length;
        const totalReps = exercise.sets.reduce((acc: number, s: any) => acc + (s.reps || 0), 0);

        const sessionDate = log.date instanceof Date ? log.date : new Date(log.date);

        if (!userMap.has(exerciseId)) {
          userMap.set(exerciseId, {
            userId: log.userId,
            exerciseId,
            exerciseName: exercise.name,
            currentPR: maxWeight,
            prDate: sessionDate,
            previousPR: 0,
            history: [],
          });
        }

        const record = userMap.get(exerciseId)!;

        // Update exercise name (keep latest)
        record.exerciseName = exercise.name;

        // Update PR if this session beats it
        if (maxWeight > record.currentPR) {
          record.previousPR = record.currentPR;
          record.currentPR = maxWeight;
          record.prDate = sessionDate;
        }

        // Append to history
        record.history.push({
          date: sessionDate,
          maxWeight,
          totalSets,
          totalReps,
        });

        totalExerciseEntries++;
      }
    }

    // Bulk write all records
    let usersProcessed = 0;
    let recordsWritten = 0;

    for (const [userIdStr, userMap] of recordsMap) {
      const operations = [];
      for (const [, record] of userMap) {
        operations.push({
          updateOne: {
            filter: { userId: record.userId, exerciseId: record.exerciseId },
            update: {
              $set: {
                exerciseName: record.exerciseName,
                currentPR: record.currentPR,
                prDate: record.prDate,
                previousPR: record.previousPR,
                history: record.history,
                migratedAt: new Date(),
              },
            },
            upsert: true,
          },
        });
      }

      if (operations.length > 0) {
        const result = await db.collection("ExerciseRecords").bulkWrite(operations);
        recordsWritten += result.upsertedCount + result.modifiedCount;
      }
      usersProcessed++;
    }

    console.log(`✅ Migration complete!`);
    console.log(`   👤 Users processed: ${usersProcessed}`);
    console.log(`   📊 Exercise entries scanned: ${totalExerciseEntries}`);
    console.log(`   💾 ExerciseRecords written: ${recordsWritten}`);

    // Verify
    const totalRecords = await db.collection("ExerciseRecords").countDocuments();
    console.log(`\n   🔍 Total ExerciseRecords in DB: ${totalRecords}`);

  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
