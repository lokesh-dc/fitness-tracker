import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";

async function inspect() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const exercises = db.collection("Exercises");
    const logs = db.collection("WorkoutLog");

    console.log("=== Exercises by muscleGroup ===");
    const grouped = await exercises
      .aggregate([
        {
          $group: {
            _id: "$muscleGroup",
            count: { $sum: 1 },
            examples: { $push: "$name" },
          },
        },
        { $project: { count: 1, examples: { $slice: ["$examples", 5] } } },
        { $sort: { count: -1 } },
      ])
      .toArray();
    console.log(JSON.stringify(grouped, null, 2));

    console.log("\n=== Exercises total ===", await exercises.countDocuments());
    console.log(
      "=== Exercises with secondaryMuscles ===",
      await exercises.countDocuments({ secondaryMuscles: { $exists: true } }),
    );
    console.log(
      "=== Exercises with legacyMuscleGroup ===",
      await exercises.countDocuments({ legacyMuscleGroup: { $exists: true } }),
    );

    console.log("\n=== Exercises._id type sample ===");
    const exSamples = await exercises.find({}).limit(3).toArray();
    console.log(
      exSamples.map((e) => ({
        name: e.name,
        _idType: typeof e._id,
        _idCtor: e._id?.constructor?.name,
        _id: String(e._id),
        muscleGroup: e.muscleGroup,
      })),
    );

    console.log("\n=== WorkoutLog count ===", await logs.countDocuments());

    console.log("\n=== WorkoutLog.exercises[].exerciseId type samples ===");
    const logSamples = await logs
      .aggregate([
        { $unwind: "$exercises" },
        {
          $project: {
            _id: 1,
            date: 1,
            name: 1,
            exerciseId: "$exercises.exerciseId",
            exerciseName: "$exercises.name",
            idType: { $type: "$exercises.exerciseId" },
          },
        },
        { $limit: 15 },
      ])
      .toArray();
    console.log(JSON.stringify(logSamples, null, 2));

    console.log("\n=== exerciseId type counts ===");
    const typeCounts = await logs
      .aggregate([
        { $unwind: "$exercises" },
        { $group: { _id: { $type: "$exercises.exerciseId" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();
    console.log(JSON.stringify(typeCounts, null, 2));

    console.log("\n=== Resolvability of exercise IDs (String id vs Exercises._id) ===");
    const resolveStats = await logs
      .aggregate([
        { $unwind: "$exercises" },
        {
          $lookup: {
            from: "Exercises",
            let: { sid: { $toString: { $ifNull: ["$exercises.exerciseId", ""] } } },
            pipeline: [
              { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$sid"] } } },
              { $project: { _id: 1, name: 1 } },
            ],
            as: "byStringId",
          },
        },
        {
          $lookup: {
            from: "Exercises",
            localField: "exercises.name",
            foreignField: "name",
            as: "byName",
          },
        },
        {
          $project: {
            resolvedById: { $gt: [{ $size: "$byStringId" }, 0] },
            resolvedByName: { $gt: [{ $size: "$byName" }, 0] },
            exerciseName: "$exercises.name",
          },
        },
        {
          $group: {
            _id: {
              resolvedById: "$resolvedById",
              resolvedByName: "$resolvedByName",
            },
            count: { $sum: 1 },
            examples: { $push: "$exerciseName" },
          },
        },
        { $project: { count: 1, examples: { $slice: ["$examples", 8] } } },
      ])
      .toArray();
    console.log(JSON.stringify(resolveStats, null, 2));

    console.log("\n=== Unresolvable exercise names (sample) ===");
    const unresolved = await logs
      .aggregate([
        { $unwind: "$exercises" },
        {
          $lookup: {
            from: "Exercises",
            localField: "exercises.name",
            foreignField: "name",
            as: "byName",
          },
        },
        { $match: { byName: { $size: 0 } } },
        { $group: { _id: "$exercises.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 25 },
      ])
      .toArray();
    console.log(JSON.stringify(unresolved, null, 2));
  } catch (err) {
    console.error("Inspection failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

inspect();
