import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { DEMO_USER_ID, DEMO_EMAIL } from "./demo";
import { addDays, subDays, startOfDay, format } from "date-fns";

export async function seedDemoData() {
  const client = await clientPromise;
  const db = client.db();
  const userId = new ObjectId(DEMO_USER_ID);

  console.log("Cleaning old demo data...");
  await db.collection("users").deleteOne({ _id: userId });
  await db.collection("WorkoutLog").deleteMany({ userId });
  await db.collection("ExerciseRecords").deleteMany({ userId });
  await db.collection("PlanDocument").deleteMany({ userId });
  await db.collection("WorkoutTemplate").deleteMany({ userId });

  console.log("Inserting demo user...");
  await db.collection("users").insertOne({
    _id: userId,
    name: "Alex Demo",
    email: DEMO_EMAIL,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    createdAt: subDays(new Date(), 90),
  });

  const exercises = [
    { id: 'bench', name: "Bench Press (Barbell)", startWeight: 60, inc: 1.25, muscle: "Chest" },
    { id: 'squat', name: "Squat (Barbell)", startWeight: 80, inc: 2.5, muscle: "Legs" },
    { id: 'deadlift', name: "Deadlift", startWeight: 100, inc: 5, muscle: "Back" },
    { id: 'ohp', name: "Overhead Press (Barbell)", startWeight: 40, inc: 1, muscle: "Shoulders" },
    { id: 'pullups', name: "Pull-ups", startWeight: 0, inc: 0, muscle: "Back" },
    { id: 'rows', name: "Bent Over Row (Barbell)", startWeight: 50, inc: 2, muscle: "Back" },
    { id: 'incline', name: "Incline Bench Press (Barbell)", startWeight: 50, inc: 1.25, muscle: "Chest" },
    { id: 'legpress', name: "Leg Press", startWeight: 120, inc: 10, muscle: "Legs" },
  ];

  const logs: any[] = [];
  const exerciseRecords: Record<string, any> = {};

  console.log("Generating 30+ logs over 90 days...");
  
  const sessionTypes = [
    { name: "Push Day", split: "Push", exIds: ['bench', 'ohp', 'incline'] },
    { name: "Pull Day", split: "Pull", exIds: ['rows', 'pullups', 'deadlift'] },
    { name: "Legs Day", split: "Legs", exIds: ['squat', 'legpress'] },
  ];

  const startDate = subDays(new Date(), 90);
  let sessionCounter = 0;

  // Track body weight trend (start at 82kg, lose 0.1kg/week approx)
  const startWeight = 82.5;

  for (let i = 0; i <= 90; i++) {
    const currentDate = addDays(startDate, i);
    const dayOfWeek = currentDate.getDay();
    const logDate = startOfDay(currentDate);
    const currentBW = startWeight - (i * 0.02); // Gradual weight loss (1.8kg over 90 days)
    
    // Pattern: Mon, Tue, Wed, Fri, Sat (Push, Pull, Legs, Rest, Push, Pull, Rest)
    const trainingDays = [1, 2, 3, 5, 6];
    const isTrainingDay = trainingDays.includes(dayOfWeek);

    let sessionExercises: any[] = [];
    let sessionName = "";
    let sessionSplit = "";

    if (isTrainingDay) {
      const sessionTypeIndex = sessionCounter % sessionTypes.length;
      const sessionType = sessionTypes[sessionTypeIndex];
      sessionCounter++;
      sessionName = sessionType.name;
      sessionSplit = sessionType.split;

      sessionExercises = sessionType.exIds.map(id => {
        const exDef = exercises.find(e => e.id === id)!;
        const progressiveWeight = exDef.startWeight + (Math.floor(sessionCounter / 3) * exDef.inc);
        const repsThisSession = 8 + (sessionCounter % 4);
        
        const sets = Array.from({ length: 3 }).map(() => ({
          weight: progressiveWeight,
          reps: repsThisSession,
          completed: true,
        }));

        // Update PR records
        if (!exerciseRecords[id]) {
          exerciseRecords[id] = {
            userId,
            exerciseId: id,
            exerciseName: exDef.name,
            currentPR: progressiveWeight,
            currentPRReps: repsThisSession,
            prDate: logDate,
            history: [],
            updatedAt: new Date(),
          };
        } else {
          if (progressiveWeight > exerciseRecords[id].currentPR || 
             (progressiveWeight === exerciseRecords[id].currentPR && repsThisSession > exerciseRecords[id].currentPRReps)) {
            exerciseRecords[id].currentPR = progressiveWeight;
            exerciseRecords[id].currentPRReps = repsThisSession;
            exerciseRecords[id].prDate = logDate;
          }
        }
        
        exerciseRecords[id].history.push({
          date: logDate,
          maxWeight: progressiveWeight,
          maxReps: repsThisSession,
          totalSets: 3,
          totalReps: sets.reduce((acc, s) => acc + s.reps, 0),
          totalVolume: progressiveWeight * sets.reduce((acc, s) => acc + s.reps, 0),
        });


        return {
          exerciseId: id,
          name: exDef.name,
          sets,
          pr: exerciseRecords[id].currentPR,
        };
      });
    }

    // Only log every day for the last 30 days if it's a "body weight log"
    // For the first 60 days, only log training days
    if (isTrainingDay || i >= 60) {
      logs.push({
        userId,
        date: logDate,
        name: sessionName || "Rest Day",
        splitName: sessionSplit || "Rest",
        bodyWeight: Number(currentBW.toFixed(1)),
        exercises: sessionExercises,
        startedAt: isTrainingDay ? new Date(logDate.getTime() + 18 * 60 * 60 * 1000) : undefined,
        completedAt: isTrainingDay ? new Date(logDate.getTime() + 19 * 60 * 60 * 1000) : undefined,
        durationSeconds: isTrainingDay ? 3600 : 0,
        createdAt: new Date(),
      });
    }
  }

  await db.collection("WorkoutLog").insertMany(logs);
  await db.collection("ExerciseRecords").insertMany(Object.values(exerciseRecords));

  console.log("Seeding Plans...");
  // PPL Plan
  const pplPlanResult = await db.collection("PlanDocument").insertOne({
    userId,
    name: "Hypertrophy PPL",
    startDate: format(subDays(new Date(), 21), "yyyy-MM-dd"),
    numWeeks: 8,
    createdAt: new Date(),
  });
  const pplPlanId = pplPlanResult.insertedId.toString();

  const pplTemplates = [
    { day: 1, split: "Push", exIds: ['bench', 'ohp', 'incline'] },
    { day: 2, split: "Pull", exIds: ['rows', 'pullups', 'deadlift'] },
    { day: 3, split: "Legs", exIds: ['squat', 'legpress'] },
    { day: 5, split: "Push", exIds: ['bench', 'ohp', 'incline'] },
    { day: 6, split: "Pull", exIds: ['rows', 'pullups', 'deadlift'] },
  ].map(t => ({
    userId,
    planId: pplPlanId,
    weekNumber: 1,
    dayOfWeek: t.day,
    splitName: t.split,
    exercises: t.exIds.map(id => {
      const exDef = exercises.find(e => e.id === id)!;
      return {
        exerciseId: id,
        name: exDef.name,
        targetSets: 3,
        targetReps: 10,
        lastWeight: exerciseRecords[id].currentPR,
        sets: [],
      };
    }),
    createdAt: new Date(),
  }));

  // 5/3/1 Plan
  const heavyPlanResult = await db.collection("PlanDocument").insertOne({
    userId,
    name: "Strength 5/3/1",
    startDate: format(subDays(new Date(), 42), "yyyy-MM-dd"),
    numWeeks: 4,
    createdAt: new Date(),
  });
  const heavyPlanId = heavyPlanResult.insertedId.toString();

  const heavyTemplates = [
    { day: 1, name: "Squat Day", exIds: ['squat'] },
    { day: 2, name: "Bench Day", exIds: ['bench'] },
    { day: 4, name: "Deadlift Day", exIds: ['deadlift'] },
    { day: 5, name: "OHP Day", exIds: ['ohp'] },
  ].map(t => ({
    userId,
    planId: heavyPlanId,
    weekNumber: 1,
    dayOfWeek: t.day,
    splitName: t.name,
    exercises: t.exIds.map(id => {
      const exDef = exercises.find(e => e.id === id)!;
      return {
        exerciseId: id,
        name: exDef.name,
        targetSets: 5,
        targetReps: 5,
        lastWeight: exerciseRecords[id].currentPR,
        sets: [],
      };
    }),
    createdAt: new Date(),
  }));

  await db.collection("WorkoutTemplate").insertMany([...pplTemplates, ...heavyTemplates]);

  console.log(`Summary:`);
  console.log(`- ${logs.length} Workout Logs`);
  console.log(`- ${Object.keys(exerciseRecords).length} Exercise Records (PRs)`);
  console.log(`- 2 Active Plans with Templates`);
  
  return {
    logs: logs.length,
    prs: Object.keys(exerciseRecords).length,
    plans: 2
  };
}
