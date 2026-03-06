import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/fitness-tracker";
const MOCK_USER_ID = "65e6d6b8b8b8b8b8b8b8b8b8";

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    console.log("Seeding WorkoutTemplate...");
    await db.collection("WorkoutTemplate").deleteMany({ userId: new ObjectId(MOCK_USER_ID) });
    
    const templates = [];
    const days = [1, 2, 3, 4, 5]; // Mon-Fri
    const exercises = [
      { exerciseId: "1", name: "Bench Press", targetSets: 4, targetReps: 10, lastWeight: 80 },
      { exerciseId: "2", name: "Overhead Press", targetSets: 3, targetReps: 12, lastWeight: 50 },
      { exerciseId: "3", name: "Lateral Raises", targetSets: 4, targetReps: 15, lastWeight: 12 },
    ];

    for (const day of days) {
      templates.push({
        userId: new ObjectId(MOCK_USER_ID),
        weekNumber: 1,
        dayOfWeek: day,
        exercises: exercises.map((ex, i) => ({
          ...ex,
          exerciseId: `${day}-${i}`
        })),
        createdAt: new Date(),
      });
    }

    await db.collection("WorkoutTemplate").insertMany(templates);

    console.log("Seeding WorkoutLog...");
    await db.collection("WorkoutLog").deleteMany({ userId: new ObjectId(MOCK_USER_ID) });
    
    const logs = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      logs.push({
        userId: new ObjectId(MOCK_USER_ID),
        date: date,
        bodyWeight: 85 - (i * 0.1) + (Math.random() * 0.5),
        exercises: exercises.map(ex => ({
          ...ex,
          sets: [{ weight: ex.lastWeight + (Math.random() * 5), reps: 10 }]
        })),
        createdAt: new Date(),
      });
    }

    await db.collection("WorkoutLog").insertMany(logs);

    console.log("Seed successful!");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await client.close();
  }
}

seed();
